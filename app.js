const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const app = express();
const crypto = require('crypto');
const port = 3000;


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());


app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public')));


const nodemailer = require('nodemailer');
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'tk839587@gmail.com',
        pass: 'gton tyhv hdem npun'
    }
});





// --------------------- MongoDB connection ---------------------
mongoose.connect('mongodb+srv://talha:talha@cluster0.uz91tck.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});


const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
    console.log('Connected to MongoDB');
});





// --------------------- Admin Schema ---------------------
const AdminSchema = new mongoose.Schema({
    name: String,
    email: String,
    password: String,
    resetToken: String,
    resetTokenExpiration: Date
});
const Admin = mongoose.model('Admin', AdminSchema);





// --------------------- Assignment connection ---------------------
const assignmentSchema = new mongoose.Schema({
    assignmentType: String,
    daysUntilDue: Number,
    exactDeadline: Date,
    gradeDesired: String,
    email: String,
    additionalDetails: String,
    fileUploads: String,
    totalCost: Number,
    status: { type: String, default: 'Not Started' }
}, { timestamps: true });
const Assignment = mongoose.model('Assignment', assignmentSchema);






// --------------------- User Routings ---------------------

app.get('/', (req, res) => {
    res.render("form");
});






// user assignment form submission
app.post('/submit', async (req, res) => {
    const { assignmentType, daysUntilDue, exactDeadline, gradeDesired, email, additionalDetails, fileUploads } = req.body;

    let basePrice = 50;
    let urgencyMultiplier = 1;

    if(daysUntilDue <= 3){
        urgencyMultiplier = 2;
    } 
    
    else if(daysUntilDue <= 7){
        urgencyMultiplier = 1.5;
    }

    let gradeMultiplier = 1;

    if(gradeDesired.toLowerCase() === 'a'){
        gradeMultiplier = 1.5;
    } 
    
    else if(gradeDesired.toLowerCase() === 'b'){
        gradeMultiplier = 1.2;
    }

    const totalCost = basePrice * urgencyMultiplier * gradeMultiplier;

    const newAssignment = new Assignment({
        assignmentType,
        daysUntilDue,
        exactDeadline,
        gradeDesired,
        email,
        additionalDetails,
        fileUploads, 
        totalCost
    });

    try{
        await newAssignment.save();

        const mailOptions = {
            from: 'tk839587@gmail.com',
            to: email,
            subject: 'Assignment Submission Confirmation',
            html: `
                <p>Thank you for submitting your assignment request. Below are the details:</p>
                <ul>
                    <li>Assignment Type: ${assignmentType}</li>
                    <li>Days Until Due: ${daysUntilDue}</li>
                    <li>Exact Deadline: ${exactDeadline}</li>
                    <li>Desired Grade: ${gradeDesired}</li>
                    <li>Additional Details: ${additionalDetails}</li>
                    <li>Total Cost: $${totalCost}</li>
                </ul>
                <p>We will contact you shortly regarding your assignment.</p>
            `
        };
       
        await transporter.sendMail(mailOptions);

        res.redirect(`/results?assignmentType=${assignmentType}&daysUntilDue=${daysUntilDue}&exactDeadline=${exactDeadline}&fileUploads=${fileUploads}&gradeDesired=${gradeDesired}&totalCost=${totalCost.toFixed(2)}&email=${email}`);
    } 
    
    catch(error){
        res.status(500).json({ message: 'Error submitting assignment', error });
    }

});






// result.ejs after submitting form
app.get('/results', (req, res) => {
    const { assignmentType, daysUntilDue, exactDeadline, gradeDesired, email, additionalDetails, fileUploads, totalCost } = req.query;
    res.render('result', { assignmentType, daysUntilDue, exactDeadline, gradeDesired, email, additionalDetails, fileUploads, totalCost });
});






// ****************************************************************************






// --------------------- Admin Routings ---------------------

// home.ejs (basically login page)
app.get('/admin', async (req, res) => {
    res.render("home.ejs");
});






app.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try{
        const foundAdmin = await Admin.findOne({ email, password });
        
        if(foundAdmin){
            res.render('dashboard', { user: foundAdmin });
        }

        else{
            res.render('home', { error: 'Invalid email or password.' });
        }
    } 
    
    catch (err){
        console.error(err);
        res.sendStatus(500);
    }
});






app.post('/signup', async (req, res) => {
    const { name, email, password } = req.body;
    const newAdmin = new Admin({
        name,
        email,
        password
    });

    try{
        await newAdmin.save();
        res.render('dashboard', { user: newAdmin });
    } 
    
    catch(err){
        console.error(err);
        res.sendStatus(500);
    }
});






app.get('/reset-password/:resetToken', async (req, res) => {
    const resetToken = req.params.resetToken;

    try{
        const foundAdmin = await Admin.findOne({ resetToken });
        if(foundAdmin && foundAdmin.resetTokenExpiration > Date.now()){
            res.render('reset-password', { resetToken, user: foundAdmin, error: null, success: false });
        } 
        
        else{
            res.render('reset-password', { resetToken, user: null, error: 'Invalid or expired reset token.', success: false });
        }
    } 
    
    catch(err){
        console.error(err);
        res.sendStatus(500);
    }
});






app.post('/reset-password/:resetToken', async (req, res) => {
    const resetToken = req.params.resetToken;
    const newPassword = req.body.newPassword;

    try{

        const foundAdmin = await Admin.findOne({ resetToken });
        
        if(foundAdmin && foundAdmin.resetTokenExpiration > Date.now()){
            foundAdmin.password = newPassword;
            foundAdmin.resetToken = null;
            foundAdmin.resetTokenExpiration = null;
            await foundAdmin.save();
            res.render('password-reset-success', { message: 'Your password has been successfully reset.' });
        } 
        
        else{
            res.render('reset-password', { resetToken: null, user: null, error: 'Invalid or expired reset token.', success: false });
        }
    } 
    
    catch(err){
        console.error(err);
        res.sendStatus(500);
    }
});






app.post('/reset-password', async (req, res) => {
    const email = req.body.email;

    try{
        const foundAdmin = await Admin.findOne({ email });
        if(foundAdmin){
            const resetToken = crypto.randomBytes(20).toString('hex');
            foundAdmin.resetToken = resetToken;
            foundAdmin.resetTokenExpiration = Date.now() + 3600000; // 1 hour
            await foundAdmin.save();

            const mailOptions = {
                from: 'tk839587@gmail.com',
                to: foundAdmin.email,
                subject: 'Password Reset',
                html: `
                    <p>You are receiving this email because you requested a password reset.</p>
                    <p>Please click the following link to reset your password:</p>
                    <a href="http://localhost:3000/reset-password/${resetToken}">Reset Password</a>
                `
            };

            await transporter.sendMail(mailOptions);
            res.render('reset-password', { success: true, error: null });
        } 
        
        else{
            res.render('reset-password', { error: 'Invalid email.' });
        }
    } 
    
    catch(err){
        console.error(err);
        res.sendStatus(500);
    }
});






app.get('/admin/dashboard', async (req, res) => {
    
    try{
        const assignments = await Assignment.find().sort({ createdAt: -1 });
        res.json(assignments);
    } 
    
    catch(error){
        res.status(500).json({ message: 'Error fetching assignments', error });
    }
});






// --------------------- Updating assignment status ---------------------

app.post('/admin/update-status/:id', async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    try{
        const assignment = await Assignment.findByIdAndUpdate(id, { status }, { new: true });

        if(status === 'started'){
            let transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: 'tk839587@gmail.com',
                    pass: 'gton tyhv hdem npun'
                }
            });

            let mailOptions = {
                from: 'tk839587@gmail.com',
                to: assignment.email,
                subject: 'Work Started Notification',
                text: `Hello,

Your assignment "${assignment.assignmentType}" has been marked as started.

Thank you,
Talha Khalid`
            };

            transporter.sendMail(mailOptions, (error, info) => {
                
                if(error){
                    console.error('Error sending email:', error);
                } 
                
                else{
                    console.log('Email sent: ' + info.response);
                }
            });
        }

        res.json({ message: 'Status updated' });
    } 
    
    catch(error){
        res.status(500).json({ message: 'Error updating status', error });
    }
});






app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}/`);
});

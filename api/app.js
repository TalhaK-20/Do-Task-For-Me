const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const { GridFSBucket } = require('mongodb');
const multer = require('multer');
const fs = require('fs');
const { google } = require('googleapis');

const { isAuthenticated, isAdminAuthenticated } = require('../middlewares/session.js');

const faviconMiddleware = require('../middlewares/favicon');

const app = express();
const port = 3000;





// Middleware setup
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());
app.use(faviconMiddleware);
app.use(express.static(path.join(__dirname, '../public')));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '../views'));


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());


app.use(faviconMiddleware);
app.use(express.static(path.join(__dirname, '../public')));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '../views'));


const mongoConnectionString = 'mongodb+srv://talha:talha@cluster0.uz91tck.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';


app.use(session({
    secret: crypto.randomBytes(64).toString('hex'),
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: mongoConnectionString }),
    cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 7, // 1 week
        httpOnly: true,
        secure: false // Ensure this is false for local development
    }
}));


const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, '../uploads/')
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname)
    }
});












// --------------------- MongoDB connection ---------------------

mongoose.connect('mongodb+srv://talha:talha@cluster0.uz91tck.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0', {
    ssl: true,
});


const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
    console.log('Connected to MongoDB');
});










// --------------------- Schemas, Models & Emails ---------------------

const AdminSchema = new mongoose.Schema({
    name: String,
    email: { type: String, unique: true },
    password: String,
    resetToken: String,
    resetTokenExpiration: Date
});

const Admin = mongoose.models.Admin || mongoose.model('Admin', AdminSchema);





const AssignmentSchema = new mongoose.Schema({
    filename: String,
    mimeType: String,
    googleDriveId: String,
    fileUrl: String,
    assignmentType: String,
    daysUntilDue: Number,
    exactDeadline: Date,
    gradeDesired: String,
    email: String,
    additionalDetails: String,
    fileUploads: String,
    totalCost: Number,
    status: { type: String, default: 'Not Started' },
    professionalLevel: { type: Boolean, default: false },
    vivaRequired: { type: Boolean, default: false },
    programmingLanguage: String,
    webDevelopmentType: String,
    fullStackFramework: String,
    topProgrammer: { type: Boolean, default: false },
    wellCommentedCode: { type: Boolean, default: false },
    noOpenSource: { type: Boolean, default: false },
    taskSize: String,
    vivaPreparation: String,
    vivaTiming: String
}, { timestamps: true });

const Assignment = mongoose.models.Assignment || mongoose.model('Assignment', AssignmentSchema);





const UserSchema = new mongoose.Schema({
    googleId: {
        type: String,
        unique: true,
        sparse: true // Use sparse index for optional unique fields
    },
    name: String,
    username: { type: String, unique: true },
    email: { type: String, unique: true },
    password: String,
    resetToken: String,
    resetTokenExpiration: Date
});

const User = mongoose.models.User || mongoose.model('User', UserSchema);





const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'tk839587@gmail.com',
        pass: 'gton tyhv hdem npun'
    }
});












// --------- Auto Login Signup Authentication ------------

const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const LinkedInStrategy = require('passport-linkedin-oauth2').Strategy;





passport.use(new GoogleStrategy({
    clientID: '561313317956-b22rnrjp8h2aelrdvu42699cqc6ib9ld.apps.googleusercontent.com',
    clientSecret: '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',
    callbackURL: 'http://localhost:3000/auth/google/callback'
}, async (token, tokenSecret, profile, done) => {
    
    try {
        let user = await User.findOne({ googleId: profile.id });
        if (!user) {
            user = new User({
                googleId: profile.id,
                username: profile.displayName,
                email: profile.emails[0].value,
                password: profile.id  // Save Google ID as the password
            });
            await user.save();

            // Send email with user details
            const mailOptions = {
                from: 'tk839587@gmail.com',
                to: user.email,
                subject: 'Welcome to Do Task For Me.com',
                html: 
       
                `
                    <!DOCTYPE html>
                    <html>
                    <head>
                        <style>
                            @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@400;700&display=swap');
                            body {
                                font-family: 'Roboto', sans-serif;
                                margin: 0;
                                padding: 0;
                                background-color: #f4f4f4;
                            }
                            .container {
                                max-width: 600px;
                                margin: 20px auto;
                                background-color: #fffff5;
                                border-radius: 8px;
                                box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
                                overflow: hidden;
                                animation: fadeIn 2s ease-in-out;
                            }
                            @keyframes fadeIn {
                                from { opacity: 0; }
                                to { opacity: 1; }
                            }
                            .header {
                                background-color: #577eff;
                                color: white;
                                padding: 20px;
                                text-align: center;
                            }
                            .content {
                                padding: 20px;
                                color: #335339;
                            }
                            .content h2 {
                                color: #577eff;
                            }
                            .footer {
                                background-color: #f4f4f4;
                                color: #777777;
                                padding: 10px;
                                text-align: center;
                            }
                            .button {
                                display: inline-block;
                                padding: 10px 20px;
                                margin-top: 20px;
                                color: white;
                                background-color: #577eff;
                                text-decoration: none;
                                border-radius: 5px;
                                transition: background-color 0.3s ease;
                            }
                            .button:hover {
                                background-color: #f4f4f3;
                                text-color: black;
                            }
                            a {
                                text-color: black
                            }
                            
                        </style>
                    </head>

                    <body>
                        <div class="container">
                            <div class="header">
                                <h1>Welcome to Our App!</h1>
                            </div>
                            <div class="content">
                                <h2>Hello, ${user.username}</h2>
                                <p>Your account has been created successfully. Here are your details:</p>
                                <p><strong>Username:</strong> ${user.username}</p>
                                <p><strong>Email:</strong> ${user.email}</p>
                                <p><strong>Password:</strong> ${user.password}</p>
                                <a href="http://localhost:3000/login-user" class="button">Let's get started</a>
                            </div>
                            <div class="footer">
                                <p>Thank you for joining us!</p>
                            </div>
                        </div>
                    </body>

                    </html>
                `
            };


            transporter.sendMail(mailOptions, (error, info) => {
                
                if (error) {
                    console.log('Error sending email:', error);
                } 
                
                else {
                    console.log('Email sent:', info.response);
                }

            });
        }

        done(null, user);
    } 
    
    catch (error) {
        done(error, null);
    }
}));





passport.serializeUser((user, done) => {
    done(null, user.id);
});


passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id).exec();
        done(null, user);
    } 
    
    catch (error) {
        done(error, null);
    }
});





// Configure Facebook Strategy
passport.use(new FacebookStrategy({
    clientID: 'FACEBOOK_CLIENT_ID',
    clientSecret: 'FACEBOOK_CLIENT_SECRET',
    callbackURL: '/auth/facebook/callback',
    profileFields: ['id', 'displayName', 'emails']
}, async (accessToken, refreshToken, profile, done) => {
    
    try {
        let user = await User.findOne({ facebookId: profile.id });
        if (!user) {
            user = new User({
                facebookId: profile.id,
                username: profile.displayName,
                email: profile.emails[0].value
            });

            await user.save();
        }

        done(null, user);
    } 
    
    catch (error) {
        done(error, null);
    }

}));





// Configure LinkedIn Strategy
passport.use(new LinkedInStrategy({
    clientID: 'LINKEDIN_CLIENT_ID',
    clientSecret: 'LINKEDIN_CLIENT_SECRET',
    callbackURL: '/auth/linkedin/callback',
    scope: ['r_emailaddress', 'r_liteprofile']
}, async (token, tokenSecret, profile, done) => {
    
    try {
        let user = await User.findOne({ linkedinId: profile.id });
        if (!user) {
            user = new User({
                linkedinId: profile.id,
                username: profile.displayName,
                email: profile.emails[0].value
            });
            await user.save();
        }

        done(null, user);

    } 

    catch (error) {
        done(error, null);
    }
}));





app.use(passport.initialize());
app.use(passport.session());





// --------------------- Auth Routes ---------------------

app.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

app.get('/auth/google/callback', passport.authenticate('google', { failureRedirect: '/' }), (req, res) => {
    res.redirect('/user-dashboard');
});





app.get('/auth/facebook', passport.authenticate('facebook', { scope: ['email'] }));
app.get('/auth/facebook/callback',
    passport.authenticate('facebook', { failureRedirect: '/login' }),
    (req, res) => {
        res.redirect('/user-dashboard');
    }
);





app.get('/auth/linkedin', passport.authenticate('linkedin', { scope: ['r_emailaddress', 'r_liteprofile'] }));
app.get('/auth/linkedin/callback',
    passport.authenticate('linkedin', { failureRedirect: '/login' }),
    (req, res) => {
        res.redirect('/user-dashboard');
    }
);










// --------------------- File Upload Drive API  ---------------------

const GOOGLE_DRIVE_FOLDER_ID = '1CbO11lCNlmam55uIUemNHWC_QuNPYxQW';

const USER_EMAIL = 'F2021266625@umt.edu.pk';

const upload = multer({ dest: '../uploads/', limits: { fileSize: 5 * 1024 * 1024 } });

const auth = new google.auth.GoogleAuth({
    
    credentials: {
        type: "service_account",
        project_id: "file-upload-427811",
        private_key_id: "d391df159dae3fe4fb4d75e94079dbadf8e7f3ce",
        private_key: `-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQDFUQtw/W0CY7AY\nEVhlecq0HFJ5v4p2CG7AZjchwrArjngOnPzX5nmMLMAendGm/wr5CRSrTQe7lP2s\nlhWx5GPMEo/87ZGPP3C93PRveilGNVPHS2S+0m4ui95UDa4SPXuuNpKsXFJ6dIOX\nKv4jFVQYvx44dFXs5L/DN7EqDHGF2TXXl3dAeJyWTMZYcSVzpRXEgtqhWu6G7Bn5\nk8cH8uuHhYE26ioOCvpbNQzL0+badMLF/yYIRyEA/eVGKlzYNmIHXRVZcHOtK4hO\n0c0t9kNncVUre1iDMsNZaTo/fYe0zgwPgRMuX2IHL6ysvAC/SgF9OzkAzKL6udF9\nofgaDqAfAgMBAAECggEAANLNQuvz1AI5fmg4H7hJ5cWGfJaVi9eOKsRib4Qh+xSN\noLX8AiSmljSrmpUbBmDjGVX13Z8lLJ27D0jTD1p+JiBftHUDWf8wR8KPzJVMbcwU\nLO0+HuO+7PfNdjlWZCIYjYoRw6FhALzSvcNCqz/QCYhmpmKp5yKvQC/Pz/acVKwp\nAI0Oh97JEAuFDuzuAdetLad1g8p050LFWBcDzRLYkdePcLW0GADRfk2rdoJkaxbn\n9N9OGQt/rgV9K03EFr8igYdeGakXnZUuNF5NoOjlYQcd/RY4Vn3ZbPe2QlKYPKFR\nfiqW/gcsIdK2OwtZAL+GW15vw09v0I6ozLSM9QFadQKBgQD2rNQv6u22RdPUnGIL\nB8xV1ayEJr+lfvWblN1Qk9rVqqhsLtI6H+VcPtRLVtqfP5ETU9jw52kUuCh5fnZ2\nnY/X87D70U+i8TO7u41F1/Uox0ivsw7bcRYqSXnGv9QvYl+g9Gd7OJjx34q8Ib+S\nUFVLtCobZJg6Al73ZDbC5gwWrQKBgQDMxo3Za7YE5MDrs6VlhALZ1PfgTqP+4eQk\nqpPupgiBy+TGJ1DAAAN0z/CnFLMldSUpzaJB564Z1ntinSy+55qaTdLS1hrw3Otc\nrQAz1M+xZTGF7EtUn74jS7YkX4GCO3KD7LCch6On2hnkIowQvgXtk+hGkFFPPD2A\nXlskxUUHewKBgFpdJb4ICdzj553TS/dOfARVqkUfDMXLpJ3CAvEpuNjdE6XN4SV5\n2cPZIFwZDS2ZU8QIy0g0/cGhVPJs6Wi6f59UnlkhbFL8mT8EjdQwMJcnqfDzX1X0\nL3J+SCYOz+Qr3WxRHDd/nEe+5EvW8R7gXt7EuUgfqcRWagOmqojrTTJhAoGBAJoo\nS7dHMBMFBvsqFbSTqfXFLwotCaai9bZot88sLTFRhptqE49HM1LoC9osaiUjyGNt\nC96jhFytK9v0STA6eRf6yGCykDuNhJ4TGxjp96UrchnI5nkBfQljQO6m+39IM5B/\nSgG81wZQ2bb2Dw23kAznkTA2CxAkYIRYBDNtUucrAoGAYI0kxCs4CRW0foZUlYCJ\nKR0uIChuSQwjwF8shFq117+ndO1D8B7XTPybm3t+iey9ww95vw1Uh2qjqvygAZYV\n1WzPR2CK4uccsGiREUaldtbSPDZ1QKKFEFLWV5OXTK0fAKBv05AIteuyM3dVvgWD\nYM0sH2Zhw8exKwPQQSAdSo0=\n-----END PRIVATE KEY-----\n`,
        client_email: "talha-khalid@file-upload-427811.iam.gserviceaccount.com",
        client_id: "103160677148251988136",
        auth_uri: "https://accounts.google.com/o/oauth2/auth",
        token_uri: "https://oauth2.googleapis.com/token",
        auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
        client_x509_cert_url: "https://www.googleapis.com/robot/v1/metadata/x509/talha-khalid%40file-upload-427811.iam.gserviceaccount.com",
        universe_domain: "googleapis.com"
    },

    scopes: ['https://www.googleapis.com/auth/drive.file']

});

const drive = google.drive({ version: 'v3', auth });












// --------------------- Routes ---------------------

app.get('/', (req, res) => {
    res.render("./main/landing-page");
});




app.get('/services', (req, res) => {
    res.render("./main/services");
});




app.get('/team', (req, res) => {
    res.render("./main/our-team");
});




app.get('/order-request-form', isAuthenticated, async (req, res) => {
    res.render('./main/form')
})




app.post('/submit-form', upload.single('file'), async (req, res) => {
    
    const { 
        
        assignmentType, 
        daysUntilDue, 
        exactDeadline, 
        gradeDesired, 
        email, 
        additionalDetails, 
        vivaRequired, 
        fileUploads, 
        professionalLevel, 
        programmingLanguage, 
        webDevelopmentType, 
        fullStackFramework, 
        topProgrammer, 
        wellCommentedCode, 
        noOpenSource, 
        vivaPreparation, 
        taskSize 
          
    } = req.body;
  

    // Convert checkbox strings to Booleans
    const wellCommentedCodeBool = wellCommentedCode === 'on';
    const noOpenSourceBool = noOpenSource === 'on';
    const topProgrammerBool = topProgrammer === 'on';


    let basePrice = 50;
    let urgencyMultiplier = 1;

    if (daysUntilDue <= 3) {
        urgencyMultiplier = 2;
    } 
    
    else if (daysUntilDue <= 7) {
        urgencyMultiplier = 1.5;
    }

    
    let gradeMultiplier = 1;
    if (typeof gradeDesired === 'string' && gradeDesired.toLowerCase() === 'a') {
        gradeMultiplier = 1.5;
    } 
    
    else if (typeof gradeDesired === 'string' && gradeDesired.toLowerCase() === 'b') {
        gradeMultiplier = 1.2;
    }


    let professionalLevelCost = professionalLevel ? basePrice * 0.3 : 0; // Additional 30% for professional level
    
    let vivaCost = vivaRequired ? basePrice * 0.2 : 0; // Additional 20% for viva
    
    let topProgrammerCost = topProgrammer ? basePrice * 0.1 : 0; // Additional 10% for top programmer
    
    let vivaPreparationCost = vivaPreparation === 'yes' ? basePrice * 0.15 : 0; // Additional 15% for viva preparation

    
    // Task size multipliers
    let taskSizeMultiplier = 1;
    
    switch (taskSize) {
        case 'extraSmall': taskSizeMultiplier = 0.5; break;
        case 'small': taskSizeMultiplier = 0.75; break;
        case 'medium': taskSizeMultiplier = 1; break;
        case 'large': taskSizeMultiplier = 1.25; break;
        case 'professional': taskSizeMultiplier = 1.5; break;
    }

    
    const totalCost = basePrice * urgencyMultiplier * gradeMultiplier * taskSizeMultiplier + professionalLevelCost + vivaCost + topProgrammerCost + vivaPreparationCost;

    
    const filePath = path.join(__dirname, 'uploads', req.file.filename);
    const mimeType = req.file.mimetype;
    
    
    try {
           
        const response = await drive.files.create({
            requestBody: {
                name: req.file.originalname,
                mimeType: mimeType,
            },
        
            media: {
                mimeType: mimeType,
                body: fs.createReadStream(filePath),
                    },
            });
            
                    const fileId = response.data.id;
            
                    await drive.permissions.create({
                        fileId: fileId,
                        requestBody: {
                            role: 'reader',
                            type: 'anyone',
                        },
                    });
            
                    const fileUrl = `https://drive.google.com/file/d/${fileId}/view`;
            
        
                    // -------------------------------------------
                    
                    // File Sharing code will be here for the future.
                    // Account details will be given here for the file
                    // sharing in case when the file link or other things
                    // got corrupted or other issues 
                    
                    // -------------------------------------------
        
        
                    const newAssignment = new Assignment({
                         
                            filename: req.file.originalname,
                            mimeType: mimeType,
                            googleDriveId: fileId,
                            fileUrl: fileUrl,
                         
                            assignmentType, 
                            daysUntilDue, 
                            exactDeadline, 
                            gradeDesired, 
                            email, 
                            additionalDetails, 
                            fileUploads, 
                            vivaPreparation,
                            
                            wellCommentedCode: wellCommentedCodeBool,
                            noOpenSource: noOpenSourceBool,
                            topProgrammer: topProgrammerBool,
                            
                            totalCost, 
                            webDevelopmentType, 
                            fullStackFramework,
                            programmingLanguage  
                    });
        
        await newAssignment.save();
        
        fs.unlinkSync(filePath);

        const mailOptions = {
            from: 'tk839587@gmail.com',
            to: email,
            subject: 'Assignment Submission Confirmation',
            html: `
                <p>Thank you for submitting your assignment request. Below are the details:</p>
                <body style="font-family: Arial, sans-serif; line-height: 1.6;">
                
                <div class="container" style="max-width: 600px; margin: 20px auto; padding: 20px; border: 1px solid #ccc; border-radius: 8px; background-color: #f9f9f9;">
                
                <h2 style="text-align: center; background: linear-gradient(to right, navy, white); -webkit-background-clip: text; -webkit-text-fill-color: transparent; font-weight: bold; margin-bottom: 20px;">Task Details</h2>
                
                <ul style="list-style-type: none; padding: 0;">
            
                    <li><span class="label" style="font-weight: bold;">Assignment Type:</span> ${assignmentType}</li>
                
                    <li><span class="label" style="font-weight: bold;">Days Until Due:</span> ${daysUntilDue}</li>
                
                    <li><span class="label" style="font-weight: bold;">Exact Deadline:</span> ${exactDeadline}</li>
                
                    <li><span class="label" style="font-weight: bold;">Desired Grade:</span> ${gradeDesired}</li>
                
                    <li><span class="label" style="font-weight: bold;">Additional Details:</span> ${additionalDetails}</li>
                
                    <li><span class="label" style="font-weight: bold;">Total Cost:</span> $${totalCost.toFixed(2)}</li>
                
                    <li><span class="label" style="font-weight: bold;">Programming Language:</span> ${programmingLanguage || 'N/A'}</li>
                
                    <li><span class="label" style="font-weight: bold;">Web Development Type:</span> ${webDevelopmentType || 'N/A'}</li>
                
                    <li><span class="label" style="font-weight: bold;">Full Stack Framework:</span> ${fullStackFramework || 'N/A'}</li>
                
                    <li><span class="label" style="font-weight: bold;">Top Programmer:</span> ${topProgrammer ? 'Yes' : 'No'}</li>
                
                    <li><span class="label" style="font-weight: bold;">Well-Commented Code:</span> ${wellCommentedCode ? 'Yes' : 'No'}</li>
                
                    <li><span class="label" style="font-weight: bold;">No Open Source:</span> ${noOpenSource ? 'Yes' : 'No'}</li>
                
                    <li><span class="label" style="font-weight: bold;">Viva Preparation:</span> ${vivaPreparation}</li>
                
                    <li><span class="label" style="font-weight: bold;">File Url:</span> ${fileUrl}</li>
            
                </ul>
            </div>
        </body>
                <p>We will contact you shortly regarding your assignment.</p>
            `
        };


        await transporter.sendMail(mailOptions);
        
        res.redirect(`/user-dashboard?
            assignmentType=${assignmentType}
            &daysUntilDue=${daysUntilDue}
            &exactDeadline=${exactDeadline}
            &fileUploads=${fileUploads}
            &gradeDesired=${gradeDesired}
            &totalCost=${totalCost.toFixed(2)}
            &email=${email}
            &wellCommentedCode=${wellCommentedCode ? 'Yes' : 'No'}
            &vivaPreparation=${vivaPreparation}
            &noOpenSource=${noOpenSource}
            &programmingLanguage=${programmingLanguage}
            &webDevelopmentType={webDevelopmentType}
            &fullStackFramework=${fullStackFramework}
            &topProgrammer=${topProgrammer}
            &additionalDetails=${additionalDetails}
            &fileUrl=${fileUrl}`
    );
    
    } 
    
    catch (error) {
        console.log('Error:', error);
        res.status(500).json({ message: 'Error submitting assignment', error });
    }
});




app.post('/submit', upload.single('file'), async (req, res) => {
    
    const { 
        
        assignmentType, 
        daysUntilDue, 
        exactDeadline, 
        gradeDesired, 
        email, 
        additionalDetails, 
        vivaRequired, 
        fileUploads, 
        professionalLevel, 
        programmingLanguage, 
        webDevelopmentType, 
        fullStackFramework, 
        topProgrammer, 
        wellCommentedCode, 
        noOpenSource, 
        vivaPreparation, 
        taskSize 
          
    } = req.body;
  

    // Convert checkbox strings to Booleans
    const wellCommentedCodeBool = wellCommentedCode === 'on';
    const noOpenSourceBool = noOpenSource === 'on';
    const topProgrammerBool = topProgrammer === 'on';


    let basePrice = 50;
    let urgencyMultiplier = 1;

    if (daysUntilDue <= 3) {
        urgencyMultiplier = 2;
    } 
    
    else if (daysUntilDue <= 7) {
        urgencyMultiplier = 1.5;
    }

    
    let gradeMultiplier = 1;
    if (typeof gradeDesired === 'string' && gradeDesired.toLowerCase() === 'a') {
        gradeMultiplier = 1.5;
    } 
    
    else if (typeof gradeDesired === 'string' && gradeDesired.toLowerCase() === 'b') {
        gradeMultiplier = 1.2;
    }


    let professionalLevelCost = professionalLevel ? basePrice * 0.3 : 0; // Additional 30% for professional level
    
    let vivaCost = vivaRequired ? basePrice * 0.2 : 0; // Additional 20% for viva
    
    let topProgrammerCost = topProgrammer ? basePrice * 0.1 : 0; // Additional 10% for top programmer
    
    let vivaPreparationCost = vivaPreparation === 'yes' ? basePrice * 0.15 : 0; // Additional 15% for viva preparation

    
    // Task size multipliers
    let taskSizeMultiplier = 1;
    
    switch (taskSize) {
        case 'extraSmall': taskSizeMultiplier = 0.5; break;
        case 'small': taskSizeMultiplier = 0.75; break;
        case 'medium': taskSizeMultiplier = 1; break;
        case 'large': taskSizeMultiplier = 1.25; break;
        case 'professional': taskSizeMultiplier = 1.5; break;
    }

    
    const totalCost = basePrice * urgencyMultiplier * gradeMultiplier * taskSizeMultiplier + professionalLevelCost + vivaCost + topProgrammerCost + vivaPreparationCost;

    
    const filePath = path.join(__dirname, 'uploads', req.file.filename);
    const mimeType = req.file.mimetype;
    
    
    try {
           
        const response = await drive.files.create({
            requestBody: {
                name: req.file.originalname,
                mimeType: mimeType,
            },
        
            media: {
                mimeType: mimeType,
                body: fs.createReadStream(filePath),
                    },
            });
            
                    const fileId = response.data.id;
            
                    await drive.permissions.create({
                        fileId: fileId,
                        requestBody: {
                            role: 'reader',
                            type: 'anyone',
                        },
                    });
            
                    const fileUrl = `https://drive.google.com/file/d/${fileId}/view`;
            
        
                    // -------------------------------------------
                    
                    // File Sharing code will be here for the future.
                    // Account details will be given here for the file
                    // sharing in case when the file link or other things
                    // got corrupted or other issues 
                    
                    // -------------------------------------------
        
        
                    const newAssignment = new Assignment({
                            
                        filename: req.file.originalname,
                        mimeType: mimeType,
                        googleDriveId: fileId,
                        fileUrl: fileUrl,
                     
                        assignmentType, 
                        daysUntilDue, 
                        exactDeadline, 
                        gradeDesired, 
                        email, 
                        additionalDetails, 
                        fileUploads, 
                        vivaPreparation,
                        
                        wellCommentedCode: wellCommentedCodeBool,
                        noOpenSource: noOpenSourceBool,
                        topProgrammer: topProgrammerBool,
                        
                        totalCost, 
                        webDevelopmentType, 
                        fullStackFramework,
                        programmingLanguage
                                        
                    });
        
        await newAssignment.save();
        
        fs.unlinkSync(filePath);

        const mailOptions = {
            from: 'tk839587@gmail.com',
            to: email,
            subject: 'Assignment Submission Confirmation',
            html: `
                <p>Thank you for submitting your assignment request. Below are the details:</p>
                <body style="font-family: Arial, sans-serif; line-height: 1.6;">
                
                <div class="container" style="max-width: 600px; margin: 20px auto; padding: 20px; border: 1px solid #ccc; border-radius: 8px; background-color: #f9f9f9;">
                
                <h2 style="text-align: center; background: linear-gradient(to right, navy, white); -webkit-background-clip: text; -webkit-text-fill-color: transparent; font-weight: bold; margin-bottom: 20px;">Task Details</h2>
                
                <ul style="list-style-type: none; padding: 0;">
            
                    <li><span class="label" style="font-weight: bold;">Assignment Type:</span> ${assignmentType}</li>
                
                    <li><span class="label" style="font-weight: bold;">Days Until Due:</span> ${daysUntilDue}</li>
                
                    <li><span class="label" style="font-weight: bold;">Exact Deadline:</span> ${exactDeadline}</li>
                
                    <li><span class="label" style="font-weight: bold;">Desired Grade:</span> ${gradeDesired}</li>
                
                    <li><span class="label" style="font-weight: bold;">Additional Details:</span> ${additionalDetails}</li>
                
                    <li><span class="label" style="font-weight: bold;">Total Cost:</span> $${totalCost.toFixed(2)}</li>
                
                    <li><span class="label" style="font-weight: bold;">Programming Language:</span> ${programmingLanguage || 'N/A'}</li>
                
                    <li><span class="label" style="font-weight: bold;">Web Development Type:</span> ${webDevelopmentType || 'N/A'}</li>
                
                    <li><span class="label" style="font-weight: bold;">Full Stack Framework:</span> ${fullStackFramework || 'N/A'}</li>
                
                    <li><span class="label" style="font-weight: bold;">Top Programmer:</span> ${topProgrammer ? 'Yes' : 'No'}</li>
                
                    <li><span class="label" style="font-weight: bold;">Well-Commented Code:</span> ${wellCommentedCode ? 'Yes' : 'No'}</li>
                
                    <li><span class="label" style="font-weight: bold;">No Open Source:</span> ${noOpenSource ? 'Yes' : 'No'}</li>
                
                    <li><span class="label" style="font-weight: bold;">Viva Preparation:</span> ${vivaPreparation}</li>
                
                    <li><span class="label" style="font-weight: bold;">File Url:</span> ${fileUrl}</li>
            
                </ul>
            </div>
        </body>
                <p>We will contact you shortly regarding your assignment.</p>
            `
        };


        await transporter.sendMail(mailOptions);
        
        res.redirect(`/results?
            assignmentType=${assignmentType}
            &daysUntilDue=${daysUntilDue}
            &exactDeadline=${exactDeadline}
            &fileUploads=${fileUploads}
            &gradeDesired=${gradeDesired}
            &totalCost=${totalCost.toFixed(2)}
            &email=${email}
            &wellCommentedCode=${wellCommentedCode ? 'Yes' : 'No'}
            &vivaPreparation=${vivaPreparation}
            &noOpenSource=${noOpenSource}
            &programmingLanguage=${programmingLanguage}
            &webDevelopmentType={webDevelopmentType}
            &fullStackFramework=${fullStackFramework}
            &topProgrammer=${topProgrammer}
            &additionalDetails=${additionalDetails}
            &fileUrl=${fileUrl}`
    );
    
    } 
    
    catch (error) {
        console.log('Error:', error);
        res.status(500).json({ message: 'Error submitting assignment', error });
    }
});




app.get('/fetch-assignments', async (req, res) => {

    try {
        // Extract email from query parameters
        const email = req.query.email;

        // Check if the email is present and is a string
        if (typeof email !== 'string') {
            return res.status(400).send('Invalid email format');
        }

        // Find the user based on email
        const foundUser = await User.findOne({ email });

        if (!foundUser) {
            return res.status(404).send('User not found');
        }

        console.log(`User found: ${foundUser}`);

        // Find assignments specific to the user's email
        const assignments = await Assignment.find({ email });

        res.json(assignments);
    } 
    
    catch (error) {
        console.error('Error fetching assignments:', error);
        res.status(500).send('Internal Server Error');
    }
});




app.get('/results', (req, res) => {
    
    const { 
        
        assignmentType, 
        daysUntilDue, 
        exactDeadline, 
        gradeDesired, 
        email, 
        additionalDetails, 
        fileUploads, 
        totalCost,
        wellCommentedCode,
        vivaPreparation,
        noOpenSource,
        programmingLanguage,
        webDevelopmentType,
        fullStackFramework,
        topProgrammer,
        fileUrl
    
    } = req.query;

    // Assuming totalCost needs to be formatted to two decimal places
    const formattedTotalCost = parseFloat(totalCost).toFixed(2);

    res.render('./main/result', { 
        assignmentType, 
        daysUntilDue, 
        exactDeadline, 
        gradeDesired, 
        email, 
        additionalDetails, 
        fileUploads, 
        totalCost: formattedTotalCost,
        wellCommentedCode,
        vivaPreparation,
        noOpenSource,
        programmingLanguage,
        webDevelopmentType,
        fullStackFramework,
        topProgrammer,
        fileUrl
    });
});




app.get('/login-user', (req, res) => {
    res.render("./user/login-signup-user", { error: null });
});




app.get('/check-login-status', (req, res) => {
    
    if (req.session.user) {
        res.json({ loggedIn: true });
    } 
    
    else {
        res.json({ loggedIn: false });
    }
});




app.post('/login-user', async (req, res) => {
    const { username, email, password } = req.body;

    try {
        const foundUser = await User.findOne({ username, email, password });

        if (foundUser) {
            // Store user data in session
            req.session.user = foundUser;
            res.redirect('/user-dashboard');
        } 
        
        else {
            res.render('./user/login-signup-user', { error: 'Invalid username, email, or password.' });
        }
    } 
    
    catch (err) {
        console.error(err);
        res.sendStatus(500);
    }
});




app.post('/signup-user', async (req, res) => {
    
    try {
        const { username, email, password } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(400).json({ error: 'User already exists' });
        }

        // Create a new user
        const newUser = new User({ username, email, password});
        await newUser.save();

        const foundUser = await User.findOne({ username, email, password });

        if (foundUser) {
            res.render('./user/user-dashboard', { user: foundUser});  // Render form with prefilled data
        }

    } 
    
    catch (error) {
        console.error('Error during signup:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});




app.get('/user-dashboard', isAuthenticated, async (req, res) => {
    
    try {
        const assignments = await Assignment.find({ email: req.session.user.email }).sort({ createdAt: -1 });
        
        res.render('./user/user-dashboard', { user: req.session.user, assignments });
    } 
    
    catch (error) {
        res.status(500).json({ message: 'Error fetching assignments', error });
    }
});




app.get('/logout', (req, res) => {
    
    req.session.destroy(err => {
        
        if (err) {
            return res.redirect('/user-dashboard');
        }
        
        res.clearCookie('connect.sid');
        res.redirect('/');
    });

});




app.get('/check-username', async (req, res) => {
    const { username } = req.query;

    try {
        const user = await User.findOne({ username });

        if (user) {
            res.json({ exists: true });
        } 
        
        else {
            res.json({ exists: false });
        }
    } 
    
    catch (err) {
        console.error(err);
        res.sendStatus(500);
    }

});




app.post('/reset-password-user', async (req, res) => {

    const email = req.body.email;
    const username = req.body.username

    try {
        const foundUser = await User.findOne({ email, username });

        if (foundUser) {
            const resetToken = crypto.randomBytes(20).toString('hex');
            foundUser.resetToken = resetToken;
            foundUser.resetTokenExpiration = Date.now() + 3600000; // 1 hour
            await foundUser.save();

            const mailOptions = {
                from: 'tk839587@gmail.com',
                to: foundUser.email,
                subject: 'Password Reset',

                html: 
                
                `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 20px auto; padding: 20px; border: 1px solid #ccc; border-radius: 8px; background: linear-gradient(to right, navy, white); text-align: center; position: relative;">
                    
                    <h1 style="color: #fff; margin-top: 0; padding: 20px 0; text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3); animation: fadeIn 2s ease-in-out;">
                    
                    <span style="font-weight: bold; font-size: 24px;">Do Task For Me</span>
                    
                    </h1>
                
                    <div style="background-color: #fff; padding: 20px; border-radius: 8px; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);">
                    
                    <p style="margin-bottom: 20px; color: #333;">You are receiving this email because you requested a password reset.</p>
                    
                    <p style="margin-bottom: 20px; color: #333;">Please click the following link to reset your password:</p>
                    
                    <a href="http://localhost:3000/reset-password-user/${resetToken}" style="display: inline-block; padding: 10px 20px; background-color: #007bff; color: #fff; text-decoration: none; border-radius: 5px;">Reset Password</a>
                </div>
            </div>
            <style>
                @keyframes fadeIn {
                    0% {
                        opacity: 0;
                    }
                100% {
                    opacity: 1;
                }
            }
            </style>
        
        `
            };

            await transporter.sendMail(mailOptions);
        
            res.render('./user/reset-password-user', { success: true, error: null });
        } 
        
        else {
            res.render('./user/reset-password-user', { error: 'Invalid email.' });
        }
    } 
    
    catch (err) {
        console.error(err);
        res.sendStatus(500);
    }
});




app.get('/reset-password-user/:resetToken', async (req, res) => {
    const resetToken = req.params.resetToken;

    try {
        const foundUser = await User.findOne({ resetToken });

        if (foundUser && foundUser.resetTokenExpiration > Date.now()) {
            res.render('./user/reset-password-user', { resetToken, user: foundUser, error: null, success: false });
        } 
        
        else {
            res.render('./user/reset-password-user', { resetToken, user: null, error: 'Invalid or expired reset token.', success: false });
        }
    } 
    
    catch (err) {
        console.error(err);
        res.sendStatus(500);
    }
});




app.post('/reset-password-user/:resetToken', async (req, res) => {
    const resetToken = req.params.resetToken;
    const newPassword = req.body.newPassword;

    try {
        const foundUser = await User.findOne({ resetToken });

        if (foundUser && foundUser.resetTokenExpiration > Date.now()) {
            foundUser.password = newPassword;
            foundUser.resetToken = null;
            foundUser.resetTokenExpiration = null;
            await foundUser.save();
            res.render('./user/password-reset-success-user', { message: 'Your password has been successfully reset.' });
        } 
        
        else {
            res.render('./user/reset-password-user', { resetToken: null, user: null, error: 'Invalid or expired reset token.', success: false });
        }
    } 
    
    catch (err) {
        console.error(err);
        res.sendStatus(500);
    }
});




app.get('/admin-login-signup', async (req, res) => {
    res.render("./admin/login-signup-admin.ejs");
});




app.post('/login-admin', async (req, res) => {
    const { email, password } = req.body;

    try {
        const foundAdmin = await Admin.findOne({ email, password });

        if (foundAdmin) {
            res.render('./admin/admin-dashboard', { user: foundAdmin });
        } 
        
        else {
            res.render('./admin/login-signup-admin.ejs', { error: 'Invalid email or password.' });
        }
    } 
    
    catch (err) {
        console.error(err);
        res.sendStatus(500);
    }
});




app.post('/signup-admin', async (req, res) => {
    const { name, email, password } = req.body;

    try {
        const newAdmin = new Admin({
            name,
            email,
            password
        });

        await newAdmin.save();
        res.render('./admin/admin-dashboard', { user: newAdmin });
    } 
    
    catch (err) {
        console.error(err);
        res.sendStatus(500);
    }
});




app.post('/reset-password-admin', async (req, res) => {
    const email = req.body.email;

    try {
        const foundAdmin = await Admin.findOne({ email });

        if (foundAdmin) {
            const resetToken = crypto.randomBytes(20).toString('hex');
            foundAdmin.resetToken = resetToken;
            foundAdmin.resetTokenExpiration = Date.now() + 3600000; // 1 hour
            await foundAdmin.save();

            const mailOptions = {
                from: 'tk839587@gmail.com',
                to: foundAdmin.email,
                subject: 'Password Reset',
                
                html: 
                
                `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 20px auto; padding: 20px; border: 1px solid #ccc; border-radius: 8px; background: linear-gradient(to right, navy, white); text-align: center; position: relative;">
                    
                    <h1 style="color: #fff; margin-top: 0; padding: 20px 0; text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3); animation: fadeIn 2s ease-in-out;">
                    
                    <span style="font-weight: bold; font-size: 24px;">Do Task For Me</span>
               
                    </h1>
                    
                    <div style="background-color: #fff; padding: 20px; border-radius: 8px; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);">
                    
                    <p style="margin-bottom: 20px; color: #333;">You are receiving this email because you requested a password reset.</p>
                    
                    <p style="margin-bottom: 20px; color: #333;">Please click the following link to reset your password:</p>
                    
                    <a href="http://localhost:3000/reset-password-admin/${resetToken}" style="display: inline-block; padding: 10px 20px; background-color: #007bff; color: #fff; text-decoration: none; border-radius: 5px;">Reset Password</a>
                </div>
            </div>
    
            <style>
                @keyframes fadeIn {
                    0% {
                        opacity: 0;
                    }
                100% {
                    opacity: 1;
                }
            }
            </style>
        `
            };

            await transporter.sendMail(mailOptions);
        
            res.render('./admin/reset-password-admin', { success: true, error: null });
        } 
        
        else {
            res.render('./admin/reset-password-admin', { error: 'Invalid email.' });
        }
    } 
    
    catch (err) {
        console.error(err);
        res.sendStatus(500);
    }
});




app.get('/reset-password-admin/:resetToken', async (req, res) => {
    const resetToken = req.params.resetToken;

    try {
        const foundAdmin = await Admin.findOne({ resetToken });

        if (foundAdmin && foundAdmin.resetTokenExpiration > Date.now()) {
            res.render('./admin/reset-password-admin', { resetToken, user: foundAdmin, error: null, success: false });
        } 
        
        else {
            res.render('./admin/reset-password-admin', { resetToken, user: null, error: 'Invalid or expired reset token.', success: false });
        }
    } 
    
    catch (err) {
        console.error(err);
        res.sendStatus(500);
    }
});




app.post('/reset-password-admin/:resetToken', async (req, res) => {
    const resetToken = req.params.resetToken;
    const newPassword = req.body.newPassword;

    try {
        const foundAdmin = await Admin.findOne({ resetToken });

        if (foundAdmin && foundAdmin.resetTokenExpiration > Date.now()) {
            foundAdmin.password = newPassword;
            foundAdmin.resetToken = null;
            foundAdmin.resetTokenExpiration = null;
            await foundAdmin.save();
            
            res.render('./admin/password-reset-success-admin', { message: 'Your password has been successfully reset.' });
        } 
        
        else {
            res.render('./admin/reset-password-admin', { resetToken: null, user: null, error: 'Invalid or expired reset token.', success: false });
        }
    } 
    
    catch (err) {
        console.error(err);
        res.sendStatus(500);
    }
});




app.get('/admin/dashboard', async (req, res) => {
    
    try {
        const assignments = await Assignment.find().sort({ createdAt: -1 });
        res.json(assignments);
    } 
    
    catch (error) {
        res.status(500).json({ message: 'Error fetching assignments', error });
    }
});




app.post('/admin/update-status/:id', async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    try {
        const assignment = await Assignment.findByIdAndUpdate(id, { status }, { new: true });

        if (status === 'started') {
            const mailOptions = {
                from: 'tk839587@gmail.com',
                to: assignment.email,
                subject: 'Work Started Notification',
                text: `Hello,

                Your assignment "${assignment.assignmentType}" has been marked as started.

                Thank you,
                Our Team
                Do Task For Me
                `
            };

            await transporter.sendMail(mailOptions);

        }

        res.json({ message: 'Status updated' });
    } 
    
    catch (error) {
        res.status(500).json({ message: 'Error updating status', error });
    }

});




app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}/`);
});

// --------------------- End ---------------------


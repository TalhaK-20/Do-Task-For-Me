# Do Task For Me - Full Stack Task Management System

![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Express.js](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)
![EJS](https://img.shields.io/badge/EJS-8A2BE2?style=for-the-badge&logo=javascript&logoColor=white)
![Google Drive API](https://img.shields.io/badge/Google%20Drive-4285F4?style=for-the-badge&logo=googledrive&logoColor=white)

## Overview

**Do Task For Me** is a comprehensive full-stack web application designed for managing academic and professional task assignments. The platform facilitates seamless task submission, real-time status tracking, automated email notifications, and integrated file management through Google Drive.

**Live Website:** [dotaskforme.onrender.com](https://dotaskforme.onrender.com)

## Features

### 🔐 Authentication & Security
- Multi-provider OAuth Integration (Google, Facebook, LinkedIn)
- Session-based authentication with secure cookie management
- Admin security layer with custom security keys
- Password reset functionality with token-based verification

### 📊 Task Management
- Complete task lifecycle management (Submission → Processing → Completion)
- Real-time status updates (Not Started → Started → Completed)
- Payment status tracking (Not Paid Yet → Paid)
- Advanced assignment categorization and filtering

### 📧 Communication System
- Automated email notifications for task events
- Professional email templates with responsive design
- Multi-recipient BCC functionality

### 📁 File Management
- Google Drive API integration for secure file storage
- Automatic file permission management
- Download link generation for completed tasks

### 👥 User Roles
- **User Dashboard**: Task submission and status tracking
- **Admin Dashboard**: Complete system oversight and management

## Technology Stack

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Template Engine**: EJS
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: Passport.js

### Frontend
- **Templating**: EJS with partials and layouts
- **Styling**: Custom CSS with responsive design
- **Client-side**: Vanilla JavaScript

### External Services
- **File Storage**: Google Drive API
- **Email Service**: Nodemailer with Gmail SMTP
- **Session Storage**: MongoDB session store

## Installation

### Prerequisites
- Node.js (v14 or higher)
- MongoDB Atlas account
- Google Cloud Platform account
- Gmail account for email services

### Setup Steps

1. **Clone the repository**
```bash
git clone <repository-url>
cd Do-Task-For-Me
```

2. **Install dependencies**
```bash
npm install
```

3. **Environment Configuration**
Create a `.env` file:
```env
MONGODB_URI=your_mongodb_connection_string
GOOGLE_DRIVE_FOLDER_ID=your_google_drive_folder_id
EMAIL_USER=your_gmail_address
EMAIL_PASS=your_gmail_app_password
SESSION_SECRET=your_session_secret
GOOGLE_CLIENT_ID=your_google_oauth_client_id
GOOGLE_CLIENT_SECRET=your_google_oauth_client_secret
```

4. **Google Drive API Setup**
- Enable Google Drive API in Google Cloud Console
- Create service account credentials
- Update credentials in `app.js`

5. **Start the application**
```bash
npm start
```

## Project Structure

```
Do-Task-For-Me/
├── middlewares/          # Custom middleware functions
├── public/              # Static assets (CSS, JS, images)
├── views/               # EJS templates
│   ├── main/            # Main pages and landing pages
│   ├── user/            # User dashboard and authentication
│   ├── admin/           # Admin interface
│   └── email-templates/ # Dynamic email templates
├── uploads/             # Temporary file storage
├── app.js              # Main application file
└── package.json        # Dependencies and scripts
```

## Database Models

### User Schema
```javascript
{
  googleId: String,
  name: String,
  username: { type: String, unique: true },
  email: { type: String, unique: true },
  password: String,
  resetToken: String,
  resetTokenExpiration: Date
}
```

### Assignment Schema
```javascript
{
  assignmentType: String,
  exactDeadline: Date,
  email: String,
  whatsapp: String,
  additionalDetails: String,
  status: { type: String, default: 'Not Started' },
  payment_status: { type: String, default: 'Not Paid Yet' },
  totalCost: Number,
  fileUrl: String,
  taskSubmissionUrl: String,
  professionalLevel: Boolean,
  programmingLanguage: String,
  webDevelopmentType: String
}
```

### Admin Schema
```javascript
{
  name: String,
  email: { type: String, unique: true },
  password: String,
  resetToken: String,
  resetTokenExpiration: Date
}
```

## API Routes

### Authentication Routes
- `POST /login-user` - User authentication
- `POST /signup-user` - User registration
- `GET /auth/google` - Google OAuth authentication
- `POST /reset-password-user` - Password reset initiation

### Assignment Routes
- `POST /submit-form` - Task submission with file upload
- `GET /fetch-assignments` - Retrieve user assignments
- `GET /assignment-details` - Detailed assignment view
- `GET /user-dashboard` - User dashboard with assignments

### Admin Routes
- `POST /admin/update-status/:id` - Update task status
- `POST /admin/update-payment-status/:id` - Update payment status
- `POST /admin/update-cost/:id` - Update assignment cost
- `POST /admin/completed-work/submission` - Submit completed work
- `GET /admin/dashboard` - Admin dashboard data
- `GET /fetch-all-assignments` - Get all assignments with filtering

### Public Routes
- `GET /` - Main landing page
- `GET /services` - Services page
- `GET /contact-us` - Contact page
- `GET /stem-assignments/*` - STEM assignment categories
- `GET /academic-writing/*` - Academic writing services

## Key Features Implementation

### File Upload System
```javascript
const upload = multer({ dest: 'uploads/', limits: { fileSize: 5 * 1024 * 1024 } });

// Google Drive integration
const drive = google.drive({ version: 'v3', auth });
const response = await drive.files.create({
  requestBody: { name: req.file.originalname, mimeType: mimeType },
  media: { mimeType: mimeType, body: fs.createReadStream(filePath) }
});
```

### Email System
```javascript
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: { user: 'dotaskforme@gmail.com', pass: 'app_password' }
});

// Dynamic email templates using EJS
const emailHtml = ejs.render(template, { assignmentData });
```

### Authentication Middleware
```javascript
const isAuthenticated = (req, res, next) => {
  if (req.session.user) {
    return next();
  }
  res.redirect('/login-user');
};
```

## Deployment

The application is configured for deployment on Render.com with:
- Automatic SSL certificate handling
- MongoDB Atlas cloud database
- Environment variable configuration
- Process management

## Security Features

- Input validation and sanitization
- File type and size restrictions (5MB limit)
- Secure session management with MongoDB store
- OAuth 2.0 implementation
- Environment variable protection
- CSRF protection measures

## Performance Optimizations

- MongoDB indexing for efficient queries
- File streaming for large uploads
- Session storage optimization
- Template caching
- CDN-ready static assets

## Support

For technical support or inquiries:
- **Email**: dotaskforme@gmail.com
- **Live Site**: [dotaskforme.onrender.com](https://dotaskforme.onrender.com)

## License

This project is proprietary and confidential. All rights reserved.

---

**Built with ❤️ using Node.js, Express, EJS, MongoDB and Google Drive API**

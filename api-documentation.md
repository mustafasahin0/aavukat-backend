# API Documentation

## Admin Routes

### Authentication

- **POST** `/admin/auth/` - Register a new admin
- **POST** `/admin/auth/signin` - Log in as an admin
- **POST** `/admin/auth/otp-verification` - Verify OTP for admin login
- **POST** `/admin/auth/resend-otp` - Resend OTP for admin login
- **POST** `/admin/auth/forgot-password` - Request a password reset
- **PATCH** `/admin/auth/update-password` - Update admin password
- **GET** `/admin/auth/refresh` - Refresh admin access token
- **POST** `/admin/auth/logout` - Log out admin

### Statistics

- **GET** `/admin/client-gender` - Get gender statistics of clients
- **GET** `/admin/revenue` - Get revenue statistics
- **GET** `/admin/appointments` - Get appointment statistics

### Client Management

- **GET** `/admin/client` - Retrieve list of clients
- **PUT** `/admin/client` - Update client information

### Lawyer Management

- **GET** `/admin/lawyer` - Retrieve list of lawyers
- **PUT** `/admin/lawyer` - Update lawyer information
- **PUT** `/admin/lawyer/verify` - Verify a lawyer's account

## Socket.IO Namespaces

- **/chat** - Namespace for chat functionality
- **/video-section** - Namespace for video section functionality
- **/notification** - Namespace for notification functionality

## Appointment Routes

### Client Routes

- **GET** `/appointments/client/details/:appointmentId` - Get details of a specific appointment
- **GET** `/appointments/client/success/:paymentId` - Get success details for a payment
- **POST** `/appointments/client/` - Create a new appointment
- **GET** `/appointments/client/` - Retrieve all appointments for a client
- **PUT** `/appointments/client/` - Update appointment status and notes

### Lawyer Routes

- **GET** `/appointments/lawyer/details/:appointmentId` - Get details of a specific appointment
- **GET** `/appointments/lawyer` - Retrieve all appointments for a lawyer
- **PUT** `/appointments/lawyer/` - Update an appointment

## Authentication Routes

### Admin Routes

- **POST** `/admin/auth/` - Register a new admin
- **POST** `/admin/auth/signin` - Log in as an admin
- **POST** `/admin/auth/otp-verification` - Verify OTP for admin login
- **POST** `/admin/auth/resend-otp` - Resend OTP for admin login
- **POST** `/admin/auth/forgot-password` - Request a password reset
- **PATCH** `/admin/auth/update-password` - Update admin password
- **GET** `/admin/auth/refresh` - Refresh admin access token
- **POST** `/admin/auth/logout` - Log out admin

## Lawyer Routes

### Authentication

- **POST** `/lawyer/auth/` - Register a new lawyer
- **POST** `/lawyer/auth/signin` - Log in as a lawyer
- **POST** `/lawyer/auth/otp-verification` - Verify OTP for lawyer login
- **POST** `/lawyer/auth/resend-otp` - Resend OTP for lawyer login
- **POST** `/lawyer/auth/forgot-password` - Request a password reset
- **PATCH** `/lawyer/auth/update-password` - Update lawyer password
- **GET** `/lawyer/auth/refresh` - Refresh lawyer access token
- **POST** `/lawyer/auth/logout` - Log out lawyer
- **POST** `/lawyer/auth/upload-url` - Upload profile image URL
- **GET** `/lawyer/auth/upload-url` - Get upload URL for profile image

### Client Management Routes

- **GET** `/lawyer/` - Retrieve list of clients for a lawyer
- **GET** `/lawyer/legal-history/:clientId` - Get legal history of a specific client

## Client Routes

### Authentication

- **POST** `/client/auth/` - Register a new client
- **POST** `/client/auth/login` - Log in as a client
- **POST** `/client/auth/oauth-signin` - Log in via OAuth
- **POST** `/client/auth/resend-otp` - Resend OTP for client login
- **POST** `/client/auth/otp-verification` - Verify OTP for client login
- **GET** `/client/auth/refresh` - Refresh client access token
- **POST** `/client/auth/forget-password` - Request a password reset
- **PATCH** `/client/auth/update-password` - Update client password
- **POST** `/client/auth/logout` - Log out client

### Profile Management

- **GET** `/client/profile` - Get client profile
- **PUT** `/client/profile` - Update client profile
- **GET** `/client/profile/upload-url` - Get upload URL for profile image
- **PUT** `/client/profile/upload-url` - Complete profile image upload

## Legal Document Routes

### Lawyer Routes

- **POST** `/legal-documents` - Create a new legal document
- **PUT** `/legal-documents` - Update a legal document
- **DELETE** `/legal-documents/:id` - Delete a legal document
- **POST** `/legal-documents/:id/attachments` - Add attachments to a legal document

### Client Routes

- **GET** `/legal-documents` - Get all legal documents
- **GET** `/legal-documents/:id` - Get a specific legal document
- **POST** `/legal-documents/:id/sign` - Sign a legal document

## Slot Routes

- **GET** `/slots` - Get all slots
- **POST** `/slots` - Create a new slot
- **PUT** `/slots` - Update a slot
- **DELETE** `/slots` - Delete a slot
- **GET** `/slots/lawyer` - Get all slots for lawyers
- **GET** `/slots/:lawyerId` - Get all slots for a specific lawyer

## Video Routes

### Video Section Access for Clients

- **GET** `/video/client/day` - Get video sections for clients for a specific day
- **GET** `/video/client/:sectionId` - Get details of a specific video section for a client

### Video Section Access for Lawyers

- **GET** `/video/lawyer/day` - Get video sections for lawyers for a specific day
- **GET** `/video/lawyer/:sectionId` - Get details of a specific video section for a lawyer
- **GET** `/video/lawyer` - Get all video sections for lawyers

# E-commerce API PRO

A complete, production-ready E-commerce REST API built with Node.js, Express, TypeScript, and MongoDB. Includes image uploads to Cloudinary, professional email templates via Nodemailer, and interactive Swagger documentation.

## Features

- **Auth**: JWT Authentication with Role-Based Access Control (RBAC).
- **CRUD Operations**: Complete management for Products, Categories, and Orders.
- **Media**: Image uploads using Multer and streaming to Cloudinary.
- **Database**: Advanced MongoDB connection with automatic retry logic.
- **Email**: HTML-templated welcome emails using Nodemailer.
- **Documentation**: Swagger/OpenAPI documentation.
- **Security**: Helmet, CORS, and Zod environment validation.

## Prerequisites

- Node.js (v16+)
- MongoDB (Local or Atlas)
- Cloudinary Account
- SMTP Service (e.g., Mailtrap for testing)

## Installation

1. Clone or download the repository.
2. Install dependencies:
    `npm install`

3. Create a `.env` file based on `.env.example` and fill in your credentials.

## Running the Application

1. **Build the project (optional for dev)**:
    `npm run build`

2. **Seed the Admin User**:
    `npm run seed:admin`

3. **Start in Development Mode**:
    `npm run dev`

4. **Start in Production Mode**:
    `npm start`

## API Documentation

Once the server is running, visit:
`http://localhost:5000/api-docs`

## Project Structure

- `src/config`: Connection logic for DB, Cloudinary, Swagger, etc.
- `src/controllers`: Request handling logic.
- `src/middlewares`: Auth, Error, and Upload middlewares.
- `src/models`: Mongoose schemas.
- `src/routes`: Express route definitions.
- `src/services`: Email and Upload utility services.
- `src/templates`: HTML email templates.
- `scripts`: Utility scripts for seeding and maintenance.

## Troubleshooting

- **MongoDB Connection**: If the DB fails to connect, the system will retry 5 times with a 5-second interval. Ensure `MONGODB_URI` is correct.
- **Cloudinary Uploads**: Ensure `CLOUDINARY_API_KEY` and others are set. Files are stored in memory and streamed for security.
- **Email Service**: If emails are not sent, verify SMTP settings in `.env`. The app logs connection status on startup.

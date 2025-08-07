# Simple Blog CMS - Full-Stack Code Test

This project is a simple Content Management System (CMS) for a blog, built as a full-stack application. It features a React frontend and an Express.js (Node.js) backend with a MySQL database. The application allows an admin to manage all blog posts, while users can register, log in, view posts, and comment.

## Features

- **Full-stack Architecture**: Decoupled frontend (React) and backend (Express.js).
- **Complete User Authentication**: Local (email/password) registration and login, plus Google OAuth 2.0.
- **Admin Role**: A predefined admin user has full control over all blog posts.
- **Full CRUD for Posts**: Authenticated users can create posts. The original author or an admin can update and delete posts.
- **Unique Slug Generation**: Slugs are automatically generated from post titles. If a slug already exists, a number is appended to ensure uniqueness (e.g., `my-post`, `my-post-2`).
- **Commenting System**: Logged-in users can add comments to posts.
- **Modern & Responsive UI**: Clean user interface built with Tailwind CSS.

---

## Tech Stack

**Frontend:**

- **React.js (v19)** with Vite
- **React Router (v7)** for client-side routing
- **Tailwind CSS (v4)** for styling
- **Heroicons** for modern icons

**Backend:**

- **Node.js** with **Express.js**
- **MySQL** as the database
- **Sequelize** as the ORM (Object-Relational Mapper)
- **Passport.js** for authentication strategies (JWT, Local, Google OAuth)
- **JSON Web Tokens (JWT)** for session management via `httpOnly` cookies

---

## Setup and Installation

Follow these instructions to get the project running on your local machine.

### Prerequisites

- Node.js (v18 or later recommended)
- npm or yarn
- A running MySQL server

### 1. Backend Setup

First, navigate into the backend directory:

```bash
cd express-test-Copy
```

**Install dependencies:**

```bash
npm install
```

**Configure Environment Variables:**
Create a `.env` file in the `express-test-Copy` directory by copying the example file:

```bash
cp .env.example .env
```

Now, open the `.env` file and fill in your details:

```env
# JWT & Google Credentials
JWT_SECRET_KEY=your_super_secret_key
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# MySQL Database Connection
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=your_mysql_username
DB_PASSWORD=your_mysql_password
DB_NAME=random-post

# Admin User Role
ADMIN_EMAIL=admin@example.com
```

## Generating Credentials API

To run this application, you need to generate a JWT Secret Key and Google OAuth 2.0 credentials.

1. **How to Generate a JWT Secret Key**
   The JWT Secret Key is a long, random string that you create. It should be kept private. You can generate a strong secret key using an online generator or by running this command in your terminal:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Copy the generated string and place it in your backend's .env file as the value for JWT_SECRET_KEY.

2. **How to Get Google Client ID and Secret**
   Follow these steps to get your Google credentials for the login feature.

Step 1: Go to Google Cloud Console

- Navigate to the Google Cloud Console.
- If you don't have a project, create a New Project.

Step 2: Enable the Google People API

- In your project, go to the navigation menu and select APIs & Services > Library.
- Search for "Google People API" and click Enable. This is required to get user profile information like name and email.

Step 3: Configure the OAuth Consent Screen

- In the navigation menu, go to APIs & Services > OAuth consent screen.
- Choose External and click Create.
- Fill in the required fields:
- App name: Simple Blog CMS (or any name you prefer).
- User support email: Select your email address.
- Developer contact information: Enter your email address.
- Click Save and Continue.
- On the "Scopes" page, click Save and Continue.
- On the "Test users" page, click + Add Users and add your own Google email address. This is necessary while the app is in "Testing" mode.
- Click Save and Continue, then go back to the dashboard.

Step 4: Create OAuth 2.0 Credentials

- In the navigation menu, go to APIs & Services > Credentials.
- Click + CREATE CREDENTIALS at the top and select OAuth client ID.
- For Application type, select Web application.
- Give it a name, e.g., "Blog CMS Web Client".
- Under Authorized JavaScript origins, click + ADD URI and enter the URL of your frontend application:

```bash
http://localhost:5173
```

- Under Authorized redirect URIs, click + ADD URI and enter the callback URL of your backend server:

```bash
http://localhost:3000/auth/google/callback
```

- Click CREATE.

Step 5: Copy Your Credentials

- A pop-up will appear showing your Your Client ID and Your Client Secret.

- Copy these values and paste them into your backend's .env file:

```bash
GOOGLE_CLIENT_ID=paste_your_client_id_here
GOOGLE_CLIENT_SECRET=paste_your_client_secret_here
```

- Now, restart your backend server, and the Google Login feature should work perfectly with your new keys.

**Setup the Database:**
Ensure your MySQL server is running and create the database:

```sql
CREATE DATABASE IF NOT EXISTS random-post;
```

For more details database table you could prefer to

```bash
cd express-test-Copy/config/databse.sql
```

**Run the Backend Server:**

```bash
npm start
```

The backend server will start on `http://localhost:3000`. It will automatically synchronize the models with your database and create the necessary tables.

### 2. Frontend Setup

Open a new terminal and navigate to the root directory of the frontend.

**Install dependencies:**

```bash
npm install
```

**Configure Environment Variables:**
Create a `.env` file in the frontend's root directory:

```
VITE_ADMIN_EMAIL=admin@example.com
```

> **Note:** The `VITE_ADMIN_EMAIL` must match the `ADMIN_EMAIL` in the backend's `.env` file.

**Run the Frontend Development Server:**

```bash
npm run dev
```

The application will be available at `http://localhost:5173`.

---

## Predefined Admin User

To log in as the administrator, use the following credentials. It's recommended to create this user via the registration page first or by inserting them directly into your `Users` table.

- **Email:** `admin@example.com`
- **Password:** `your_chosen_admin_password`

---

## API Documentation

Detailed API documentation, including all available endpoints, request bodies, and example responses, has been created using Postman.

Please import the included Postman collection file (`Simple Post Blog.postman_collection`) into your Postman application to test and review the API.

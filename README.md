# 🏪 Store Rating Platform

A **Full-Stack Role-Based Store Rating Platform** built with **React + Node.js + Express + MySQL (Prisma ORM)**.  
This project was developed as part of the **Roxiler Solutions Fullstack Intern Challenge**.

---

## ✨ Features

### 👤 Normal User
- Sign up & login with JWT authentication.
- Browse all registered stores.
- Search stores by **Name** or **Address**.
- View:
  - Store Name
  - Address
  - Average Rating
  - User’s Submitted Rating
- Submit or update ratings (1–5 stars).
- Logout securely.

### 🏪 Store Owner
- Login with role-based access.
- Update password.
- Dashboard includes:
  - Store details
  - Average rating
  - Rating distribution
  - Recent ratings
  - List of users who rated their store

### 👨‍💻 System Administrator
- Add new stores, users, and admin accounts.
- Dashboard showing:
  - Total Users
  - Total Stores
  - Total Ratings
- Manage:
  - Users (filterable by name, email, role)
  - Stores (with ratings)
- Secure logout.

---

## 🛠️ Tech Stack

- **Frontend:** React.js (Vite), React Router, Axios, Context API  
- **Backend:** Node.js, Express.js  
- **Database:** MySQL with Prisma ORM  
- **Authentication:** JWT (JSON Web Tokens), bcrypt for password hashing  
- **Styling:** CSS (custom)  

---

## ⚙️ Installation & Setup Guide

Follow these steps to run the project locally 👇

### 1️⃣ Clone the repository
```bash
git clone https://github.com/Panubhati/Roxiler_solutions_task.git
cd Roxiler_solutions_task
```
### 2️⃣ Setup Backend
```bash
Go into backend folder:
cd backend

Install dependencies:
npm install

Create .env file inside backend/ with the following structure:

# Database connection
DATABASE_URL="mysql://root:password@localhost:3306/roxilerdb"

# JWT secret key
JWT_SECRET="your_secret_key"

# Server port
PORT=4000

Run Prisma migrations (to create tables in MySQL):
--> npx prisma migrate dev --name init


Start backend server:
--> node index.js

Backend will run on: http://localhost:4000
```
### 3️⃣ Setup Frontend
```bash
Go into frontend folder:
cd frontend

Install dependencies:
npm install

Start frontend server:
npm run dev

Frontend will run on: http://localhost:5173

```
### 📂 Project Structure
```bash
roxiler-solution-task/
│
│── backend/                  # Node.js + Express + Prisma backend
│   ├── prisma/               
│   │   ├── migrations/       # Database migrations
│   │   └── schema.prisma     # Prisma schema
│   │
│   ├── src/
│   │   ├── controllers/      # Controllers (business logic)
│   │   │   ├── adminController.js
│   │   │   ├── authController.js
│   │   │   ├── storeController.js
│   │   │   └── storeOwnerController.js
│   │   │
│   │   ├── middlewares/      # Middleware (auth, validation)
│   │   │   └── auth.js
│   │   │
│   │   └── routes/           # API routes
│   │       ├── admin.js
│   │       ├── auth.js
│   │       └── store.js
│   │
│   ├── .env                  # Environment variables
│   ├── index.js              # Backend entry point
│   ├── prismaClient.js       # Prisma client instance
│   └── package.json
│
│── frontend/                 # React + Vite frontend
│   ├── src/
│   │   ├── assets/           # Static assets (images, logos, etc.)
│   │   ├── components/       # Reusable components
│   │   ├── context/          # AuthContext (role-based auth)
│   │   └── pages/            # Page-level components
│   │       ├── Login.jsx / Login.css
│   │       ├── Signup.jsx
│   │       ├── AdminDashboard.jsx / AdminDashboard.css
│   │       ├── StoreOwnerDashboard.jsx / StoreOwnerDashboard.css
│   │       └── UserDashboard.jsx / UserDashboard.css
│   │
│   ├── App.jsx / App.css     # Main App component
│   ├── main.jsx              # Vite entry point
│   ├── index.css             # Global styles
│   └── package.json
│
└── README.md                 # Project documentation


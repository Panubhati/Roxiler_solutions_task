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

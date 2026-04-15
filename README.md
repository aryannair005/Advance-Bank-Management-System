# 🏦 Backend Ledger API

A secure and scalable backend system for managing financial accounts, transactions, and ledgers.

---

## 📌 Overview

The **Backend Ledger API** is a Node.js REST API built for core banking-style workflows such as:

- User authentication
- Account management
- Deposits and withdrawals
- Ledger history tracking

The project follows a modular **MVC architecture** for maintainability and scalability.

---

## 🚀 Features

- 🔐 JWT-based authentication
- 👤 User registration and login with hashed passwords
- 💳 Multi-account management
- 💸 Deposit and withdrawal transactions
- 📊 Ledger tracking for fund movements
- 📧 Email notifications via Nodemailer
- 🚫 Token blacklisting for secure logout
- 🧩 Clean modular architecture (controllers, models, routes, services)

---

## 🛠️ Tech Stack

- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB with Mongoose
- **Authentication:** JWT
- **Security:** bcryptjs
- **Email:** Nodemailer
- **Config:** dotenv

---

## 📂 Project Structure

- `server.js` – application entry point  
- `src/app.js` – Express app setup  
- `src/config/database.js` – DB connection logic  
- `src/controllers/` – request handlers  
  - `auth.controller.js`
  - `account.controller.js`
  - `transaction.controller.js`
- `src/middlewares/auth.middleware.js` – auth middleware
- `src/models/` – Mongoose schemas  
  - `user.model.js`
  - `account.model.js`
  - `transaction.model.js`
  - `ledger.model.js`
  - `blackList.model.js`
- `src/routes/` – route definitions  
  - `auth.routes.js`
  - `account.routes.js`
  - `transaction.routes.js`
- `src/services/email.service.js` – email utilities
- `.env` – environment variables

---

## ⚙️ Installation & Setup

1. Clone the repository:
   - `git clone https://github.com/aryannair005/Advance-Bank-Management-System.git`
   - `cd Advance-Bank-Management-System\Backend-Ledger`

2. Install dependencies:
   - `npm install`

3. Create a `.env` file in project root and configure:
   - `PORT=3000`
   - `MONGO_URI=your_mongodb_connection_string`
   - `JWT_SECRET=your_secret_key`
   - `EMAIL_USER=your_email_address`
   - `EMAIL_PASS=your_email_password`

4. Start the server:
   - Development: `npm run dev`
   - Production: `npm start`

Server default: `http://localhost:3000`

---

## 📡 API Endpoints (Typical)

### Authentication
- `POST /auth/register` — Register a user
- `POST /auth/login` — Login and receive token

### Accounts
- `POST /account/create` — Create account
- `GET /account/:id` — Get account details

### Transactions
- `POST /transaction/deposit` — Deposit amount
- `POST /transaction/withdraw` — Withdraw amount
- `GET /transaction/history` — Get ledger/transaction history

---

## 🧪 Example Request

`POST /transaction/deposit`

Request body:
- `accountId`: `"12345"`
- `amount`: `5000`

---

## 🔒 Security

- Password hashing using `bcryptjs`
- JWT-protected private routes
- Token blacklist for logout/session invalidation
- Environment-based secret management (`.env`)

---

## 📈 Future Improvements

- Swagger/OpenAPI documentation
- Role-based access control (RBAC)
- Rate limiting
- Unit/integration tests
- Docker support

---

## 👤 Author

**Aryan Nair**

---

## ⭐ Support

If this project helped you, consider giving it a **star** on GitHub.

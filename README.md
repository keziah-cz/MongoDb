# SipVerse — Express.js + MongoDB Atlas

SipVerse is an Express.js web application backed by MongoDB Atlas. It reuses the existing storefront, customer authentication, cart, checkout, and administrator dashboard while replacing the SQL database layer with MongoDB.

## Technology
- Node.js + Express.js
- MongoDB Atlas
- MongoDB Compass
- EJS
- Express Session + connect-mongo
- bcrypt
- Multer

## MongoDB collections
- `users` — customer accounts and hashed passwords
- `categories` — drink categories
- `products` — drink catalog data
- `orders` — customer orders with embedded order items
- `sessions` — Express session data

## Setup
1. Create a MongoDB Atlas cluster and database user.
2. Copy `.env.example` to `.env`.
3. Put your Atlas connection string in `MONGODB_URI`.
4. Set `MONGODB_DB`, `SESSION_SECRET`, `ADMIN_EMAIL`, and `ADMIN_PASSWORD`.
5. Run `npm install`.
6. Run `npm run dev` or `npm start`.
7. Open `http://localhost:3000`.

The application creates the required drink categories automatically on startup.

## MongoDB Compass
Use the same Atlas connection string in MongoDB Compass to demonstrate the database, collections, and documents.

## Express middleware
The project meaningfully uses request parsing middleware, static-file middleware, a request logger, authorization middleware (`requireCustomer` and `requireAdmin`), session middleware, and Multer image-upload middleware.

## Sessions
After login, the application stores the user's ID, name, email, and role in the session. The customer cart is also session-specific. Protected routes use the session to control access. Sessions are persisted in MongoDB through `connect-mongo`.

## CRUD
The administrator dashboard provides product Create, Read, Update, and Delete operations. Customer registration creates user documents and checkout creates order documents while updating product stock.

## Security
Never commit `.env`, real MongoDB Atlas connection strings, passwords, API keys, or other secrets. Only `.env.example` should be committed.

## Demonstration checklist
Show the running application, MongoDB Compass collections/documents, a meaningful CRUD operation, the MongoDB connection, middleware and protected routes, login/session/logout behavior, and the relevant source-code areas.

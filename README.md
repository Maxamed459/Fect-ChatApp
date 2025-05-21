# Fect-Chat

![Chat UI](./client/src/assets/chat%20app.jpg)

Fect-Chat is a modern, full-stack chat application built with the MERN stack (MongoDB, Express.js, React, Node.js). It offers real-time messaging capabilities, user authentication, and a sleek, responsive design.

## 🚀 Features

Real-Time Messaging: Instant communication between users.

User Authentication: Secure registration and login functionality.

Responsive Design: Optimized for both desktop and mobile devices.

User Profiles: Personalized user information and avatars.

Chat Rooms: Create and join multiple chat rooms.

Notifications: Real-time alerts for new messages and activities.

## 🛠️ Technologies Used

Frontend: React, Tailwind CSS, React Router

Backend: Node.js, Express.js, MongoDB, Mongoose

Real-Time Communication: Socket.IO

Authentication: JSON Web Tokens (JWT)

State Management: Redux Toolkit

Form Handling: Formik, Yup

## 📦 Installation

Prerequisites
Node.js (v14 or higher)

MongoDB (local or cloud instance)

Steps
Clone the repository

bash
Copy
Edit
git clone https://github.com/Maxamed459/Fect-Chat.git
cd Fect-Chat
Install dependencies

bash
Copy
Edit

# Install server dependencies

cd server
npm install

# Install client dependencies

cd ../client
npm install
Set up environment variables

Create a .env file in the server directory with the following content:

env
Copy
Edit
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
Run the application

bash
Copy
Edit

# Start the backend server

cd server
npm start

# Start the frontend development server

cd ../client
npm start
The application will be accessible at http://localhost:3000.

📁 Project Structure
csharp
Copy
Edit
Fect-Chat/
├── client/ # React frontend
│ ├── public/
│ └── src/
│ ├── components/
│ ├── pages/
│ ├── redux/
│ └── App.jsx
├── server/ # Express backend
│ ├── controllers/
│ ├── models/
│ ├── routes/
│ └── server.js
└── README.md
🧪 Testing
To run tests (if implemented), use the following commands:

bash
Copy
Edit

# Backend tests

cd server
npm test

# Frontend tests

cd ../client
npm test

🙌 Acknowledgments
Inspired by modern chat applications and real-time communication platforms.

Special thanks to the open-source community for providing invaluable resources and tools.

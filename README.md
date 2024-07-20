# Omegle Clone

A real-time video chat application inspired by Omegle, allowing users to connect with random strangers for video calls and text messaging.

## 🌐 Live Demo

Check out the live version of the project: [Omegle Clone Demo](http://omegel-clone.devrohit.tech/)

## 📑 Table of Contents
1. [Features](#-features)
2. [Tech Stack](#️-tech-stack)
3. [Deployment](#-deployment)
4. [How It Works](#-how-it-works)
5. [Project Setup](#️-project-setup)
6. [Future Improvements](#-future-improvements)
7. [Contributing](#-contributing)

## ✨ Features

- Random pairing with strangers
- Real-time video calling using WebRTC
- Text chat alongside video calls
- Ability to switch camera devices
- User-friendly interface for messaging and video controls

## 🛠️ Tech Stack

### Frontend
- React.js
- Socket.IO Client
- WebRTC API

### Backend
- Node.js
- Express.js
- Socket.IO
- Redis for user management and pairing

## 🚀 Deployment

This project is deployed on AWS, with both the frontend and backend served using Nginx.

## 🚀 How It Works

1. Users enter a username to join the chat
2. The server pairs random users and establishes a socket connection
3. WebRTC peer connection is set up for video calling
4. Users can exchange messages and switch cameras during the call
5. Users can disconnect and be paired with new strangers

## 🏗️ Project Setup

To get started with this project locally, follow these simple steps:

1. Clone the repository
 - git clone [repo-url]
2. Set up the Client
 - cd client
 - npm install
 - mv env .env
 - npm run dev
3. Set up the Server
 - cd server
 - npm install
 - mv env .env (fill redis parameters)
 - npm start

 ## 🌟 Future Improvements

- Enhanced error handling
- Additional chat features (emojis, file sharing)
- Improved UI/UX design
- Security enhancements
- Performance optimizations for scalability

## 🤝 Contributing

We welcome contributions to improve the Omegle Clone! Please follow these steps:

1. Fork the repository
2. Create a new branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📬 Contact

Rohit Bind - [rohitbindw@gmail.com](mailto:rohitbindw@gmail.com)

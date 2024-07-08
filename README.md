
# Project Setup

To get started with this project, follow these simple steps:

## 1. Clone the Repository

git clone [repo-url]

## 2. Set up the Client

cd client &&
npm install &&
npm run dev

## 3. Set up the Server

cd server &&
npm install &&
npm start

Certainly! Here's a summary of your project for a GitHub README:
Omegle Clone
This project is a real-time video chat application inspired by Omegle, allowing users to connect with random strangers for video calls and text messaging.
Features

Random pairing with strangers
Real-time video calling using WebRTC
Text chat alongside video calls
Ability to switch camera devices
User-friendly interface for messaging and video controls

Tech Stack
Frontend

React.js
Socket.IO Client
WebRTC API

Backend

Node.js
Express.js
Socket.IO
Redis for user management and pairing

Key Components

Video Call

LocalVideo: Manages user's own video stream
RemoteVideo: Displays stranger's video stream
ChangeCam: Allows switching between camera devices


Chat Interface

MessageBox: Displays chat messages
InputBox: Allows sending messages and finding new chat partners
ConnectionStatusBar: Shows current connection status


Core Functionality

useSocket: Custom hook for socket connection and user pairing
usePeerConnection: Manages WebRTC peer connections
webrtc-signaling: Handles WebRTC offer/answer exchange


Backend Logic

User pairing system
Socket event handling for messaging and video call signaling
Redis integration for efficient user management



How It Works

Users enter a username to join the chat
The server pairs random users and establishes a socket connection
WebRTC peer connection is set up for video calling
Users can exchange messages and switch cameras during the call
Users can disconnect and be paired with new strangers

Future Improvements

Enhanced error handling
Additional chat features (emojis, file sharing)
Improved UI/UX design
Security enhancements
Performance optimizations for scalability

Getting Started
(Include instructions on how to set up and run your project locally)
Contributing
(Include guidelines for contributing to your project)


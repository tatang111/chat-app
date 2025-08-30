import express from 'express';
import 'dotenv/config'
import cors from 'cors';
import http from 'http'
import { connectDB } from './lib/db.js';
import userRouter from './routes/user.route.js';
import messageRouter from './routes/message.route.js';
import { Server } from 'socket.io'

// Create Express app and HTTP Server
const app = express();
const server = http.createServer(app)


// Initialize socket.io server
export const io = new Server(server, {
    cors: { origin: "*" }
})

// Store online users
export const userSocketMap = {}; // { userId: socketId }

// Socket.io connection handler
io.on('connection', (socket) => {
    const userId = socket.handshake.query.userId;
    console.log("User connected", userId);

    if (userId) userSocketMap[userId] = socket.id;

    // Emit online users to all connected clients
    io.emit('getOnlineUsers', Object.keys(userSocketMap));

    socket.on('disconnect', () => {
        console.log("User disconnected", userId)
        delete userSocketMap[userId];
        io.emit('getOnlineUsers', Object.keys(userSocketMap))
    })
})


// Middleware setup
app.use(cors())
app.use(express.json({ limit: '4mb' }))


// Routes setup
app.get('/api/status', (req, res) => res.send('Server is live!'))
app.use('/api/auth', userRouter)
app.use('/api/messages', messageRouter)


// Connect to MongoDB
await connectDB();

if (process.env.NODE_ENV !== 'production') {
    const PORT = process.env.PORT || 5000
    server.listen(PORT, () => {
        console.log(`Server running on http://localhost:${[PORT]}`)
    })
} 

// Export server for Vercel
export default server
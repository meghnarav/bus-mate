import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';
import apiRouter from './routes/api.v1';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: '*', // In production, restrict this to the PWA URL
    methods: ['GET', 'POST']
  }
});

app.use(cors());
app.use(express.json());

// API Routes
app.use('/api/v1', apiRouter);

// Health check
app.get('/health', (req, res) => res.json({ status: 'OK' }));

// WebSocket implementation for live bus updates
io.on('connection', (socket) => {
  console.log(`[Socket.io] Client connected: ${socket.id}`);
  
  socket.on('subscribe_route', (routeId) => {
    socket.join(`route_${routeId}`);
    console.log(`Client subscribed to route_${routeId}`);
  });

  socket.on('disconnect', () => {
    console.log(`[Socket.io] Client disconnected: ${socket.id}`);
  });
});

// Attach io instance to app for use in controllers
app.set('io', io);

const PORT = process.env.PORT || 8080;
httpServer.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});

const express = require("express");
const { createServer } = require("http");
const { Server } = require("socket.io");
const Redis = require('ioredis')

const { PORT } = require('./config/serverConfig');

const app = express();

app.use(express.json());

const httpServer = createServer(app);

const redisCache = new Redis();
const io = new Server(httpServer, {});

io.on("connection", (socket) => {
    socket.on("setUserId", (userId) => {
        console.log("Setting user id to connection id", userId, socket.id);
        redisCache.set(userId, socket.id);

    });

    socket.on("getConnectionId", async (userId) => {
        const connId = await redisCache.get(userId);
        console.log("Getting connection id for user id " + userId, connId);
        socket.emit('connectionId', connId);
    })
});

app.post('/sendPayload', async (req, res) => {
    const { userId, payload } = req.body;
    if (!userId || !payload) {
        res.status(400).send("Invalid request");
    }
    const socketId = await redisCache.get(userId);

    if (socketId) {
        io.to(socketId).emit('submissionPayloadResponse', payload); 
        return res.send("payload sent successfully");
    } else {
        return res.status(404).send("User not connected");
    }
});

httpServer.listen(PORT, () => {
    console.log("Server is running on port 6000");
});
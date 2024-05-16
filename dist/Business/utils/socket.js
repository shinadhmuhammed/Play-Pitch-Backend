"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const configureSocket = (io) => {
    io.on("connection", (socket) => {
        socket.on("join-room", (roomId) => {
            socket.join(roomId);
            console.log(`User ${socket.id} joined room ${roomId}`);
        });
        socket.on("chat-message", (data) => {
            io.to(data.roomId).emit('received-message', { message: data.message, senderId: data.userId });
        });
        socket.on("disconnect", () => {
        });
    });
};
exports.default = configureSocket;

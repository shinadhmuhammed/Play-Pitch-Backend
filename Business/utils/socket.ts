import { Server, Socket } from "socket.io";

const configureSocket = (io: Server) => {
  io.on("connection", (socket: Socket) => {

    socket.on("join-room", (roomId: string) => {
      socket.join(roomId);
      console.log(`User ${socket.id} joined room ${roomId}`);
    });

    socket.on("chat-message", (data: { message: string, roomId: string, userId: string }) => {
      io.to(data.roomId).emit('received-message', { message: data.message, senderId: data.userId }); 
    });
    
    socket.on("disconnect", () => {
    });
  });
};

export default configureSocket;

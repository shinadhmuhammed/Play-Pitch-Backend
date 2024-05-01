import { Server, Socket } from "socket.io";

const configureSocket = (io: Server) => {
  io.on("connection", (socket: Socket) => {
    console.log(`A user connected: ${socket.id}`);

    socket.on("join-room", (roomId: string) => {
      socket.join(roomId);
      console.log(`User ${socket.id} joined room ${roomId}`);
    });

    socket.on("chat-message", (data: { message: string, roomId: string, userId: string }) => {
      console.log('received-message', data);
      io.to(data.roomId).emit('received-message', { message: data.message, senderId: data.userId }); 
    });
    

    socket.on("disconnect", () => {
      console.log("user disconnected");
    });
  });
};

export default configureSocket;

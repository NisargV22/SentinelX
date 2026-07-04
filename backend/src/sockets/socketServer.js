const socketIo = require("socket.io");
const jwt = require("../utils/jwt");

let io = null;

const initSocketServer = (server) => {
  io = socketIo(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });

  io.use((socket, next) => {
    const token = socket.handshake.auth.token || socket.handshake.query.token;
    if (!token) {
      return next(new Error("Authentication error: token missing"));
    }
    try {
      const payload = jwt.verifyAccessToken(token);
      socket.user = payload;
      next();
    } catch (err) {
      return next(new Error("Authentication error: invalid token"));
    }
  });

  io.on("connection", (socket) => {
    console.log(`Socket Client Connected: ${socket.id} (${socket.user.email})`);
    
    socket.on("disconnect", () => {
      console.log(`Socket Client Disconnected: ${socket.id}`);
    });
  });

  return io;
};

module.exports = {
  initSocketServer,
  getIo: () => io
};

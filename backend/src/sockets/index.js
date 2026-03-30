const setupSockets = (io) => {
  io.on('connection', (socket) => {
    console.log(`🔌 Socket connected: ${socket.id}`);

    // Patient joins a department room to get live queue updates
    socket.on('join_department', (departmentId) => {
      socket.join(`department:${departmentId}`);
      console.log(`Socket ${socket.id} joined department:${departmentId}`);
    });

    socket.on('leave_department', (departmentId) => {
      socket.leave(`department:${departmentId}`);
    });

    // Admin joins hospital room
    socket.on('join_hospital', (hospitalId) => {
      socket.join(`hospital:${hospitalId}`);
      console.log(`Socket ${socket.id} joined hospital:${hospitalId}`);
    });

    socket.on('leave_hospital', (hospitalId) => {
      socket.leave(`hospital:${hospitalId}`);
    });

    // User joins their personal room for booking notifications
    socket.on('join_user', (userId) => {
      socket.join(`user:${userId}`);
    });

    socket.on('disconnect', () => {
      console.log(`🔌 Socket disconnected: ${socket.id}`);
    });
  });
};

module.exports = setupSockets;

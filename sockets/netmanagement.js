const logger = require('../lib/logger')

// Socket Module for interacting with Client Network
module.exports = (socket) => {
  // Notify all active Clients
  socket.on('notify-all', (msg) => {
    console.dir(` ######## [ Server Network Notification ] ######## Notify all Clients`);
    socket.broadcast.emit('net-msg', msg)
    logger('Socket', 'info', `Notify all Clients with Message: "${msg}"`)
  })
  // Notify selected Clients
  socket.on('notify-selected', (msg, clients) => {
    console.dir(` ######## [ Server Network Notification ] ######## Notify selected Clients`);
    for (let client of clients) {
      socket.broadcast.to(client.id).emit('net-msg', msg)
      logger('Socket', 'info', `Notify Client "${client.id}" with Message: "${msg}"`)
    }
    // socket.broadcast.to(clients).emit('net-msg', msg)
  })
}

const logger = require('../lib/logger')

// Socket Module for interacting with Client Network
module.exports = (socket, clients) => {
  // Notify all active Clients
  socket.on('notify-all', (msg) => {
    console.dir(` ######## [ Server Network Notification ] ######## Notify all Clients`);
    let client = clients.find(client => client.id === socket.id)
    socket.broadcast.emit('net-msg', msg)
    logger(socket, 'Socket', 'info', `Notify all Clients with Message: "${msg}"`, client)
  })
  // Notify selected Clients
  socket.on('notify-selected', (msg, clients) => {
    console.dir(` ######## [ Server Network Notification ] ######## Notify selected Clients`);
    let client = clients.find(client => client.id === socket.id)
    for (let client of clients) {
      socket.broadcast.to(client.id).emit('net-msg', msg)
      logger(socket, 'Socket', 'info', `Notify Client "${client.id}" with Message: "${msg}"`, client)
    }
    // socket.broadcast.to(clients).emit('net-msg', msg)
  })
}

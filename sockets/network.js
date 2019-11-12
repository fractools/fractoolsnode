const logger = require('../lib/logger')

// Connected Clients List
let clients = []

// Socket Module for interacting with Client Network
module.exports = (socket) => {

  // Fetch recent Client List
  socket.on('clients', function (fn) {
    console.dir(` ######## [ Server Socket ] ######## Fetch Clients`);
    fn(clients);
  });

  // Add Client to Client-List
  socket.on('client', (client) => {
    clients.push(client);
    socket.emit(`new-client`, clients)
    socket.broadcast.emit(`new-client`, clients)
  })

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
  })
  
  // Socket for Client to disconnect
  socket.on('disconnect', function(){
    console.dir(` ######## [ Server Socket ] ######## Client "${socket.id}" disconnected!`);
    let recentClients = clients.filter(c => c.id != socket.id);
    clients = recentClients;
    socket.broadcast.emit(`new-client`, clients)
  })
}

const logger = require('../lib/logger')

module.exports = (io) => {
  // Run Socket Services
  console.dir(' ######## [ Server Engine ] ######## Initialize Sockets ');

  // Connected Clients List
  let clients = []

  // Socket for Client to connect with Node
  io.on('connection', (socket) => { // TODO Handshake
    console.dir(` ######## [ Server Socket ] ######## New Client "${socket.id}" connected!`);
    // logger('Socket', 'info', `New Client "${socket.id}" connected`)

    socket.on('clients', function (fn) {
      console.dir(` ######## [ Server Socket ] ######## Fetch Clients`);
      fn(clients);
    });

    // Socket for Client to disconnect
    socket.on('disconnect', function(){
      console.dir(` ######## [ Server Socket ] ######## Client "${socket.id}" disconnected!`);
      // logger('Socket', 'info', `Client "${socket.id}" disconnected`)
      let recentClients = clients.filter(c => c.id != socket.id);
      clients = recentClients;
      socket.broadcast.emit(`new-client`, clients)
    });

    // Documentmanagement
    require('./dbmanagement')(socket);
    // Authentififcation
    require('./auth')(socket, io, clients);
    // NodeMailer
    require('./nodemailer')(socket);
    // Usermanagement
    require('./usermanagement')(socket);
    // Network Management
    require('./netmanagement')(socket);
  });

  console.dir(' ######## [ Server Engine ] ######## Sockets Initialized ');
};

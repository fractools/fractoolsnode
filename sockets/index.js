const logger = require('../lib/logger'),
      pkg = require('../package');

module.exports = (app, io) => {
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

    // Localize Fractools Modules
    for (let dep in pkg.dependencies) {
      if (dep.startsWith('@fractools')) {
        // Initialize Fileserver
        require(dep)(app, logger)         // TODO Move to SocketIO
      }
    }

    // Documentmanagement
    require('./dbmanagement')(socket, clients);
    // Authentififcation
    require('./auth')(socket, io, clients);
    // NodeMailer
    require('./nodemailer')(socket, clients);
    // Usermanagement
    require('./usermanagement')(socket, clients);
    // Network Management
    require('./netmanagement')(socket, clients);
  });

  console.dir(' ######## [ Server Engine ] ######## Sockets Initialized ');
};

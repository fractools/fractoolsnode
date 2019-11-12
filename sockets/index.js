const logger = require('../lib/logger')

module.exports = (io) => {
  // Run Socket Services
  console.dir(' ######## [ Server Engine ] ######## Initialize Sockets ');

  // Socket for Client to connect with Node
  io.on('connection', (socket) => { // TODO Handshake
    console.dir(` ######## [ Server Socket ] ######## New Client "${socket.id}" connected!`);

    // Networkmanagement
    require('./network')(socket);
    // Monitoring
    require('./monitoring')(socket);
    // Authentififcation
    require('./authentification')(socket);
    // Usermanagement
    require('./usermanagement')(socket);
    // Databasemanagement
    require('./dbmanagement')(socket);
    // Documentmanagement
    require('./docmanagement')(socket);
    // NodeMailer
    require('./nodemailer')(socket);
  });

  console.dir(' ######## [ Server Engine ] ######## Sockets Initialized ');
};

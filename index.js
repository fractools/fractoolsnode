// Import lib
const http = require('http'),
      config = require('./fractools.config.js')
      pkg = require('./package'),
      express = require('express'),
      SocketIO = require('socket.io'),
      genPouch = require('./lib/genPouch');

// Config Env
const PORT = process.env.PORT || config.port
const HOST = process.env.baseurl || config.host

// Init App
const app = express()
const server = http.createServer(app)
const io = SocketIO(server)

// Define Root Path
global.__basedir = __dirname;

// Localize if Fileserver is installed
for (let dep in pkg.dependencies) {
  if (dep === '@fractools/fileserver') {
    // Initialize Fileserver
    require('@fractools/fileserver')(app)         // TODO Move to SocketIO
  }
}

// Initialize Databases
genPouch.dbInit()           // TODO Move into databasemanager

// Initialize Server
server.listen(PORT, HOST)

// MasterSocket
require('./sockets')(io);

console.dir(' ######## [ Server Engine ] ######## Server listening on: http://' + HOST + ':' + PORT)

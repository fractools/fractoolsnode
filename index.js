// Import lib
const http = require('http'),
      config = require('./fractools.config.js')
      pkg = require('./package'),
      express = require('express'),
      SocketIO = require('socket.io'),
      genPouch = require('./lib/genPouch'),
      logger = require('./lib/logger');

// Config Env
const PORT = process.env.PORT || config.port
const HOST = process.env.baseurl || config.host

// Init App
const app = express()
const server = http.createServer(app)
const io = SocketIO(server)

// Define Root Path
global.__basedir = __dirname;

// Define Upload-Directory
app.use('/uploads', express.static(global.__basedir + '/uploads'));

// Log Node Initialization
logger(null, 'Node Core', 'info', `Initialize Node`, { user: 'Fractools Node', id: '00' })

// Initialize Databases
genPouch.dbInit()           // TODO Move into databasemanager

// Initialize Server
server.listen(PORT, HOST)

// MasterSocket
require('./sockets')(app, io);

console.dir(' ######## [ Server Engine ] ######## Server listening on: http://' + HOST + ':' + PORT)

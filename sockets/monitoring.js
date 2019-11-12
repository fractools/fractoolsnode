const os = require('os')
const ss = require('socket.io-stream')
const monitor = require('os-monitor')


let data = {
  os: os.cpus(),
  memory: process.memoryUsage(),
  pid: process.pid
}

module.exports = (socket) => {
  ss(socket).on('monitoring', (stream) => {
    monitor.start({ stream: true }).pipe(stream)
  })
}

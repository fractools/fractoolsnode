const monitor = require('os-monitor')
let res = {}

monitor.start({ stream: true }).pipe(res)

module.exports = res

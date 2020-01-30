const moment = require('moment'),
      { postDoc, fetch } = require('./genPouch'),
      { genRandomString } = require('./tokenizer');

moment.locale('de')

async function logger (socket, topic, level, msg, client) { // TODO Write SocketSession for 'require('socket')'
  const log = {
    time: moment().format(),
    label: topic,
    level: level,
    message: msg,
    user: () => { if (client.user) { return client.user } else { return 'Node' } },
    socketid: () => { if (client.id) { return client.id } else { return 'Node' } }
  }
  try {
    await postDoc('logs', `${log.time}${genRandomString(3)}`, log)
  } catch (e) {
    console.log(e);
  }
  try {
    let docs = await fetch('logs')
    if (socket && socket.broadcast) {
      socket.broadcast.emit(`documents`, docs, 'logs');
      socket.emit(`documents`, docs, 'logs');
    }
  } catch (e) {
    console.log(e);
  }
}

module.exports = logger

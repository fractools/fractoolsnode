const moment = require('moment'),
      { postDoc } = require('./genPouch'),
      { genRandomString } = require('./cryptoPW');

moment.locale('de')

async function logger (topic, level, msg, client) {
  const log = {
    time: moment().format(),
    label: topic,
    level: level,
    message: msg,
    user: client.user,
    socketid: client.id
  }
  try {
    await postDoc('logs', `${log.time}${genRandomString(3)}`, log)
  } catch (e) {
    console.log(e);
  }
}

module.exports = logger

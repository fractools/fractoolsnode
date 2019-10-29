const moment = require('moment'),
      { postDoc } = require('./genPouch'),
      { genRandomString } = require('./cryptoPW');

moment.locale('de')

async function logger (topic, level, msg) {
  const log = {
    time: moment().format('L'),
    label: topic,
    level: level,
    message: msg
  }
  try {
    await postDoc('logs', `${log.time}${genRandomString(3)}`, log)
  } catch (e) {
    console.log(e);
  }
}

module.exports = logger
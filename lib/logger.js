const { postDoc } = require('./genPouch'),
      { genRandomString } = require('./cryptoPW');

async function logger (topic, level, msg) {
  const log = {
    time: `${new Date()}`,
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

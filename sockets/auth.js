const PouchDB = require('pouchdb'),
      logger = require('../lib/logger'),
      { saltHashPassword, genRandomString } = require('../lib/cryptoPW'),
      { authInit, fetch, putDoc } = require('../lib/genPouch');


module.exports = (socket, io, clients) => {
  console.dir(` ######## [ Server Engine ] ######## Initialize Authentification `)

  // User Authentification
  authInit();

  socket.on(`login`, async (data, fn) => {
    console.dir(` ######## [ Server Engine ] ######## "${data.username}" logs in `)
    let client = clients.find(client => client.id === socket.id)

    // Fetch User Credencials
    let users;
    try {
      users = await fetch('user');
    } catch(err) {
      console.log(err);
    }

    // Get Single User out of Users List via matching Credencials
    let user = users.find(u => u.username === data.username)

    // Try Authentification for found User
    if (user) {
      // Crypto
      let result = saltHashPassword(data.password, user.password.salt)
      if (result.passwordHash === user.password.passwordHash) {

        // Generate Token for Autologin via Cookie
        let token = genRandomString(16)
        // Add Token into User
        user = { ...user, token }

        try {
          await putDoc('user', user._id, user)
        } catch (e) {
          console.log(e);
        }

        logger('Authentification', 'info', `Login by "${data.username}"`, client)
        return fn(null, { username: user.username, role: user.role, _id: user._id, token })
      }
      logger('Authentification', 'error', `Wrong password by "${data.username}"`, client)
      fn({ message: 'Wrong Credentials' }, null)
    }
    logger('Authentification', 'error', `User "${data.username}" not found`, client)
    fn({ message: 'Wrong Credentials' }, null)
  })

  socket.on('token', async (token, fn) => {
    let client = clients.find(client => client.id === socket.id)
    let users;
    try {
      users = await fetch('user')
    } catch (e) {
      console.log(e);
    }

    const user = users.find(u => u.token === token)

    if (user) {
      console.dir(` ######## [ Server Engine ] ######## Login via Token by "${user.username}" `)
      logger('Authentification', 'Info', `Login via Token by "${user.username}"`, client)
      return fn(null, { username: user.username, role: user.role, _id: user._id, token })
    }
    fn({ message: 'No valid token' }, null)
    logger('Authentification', 'error', `No valid Token`, client)
  })


  socket.on('client', (client) => {
    // Add Client to Client-List
    clients.push(client);
    socket.emit(`new-client`, clients)
    socket.broadcast.emit(`new-client`, clients)
  })

  console.dir(` ######## [ Server Engine ] ######## Authentification Initialized `)
}

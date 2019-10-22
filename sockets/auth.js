const PouchDB = require('pouchdb'),
      { saltHashPassword } = require('../lib/cryptoPW'),
      { authInit, fetch } = require('../lib/genPouch');


module.exports = (socket, io, clients) => {
  console.dir(` ######## [ Server Engine ] ######## Initialize Authentification `)

  // User Authentification
  authInit();

  socket.on(`login`, async (data, fn) => {
    console.dir(` ######## [ Server Engine ] ######## Fetching User Credentials for ${data.username} `)

    // let recentClients = clients.filter(c => c !== socket.id);
    // clients = recentClients;

    // Add Client to Client-List
    // clients.push({ id: socket.id, user: data.username });

    // socket.emit(`client`, { id: socket.id, user: data.username })
    // socket.broadcast.emit(`client`, { id: socket.id, user: data.username })

    // Fetch User Credencials
    let users;
    try {
      users = await fetch('user');
    } catch(err) {
      console.log(err);
    }

    // Get Single User out of Users List via matching Credencials
    const user = users.find(u => u.username === data.username)

    // Try Authentification for found User
    if (user) {
      // Crypto
      let result = saltHashPassword(data.password, user.password.salt)
      if (result.passwordHash === user.password.passwordHash) {
        return fn(null, { username: user.username, role: user.role, _id: user._id })
      }
      fn({ message: 'Nutzername oder Passwort ist falsch!' }, null)
    }
    fn({ message: 'Nutzername oder Passwort ist falsch!' }, null)
  })

  // Client Cookie Login
  socket.on('client', (client) => {
    // Add Client to Client-List
    clients.push(client);
    // console.log(io.sockets.clients().connected)
    // console.log('id', socket.id);
    socket.emit(`new-client`, clients)
    socket.broadcast.emit(`new-client`, clients)
  })

  console.dir(` ######## [ Server Engine ] ######## Authentification Initialized `)
}

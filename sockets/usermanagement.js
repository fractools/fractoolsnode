// No need to Define the Rest expect Custom Methods
const PouchDB = require('pouchdb'),
      pkg = require('../package'),
      // Import Lib
      { saltHashPasswordRegister,
        saltHashPassword,
        matchPassword,
        genRandomString } = require('../lib/tokenizer'),
      genPouch = require('../lib/genPouch'),
      logger = require('../lib/logger'),
      // Extract Methods form Lib
      replicate = genPouch.replicate,
      fetch = genPouch.fetch,
      docCount = genPouch.docCount,
      // Define PouchDB-Remote-Server and Database
      server = pkg.remotePouchDB;

module.exports = (socket, clients) => {
  // Register new User
  socket.on(`register`, async (fullUser, fn) => {
    console.log(` ######## [ Server Usermanagement ] ######## Register User "${fullUser.user.username}" `);
    let client = clients.find(client => client.id === socket.id)
    // Split Data for two Datasets
    const user = fullUser.user,
          userData = fullUser.userData;
    // Prepare Data
    let resUser,
        resUserData;
    // Prepare Databases
    const userdb = new PouchDB(`./database/user`),
          userDatadb = new PouchDB(`./database/userdata`);
    // Prepare crypted PW
    const cryptPW = saltHashPasswordRegister(user.password);
    const cryptedUser = {
      ...user,
      password: cryptPW,
    };
    // Push Data into Databases
    try {
      resUser = await userdb.put(cryptedUser)
      resUserData = await userDatadb.put(userData)
      // Fetch All Data
      let fetchUser = await fetch('user');
      let fetchUserData = await fetch('userdata');
      // Broadcast Data to Clients
      socket.broadcast.emit(`documents`, resUser, 'user') // TODO Move and Refactor
      socket.emit(`documents`, resUser, 'user')
      socket.broadcast.emit(`documents`, resUserData, 'userdata')
      socket.emit(`documents`, resUserData, 'userdata')
      logger(socket, 'User Management', 'info', `Register User "${fullUser.user.username}"`, client)
      // Promise Response to Client
      fn(null, 'Registered')
    } catch (err) {
      logger(socket, 'User Management', 'error', `Fail to Register User "${fullUser.user.username}": ${err}`, client)
      fn(err, null)
      console.log(err);
    }
  })

  // Set new Password for User
  socket.on(`newpassword`, async (user, password, fn) => {
    console.log(` ######## [ Server Usermanagement ] ######## New Password for user "${user.username}" `);
    let client = clients.find(client => client.id === socket.id)
    // Prepare Databases
    const userdb = new PouchDB(`./database/user`);
    // Prepare crypted PW
    const cryptPW = saltHashPasswordRegister(password);
    const cryptedUser = {
      ...user,
      password: cryptPW,
    }
    // Push Data into Databases
    try {
      resUser = await userdb.put(cryptedUser)
      // Fetch All Data
      let fetchUser = await fetch('user');
      // Broadcast Data to Clients
      socket.broadcast.emit(`documents`, resUser, 'user')
      socket.emit(`documents`, resUser, 'user')
      logger(socket, 'User Management', 'info', `New Password for user "${user.username}"`, client)
      // Promise Response to Client
      fn(null, 'Registered')
    } catch (err) {
      logger(socket, 'User Management', 'error', `No New Password for user "${user.username}": ${err}`, client)
      fn(err, null)
      console.log(err);
    }
  })

  // Password Check
  socket.on(`checkpassword`, async (user, password, fn) => {
    let client = clients.find(client => client.id === socket.id)
    // Prepare Databases
    const userdb = new PouchDB(`./database/user`);
    try {
      let data = await userdb.get(user._id)
      let result = saltHashPassword(password, data.password.salt)
      await matchPassword(result.passwordHash, user.password.passwordHash)
      fn(null, true)
    } catch (err) {
      fn(err, null);
    }
  })

  // Fetch all User
  socket.on('getalluser', async (fn) => {
    console.log('Get All User');
    const alluser = new PouchDB(`./database/user`);
    // TODO Userdata
    try {
      let user = [];
      let userrow = await alluser.allDocs({
        include_docs: true,
        attachments: false
      });
      user = userrow.rows.map(row => row.doc);
      if (!user[0]) {
        fn('No User exists', null);
      }
      fn(null, user);
    } catch (err) {
      console.log(err);
      fn(err, null);
    }
  })

  // Fetch single User
  socket.on('getuser', async (id, fn) => {
    const userdb = new PouchDB(`./database/user`)
    // TODO Userdata
    try {
      let res = await userdb.get(id)
      fn(null, res)
    } catch (err) {
      fn(err, null)
    }
  })

  // Update single User
  socket.on('updateuser', async (data, fn) => {
    let client = clients.find(client => client.id === socket.id)
    const userdb = new PouchDB(`./database/user`)
    // TODO Userdata
    try {
      let doc = await userdb.get(data._id)
      let res = await userdb.put({
        _id: data._id,
        _rev: doc._rev,
        ...data
      })
      logger(socket, 'User Management', 'info', `Update user "${user.username}"`, client)
      fn(null, true)
    } catch (err) {
      logger(socket, 'User Management', 'error', `Fail to Update user "${user.username}": ${err}`, client)
      fn(err, null)
    }
  })

  // Remove single User
  socket.on('removeuser', async (id, fn) => {
    let client = clients.find(client => client.id === socket.id)
    const userdb = new PouchDB(`./database/user`)
    // TODO Userdata
    try {
      let doc = await userdb.get(id)
      let res = await userdb.remove(doc)
      logger(socket, 'User Management', 'info', `Remove user "${user.username}"`, client)
      fn(null, true)
    } catch (err) {
      logger(socket, 'User Management', 'error', `Fail to Remove user "${user.username}": ${err}`, client)
      fn(err, null)
    }
  })
};

// No need to Define the Rest expect Custom Methods
const PouchDB = require('pouchdb'),
      pkg = require('../package'),
      // Import Lib
      { saltHashPasswordRegister,
        saltHashPassword,
        matchPassword,
        genRandomString } = require('../lib/cryptoPW'),
      genPouch = require('../lib/genPouch'),
      // Extract Methods form Lib
      replicate = genPouch.replicate,
      fetch = genPouch.fetch,
      docCount = genPouch.docCount,
      // Define PouchDB-Remote-Server and Database
      server = pkg.remotePouchDB;

module.exports = (socket) => {
  // Register new User
  socket.on(`register`, async (fullUser, fn) => {
    console.log(` ######## [ Server Usermanagement ] ######## Register User "${fullUser.user.username}" `);
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
      // Promise Response to Client
      fn(null, 'Registered')
    } catch (err) {
      fn(err, null)
      console.log(err);
    }
  })

  // Set new Password for User
  socket.on(`newpassword`, async (user, password, fn) => {
    console.log(` ######## [ Server Usermanagement ] ######## New Password for user "${user.username}" `);
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
      // Promise Response to Client
      fn(null, 'Registered')
    } catch (err) {
      fn(err, null)
      console.log(err);
    }
  })

  // Password Check
  socket.on(`checkpassword`, async (user, password, fn) => {
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
    const alluser = new PouchDB(`./database/user`)
    // TODO Userdata
    try {
      let userrow = await alluser.allDocs()
      let user = userrow.rows.map(row => row.doc)
      console.log(user);
      fn(null, user)
    } catch (err) {
      fn(err, null)
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
    const userdb = new PouchDB(`./database/user`)
    // TODO Userdata
    try {
      let doc = await userdb.get(data._id)
      let res = await userdb.put({
        _id: data._id,
        _rev: doc._rev,
        ...data
      })
      fn(null, true)
    } catch (err) {
      fn(err, null)
    }
  })

  // Remove single User
  socket.on('removeuser', async (id, fn) => {
    const userdb = new PouchDB(`./database/user`)
    // TODO Userdata
    try {
      let doc = await userdb.get(id)
      let res = await userdb.remove(doc)
      fn(null, true)
    } catch (err) {
      fn(err, null)
    }
  })
};

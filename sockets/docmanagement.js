const PouchDB = require('pouchdb'),
      pkg = require('../package'),
      // Import lib
      logger = require('../lib/logger'),
      genPouch = require('../lib/genPouch'),
      // Extract Methods form Lib
      replicate = genPouch.replicate,
      fetch = genPouch.fetch,
      docCount = genPouch.docCount,
      // Define PouchDB-Remote-Server and Database
      server = pkg.remotePouchDB;

module.exports = (socket) => {

  // Fetch Documents to/from Remote
  socket.on(`last-documents`, async (database, fn) => {
    console.dir(` ######## [ Server Socket ] ######## Fetch Data from "${database}"`)
    try {
      let docs = await fetch(database);
      fn(null, docs);
    } catch (err) {
      fn(err, null);
    }
    try {
      await replicate(database);
    } catch (err) {
      console.log(err);
    }
  })

  // Send and Broadcast new Document
  socket.on(`send-document`, async (database, data, id, fn) => {
    console.dir(` ######## [ Server Socket ] ######## Put Data in "${database}"`)
    let db = new PouchDB(`./database/${database}`)
    let doc = {
      _id: id,
      ...data
    }
    try {
      let response = await db.put(doc)
      fn(null, response)
      let docs = await fetch(database);
      socket.broadcast.emit(`documents`, docs, database)
      socket.emit(`documents`, docs, database)
      logger('Documents', 'info', `Put Data in "${database}"`)
    } catch (err) {
      console.log(err);
      logger('Documents', 'error', `Error Putting Data in "${database}": ${err}`)
      fn(err, null)
    }
    try {
      await replicate(database);
    } catch (err) {
      console.log(err);
    }
  })

  // Send and Broadcast updated Document
  socket.on(`update-document`, async (database, data, id, rev, fn) => {
    console.dir(` ######## [ Server Socket ] ######## Update Data in "${database}"`)
    let db = new PouchDB(`./database/${database}`)
    let docs;
    try {
      let doc = await db.get(id)
      let response = await db.put({
        _id: id,
        _rev: doc._rev,
        ...doc = data
      })
      docs = await fetch(database);
      fn(null, response);
      socket.broadcast.emit(`documents`, docs, database);
      socket.emit(`documents`, docs, database);
      logger('Documents', 'info', `Update Data in "${database}"`)
    } catch (err) {
      console.dir(err);
      logger('Documents', 'error', `Error Updating Data in "${database}": ${err}`)
      fn(err, null)
    }
    try {
      await replicate(database);
    } catch (err) {
      console.log(err);
    }
  })

  // Remove and Broadcast removed Document
  socket.on(`remove-document`, async (database, obj, fn) => {
    console.dir(` ######## [ Server Socket ] ######## Remove Data in "${database}"`)
    let db = new PouchDB(`./database/${database}`)
    let docs;
    try {
      let doc = await db.get(obj._id)
      let response = await db.remove(doc);
      docs = await fetch(database);
      fn(null, response);
      socket.broadcast.emit(`documents`, docs, database)
      socket.emit(`documents`, docs, database)
      logger('Documents', 'info', `Remove Data in "${database}"`)
    } catch (err) {
      console.dir(err);
      logger('Documents', 'error', `Error Removing Data in "${database}": ${err}`)
      fn(err, null);
    }
    try {
      await replicate(database);
    } catch (err) {
      console.log(err);
    }
  })

  // Get Single Document
  socket.on(`get-document`, async (database, id, fn) => {
    console.dir(` ######## [ Server Socket ] ######## Get Single Doc from "${database}"`)
    let db = new PouchDB(`./database/${database}`)
    try {
      let doc = await db.get(id)
      fn(null, doc)
    } catch (err) {
      console.dir(err);
      fn(err, null)
    }
  })

}

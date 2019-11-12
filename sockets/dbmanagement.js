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
  // Fetch Documents Count in Database
  socket.on(`docCount`, async (database, fn) => {
    try {
      let data = await docCount(database);
      fn(null, data);
    } catch (err) {
      fn(err, null);
    }
  })

  // Send and Broadcast new Document
  socket.on(`send-db`, async (data, id, fn) => {
    console.dir(` ######## [ Server Socket ] ######## Put ${data.dbname} in "Databases"`)
    let db = new PouchDB(`./database/databases`)
    let doc = {
      _id: id,
      ...data
    };
    let docs;
    try {
      let response = await db.put(doc)
      docs = await fetch('databases');
      fn(null, response);
      socket.broadcast.emit(`new-database`, doc)
      socket.emit(`new-database`, doc)
      socket.broadcast.emit(`documents`, docs, 'databases')
      socket.emit(`documents`, docs, 'databases')
      logger('Database', 'info', `Put "${data.dbname}" into "Databases"`)
    } catch (err) {
      console.log(err);
      logger('Database', 'error', `Error Putting "${data.dbname}" in "Databases": ${err}`)
      fn(err, null);
    }
    try {
      await replicate('databases');
    } catch (err) {
      console.log(err);
    }
  })

  // Replicate Documents to/from Remote
  socket.on(`replicate-database`, async (database) => {
    console.dir(` ######## [ Server Socket ] ######## Replicate Data for "${database}"`)
    let db = new PouchDB(`./database/${database}`)
    await replicate(db, database);
  })

  // Replicate Documents to/from Remote
  socket.on(`replicateFT`, async (server1, database1, server2, database2) => {
    console.dir(` ######## [ Server Socket ] ######## Replicate from "${database1}" to "${database2}"`)
    let db = new PouchDB(`./database/${database1}`)
    await db.replicate.from(`http://${server1}/${database1}`);
    await db.replicate.to(`http://${server2}/${database2}`);
    let db2 = new PouchDB(`./database/${database2}`);
    await db2.replicate.from(`http://${server2}/${database2}`);
  })
}

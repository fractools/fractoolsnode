// No need to Define the Rest expect Custom Methods
const PouchDB = require('pouchdb'),
      config = require('../fractools.config'),
      // logger = require('./logger'),

      // Define PouchDB-Remote-Server and Database
      server = config.remotePouchDB;


// Define general Methods
async function dbExists(database) {
  let data;
  try {
    let db = new PouchDB(`./database/${database}`)
    let res = await db.allDocs({
      include_docs: true,
      attachments: false
    });
    data = res.rows.map(row => row.doc);
  } catch (e) {
    console.log(e);
  } finally {
    if (data[0]) return true;
    if (!data[0]) return false;
  }
}

async function replicate(database) {
  try {
    let db = new PouchDB(`./database/${database}`)
    await db.replicate.to(`http://${server}/${database}`, { live: false, retry: false });
    await db.replicate.from(`http://${server}/${database}`, { live: false, retry: false });
    console.dir(` ######## [ Server Database ] ########  ${database} Replicated`);
    // logger('Database', 'info', `${database} Replicated`)
  } catch (err) {
    console.dir(` ######## [ Server Database ] ########  ${database} NOT Replicated!`);
    // logger('Database', 'error', `${database} NOT Replicated`)
    throw new Error(err.message);
  }
}

async function fetch(database) {
  let db = new PouchDB(`./database/${database}`);
  let data;
  try {
    let alldocs = await db.allDocs({
      include_docs: true,
      attachments: false
    });
    data = alldocs.rows.map(row => row.doc);
    // logger('Database', 'info', `${database} Fetched`)
  } catch (err) {
    // logger('Database', 'error', `${database} NOT Fetched: ${err}`)
    throw new Error(err);
  }
  return data;
}

async function putDoc(database, id, data) {
  let db = new PouchDB(`./database/${database}`)
  try {
    let doc = await db.get(id)
    let res = await db.put({
      _id: id,
      _rev: doc._rev,
      ...doc = data
    })
  } catch (e) {
    throw new Error(e)
  }
}

async function postDoc(database, id, data) {
  let db = new PouchDB(`./database/${database}`)
  try {
    let res = await db.put({
      _id: id,
      ...data
    })
  } catch (e) {
    throw new Error(e)
  }
}

async function docCount(database) {
  let db = new PouchDB(`./database/${database}`);
  let dbRemote = new PouchDB(`http://${server}/${database}`);
  let localDocCount;
  let remoteDocCount;

  try {
    try {
      remoteDocCount= await db.info()
    } catch (err) {
      remoteDocCount = await db.info(); // TODO Why is this like that?
      console.log(err.message);
    } finally {
      localDocCount = await db.info()
      let count = { localDocCount, remoteDocCount }
      return count;
    }
  } catch (err) {
    console.log(err);
  }
}

async function dbInit() {
  console.dir(' ######## [ Server Engine ] ######## Initialize Databases ');
  // logger('Database', 'info', `Initialize Databases`)
  let databases = [];
  try {
    await replicate('databases')
    await replicate('settings')
    databases = await fetch('databases') // TODO Finally
  } catch (err) {
    console.log(err);
  };
  for (let db of databases) {
    try {
      await replicate(db.dbname);
    } catch (err) {
      console.log(err);
    };
  };
  console.dir(' ######## [ Server Engine ] ######## Databases Initialized ');
  // logger('Database', 'info', `Databases Initialized`)
}

async function authInit() {
  try {
    // logger('Authentification', 'info', `Initialize Authentification`)
    await replicate('user')
  } catch (e) {
    // logger('Authentification', 'error', `Error to Initialize Authentification: ${e}`)
    console.error(e);
  } finally {
    await fetch('user');
  }
}

module.exports = {
  replicate,
  fetch,
  putDoc,
  postDoc,
  docCount,
  dbInit,
  authInit,
  dbExists
}

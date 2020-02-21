const SocketIOFile = require('socket.io-file'),
      logger = require('../lib/logger'),
      fs = require('fs');

let config = {
  // uploadDir: {			                    // multiple directories
  // 	music: 'uploads/music',
  // 	document: 'uploads/document'
  // },
  uploadDir: 'uploads',							      // simple directory
  // accepts: ['audio/mpeg'],		          // chrome and some of browsers checking mp3 as 'audio/mp3', not 'audio/mpeg'
  // maxFileSize: 4194304, 						    // 4 MB. default is undefined(no limit)
  chunkSize: 10240,							          // default is 10240(1KB)
  transmissionDelay: 0,						        // delay of each transmission, higher value saves more cpu resources, lower upload speed. default is 0(no delay)
  overwrite: true 							          // overwrite file if exists, default is true.
};

module.exports = (socket, io) => {
  console.dir(` ######## [ Server Engine ] ######## Initialize Fileserver `);
  const uploader = new SocketIOFile(socket, config);

  uploader.on('start', (fileInfo) => {
    console.log('Start uploading');
    console.log(fileInfo);
  });

  uploader.on('stream', (fileInfo) => {
    console.log(`${fileInfo.wrote} / ${fileInfo.size} byte(s)`);
  });

  uploader.on('complete', (fileInfo) => {
    console.log('Upload Complete.');
    console.log(fileInfo);
  });

  uploader.on('error', (err) => {
    console.log('Error!', err);
  });

  uploader.on('abort', (fileInfo) => {
    console.log('Aborted: ', fileInfo);
  });

  socket.on('removeFile', (path, filename, username, fn) => {
    let dest = global.__basedir + '/uploads/', // TODO Path
        socketid = socket.id,
        client = { user: username, id: socketid };

    fs.unlink(`${dest + filename}`, (err) => {
      if (err) return fn(err, null) && logger(null, 'Fileserver', 'error', `File "${filename}" not deleted to "${dest}"`, client);
      fn(null, 'Deleted')
      logger(null, 'Fileserver', 'info', `File "${filename}" deleted in ${dest}`, client)
    })
  });
};

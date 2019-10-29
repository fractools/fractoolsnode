"use strict";
const nodemailer = require("nodemailer"),
      logger = require('../lib/logger');

async function main(to, subject, text){
  // create reusable transporter object using the default SMTP transport
  let transporter = nodemailer.createTransport({
    host: "",
    port: 25,
    secure: false,                          // true for 465, false for other ports
    tls: {
      rejectUnauthorized: false
    },
    auth: {
      user: '',                             // generated ethereal user
      pass: ''                              // generated ethereal password
    }
  });
  try {
    // send mail with defined transport object
    let info = await transporter.sendMail({
      from: '',  // sender address
      to: to,                                 // list of receivers
      subject: subject,                       // Subject line
      text: text,                             // plain text body
      html: text                              // html body
    });
    let res = "Message ID: " + info.messageId;
    console.log(res);
    return res
  } catch (err) {
    throw new Error(err);
  }
}

module.exports = (socket) => {
  // Send E-Mail via Node
  socket.on(`send-mail`, async (to, subject, text, fn) => {
    console.log(` ######## [ Server Mailer ] ######## Send Mail to "${to}" `);
    try {
      let res = await main(to, subject, text)
      logger('Nodemailer', 'info', `Send Mail to "${to}"`)
      fn(null, res)
    } catch (err) {
      console.log(err);
      logger('Nodemailer', 'error', `Fail to Send Mail to "${to}": ${err}`)
      fn(err, null)
    }
  })
};

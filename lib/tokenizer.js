// Reference : https://ciphertrick.com/salt-hash-passwords-using-nodejs-crypto/
const crypto = require('crypto')


/**
 * generates random string of characters i.e salt
 * @function
 * @param {number} length - Length of the random string.
 */
let genRandomString = function(length){
    return crypto.randomBytes(Math.ceil(length/2))
            .toString('hex') /** convert to hexadecimal format */
            .slice(0,length);   /** return required number of characters */
};

/**
 * hash password with sha512.
 * @function
 * @param {string} password - List of required fields.
 * @param {string} salt - Data to be validated.
 */
let sha512 = function(password, salt){
    let hash = crypto.createHmac('sha512', salt); /** Hashing algorithm sha512 */
    hash.update(password);
    let value = hash.digest('hex');
    return {
        salt:salt,
        passwordHash:value
    };
};


// Register or set New Password
function saltHashPasswordRegister(userpassword) {
    let salt = genRandomString(16); /** Gives us salt of length 16 */
    let passwordData = sha512(userpassword, salt);
    return passwordData;
}

// Login or PasswordCheck for new Password
function saltHashPassword(userpassword, salt) {
    let passwordData = sha512(userpassword, salt);
    return passwordData;
}

// Check if Passwords match
async function matchPassword(db, delivered) {
  return await new Promise((resolve, reject) => {
    if (db === delivered) {
      return resolve('Password matches')
    } else {
      return reject('Das alte Passwort ist nicht korrekt')
    }
  })
}

module.exports = {
  genRandomString,
  saltHashPasswordRegister,
  saltHashPassword,
  matchPassword,
  sha512
}

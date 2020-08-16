require('dotenv').config();

async function verify(req, res, next) {
  // check for basic auth header
  if (!req.headers.authorization || req.headers.authorization.indexOf('Basic ') === -1) {
      return res.status(401).json({ message: 'Missing Authorization Header' });
  }

  const auth = {username: 'login', password: 'pass'} // change this

  // verify auth credentials
  const base64Credentials =  req.headers.authorization.split(' ')[1];
  const credentials = Buffer.from(base64Credentials, 'base64').toString('ascii');
  const [username, password] = credentials.split(':');
  console.log(username, password);
  if (username && password && username === process.env.AUTH_USERNAME && password === process.env.AUTH_PASSWORD) {
    return next();
  }
  
  return res.status(401).json({ message: 'Invalid Authentication Credentials' });
}

module.exports = {
  verify
}
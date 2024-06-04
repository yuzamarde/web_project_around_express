const jwt = require('jsonwebtoken');

const authorize = async (req, res, next) => {
  const headerAuth = req.header('Authorization');

  if (!headerAuth) {
    return res.status(403).send('Otorisasi diperlukan untuk signin');
  }
  const token = headerAuth.replace('Bearer ', '');

  try {
    const payload = jwt.verify(token, 'developer');
    if (!payload) {
      return res.status(403).send('No token tidak valid');
    }

    req.user = payload;
    next();
    return req.user;
  } catch (error) {
    return res.status(403).send('No token tidak valid', error);
  }
};

module.exports = authorize;

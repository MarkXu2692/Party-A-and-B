const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
  const token = req.header('Authorization') && req.header('Authorization').split(' ')[1];

  if (!token) {
    return res.status(403).json({ message: 'No token, authorization denied' });
  }

  try {
    const decoded = jwt.verify(token, 'yourSecretKey');  // Ensure 'yourSecretKey' matches what you use when signing the token
    req.user = decoded;  // Attach the decoded token (user ID and username) to the request
    next();  // Proceed to the next middleware or route handler
  } catch (err) {
    console.error('Invalid token:', err);  // Log error if token is invalid
    return res.status(403).json({ message: 'Invalid token' });
  }
};

module.exports = authenticateToken;

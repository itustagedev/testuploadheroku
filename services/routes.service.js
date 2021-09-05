const jwt = require('jsonwebtoken');
const config = require('../config/config');

/**
 * Verify validity of a jwt token
 * @param {Request} req Request
 */
exports.verifyToken = (req) => {
    let token = req.headers['authorization'];
    token = token.slice(7, token.length);
    const decodedToken = jwt.verify(token, config.JWT_PASSPHRASE);
    
    return decodedToken;
}
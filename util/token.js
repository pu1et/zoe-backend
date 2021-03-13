const jwt = require('jsonwebtoken');

const { JWT_SECRET } = require('../config');

/**
 * 사용자토큰 생성
 */
exports.signToken = user => {
    return jwt.sign({
        email: user.email,
        userId: user._id.toString(),
    }, 
    JWT_SECRET,
    { expiresIn: '1d' });
}
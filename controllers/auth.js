/**
 * 계정 인증/관리 등
 */
const crypto = require('crypto');

const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
// const sendgridTransport = require('nodemailer-sendgrid-transport');
const mgTransport = require('nodemailer-mailgun-transport');
const jwt = require('jsonwebtoken');

const { JWT_SECRET } = require('../config');
const User = require('../models/user');
const { signToken } = require('../util/token');

require('dotenv').config();

/* 샌드그리드 */
// const transporter = nodemailer.createTransport(
//     sendgridTransport({
//         auth: { api_key: process.env.SENDGRID_KEY },
//     })
// );
const transporter = nodemailer.createTransport(
    mgTransport({
        auth: {
            api_key: process.env.MAILGUN_PRIVATE,
            domain: process.env.MAILGUN_DOMAIN
        },
        host: 'api.eu.mailgun.net' // e.g. for EU region
    })
);

/**
 * 이메일 인증번호 전송
 * @param req id / email: 아이디 또는 이메일 주소(둘 중 하나)
 * @param res       |status     |isSuccess  |message
 *            성공 : |200        |true
 *            실패 : |422        |false      |유효/존재하지 않는 이메일
 *            에러 : |500        |false
 */
exports.postSendToken = (req, res, next) => {
    const { id, email } = req.body;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const error = new Error('Validation failed.');
        return res.status(422).json({
            isSuccess: false,
            message: errors.array(),
        });
    }

    if (id) {
        User.findOne({ 'local.id': id })
            .then((userDoc) => {
                if (userDoc) {
                    sendTokenToEmail(userDoc);
                    return res.json({
                        isSuccess: true,
                    })
                }
                return res.status(422).json({
                    isSuccess: false,
                    message: '존재하지 않는 아이디/이메일 주소입니다.',
                });
            })
    } else {
        User.findOne({ email })
        .then((userDoc) => {
            if (userDoc && userDoc.method === 'local') {
                sendTokenToEmail(userDoc);
                return res.json({
                    isSuccess: true,
                })
            }
            if (userDoc) {
                return res.status(422).json({
                    isSuccess: false,
                    message: 'SNS 회원입니다. SNS를 통해 로그인 가능합니다.',
                });
            } 
            return res.status(422).json({
                isSuccess: false,
                message: '존재하지 않는 아이디/이메일 주소입니다.',
            });
        })
    }
};

/**
 * 인증번호 확인 (아이디 찾기 or 이메일 인증)
 * @param req email, token : 이메일과 인증번호
 * @param res       |status     |isSuccess  |message
 *            일치 : |200        |true
 *            불일치: |422        |false      |유효/존재하지 않는 이메일, 인증번호 불일치
 *            에러 : |500        |false
 */
exports.postVerifyToken = (req, res, next) => {
    const { id, email, token } = req.body;
    let loadedUser;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const error = new Error('Validation failed.');
        return res.status(422).json({
            isSuccess: false,
            message: errors.array(),
        });
    }

    User.findOne({ $or: [{ 'local.id': id }, { email }] })
        .then((user) => {
            if (!user) {
                return res.status(422).json({
                    isSuccess: false,
                    message: '아이디/이메일을 확인해주세요.',
                });
            }
            loadedUser = user;
            return bcrypt.compare(token, user.token);
        })
        .then((isEqual) => {
            if (!isEqual) {
                return res.status(422).json({
                    isSuccess: false,
                    message: '인증번호를 확인해주세요.',
                });
            }
            if (loadedUser.tokenExpiration < Date.now()) {
                return res.status(422).json({
                    isSuccess: false,
                    isTokenExpired: true,
                    message: '인증번호가 만료되었습니다.',
                });
            }
            // 인증번호가 일치하고, 만료되지 않았을 때
            return res.json({
                isSuccess: true,
                data: {
                    userId: loadedUser.local.id,
                    userEmail: loadedUser.email,
                },
                message: '인증완료 되었습니다.',
            });
        })
        .catch((err) => {
            if (!err.statusCode) {
                err.statusCode = 500;
            }
            next(err);
        });
};

/**
 * 이메일 인증링크 전송
 * @param req email: 이메일 주소
 * @param res       |status     |isSuccess  |message
 *            성공 : |200        |true
 *            실패 : |422        |false      |유효/존재하지 않는 이메일
 *            에러 : |500        |false
 */
exports.getSendLink = (req, res, next) => {
    const { email } = req.query;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const error = new Error('Validation failed.');
        return res.status(422).json({
            isSuccess: false,
            message: errors.array(),
        });
    }

    // 이메일 값이 일치하는 유저
    User.findOne({ email })
        .then((user) => {
            if (user) {
                const token = signToken(user);
                return transporter.sendMail({
                    from: 'admin@zoesbreath.com',
                    to: user.email,
                    subject: '인증메일',
                    html: `
                        <p><a href="https://zoesbreath.com:5000/auth/verify-link/?token=${token}">링크</a>를 클릭하면 인증이 완료됩니다.</p>
                        `,
                });
            }
            return res.status(422).json({
                isSuccess: false,
                message: '존재하지 않는 이메일 주소입니다.',
            });
        })
        .then((result) => {
            if (result.isSuccess) {
                return res.json(result);
            }
            return res.status(500).json(result);
        })
        .catch((err) => {
            if (!err.statusCode) {
                err.statusCode = 500;
            }
            next(err);
        });
};

/**
 * 이메일 인증 링크 확인
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
exports.getVerifyLink = (req, res, next) => {
    const { token } = req.query;

    let decodedToken;
    try {
        decodedToken = jwt.verify(token, JWT_SECRET);
    } catch (err) {
        err.statusCode = 500;
        throw err;
    }
    if (!decodedToken) {
        const error = new Error('Not authenticated.');
        error.statusCode = 401;
        throw error;
    }
    User.findById({ _id: decodedToken.userId })
        .then((user) => {
            if (user) {
                user.isEmailVerified = true;
                return user.save();
            }
            res.status(404).end('error');
        })
        .then((userDoc) => {
            return res.redirect('zoebreath://')
        })
}

/**
 * 비밀번호 재설정 (비밀번호 찾기)
 * @param req id, token, newPassword : 아이디/이메일, 인증번호, 새로운 비밀번호
 * @param res       |status     |isSuccess  |message
 *            성공 : |200        |true
 *            실패 : |422        |false      |존재하지 않는 아이디/이메일, 유효하지 않은 비밀번호, 인증번호 불일치
 *            에러 : |500        |false
 * @param next
 */
exports.postResetPassword = (req, res, next) => {
    const { id, token, newPassword } = req.body;
    let loadedUser;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const error = new Error('Validation failed.');
        error.statusCode = 422;
        error.message = errors.array();
        throw error;
    }

    User.findOne({ 'local.id': id })
        .then((user) => {
            if (!user) {
                return res.status(422).json({
                    isSuccess: false,
                    message: '아이디/이메일을 확인해주세요.',
                });
            }
            loadedUser = user;
            return bcrypt.compare(token, user.token);
        })
        .then((isEqual) => {
            if (!isEqual) {
                return res.status(422).json({
                    isSuccess: false,
                    message: '인증번호를 확인해주세요.',
                });
            }
            if (loadedUser.tokenExpiration < Date.now()) {
                return res.status(422).json({
                    isSuccess: false,
                    isTokenExpired: true,
                    message: '인증번호가 만료되었습니다.',
                });
            }
            // 인증번호가 일치하고, 만료되지 않았을 때
            return bcrypt.hash(newPassword, 12);
        })
        .then((hashedPassword) => {
            loadedUser.local.password = hashedPassword;
            return loadedUser.save();
        })
        .then((result) => {
            return res.json({
                isSuccess: true,
                message: '비밀번호 수정 완료',
                data: {
                    id: result.id,
                    email: result.email,
                    nickName: result.nickName,
                },
            });
        })
        .catch((err) => {
            if (!err.statusCode) {
                err.statusCode = 500;
            }
            next(err);
        });
};

/**
 * 아이디 중복확인
 * @param req id : 중복 확인하려는 유저 아이디
 * @param res              |status     |isSuccess  |message
 *            중복       :  |409        |false
 *            중복아님    :  |200        |true
 *            유효하지않음 :  |422        |false
 *            에러       :  |500        |false
 */
exports.getCheckId = (req, res, next) => {
    const { id } = req.params;

	console.log('a')
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const error = new Error('Validation failed.');
        error.statusCode = 422;
        error.message = errors.array();
	    console.log('error')
        throw error;
    }
	console.log('c')

    User.findOne({ 'local.id': id })
        .then((userDoc) => {
            if (userDoc) {
                return res.status(409).json({
                    isSuccess: false,
                    message: '중복되는 아이디 입니다.',
                });
            }
            return res.json({
                isSuccess: true,
                message: '사용가능한 아이디 입니다.',
            });
        })
        .catch((err) => {
            if (!err.statusCode) {
                err.statusCode = 500;
            }
            next(err);
        });
};

/**
 * 이메일 중복확인
 * @param req email : 중복 확인하려는 유저 이메일
 * @param res              |status     |isSuccess  |message
 *            중복       :  |409        |false
 *            중복아님    :  |200        |true
 *            유효하지않음 :  |422        |false
 *            에러       :  |500        |false
 */
exports.getCheckEmail = (req, res, next) => {
    const { email } = req.params;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const error = new Error('Validation failed.');
        error.statusCode = 422;
        error.message = errors.array();
        throw error;
    }

    User.findOne({ email })
        .then((userDoc) => {
            if (userDoc) {
                return res.status(409).json({
                    isSuccess: false,
                    message: '중복되는 이메일 주소입니다.',
                });
            }
            return res.json({
                isSuccess: true,
                message: '사용가능한 이메일 주소입니다.',
            });
        })
        .catch((err) => {
            if (!err.statusCode) {
                err.statusCode = 500;
            }
            next(err);
        });
};

/**
 * 닉네임 중복확인
 * @param req nickName : 중복 확인하려는 유저 닉네임
 * @param res              |status     |isSuccess  |message
 *            중복       :  |409        |false
 *            중복아님    :  |200        |true
 *            에러       :  |500        |false
 */
exports.getCheckNickName = (req, res, next) => {
    const { nickName } = req.params;

    User.findOne({ nickName })
        .then((userDoc) => {
            if (userDoc) {
                return res.status(409).json({
                    isSuccess: false,
                    message: '중복되는 닉네임 입니다.',
                });
            }
            return res.json({
                isSuccess: true,
                message: '사용가능한 닉네임 입니다.',
            });
        })
        .catch((err) => {
            if (!err.statusCode) {
                err.statusCode = 500;
            }
            next(err);
        });
};

/**
 * 이메일 인증여부 확인
 * 
 */
exports.getIsEmailVerified = (req, res, next) => {
    const { email } = req.query;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const error = new Error('Validation failed.');
        error.statusCode = 422;
        error.message = errors.array();
        throw error;
    }

    User.findOne({$and: [
                        { email },
                        { method: 'local' }
                    ]})
        .then((userDoc) => {
            if (!userDoc) {
                return res.status(409).json({
                    isSuccess: false,
                    message: '이메일 주소를 확인해주세요.',
                });
            }
            return res.json({
                isSuccess: userDoc.isEmailVerified,
            });
        })
        .catch((err) => {
            if (!err.statusCode) {
                err.statusCode = 500;
            }
            next(err);
        });
};

/**
 * 이메일로 인증 번호 전송 - user값이 존재하는 경우를 가정
 */
const sendTokenToEmail = (user) => {
    return new Promise((resolve, reject) => {
        crypto.randomBytes(3, (err, buffer) => {
            if (err) {
                return {
                    isSuccess: false,
                    error: err,
                };
            }
            // 사용자 인증 번호
            const token = parseInt(buffer.toString("hex"), 16)
                .toString()
                .substr(0, 6);
            bcrypt
                .hash(token, 12)
                .then((hashedToken) => {
                    user.token = hashedToken;
                    user.tokenExpiration = Date.now() + 1000 * 60 * 10;
                    return user.save();
                })
                .then((result) => {
                    transporter.sendMail({
                        to: user.email,
                        from: 'admin@zoesbreath.com	',
                        subject: '인증번호',
                        html: `
                        <p>인증 번호는 ${token} 입니다.</p>
                    `,
                    });
                    resolve({
                        isSuccess: true,
                        message: '인증번호 전송 완료',
                    });
                })
                .catch((err) => {
                    reject({
                        isSuccess: false,
                        error: err,
                    });
                });
        });
    });
};

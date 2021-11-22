/**
 * 계정 가입, 로그인 - local, sns
 */
const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');

const User = require('../models/user');
const { signToken } = require('../util/token');

require('dotenv').config();

/**
 * 회원가입
 * @param req 회원가입하려는 유저의 정보
 * @param res       |status     |isSuccess  |message
 *            성공 : |200        |true
 *            실패 : |422        |false
 *            에러 : |500        |false
 */
exports.postSignup = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const error = new Error('Validation failed.');
        error.statusCode = 422;
        error.message = errors.array();
        throw error;
    }

    const {
        id,
        password,
        email,
        nickName,
        gender,
        birthday,
        agreeService,
        agreePersonalInfo,
    } = req.body;

    bcrypt
        .hash(password, 12)
        .then((hashedPassword) => {
            const user = new User({
                method: 'local',
                local: {
                    id,
                    password: hashedPassword,
                },
                email,
                nickName,
                gender,
                birthday,
                agreeService,
                agreePersonalInfo,
            });
            return user.save();
        })
        .then((result) => {
            return res.json({
                isSuccess: true,
                message: '회원가입 완료',
                data: {
                    id: result.local.id,
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
 * 로컬 로그인
 * @param req id, password: 아이디와 패스워드
 * @param res       |status     |isSuccess  |message  |return
 *            성공 : |200        |true                 |토큰
 *            실패 : |422        |false      |유효성 검사, 아이디 또는 패스워드 불일치
 *            에러 : |500        |false
 */
exports.postLogin = (req, res, next) => {
    const { id, password } = req.body;
    let loadedUser;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const error = new Error('Validation failed.');
        return res.status(422).json({
            isSuccess: false,
            message: errors.array(),
        });
    }

    User.findOne({ 'local.id': id })
        .then((user) => {
            if (!user) {
                return res.status(422).json({
                    isSuccess: false,
                    message: "아이디/패스워드가 잘못되었습니다.",
                });
            }
            loadedUser = user;
            return bcrypt.compare(password, user.local.password);
        })
        .then((isEqual) => {
            if (isEqual) {
                return res.json({
                    isSuccess: true,
                    token: signToken(loadedUser),
                    tokenExpiration: Date.now() + 1000 * 60 * 60,
                    userMethod: 'local',
                    userId: loadedUser._id.toString(),
                    isInitial: loadedUser.isInitial,
                });
            }
            return res.status(422).json({
                isSuccess: false,
                message: "아이디/패스워드가 잘못되었습니다.",
            });
        })
        .catch((err) => {
            return res.status(500).json({
                isSuccess: false,
                message: '네트워크 에러 발생',
            });
        });
  };

/**
 * 카카오 로그인/가입
 * @param req 카카오인증을 통해 받은 유저 정보
 * @param res       |status     |isSuccess  |message  |return
 *            성공 : |200        |true                 |토큰
 *            실패 : |422        |false      |이미 다른 방식으로 가입한 유저
 *            에러 : |500        |false
 */
exports.postKakaoLogin = (req, res, next) => {
    const { 
        id,
        nickname,
        email, 
        birthday, 
        gender
    } = req.body;

    User.findOne({ $or: [{ 'kakao.id': id }, { email }]})
        .then((user) => {
            if (!user) {
                user = new User({
                    method: 'kakao',
                    kakao: {
                        id,
                    },
                    email,
                    nickName: nickname,
                    birthday,
                    gender,
                })
                return user.save(function (err, user) {
		    if (err) throw err;
		    return user.body;
		});
            }
            /* 다른 방식으로 이미 가입된 메일인 경우 */
            if (user.method !== 'kakao') {
                return res.status(422).json({
                    isSuccess: false,
                    message: "이미 가입된 사용자 입니다.",
                });
            }
            return user;
        })
        .then((userDoc) => {
            const user = userDoc;

            return res.json({
                isSuccess: true,
                token: signToken(user),
                tokenExpiration: Date.now() + 1000 * 60 * 60 * 24,
                userMethod: 'kakao',
                userId: user._id.toString(),
                isInitial: user.isInitial,
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
 * 네이버 로그인/가입
 * @param req 네이버인증을 통해 받은 유저 정보
 * @param res       |status     |isSuccess  |message  |return
 *            성공 : |200        |true                 |토큰
 *            실패 : |422        |false      |이미 다른 방식으로 가입한 유저
 *            에러 : |500        |false
 */
 exports.postNaverLogin = (req, res, next) => {
    const { 
        id,
        nickname,
        email, 
        birthday, 
        gender
    } = req.body;

    User.findOne({ $or: [{ 'naver.id': id }, { email }]})
        .then((user) => {
            if (!user) {
                user = new User({
                    method: 'naver',
                    naver: {
                        id,
                    },
                    email,
                    nickName: nickname,
                    birthday,
                    gender,
                })
                return user.save(function (err, user) {
		    if (err) throw err;
		    return user.body;
		});
            }
            /* 다른 방식으로 이미 가입된 메일인 경우 */
            if (user.method !== 'naver') {
                return res.status(422).json({
                    isSuccess: false,
                    message: "이미 가입된 사용자 입니다.",
                });
            }
            return user;
        })
        .then((userDoc) => {
            const user = userDoc;

            return res.json({
                isSuccess: true,
                token: signToken(user),
                tokenExpiration: Date.now() + 1000 * 60 * 60 * 24,
                userMethod: 'naver',
                userId: user._id.toString(),
                isInitial: user.isInitial,
            });
        })
        .catch((err) => {
            if (!err.statusCode) {
                err.statusCode = 500;
            }
            next(err);
        });
};

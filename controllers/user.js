/**
 * 계정 가입, 로그인 - local, sns
 */
const User = require('../models/user');
const {signToken} = require('../util/token');

require('dotenv').config();

/**
 * 카카오 로그인/가입
 * @param req 카카오인증을 통해 받은 유저 정보
 * @param res       |status     |isSuccess  |message  |return
 *            성공 : |200        |true                 |토큰
 *            실패 : |422        |false      |이미 다른 방식으로 가입한 유저
 *            에러 : |500        |false
 */
exports.kakaoLogin = (req, res, next) => {
    console.log(req.url + "\n");
    console.log(req.body);
    const {
        id,
        nickname,
        email,
        birthday,
        gender
    } = req.body;

    User.findOne({'kakao.id': id})
        .then((user) => {
            if (!user) {
                user = new User({
                    method: 'kakao',
                    kakao: {
                        id,
                    },
                    email,
                    nickname: nickname,
                    birthday,
                    gender,
                })
                user.save(function (err, user) {
                    if (err) throw err;
                    return user.body;
                });
                console.log("kakao user 생성 완료\n" + user);
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
exports.naverLogin = (req, res, next) => {
    console.log(req.url + "\n");
    console.log(req.body);
    const {
        id,
        nickname,
        email,
        birthday,
        gender
    } = req.body;

    User.findOne({'naver.id': id})
        .then((user) => {
            if (!user) {
                user = new User({
                    method: 'naver',
                    naver: {
                        id,
                    },
                    email,
                    nickname: nickname,
                    birthday,
                    gender,
                })
                user.save(function (err, user) {
                    if (err) throw err;
                    return user.body;
                });
                console.log("naver user 생성 완료\n" + user);
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

exports.appleLogin = (req, res, next) => {
    console.log(req.url + "\n");
    console.log(req.body);
    const {
        id,
        nickname,
        email,
        birthday,
        gender
    } = req.body;

    User.findOne({'apple.id': id})
        .then((user) => {
            if (!user) {
                user = new User({
                    method: 'apple',
                    apple: {
                        id,
                    },
                    email,
                    nickname: nickname,
                    birthday,
                    gender,
                })

                user.save(function (err, user) {
                    if (err) throw err;
                    return user.body;
                });
                console.log("apple user 생성 완료\n" + user);
            }
            /* 다른 방식으로 이미 가입된 메일인 경우 */
            if (user.method !== 'apple') {
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
                userMethod: 'apple',
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

exports.updateNickname = (req, res, next) => {
    console.log(req.url + "\n");
    console.log(req.body);
    console.log(req.userId);

    const {method, nickname} = req.body;
    var query = {'_id': req.userId}

    User.updateOne(
        query, {$set : {'nickname': nickname}})
        .catch((err) => {
            if (!err.statusCode) {
                err.statusCode = 500;
            }
            next(err);
        });
};

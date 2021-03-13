const { body, param } = require('express-validator');

const User = require('../models/user');

/**
 * 회원가입 
 * POST /user/signup
 */
exports.postSignupValidator = [
    body('id')
        .not().isEmpty()
        .withMessage('아이디를 입력해주세요.')
        .isLength({ min: 5, max: 20 })
        .withMessage('아이디는 5~20자 이내로 입력하셔야 합니다.')
        .matches(/^[a-z0-9]+$/)
        .withMessage('아이디는 영문 소문자, 숫자만 사용 가능합니다.')
        .custom((value, { req }) => {
            return User.findOne({ 'local.id': value }).then(userDoc => {
              if (userDoc) {
                return Promise.reject('이미 존재하는 아이디입니다.');
              }
            });
        }),
    body('password')
        .not().isEmpty()
        .withMessage('비밀번호를 입력해주세요.')
        .isLength({ min: 8, max: 20 })
        .withMessage('비밀번호는 8~20자 이내로 입력하셔야 합니다.')
        .isAlphanumeric()
        .withMessage('8자 이상의 영문, 숫자 조합으로 입력해주세요.')
        .not().isAlpha()
        .withMessage('반드시 하나 이상의 숫자를 입력하세요.')
        .not().isNumeric()
        .withMessage('반드시 하나 이상의 영문자를 입력하세요.'),
    body('email')
        .not().isEmpty()
        .withMessage('이메일을 입력해주세요.')
        .isEmail()
        .withMessage('이메일 형식이 올바르지 않습니다.')
        .custom((value, { req }) => {
            return User.findOne({ email: value }).then(userDoc => {
                if (userDoc) {
                    return Promise.reject('이미 존재하는 이메일입니다.');
                }
            });
        })
        .normalizeEmail(),
    body('nickName')
        .not().isEmpty()
        .withMessage('닉네임을 입력해주세요.'),
    body('agreeService')
        .not().isEmpty()
        .withMessage('서비스 이용약관 동의는 필수 값입니다.')
        .isBoolean()
        .equals('true')
        .withMessage('서비스 이용약관에 동의 후 이용가능합니다.'),
    body('agreePersonalInfo')
        .not().isEmpty()
        .withMessage('개인정보 수집 동의는 필수 값입니다.')
        .isBoolean()
        .equals('true')
        .withMessage('개인정보 수집 동의 후 이용가능합니다.'),
];

/**
 * 로그인 
 * POST /user/login
 */
exports.postLoginValidator = [
    body('id')
        .not().isEmpty()
        .withMessage('아이디를 입력해주세요.')
        .isLength({ min: 5, max: 20 })
        .withMessage('아이디는 5~20자 이내로 입력하셔야 합니다.')
        .matches(/^[a-z0-9]+$/)
        .withMessage('아이디는 영문 소문자, 숫자만 사용 가능합니다.'),
    body('password')
        .not().isEmpty()
        .withMessage('비밀번호를 입력해주세요.')
        .isLength({ min: 8, max: 20 })
        .withMessage('비밀번호는 5~20자 이내로 입력하셔야 합니다.')
        .isAlphanumeric()
        .withMessage('8자 이상의 영문, 숫자 조합으로 입력해주세요.')
        .not().isAlpha()
        .withMessage('반드시 하나 이상의 숫자를 입력하세요.')
        .not().isNumeric()
        .withMessage('반드시 하나 이상의 영문자를 입력하세요.'),
];

/**
 * 이메일 인증번호 전송 
 * POST /user/send-token
 */
exports.postSendTokenValidator = [
    body('id')
        .optional()
        .isLength({ min: 5, max: 20 })
        .withMessage('아이디는 5~20자 이내로 입력하셔야 합니다.')
        .matches(/^[a-z0-9]+$/)
        .withMessage('아이디는 영문 소문자, 숫자만 사용 가능합니다.')        
        .custom((value, { req }) => {
            return User.findOne({ 'local.id': value }).then(userDoc => {
              if (!userDoc) {
                return Promise.reject('존재하지 않는 아이디입니다.');
              }
            });
        }),
    body('email')
        .optional()
        .isEmail()
        .withMessage('이메일 형식이 올바르지 않습니다.')
        .normalizeEmail()
        .custom((value, { req }) => {
            return User.findOne({ email: value }).then(userDoc => {
              if (!userDoc) {
                return Promise.reject('존재하지 않는 이메일 주소입니다.');
              }
            });
        }),
];

/**
 * 인증번호 확인 (아이디 찾기 or 이메일 인증) 
 * POST /user/verify-token
 */
exports.postVerifyTokenValidator = [
    body('id')
        .optional()
        .isLength({ min: 5, max: 20 })
        .withMessage('아이디는 5~20자 이내로 입력하셔야 합니다.')
        .matches(/^[a-z0-9]+$/)
        .withMessage('아이디는 영문 소문자, 숫자만 사용 가능합니다.')        
        .custom((value, { req }) => {
            return User.findOne({ 'local.id': value }).then(userDoc => {
              if (!userDoc) {
                return Promise.reject('존재하지 않는 아이디입니다.');
              }
            });
        }),
    body('email')
        .optional()
        .isEmail()
        .withMessage('이메일 형식이 올바르지 않습니다.')
        .normalizeEmail()
        .custom((value, { req }) => {
            return User.findOne({ email: value }).then(userDoc => {
              if (!userDoc) {
                return Promise.reject('존재하지 않는 이메일 주소입니다.');
              }
            });
        }),
    body('token')
        .not().isEmpty()
        .withMessage('인증번호를 입력해주세요.')
        .isLength( { min: 6, max: 6 })
        .withMessage('인증번호는 6자리 숫자 입니다.')
        .isNumeric()
        .withMessage('인증번호는 6자리 숫자 입니다.'),
];

/**
 * 비밀번호 재설정 (비밀번호 찾기)
 * POST /user/reset-password
 */
exports.postResetPasswordValidator = [
    body('id')
        .optional()
        .isLength({ min: 5, max: 20 })
        .withMessage('아이디는 5~20자 이내로 입력하셔야 합니다.')
        .matches(/^[a-z0-9]+$/)
        .withMessage('아이디는 영문 소문자, 숫자만 사용 가능합니다.')        
        .custom((value, { req }) => {
            return User.findOne({ 'local.id': value }).then(userDoc => {
              if (!userDoc) {
                return Promise.reject('존재하지 않는 아이디입니다.');
              }
            });
        }),
    body('email')
        .optional()
        .isEmail()
        .withMessage('이메일 형식이 올바르지 않습니다.')
        .normalizeEmail()
        .custom((value, { req }) => {
            return User.findOne({ email: value }).then(userDoc => {
              if (!userDoc) {
                return Promise.reject('존재하지 않는 이메일 주소입니다.');
              }
            });
        }),
    body('token')
        .not().isEmpty()
        .withMessage('인증번호를 입력해주세요.')
        .isLength( { min: 6, max: 6 })
        .withMessage('인증번호는 6자리 숫자 입니다.')
        .isNumeric()
        .withMessage('인증번호는 6자리 숫자 입니다.'),
    body('newPassword')
        .not().isEmpty()
        .withMessage('새로운 비밀번호를 입력해주세요.')
        .isLength({ min: 8, max: 20 })
        .withMessage('비밀번호는 5~20자 이내로 입력하셔야 합니다.')
        .isAlphanumeric()
        .withMessage('8자 이상의 영문, 숫자 조합으로 입력해주세요.')
        .not().isAlpha()
        .withMessage('반드시 하나 이상의 숫자를 입력하세요.')
        .not().isNumeric()
        .withMessage('반드시 하나 이상의 영문자를 입력하세요.'),
];

/**
 * 아이디 중복확인
 * GET /user/check-id/:id
 */
exports.getCheckIdValidator = [
    param('id')
        .not().isEmpty()
        .withMessage('아이디를 입력해주세요.')
        .isLength({ min: 5, max: 20 })
        .withMessage('아이디는 5~20자 이내로 입력하셔야 합니다.')
        .matches(/^[a-z0-9]+$/)
        .withMessage('아이디는 영문 소문자, 숫자만 사용 가능합니다.'),
];

/**
 * 이메일 중복확인
 * GET /user/check-email/:email
 */
exports.getCheckEmailValidator = [
    param('email')
        .not().isEmpty()
        .withMessage('이메일을 입력해주세요.')
        .isEmail()
        .withMessage('이메일 형식이 올바르지 않습니다.')
        .normalizeEmail(),
];

/**
 * 닉네임 중복확인
 * GET /check-nickname/:nickName
 */
exports.getCheckNickNameValidator = [
    param('nickName')
        .not().isEmpty()
        .withMessage('닉네임을 입력해주세요.'),
];

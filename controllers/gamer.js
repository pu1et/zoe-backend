/**
 * 게임 동작 관련
 */
const { validationResult } = require('express-validator');

const User = require('../models/user');

require('dotenv').config();

/**
 * 게임유저 정보 패치
 *
 * GET /gamer
 */
exports.getGamerInfo = (req, res, next) => {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		const error = new Error('Validation failed.');
		error.statusCode = 422;
		error.message = errors.array();
		throw error;
	}

	User.findById(req.userId)
		.then((user) => {
			res.status(200).json({
				message: 'Fetched gamer info successfully.',
				gamer: {
					_id: user._id,
                    nickName: user.nickName,
                    profileImgUrl: user.profileImgUrl,
					isInitial: user.isInitial,
                    score: user.score,
                    itemHave: user.itemHave,
					skins: user.skins,
					dustStage: user.dustStage,
                    isWithered: user.isWithered,
                    itemLeft: user.itemLeft,
                    isNotiAllowed: user.isNotiAllowed,
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
 * 게임유저 정보 업데이트
 *
 * PUT /gamer
 */
exports.updateGamerInfo = (req, res, next) => {
	const { userId } = req;
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		const error = new Error(
			'Validation failed, entered data is incorrect.'
		);
		error.statusCode = 422;
		throw error;
	}

	const {
        nickName,
        profileImgUrl,
        isInitial,
        isNotiAllowed,
	} = req.body;

	User.findById(userId)
		.then((user) => {
			user.nickName = nickName ? nickName : user.nickName;
			user.profileImgUrl = profileImgUrl ? profileImgUrl : user.profileImgUrl;
            user.isInitial = isInitial ? isInitial : user.isInitial;
            user.isNotiAllowed = isNotiAllowed ? isNotiAllowed : user.isNotiAllowed;
			return user.save();
		})
		.then((user) => {
			res.status(200).json({ 
                message: 'Gamer updated!', 
				gamer: {
					_id: user._id,
					nickName: user.nickName,
					profileImgUrl: user.profileImgUrl,
                    isInitial: user.isInitial,
                    isNotiAllowed: user.isNotiAllowed,
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
 * 게임 아이템 줍기
 * 
 * 해당 행성의 아이템 남은 개수 -1,
 * 사용자의 해당 아이템 개수 +1
 * 
 * POST /gamer/postPickItem
 */
exports.postPickItem = (req, res, next) => {
	const { userId } = req;
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		const error = new Error(
			'Validation failed, entered data is incorrect.'
		);
		error.statusCode = 422;
		throw error;
	}

	const {
        item,
        planet
	} = req.body;

	User.findById(userId)
		.then((user) => {
            if (user.itemLeft[planet] > 0) {
                user.itemHave[item] += 1;
                user.itemLeft[planet] -= 1;
                return user.save();
            }
            res.status(409).json({
                isSuccess: false,
                message: `${planet} 행성에 아이템이 없음`,
            });
		})
		.then((user) => {
			res.status(200).json({ 
                message: 'Gamer updated!', 
				gamer: {
                    _id: user._id,
                    itemHave: user.itemHave,
                    itemLeft: user.itemLeft,
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
 * 게임 아이템 사용, 바오밥 획득 등
 *
 * POST /gamer/postUseItem
 */
exports.postUseItem = (req, res, next) => {
	const { userId } = req;
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		const error = new Error(
			'Validation failed, entered data is incorrect.'
		);
		error.statusCode = 422;
		throw error;
	}

	const {
        item,
        plusScore,
	} = req.body;

	User.findById(userId)
		.then((user) => {
            /* 아이템 개수가 맞는지 확인해줌 */
            if (item && user.itemHave[item] <= 0) {
                return res.status(422).json({
                    isSuccess: false,
                    message: '아이템이 0개라 사용불가',
                });
            }

            /* 튜토리얼 완료 후 */
            if (plusScore && plusScore >= 0) {
                const prevScore = user.score;
                user.score += (item && item === 'booster') ? (2 * plusScore) : parseInt(plusScore);
                
                /* 1000단위로 증가할 때마다 먼지가 늘어남 */
                if (parseInt(prevScore / 1000) !== parseInt(user.score / 1000) 
                    && user.dustStage < 3) {
                        user.dustStage += 1;
                    }
                user.itemHave[item] -= 1;
                return user.save();
            }

            /* 클리너 사용 */
            if (item && item === 'cleaner' && user.dustStage > 0) {
                user.dustStage -= 1;
                user.itemHave[item] -= 1;
                return user.save();
            }

            /* 물뿌리개 사용 */
            if (item && item === 'sprinkler' && user.isWithered) {
                user.isWithered = false;
                user.itemHave[item] -= 1;
                return user.save();
            }

            res.status(422).json({
                isSuccess: false,
                message: '인자가 부족하거나, user state에 맞지 않는 아이템',
            });
		})
		.then((user) => {
			res.status(200).json({ 
                message: 'Gamer updated!', 
				gamer: {
					_id: user._id,
                    nickName: user.nickName,
                    profileImgUrl: user.profileImgUrl,
					isInitial: user.isInitial,
                    score: user.score,
                    itemHave: user.itemHave,
					skins: user.skins,
					dustStage: user.dustStage,
                    isWithered: user.isWithered,
                    itemLeft: user.itemLeft,
                    isNotiAllowed: user.isNotiAllowed,
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
const {
    Tutorial,
    Comment
} = require('../models/tutorial');
const User = require('../models/user');
const { populate } = require('../models/user');
const Mongoose = require('mongoose');

/*
    리스트 정보
 */
const tutList = [
    [
        '5fbd1a2e0745694f74859faf',
        '5fbd1c020745694f74859fb3',
        '610827e82163f962f57cf8de',
    ],
    [
        '5fbd1d080745694f74859fbb',
        '5fbd1d080745694f74859fbd',
        '610828052163f962f57cf8df',
        '610828052163f962f57cf8e0'
    ],
    [
        '5fbd1d060745694f74859fb5',
        '5fbd1d070745694f74859fb7',
        '5fbd1d070745694f74859fb9'
    ],
    [
        '5fbd1d090745694f74859fbf',
        '5fbd1d1b0745694f74859fc1'
    ],
    [
        '5fbd2e2b0745694f74859fc5',
        '5fbd2e2c0745694f74859fc7',
        '6110aea6c322c1a3fb58177a',
        '6110af8fc322c1a3fb58177b'
    ],
]

/**
 * 튜토리얼 리스트뷰
 * 
 * GET /tutorial/list/:listId
 */
exports.getTutorialList = (req, res, next) => {
    // 데모 버전에서는 튜토리얼 로직이 아직 없음
    // 추후에 이 곳에 튜토리얼 리스트 카테고리별로 로직을 추가해야함.

    const { listId } = req.params;
    const numId = parseInt(listId);

    if (numId >= tutList.length || numId < 0) {
        return res.status(422).json({ 
            isSuccess: false,
            message: 'Invalid list id!',
        });
    }

    Tutorial.find()
        .where('_id')
        .in(tutList[numId])
        .then(tutorials => {
            let prevData = tutorials.map(tut => ({
                _id: tut._id,
                thumbnailImg: tut.thumbnailImg,
                title: tut.title,
            }))
            return res.status(200).json({ 
                message: 'Fetched tutorials successfully.',
                prevData, 
            });
        })
        .catch(err => {
            return res.status(500).json({
                message: err.message,
                error: '네트워크 문제 발생',
            });
        });
        ;
};

/**
 * 튜토리얼 상세뷰
 * 
 * GET /tutorial/:tutorialId
 */
exports.getTutorial = (req, res, next) => {
    const { tutorialId } = req.params;

    Tutorial.findById(tutorialId)
        .then(data => {
            delete data['comment'];
            res.status(200).json({ 
                message: 'Tutorial fetched.', 
                tutorial: data
            });
        })
        .catch(err => {
            return res.status(500).json({
                message: err.message,
                error: '네트워크 문제 발생',
            });
        });
};

/**
 * 튜토리얼 댓글 가져오기
 * 
 * GET /tutorial/comments/:tutorialId
 * 
 */
exports.getComments = (req, res, next) => {
    const currentPage = req.query.page || 1;
    const { tutorialId } = req.params;
    const perPage = 10;

    Tutorial.aggregate([
        {
            '$match': {
                '_id': Mongoose.Types.ObjectId(tutorialId)
            }
        }, {
            '$unwind': '$comments'
        }, {
            '$project': {
                'comments._id': 1,
                'comments.createdAt': 1,
                'comments.author': 1,
                'comments.content': 1,
            }
        }, {
            '$sort': { 'comments.createdAt': -1 }
        }, { 
            '$skip': (currentPage - 1) * perPage
        }, { 
            '$limit': 10
        }, {
            '$lookup': {
                'from': User.collection.name,
                'localField': 'comments.author',
                'foreignField': '_id',
                'as': 'comments.authorInfo'
            }
        }, {
            '$group': {
                '_id': '$_id',
                'comments': {
                    '$push': '$comments'
                },
                'count': { '$sum': 1 }
            }
        }], function(error, result) {
            let returnComments = [];

            // 댓글에 필요한 정보 매핑 후, 리턴
            if (result[0]) {
                result[0].comments.map(el => {
                    returnComments.push({
                        content: el.content,
                        _id: el._id,
                        author: el.author,
                        createdAt: el.createdAt,
                        authorInfo: {
                            profileImgUrl: el.authorInfo[0].profileImgUrl,
                            nickName: el.authorInfo[0].nickName,
                        }
                    })
                })
            }

            return res.status(200).json({ 
                message: 'Comments fetched.',
                page: currentPage,
                comments: returnComments,
            });
    })
};

/**
 * 튜토리얼 데이터 생성 (내부용)
 * 
 * POST /tutorial
 * 
 * @param req 튜토리얼 정보
 * @param res       |status
 *            성공 : |201
 */
exports.createTutorial = (req, res, next) => {
    // 데모 버전에서는 관리자용 페이지가 없음 -> 프론트에서 호출하는 API x!
    // 추후 관리자용 (튜토리얼 추가) 페이지를 만든다면,
    // 이 곳에 데이터 검증 및 관리자 체크 로직을 추가해야함.

    const { 
        title, 
        thumbnailImg, 
        mainImg,
        backImg,
        tags,
        explanation,
        tutorialType,
        items,
    } = req.body;

    const tutorial = new Tutorial({
        title, 
        thumbnailImg, 
        mainImg,
        backImg,
        tags,
        explanation,
        tutorialType,
        items,
        comments: [],
    });

    tutorial
        .save()
        .then(result => {
            return res.status(201).json({
                message: 'Tutorial created successfully!',
                tutorial: tutorial,
            });
        })
        .catch(err => {
            return res.status(500).json({
                message: 'Tutorial created successfully!',
                error: '네트워크 문제 발생',
            });
        });
};

/**
 * 튜토리얼 댓글작성
 * 
 * POST /tutorial/comment/:tutorialId
 * 
 * @param req 튜토리얼아이디, 작성자, 댓글내용
 * @param res       |status
 *            성공 : |201
 */
exports.postComment = (req, res, next) => {
    const { tutorialId } = req.params;
    const { content } = req.body;

    const comment = new Comment({
        author: req.userId,
        content: content
    });

    Tutorial.findById(tutorialId)
        .then(tutorial => {
            tutorial.comments.push(comment);
            tutorial.commentCount += 1;
            return tutorial.save();
        })
        .then(result => {
            res.status(201).json({
                message: 'Comment created successfully!',
                comment: comment,
            });
        })
        .catch(err => {
            if (!err.statusCode) {
                err.statusCode = 500;
            }
            next(err);
        });
}

/**
 * 튜토리얼 favorite 여부
 * 
 * GET /tutorial/is-favorite/:tutorialId
 * 
 * @param req 튜토리얼아이디, 유저
 * @param res             |status
 *            favor     : |200
 *            not favor : |409
 */
exports.getIsFavorite = (req, res, next) => {
    const { tutorialId } = req.params;

    User.findById(req.userId)
        .then(user => {
            const isFavorite = user.favoriteTuts.find(el => el.toString() === tutorialId);
            if (!isFavorite) {
                return res.status(409).json({
                    isFavorite: false,
                    message: "This tutorial isn't favorite",
                });
            }
            return res.status(200).json({ 
                isFavorite: true,
                message: "This tutorial is favorite",
            });
        })
        .catch(err => {
            if (!err.statusCode) {
            err.statusCode = 500;
            }
            next(err);
        });
};

/**
 * 튜토리얼 fovorite 추가
 * 
 * POST /tutorial/add-favorite/:tutorialId
 * 
 * @param req 튜토리얼아이디, 유저
 * @param res                  |status
 *            성공            : |201
 *            튜토리얼 존재 x   : |404
 *            이미 추가된 경우   : |409
 */
exports.postAddFavorite = (req, res, next) => {
    const { tutorialId } = req.params;

    Tutorial.findById(tutorialId)
        .then(tut => {
            if (!tut) {
                const error = new Error('Could not find tutorial.');
                error.statusCode = 404;
                throw error;
            }
            tutorial = tut;
            return User.findById(req.userId);
        })
        .then(user => {
            const isExist = user.favoriteTuts.find(el => {
                return el.toString()===tutorialId;
            });
            if (!isExist) {
                user.favoriteTuts.push(tutorialId);
                return user.save();
            }
            res.status(422).json({
                isSuccess: false,
                message: 'Tutorial already in favorites!',
            });
        })
        .then(result => {
            res.status(201).json({
                isSuccess: true,
                message: 'Tutorial added to favorites successfully!',
            });
        })
        .catch(err => {
            if (!err.statusCode) {
                err.statusCode = 500;
            }
            next(err);
        });
}

/**
 * 튜토리얼 fovorite 삭제
 * 
 * POST /tutorial/remove-favorite/:tutorialId
 * 
 * @param req 튜토리얼아이디, 유저
 * @param res                  |status
 *            성공            : |200
 *            튜토리얼 존재 x   : |404
 *            이미 없는 경우    : |409
 */
exports.postRemoveFavorite = (req, res, next) => {
    const { tutorialId } = req.params;

    Tutorial.findById(tutorialId)
        .then(tut => {
            if (!tut) {
                const error = new Error('Could not find tutorial.');
                error.statusCode = 404;
                throw error;
            }
            tutorial = tut;
            return User.findById(req.userId);
        })
        .then(user => {
            const isExist = user.favoriteTuts.find(el => {
                return el.toString()===tutorialId;
            });
            if (isExist) {
                user.favoriteTuts.remove(tutorialId);
                return user.save();
            }
            res.status(422).json({
                isSuccess: false,
                message: 'Tutorial not exists in favorites!',
            });
        })
        .then(result => {
            res.status(200).json({
                isSuccess: true,
                message: 'Tutorial removed from favorites successfully!',
            });
        })
        .catch(err => {
            if (!err.statusCode) {
                err.statusCode = 500;
            }
            next(err);
        });
}

const { validationResult } = require('express-validator');
const moment = require('moment');

const Story = require('../models/story');
const User = require('../models/user');

/**
 * 스토리(다이어리) 리스트뷰
 *
 * GET /story
 */
exports.getStories = (req, res, next) => {
	const currentPage = req.query.page || 1;
	const perPage = 10; //나중에 더 키우기 50?
	let totalItems;
	Story.find({ creator: req.userId })
		.countDocuments()
		.then((count) => {
			totalItems = count;
			return Story.find({ creator: req.userId })
				.sort({ createdAt: -1 })
				.skip((currentPage - 1) * perPage)
				.limit(perPage);
		})
		.then((stories) => {
			res.status(200).json({
				message: 'Fetched stories successfully.',
				stories: stories,
				totalItems: totalItems,
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
 * 스토리(다이어리) 생성
 *
 * POST /story
 */
exports.createStory = (req, res, next) => {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
        return res.status(422).json({
            isSuccess: false,
            message: 'Validation failed, entered data is incorrect.'
        });
	}
	const { content } = req.body;
	let creator;
	const story = new Story({
		content: content,
		creator: req.userId,
	});
	story
		.save()
		.then((result) => {
			return User.findById(req.userId);
		})
		.then((user) => {
			creator = user;
			user.stories.push(story);
			return user.save();
		})
		.then((result) => {
			res.status(201).json({
				message: 'Story created successfully!',
				story: story,
				creator: { _id: creator._id, name: creator.name },
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
 * 스토리(다이어리) 업데이트
 *
 * PUT /story/:storyId
 */
exports.updateStory = (req, res, next) => {
	const { storyId } = req.params;
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
        return res.status(422).json({
            isSuccess: false,
            message: 'Validation failed, entered data is incorrect.'
        });
	}
	const { content } = req.body;
	Story.findById(storyId)
		.then((story) => {
			if (!story) {
                return res.status(404).json({
                    isSuccess: false,
                    message: 'Could not find story.'
                });
			}
			if (story.creator.toString() !== req.userId) {
                return res.status(403).json({
                    isSuccess: false,
                    message: 'Not authorized!'
                });
			}
			story.content = content;
			return story.save();
		})
		.then((result) => {
			return res.status(200).json({ message: 'Story updated!', story: result });
		})
		.catch((err) => {
            return res.status(500).json({
                isSuccess: false,
                message: 'Network error!'
            });
		});
};

/**
 * 스토리(다이어리) 삭제
 *
 * DELETE /story/:storyId
 */
exports.deleteStory = (req, res, next) => {
	const { storyId } = req.params;
	Story.findById(storyId)
		.then((story) => {
			if (!story) {
				return res.status(422).json({
                    isSuccess: false,
                    message: 'Could not find story.'
                });
			}
			if (story.creator.toString() !== req.userId) {
				return res.status(403).json({
                    isSuccess: false,
                    message: 'Not authorized!'
                });
			}
			return Story.findByIdAndRemove(storyId);
		})
		.then((result) => {
			return User.findById(req.userId);
		})
		.then((user) => {
			user.stories.pull(storyId);
			return user.save();
		})
		.then((result) => {
			return res.status(200).json({ message: 'Deleted story.' });
		})
		.catch((err) => {
			return res.status(500).json({
                isSuccess: false,
                message: 'Network Error!'
            })
		});
};

/**
 * 스토리(다이어리) 작성 날짜들 (달력 표기용)
 *
 * GET /story/stories-date
 */
exports.getStoriesDate = (req, res, next) => {
	Story.find({ creator: req.userId }, 'createdAt')
        .then((stories) => {
            let formattedDates;
            if (stories) {
                formattedDates = stories.map(story => _dateFormatter(story.createdAt));
            }
            return res.status(200).json({
                message: 'Fetched stories date successfully.',
                dates: formattedDates,
            });
        })
        .catch((err) => {
            return res.status(500).json({
                isSuccess: false,
                message: 'Network error!'
            });
        });
};

/**
 * 레거시 -> 얘를 버리고 날짜 검색같은걸 추가해야함 .
 */
exports.getStory = (req, res, next) => {
	const { storyId } = req.params;
	Story.findById(storyId)
		.then((story) => {
			if (!story) {
                return res.status(404).json({
                    isSuccess: false,
                    message: 'Could not find story.'
                });
			}
			if (story.creator.toString() !== req.userId) {
                return res.status(403).json({
                    isSuccess: false,
                    message: 'Not authorized!'
                });
			}
			return res.status(200).json({ message: 'Story fetched.', story: story });
		})
		.catch((err) => {
            return res.status(500).json({
                isSuccess: false,
                message: 'Network error!'
            });
		});
};

/**
 * INPUT : Date
 * OUTPUT : String (YYYY-MM-DD)
 */
const _dateFormatter = (date) => {
    return [date.getFullYear(), ('0' + (date.getMonth() + 1)).slice(-2), ('0' + date.getDate()).slice(-2)].join('-');
}
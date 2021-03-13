const { PythonShell } = require("python-shell");

const Story = require('../models/story');
const User = require('../models/user');

/**
 * 마인드클라우드 이미지 가져오기
 *
 * GET /mindcloud/:start-date/:end-date
 */
exports.getMindcloud = (req, res, next) => {
    const { startDate, endDate } = req.params;
    const data = [];
    
    Story.find({ 
            creator: req.userId,
            createdAt : {
                $gte: parseInt(startDate),
                $lte: parseInt(endDate) + 86400000,
            }
        })
        .then((stories) => {
            if (stories.length) {
                stories.map(story => {
                    data.push(story.content);
                });

                const options = {
                    mode: 'text',
                    pythonOptions: ['-u'],
                    scriptPath: 'pysrc/',
                    args: [JSON.stringify({data})]
                };
                                    
                PythonShell.run('wordcloud.py', options, function (err, data) {
                    if (err) {
                        err.message = '파이썬 코드 에러';
                        throw err;
                    }
                    const base64Data = data[0];
                    return res.status(200).json({ data: base64Data.slice(2, -1), isSuccess: true });
                });
            } else {
                return res.status(409).json({
                    message: '해당 기간에 작성한 일기가 없습니다.',
                    isSuccess: false,
                });
            }
        })
        .catch((err) => {
            return res.status(500).json({
                isSuccess: false,
                message: err.message,
            })
        });
};
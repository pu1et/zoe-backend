/**
 * 
 * 이미지 업로드
 */
exports.postImage = (req, res, next) => {
    if (req.file) {
        return res.json({
            isSuccess: true,
            imageUrl: req.file.location
        })
    } else {
        return res.status(422).json({
            isSuccess: false,
            message: 'png/jpeg/gif 파일 형식만 업로드 가능합니다.'
        })
    }

};
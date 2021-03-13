const mongoose = require('mongoose');

const Schema = mongoose.Schema;

/* 튜토리얼 댓글 */
const commentSchema = new Schema(
    {
        /* 댓글 작성자 */
        author: {
            type: mongoose.Schema.ObjectId,
            ref: 'User',
            required: true,
        },
        /* 내용 */
        content: {
            type: String,
            trim: true,
            default: '내용 없음'
        },
    },
    { timestamps: true }
);

/* 테마곡 */
const itemSchema = new Schema({
    /* 제목 */
    title : {
        type: String,
        default: '제목 없음'
    },
    /* 미리보기 이미지 - 리스트 */
    thumbnailImg: String,
    /* 시간 - 초단위 */
    duration: Number,
    /* 데이터 URL */
    data: String,
    /* 오디오 여부(오디오, 비디오) */
    isAudio: {
        type: Boolean,
        default: false,
    }
});

const tutorialSchema = new Schema({
    /* 제목 */
    title: {
      type: String,
      default: '제목 없음'
    },
    /* 미리보기 이미지 - 리스트 뷰 */
    thumbnailImg: String,
    /* 메인 이미지 - 상세 뷰 */
    mainImg: String,
    /* 배경 이미지 - 상세 뷰 */
    backImg: String,
    /* 테그 */
    tags: [{
      type: String,
      minLength: 1,
    }],
    /* 설명 */
    explanation: {
        type: String,
    },
    /* 여행자들의 한마디 */
    comments: [commentSchema],
    /* 댓글 개수 */
    commentCount: {
        type: Number,
        default: 0
    },
    /* 튜토리얼 타입 - 호흡법/테마곡 */
    tutorialType: {
        type: String,
        enum: ['breathings', 'songs'],
    },
    /* 튜토리얼 아이템 */
    items: [itemSchema],
  },
);

const Comment = mongoose.model('Comment', commentSchema);
const Tutorial = mongoose.model('Tutorial', tutorialSchema);

module.exports = {
    Comment: Comment,
    Tutorial: Tutorial
}
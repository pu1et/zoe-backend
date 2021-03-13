const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const userSchema = new Schema(
    {
        /**************************
         * 계정 및 인증 관련
         **************************/
        /* 로그인 타입 */
        method: {
            type: String,
            enum: ['local', 'kakao', 'facebook'],
            required: true,
        },
        /* 자체 인증 */
        local: {
            id: {
                type: String,
                lowercase: true,
            },
            password: {
                type: String,
            },
        },
        /* 카카오 */
        kakao: {
            id: String,
        },
        /* 페이스북 */
        facebook: {
            id: String,
        },
        /* 이메일 주소 */
        email: {
            type: String,
            unique: true,
        },
        /* 이메일 주소 인증 여부 */
        isEmailVerified: {
            type: Boolean,
            default: false,
        },
        /* 닉네임 */
        nickName: {
            type: String,
        },
        /* 생년월일 */
        birthday: {
            type: Date,
        },
        /* 성별 */
        gender: {
            type: String,
            // enum: ['male', 'female'],
        },
        /* 프로필 이미지 */
        profileImgUrl: {
            type: String,
            default: 'https://kr.object.ncloudstorage.com/because/image/Profile_default%403x.png',
        },
        /* 서비스 이용약관 동의 */
        agreeService: {
            type: Boolean,
        },
        /* 개인정보 수집 및 이용 동의 */
        agreePersonalInfo: {
            type: Boolean,
        },
        /* 인증번호 */
        token: String,
        /* 인증번호 만료시점 */
        tokenExpiration: String,

        /**************************
         * 게임 관련
         **************************/
        /* 초기화면 - 랜더링 후 false로 */
        isInitial: {
            type: Boolean,
            default: true
        },
        loggedInAt: {
            type: Date,
            default: Date.now,
        },
        /* 바오밥(점수) */
        score : {
            type: Number,
            default: 0,
        },
        /* 아이템들 */
        itemHave: {
            booster: {
                type: Number,
                default: 0,
            },
            cleaner: {
                type: Number,
                default: 0,
            },
            sprinkler: {
                type: Number,
                default: 0,
            },
        },
        /* 획득한 스킨 종류 */
        skins: {
            type: Array,
            default: ['base'],
        },
        /* 먼지 쌓인 정도 */
        dustStage: {
            type: Number,
            default: 0,
            enum: [0, 1, 2, 3]
        },
        /* 장미 시듦 여부 */
        isWithered: {
            type: Boolean,
            default: false
        },
        /* 마지막으로 아이템 뿌려준 날짜 */
        itemUpdatedAt: {
            type: Date,
            default: Date.now,
        },
        /* 행성별 남은 아이템 개수 */
        itemLeft: {
            desert: {
                type: Number,
                default: 3
            },
            ocean: {
                type: Number,
                default: 4
            },
            forest: {
                type: Number,
                default: 3
            },
            reed: {
                type: Number,
                default: 4
            },
            waterfall: {
                type: Number,
                default: 3
            },
            grape: {
                type: Number,
                default: 3
            },
            apple: {
                type: Number,
                default: 4
            },
            pineapple: {
                type: Number,
                default: 3
            },
            banana: {
                type: Number,
                default: 4
            },
            strawberry: {
                type: Number,
                default: 3
            },
        },

        /**
         * 튜토리얼 - favorite
         */
        favoriteTuts: [
            {
                type: Schema.Types.ObjectId,
                ref: 'Tutorial'
            }
        ],

        /**
         *  다이어리 - 마이스토리(일기)
         */
        stories: [
            {
                type: Schema.Types.ObjectId,
                ref: 'Story'
            }
        ],

        /**
         * 설정
         */
        /* 알림 허용 */
        isNotiAllowed: {
            type: Boolean,
            default: false,
        }
    },
    /* 생성 & 업데이트 시점 */
    { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);

module.exports = {
    JWT_SECRET: process.env.JWT_STRATEGY_SECRET,
    oauth: {
        kakao: {
            clientID: process.env.OUTH_KAKAO_CLIENT_ID,
            clientSecret: process.env.OUTH_KAKAO_CLIENT_SECRET,
        },
    },
};

const User = require('../models/user');

const timeToDate = (time) => parseInt(time/1000/60/60/24);

const _getRandomInt = (min, max) => {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min; //최댓값은 제외, 최솟값은 포함
}

module.exports = (req, res, next) => {
    const { userId } = req;

    User.findById(userId)
        .then((user) => {
            /* 인트로 스크린 보여준 후 -> false */
            if (user.isInitial) {
                user.isInitial = false;
            }

            /* 최근 로그인 기록이 3일 이전이면, 장미가 시듦 */
            let diffDate = timeToDate(new Date().getTime()) - timeToDate(user.loggedInAt.getTime());
            if (diffDate >= 3) {
                user.isWithered = true;
            };

            /* 하루 단위로 아이템 새로 생성 */
            diffDate = timeToDate(new Date().getTime()) - timeToDate(user.itemUpdatedAt.getTime());
            if (diffDate >= 1) {
                Object.keys(user.itemLeft).forEach(planet => {
                    user.itemLeft[planet] = _getRandomInt(3, 5);
                })

                user.itemUpdatedAt = new Date().getTime();
            };

            /* 최근 로그인 날짜 업데이트 */
            user.loggedInAt = new Date().getTime();
            return user.save();
        })
        .then((user) => {
            next();
		})
        .catch((err) => {
            next(err);
        })    
}
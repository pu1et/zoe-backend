const path = require('path');

// 모듈 로드
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

// 초기화 파트
require('dotenv').config();
const app = express();

const gamerRoutes = require('./routes/gamer');
const imageRoutes = require('./routes/image');
const mindcloudRoutes = require('./routes/mindcloud');
const storyRoutes = require('./routes/story');
const tutorialRoutes = require('./routes/tutorial');
const userRoutes = require('./routes/user');
const indexRoutes = require('./routes');

// 미들웨어 설정 파트
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
})

// 라우팅 파트
app.use('/gamer', gamerRoutes);
app.use('/image', imageRoutes);
app.use('/mindcloud', mindcloudRoutes);
app.use('/story', storyRoutes);
app.use('/tutorial', tutorialRoutes);
app.use('/user', userRoutes);
app.use('/', indexRoutes);

// 에러 헨들링 미들웨어
app.use((error, req, res, next) => {
    console.log(error);
    const status = error.statusCode || 500;
    const message = error.message;
    return res.status(status).json({message});
})

app.set('views', path.join(__dirname,'views'));
app.engine('html', require('ejs').renderFile);
app.set('view engine','html');

const server = http.createServer(app)

// 서버 실행
mongoose
    .connect(process.env.DB_URL, { useNewUrlParser: true })
    .then(() => {
        console.log("몽고 DB가 연결되었습니다.");
        server.listen(5000, (req, res) => {
            console.log("서버 실행중..");
        });
    })
    .catch(err => {
        console.log(err)
    });

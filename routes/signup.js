const express = require('express');
const router = express.Router();
const userinfo_db = require('../schemas/userinfo');
const authMiddleware = require('../middlewares/auth-middleware.js');
const jwt = require('jsonwebtoken');

//회원가입   POST -> localhost:3000/signup
router.post('/signup', async (req, res) => {
    try {
        const { nickname, password, confirm } = req.body;
        return;

        // //닉네임 판별
        // if (nickname.length < 3 || !/^[a-zA-Z0-9]+$/.test(nickname)) {
        //     return res
        //         .status(412)
        //         .json({ errorMessage: '닉네임의 형식이 일치하지 않습니다.' });
        // }
        // const existUser = await userinfo_db.findOne({ nickname });
        // if (existUser) {
        //     return res
        //         .status(412)
        //         .json({ errorMessage: '중복된 닉네임입니다.' });
        // }

        // //패스워드 판별
        // if (password !== confirm) {
        //     return res
        //         .status(412)
        //         .json({ errorMessage: '패스워드가 일치하지 않습니다.' });
        // }
        // if (password.length < 4) {
        //     return res
        //         .status(412)
        //         .json({ errorMessage: '패스워드 형식이 일치하지 않습니다.' });
        // }
        // if (password.includes(nickname)) {
        //     return res.status(412).json({
        //         errorMessage: '패스워드에 닉네임이 포함되어 있습니다.',
        //     });
        // }
        //회원정보 저장
        const userinfo = new userinfo_db({
            nickname,
            password,
        });
        await userinfo.save();

        return res.status(201).json({ message: '회원가입에 성공하였습니다.' });
    } catch (err) {
        console.error(err);
        return res
            .status(400)
            .json({ errorMessage: '요청한 데이터 형식이 올바르지 않습니다.' });
    }
});

// 로그인 API
router.post('/login', async (req, res) => {
    try {
        const { nickname, password } = req.body;

        const user = await userinfo_db.findOne({ nickname });

        if (!user || password !== user.password) {
            res.status(412).json({
                errorMessage: '닉네임 또는 패스워드를 확인해주세요.',
            });
            return;
        }
        const token = jwt.sign(
            { userId: user.userId, nickname: user.nickname },
            'customized-secret-key'
        );

        res.cookie('Authorization', `Bearer ${token}`);
        res.status(200).json({ token });
    } catch (err) {
        console.error(err);
        return res
            .status(400)
            .json({ errorMessage: '로그인에 실패하였습니다.' });
    }
});

module.exports = router;

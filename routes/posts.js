const express = require('express');
const router = express.Router();
const post_db = require('../schemas/post');

const authMiddleware = require('../middlewares/auth-middleware');

//게시글 생성   POST -> localhost:3000/posts
router.post('/', authMiddleware, async (req, res) => {
    try {
        const { userId, nickname } = res.locals.user;
        const { title, content } = req.body;

        if (!title || !content) {
            return res
                .status(412)
                .json({ errorMessage: '데이터 형식이 올바르지 않습니다.' });
        }

        if (typeof title !== 'string') {
            return res.status(412).json({
                errorMessage: '게시글 제목의 형식이 일치하지 않습니다.',
            });
        }
        if (typeof content !== 'string') {
            return res.status(412).json({
                errorMessage: '게시글 내용의 형식이 일치하지 않습니다.',
            });
        }
        await post_db.create({ userId, nickname, title, content });
        return res
            .status(200)
            .json({ message: '게시글작성에 성공하였습니다.' });
    } catch {
        return res
            .status(400)
            .json({ errorMessage: '게시글 작성에 실패하였습니다.' });
    }
});

//게시글 전체조회   GET -> localhost:3000/posts
router.get('/', async (req, res) => {
    try {
        const post = await post_db.find();
        const postPrint = post
            .map((value) => {
                return {
                    postId: value.postId,
                    userId: value.userId,
                    nickname: value.nickname,
                    title: value.title,
                    createdAt: value.createdAt,
                    updatedAt: value.updatedAt,
                };
            })
            .sort((a, b) => {
                return b.createdAt.getTime() - a.createdAt.getTime();
            });

        return res.status(200).json({ data: postPrint });
    } catch (err) {
        return res
            .status(400)
            .json({ errorMessage: '게시글 조회에 실패하였습니다.' });
    }
});

// 게시글 상세조회 : GET -> localhost:3000/posts/:postId
router.get('/:postId', async (req, res) => {
    try {
        const { postId } = req.params;
        const post = await post_db.findOne({ _id: postId });
        const postPrint = {
            postId: post.postId,
            userId: post.userId,
            nickname: post.nickname,
            title: post.title,
            content: post.content,
            createdAt: post.createdAt,
            updatedAt: post.updatedAt,
        };
        res.status(200).json({ data: postPrint });
    } catch (err) {
        console.error(err);
        res.status(400).send({ errorMessage: '게시글 조회에 실패하였습니다.' });
    }
});

// 게시글 수정 : PUT -> localhost:3000/posts/:postId
router.put('/:postId', authMiddleware, async (req, res) => {
    try {
        const { userId } = res.locals.user;
        const { postId } = req.params;
        const { title, content } = req.body;
        const [post] = await post_db.find({ _id: postId });

        //형식이 비정상적인 경우
        if (!title || !content) {
            return res.status(412).json({
                errorMessage: '데이터 형식이 올바르지 않습니다.',
            });
        }
        if (typeof title !== 'string') {
            return res.status(412).json({
                errorMessage: '게시글 제목의 형식이 일치하지 않습니다.',
            });
        }
        if (typeof content !== 'string') {
            return res.status(412).json({
                errorMessage: '게시글 내용의 형식이 일치하지 않습니다.',
            });
        }
        try {
            if (userId === post.userId) {
                const date = new Date();
                await post_db.updateOne(
                    { _id: postId },
                    { $set: { title: title, content: content, updateAt: date } }
                );
                return res
                    .status(200)
                    .json({ message: '게시글을 수정하였습니다.' });
            } else {
                return res.status(403).json({
                    errorMessage: '게시글 수정의 권한이 존재하지 않습니다.',
                });
            }
        } catch (err) {
            return res.status(401).send({
                errorMessage: '게시글이 정상적으로 수정되지 않았습니다.',
            });
        }
    } catch (err) {
        return res
            .status(400)
            .send({ errorMessage: '게시글 수정에 실패하였습니다.' });
    }
});

// 게시글 삭제 : DELETE -> localhost:3000/posts/:postId
router.delete('/:postId', authMiddleware, async (req, res) => {
    try {
        const { userId } = res.locals.user;
        const { postId } = req.params;
        const [post] = await post_db.find({ _id: postId });
        if (!post) {
            return res.status(404).json({
                errorMessage: '게시글이 존재하지 않습니다.',
            });
        }

        try {
            if (userId === post.userId) {
                await post_db.deleteOne({ _id: postId });
                return res
                    .status(200)
                    .json({ message: '게시글을 삭제하였습니다.' });
            } else {
                return res.status(403).json({
                    errorMessage: '게시글 삭제의 권한이 존재하지 않습니다.',
                });
            }
        } catch (err) {
            return res.status(401).send({
                errorMessage: '게시글이 정상적으로 삭제되지 않았습니다.',
            });
        }
    } catch (err) {
        return res
            .status(400)
            .send({ errorMessage: '게시글 삭제에 실패하였습니다.' });
    }
});

module.exports = router;

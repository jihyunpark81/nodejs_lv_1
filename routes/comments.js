const express = require('express');
const router = express.Router();
const post_db = require('../schemas/post');
const comment_db = require('../schemas/comment');

const authMiddleware = require('../middlewares/auth-middleware');

//댓글 생성
router.post('/:postId/comments', authMiddleware, async (req, res) => {
    try {
        const { comment } = req.body;
        const { postId } = req.params;
        const { userId, nickname } = res.locals.user;
        const existPost = await post_db.findOne({ _id: postId });

        if (!existPost) {
            return res
                .status(404)
                .json({ errorMessage: '게시글이 존재하지 않습니다.' });
        }
        if (comment.length === 0) {
            return res
                .status(400)
                .json({ message: '댓글 내용을 입력해주세요.' });
        }
        if (!comment) {
            return res
                .status(412)
                .json({ errorMessage: '데이터 형식이 올바르지 않습니다.' });
        }

        await comment_db.create({ postId, userId, nickname, comment });
        return res.status(201).json({ message: '댓글을 작성하였습니다.' });
    } catch {
        return res
            .status(400)
            .send({ errorMessage: '댓글 작성에 실패하였습니다.' });
    }
});

//댓글 조회하기
router.get('/:postId/comments', async (req, res) => {
    try {
        const { postId } = req.params;
        const comments = await comment_db.find({ postId });
        if (!postId) {
            return res
                .status(404)
                .json({ errorMessage: '게시글이 존재하지 않습니다.' });
        }
        const commentsPrint = comments.map((value) => {
            return {
                commentId: value.commentId,
                userId: value.userId,
                nickname: value.nickname,
                comment: value.comment,
                createdAt: value.createdAt,
                updatedAt: value.updatedAt,
            };
        });
        res.status(200).json({ data: commentsPrint });
    } catch (err) {
        return res
            .status(400)
            .send({ errorMessage: '댓글 조회에 실패하였습니다.' });
    }
});

//댓글 수정 : PUT -> localhost:3000/posts/:postId/comments/:commentId

router.put('/:postId/comments/:commentId', authMiddleware, async (req, res) => {
    try {
        const { userId } = res.locals.user;
        const { postId, commentId } = req.params;
        const { comment } = req.body;
        const existPost = await post_db.findOne({ _id: postId });
        const existComment = await comment_db.findOne({ _id: commentId });

        if (!existPost) {
            return res
                .status(404)
                .json({ errorMessage: '게시글이 존재하지 않습니다.' });
        }
        if (!existComment) {
            return res
                .status(404)
                .json({ errorMessage: '댓글이 존재하지 않습니다.' });
        }
        if (comment.length === 0) {
            return res
                .status(404)
                .json({ errorMessage: '데이터 형식이 올바르지 않습니다.' });
        }
        if (userId === existComment.userId) {
            const date = new Date();
            await comment_db.updateOne(
                { _id: commentId },
                { $set: { comment, updatedAt: date } }
            );
            return res.status(200).json({ message: '댓글을 수정하였습니다.' });
        } else {
            return res.status(403).json({
                errorMessage: '댓글의 수정 권한이 존재하지 않습니다.',
            });
        }
    } catch (err) {
        console.log(err);
        res.status(400).send({
            errorMessage: '댓글 수정에 실패하였습니다.',
        });
    }
});

router.delete(
    '/:postId/comments/:commentId',
    authMiddleware,
    async (req, res) => {
        try {
            const { userId } = res.locals.user;
            const { postId, commentId } = req.params;
            const existPost = await post_db.findOne({ _id: postId });
            const existComment = await comment_db.findOne({ _id: commentId });

            if (!existPost) {
                return res
                    .status(404)
                    .json({ errorMessage: '게시글이 존재하지 않습니다.' });
            }
            if (!existComment) {
                return res
                    .status(404)
                    .json({ errorMessage: '댓글이 존재하지 않습니다.' });
            }
            if (userId === existComment.userId) {
                await comment_db.deleteOne({ _id: commentId });
                return res
                    .status(200)
                    .json({ message: '댓글을 삭제하였습니다.' });
            } else {
                return res.status(403).json({
                    errorMessage: '댓글의 삭제 권한이 존재하지 않습니다.',
                });
            }
        } catch (err) {
            console.log(err);
            res.status(400).send({
                errorMessage: '댓글 삭제에 실패하였습니다.',
            });
        }
    }
);

module.exports = router;

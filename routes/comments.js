const express = require('express');
const router = express.Router();
const Posts = require('../schemas/post.js');

const Comments = require('../schemas/comment.js');

//댓글 생성
router.post('/:postId/comments', async (req, res) => {
    try {
        const postId = req.params.postId;
        console.log('here');
        const { commentId, user, password, content } = req.body;
        const comment = await Comments.find({ commentId }, {});
        if (comment.length) {
            return res.status(404).json({ message: '이미 있는 데이터입니다' });
        }
        await Comments.create({
            commentId,
            postId,
            user,
            password,
            content,
        });

        return res.status(200).json({ message: '댓글을 생성하였습니다.' });
    } catch (err) {
        console.log(err);
        return res
            .status(400)
            .json({ message: '데이터 형식이 올바르지 않습니다.' });
    }
});

//댓글 조회하기
router.get('/:postId/comments', async (req, res) => {
    try {
        const postId = req.params.postId;
        const post = await Posts.findOne(
            { postId: postId },
            { _id: 0, password: 0, __v: 0 }
        );
        const comment = await Comments.find(
            { postId: postId },
            { _id: 0, password: 0, __v: 0, postId: 0 }
        );

        if (!post) {
            return res
                .status(400)
                .json({ message: '게시글 조회에 실패하였습니다.' });
        }

        res.json({ data: comment });
    } catch {
        return res
            .status(400)
            .json({ message: '데이터 형식이 올바르지 않습니다.' });
    }
});

//댓글 수정 : PUT -> localhost:3000/posts/
//게시글 id 찾기

router.put('/:postId/comments/:commentId', async (req, res) => {
    try {
        const { postId, commentId } = req.params;
        const { password, content } = req.body;
        const post = await Posts.findOne({ postId });
        const comment = await Comments.findOne({ commentId });
        if (!post) {
            return res
                .status(400)
                .json({ message: '게시글 조회에 실패하였습니다.' });
        }
        if (!comment) {
            return res
                .status(400)
                .json({ message: '댓글 조회에 실패하였습니다.' });
        }

        if (password === comment.password) {
            await Comments.updateOne(
                { commentId },
                { $set: { content: content } }
            );

            return res.status(200).json({ message: '댓글을 수정하였습니다.' });
        } else {
            return res
                .status(400)
                .json({ message: '비밀번호가 올바르지 않습니다.' });
        }
    } catch {
        return res
            .status(400)
            .json({ message: '데이터 형식이 올바르지 않습니다.' });
    }
});

//댓글삭제

router.delete('/:postId/comments/:commentId', async (req, res) => {
    try {
        const { postId, commentId } = req.params;
        const { password, content } = req.body;
        const post = await Posts.findOne({ postId });
        const comment = await Comments.findOne({ commentId });
        if (!post) {
            return res
                .status(400)
                .json({ message: '게시글 조회에 실패하였습니다.' });
        }
        if (!comment) {
            return res
                .status(400)
                .json({ message: '댓글 조회에 실패하였습니다.' });
        }

        if (password === comment.password) {
            await Comments.deleteOne({ commentId });

            return res.status(200).json({ message: '댓글을 삭제하였습니다.' });
        } else {
            return res
                .status(400)
                .json({ message: '비밀번호가 올바르지 않습니다.' });
        }
    } catch {
        return res
            .status(400)
            .json({ message: '데이터 형식이 올바르지 않습니다.' });
    }
});

module.exports = router;

const express = require('express');
const cookieParser = require('cookie-parser');
const app = express();
const port = 3000;

const postsRouter = require('./routes/posts');
const commentsRouter = require('./routes/comments');
const signupRouter = require('./routes/signup'); //오류

const connect = require('./schemas');
connect();

app.use(express.json());
app.use(cookieParser());

app.get('/', (req, res) => {
    res.send('Test!!');
});

app.use('/posts', [postsRouter]);
app.use('/posts', [commentsRouter]);
app.use('/', [signupRouter]);

app.listen(port, () => {
    console.log(`${port} success`);
});

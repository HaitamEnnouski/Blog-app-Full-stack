const express = require('express');
const router = express.Router();
const { GetAllPosts, GetPostById,CreatePost,DeletePost,UpdatePost} = require('../controllers/post-controller');

router.get('/posts', GetAllPosts);
router.get('/posts/:id', GetPostById);
router.post('/posts', CreatePost);
router.put('/posts/:id', UpdatePost);
router.delete('/posts/:id', DeletePost);


module.exports = router;
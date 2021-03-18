const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
//signup and login
router.post('/signup', userController.signup);
router.post('/login', userController.login);

//get own posts
router.get('/myposts', userController.allowIfLoggedin, userController.grantAccess('readOwn', 'profile'), userController.getMyPosts);

//create post
router.get('/addpost', userController.allowIfLoggedin, userController.grantAccess('createOwn', 'profile'), userController.addPost);

//delete own posts
router.get('/delete', userController.allowIfLoggedin, userController.grantAccess('deleteOwn', 'profile'), userController.deletePost);

//get all posts
router.get('/posts', userController.allowIfLoggedin, userController.grantAccess('readAny', 'profile'), userController.getPosts);

//get all users
router.get('/users', userController.allowIfLoggedin, userController.grantAccess('readAny', 'profile'), userController.getUsers);

//update any post
router.put('/updatepost', userController.allowIfLoggedin, userController.grantAccess('updateAny', 'profile'), userController.updatePost);

//delete any post
router.get('/deletepost', userController.allowIfLoggedin, userController.grantAccess('deleteAny', 'profile'), userController.deletePost);

//create any post
router.get('/addanypost', userController.allowIfLoggedin, userController.grantAccess('createAny', 'profile'), userController.addAnyPost);

//add comment to post
router.get('/addcomment', userController.allowIfLoggedin, userController.grantAccess('createOwn', 'profile'), userController.addComment);

module.exports = router;
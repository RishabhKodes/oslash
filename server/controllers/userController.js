const User = require('../models/userModel');
const Post = require('../models/postModel');
const jwt = require('jsonwebtoken');
const express = require('express')
const cookieParser = require('cookie-parser');
const app = express();
app.use(cookieParser(process.env.JWT_SECRET));
const bcrypt = require('bcrypt');
const { roles } = require('../roles')

global.userId;

async function hashPassword(password) {
 return await bcrypt.hash(password, 10);
}

async function validatePassword(plainPassword, hashedPassword) {
 return await bcrypt.compare(plainPassword, hashedPassword);
}

exports.signup = async (req, res, next) => {
 try {
  const { email, password, role } = req.body
  const hashedPassword = await hashPassword(password);
  const newUser = new User({ email, password: hashedPassword, role: role || "basic" });

  global.userId = newUser._id;

  const accessToken = jwt.sign({ userId: newUser._id }, process.env.JWT_SECRET, {
   expiresIn: "1d"
  });
  newUser.accessToken = accessToken;
  await newUser.save();
  res.json({
   data: newUser
  })
 } catch (error) {
  next(error)
 }
}

exports.login = async (req, res, next) => {
    try {
     const { email, password } = req.body;
     const user = await User.findOne({ email });
     if (!user) return next(new Error('Email does not exist'));

     const validPassword = await validatePassword(password, user.password);
     if (!validPassword) return next(new Error('Password is not correct'))

     global.userId = user._id;
    // res.cookie('uid', user._id, {maxAge: 1000 * 60 * 15});

    // console.log(req.cookies);
     const accessToken = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1d"
     });
     
     await User.findByIdAndUpdate(user._id, { accessToken })
     res.status(200).json({
      data: { email: user.email, role: user.role },
      accessToken
     })
    } catch (error) {
     next(error);
    }
   }

exports.getUsers = async (req, res, next) => {
 const users = await User.find({});
 res.status(200).json({
  data: users
 });
}

// exports.getUser = async (req, res, next) => {
//  try {
//   const userId = req.params.userId;
//   const user = await User.findById(userId);
//   if (!user) return next(new Error('User does not exist'));
//    res.status(200).json({
//    data: user
//   });
//  } catch (error) {
//   next(error)
//  }
// }

exports.getPosts = async (req, res, next) => {
    const posts = await Post.find({});
    res.status(200).json({
     data: posts
    });
   }

exports.getMyPosts = async (req, res, next) => {
    var username = req.query.username;
    const posts = await Post.find({author:username});
    res.status(200).json({
     data: posts
    });
   }   

exports.updatePost = async (req, res, next) => {
 try {
  const update = req.body
  const postId = req.query.postId;
  console.log(update);
  await Post.findByIdAndUpdate(postId, update);
  const post = await Post.findById(postId)
  res.status(200).json({
   data: post,
   message: 'Post has been updated'
  });
 } catch (error) {
  next(error)
 }
}

exports.deletePost = async (req, res, next) => {
 try {
  const postId = req.query.postid;
//   const userId = req.query.username;

  await Post.findByIdAndDelete({"_id":postId});
  res.status(200).json({
   data: null,
   message: 'Post has been deleted'
  });
 } catch (error) {
  next(error)
 }
}

exports.addComment = async (req, res, next) => {    
    try {
     const postid = req.query.postid;
     const comment = req.body.comment;

     await Post.updateOne({"_id":postid },{ $push:{ "comments":comment } }, function(err, doc){
        if(err){
            throw err;
        }else{
            res.send({"Comment": comment, "Message":"Comment added!"});
        }
    })
   }catch (error) {
    next(error)
   }
};

exports.addPost = async (req, res, next) => {
    try {
        const { title, body, author} = req.body
        const newPost = new Post({ title:title, body:body , author:author});

        await newPost.save();
        res.json({
         data: newPost,
         message: "Post Added"
        })
       } catch (error) {
        next(error)
       }

};

exports.addAnyPost = async (req, res, next) => {
    try {
        const { title, body, userId} = req.body
        const newPost = new Post({ title:title, body:body , author:userId});

        await newPost.save();
        res.json({
         data: newPost,
         message: "Post Added"
        })
       } catch (error) {
        next(error)
       }

};


exports.grantAccess = function(action, resource) {
    return async (req, res, next) => {
     try {
      const permission = roles.can(req.user.role)[action](resource);
      if (!permission.granted) {
       return res.status(401).json({
        error: "You don't have enough permission to perform this action"
       });
      }
      next()
     } catch (error) {
      next(error)
     }
    }
}

// only grant access to users that are logged in
exports.allowIfLoggedin = async (req, res, next) => {
    try {
     const user = res.locals.loggedInUser;
     if (!user)
      return res.status(401).json({
       error: "You need to be logged in to access this route"
      });
      req.user = user;
      next();
     } catch (error) {
      next(error);
     }
   }
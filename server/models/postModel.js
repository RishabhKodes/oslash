// server/models/userModel.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const PostSchema = new Schema({
 title: {
  type: String,
  required: true
 },
 body: {
  type: String,
  required: true
 },
 author: {
  type: String
 },
 comments:[String]
});

const Post = mongoose.model('post', PostSchema);

module.exports = Post;
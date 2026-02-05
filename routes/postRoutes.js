const express = require("express");
const Post = require("../models/Post");
const authenticateToken = require("../middleware/auth");

const router = express.Router();

//  POST
router.post("/create", authenticateToken, async (req, res) => {
  try {
    const { userId, username, text, image } = req.body;
    if (!text && !image) return res.status(400).json({ message: "Text or image required" });

    const post = new Post({ userId, username, text, image });
    await post.save();
    res.status(201).json(post);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// FEED
router.get("/", authenticateToken, async (req, res) => {
  try {
    const posts = await Post.find().sort({ createdAt: -1 });
    res.json(posts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// LIKE / UNLIKE
router.post("/like/:id", authenticateToken, async (req, res) => {
  try {
    const { username } = req.body;
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    if (post.likes.includes(username)) {
      post.likes = post.likes.filter(u => u !== username);
    } else {
      post.likes.push(username);
    }

    await post.save();
    res.json(post);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// COMMENT
router.post("/comment/:id", authenticateToken, async (req, res) => {
  try {
    const { username, text } = req.body;
    const post = await Post.findById(req.params.id);
    post.comments.push({ username, text });
    await post.save();
    res.json(post);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

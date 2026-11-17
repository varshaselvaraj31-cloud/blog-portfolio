// server.js
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/blogDB';

app.use(cors());
app.use(bodyParser.json());
app.use(express.json());

// Define Schema
const blogSchema = new mongoose.Schema({
  newTitle: { type: String, required: true },
  newContent: { type: String, required: true },
  date: { 
    type: String, 
    default: () => new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) 
  },
  likes: { type: Number, default: 0 }
}, { timestamps: true });

const Blog = mongoose.model('Blog', blogSchema);

// MongoDB Connection
mongoose.connect(MONGODB_URI)
  .then(async () => {
    console.log(`Connected successfully to MongoDB at ${MONGODB_URI}`);
    try {
      const count = await Blog.countDocuments();
      if (count === 0) {
        await Blog.insertMany([
          {
            newTitle: "Getting Started with Full Stack Web Development",
            newContent: "Full stack development connects interactive user interfaces with scalable backends and reliable databases like MongoDB. In this post, we explore how React, Node.js, and Express work together seamlessly.",
            date: "May 15, 2024",
            likes: 5
          },
          {
            newTitle: "Mastering Firebase Authentication in React Apps",
            newContent: "Firebase Authentication provides backend services, easy-to-use SDKs, and ready-made UI libraries to authenticate users to your app. It supports email and passwords, phone auth, Google, and more.",
            date: "June 20, 2024",
            likes: 12
          },
          {
            newTitle: "Best Practices for Building Modern REST APIs",
            newContent: "Building clean REST APIs requires consistent URL conventions, proper HTTP status codes (200, 201, 400, 404, 500), secure CORS configuration, and robust error handling.",
            date: "July 2, 2024",
            likes: 8
          }
        ]);
        console.log("Seeded initial blog posts into MongoDB collection 'blogs'");
      }
    } catch (err) {
      console.error("Error checking or seeding initial data:", err.message);
    }
  })
  .catch((err) => {
    console.error("MongoDB Connection Error:", err.message);
  });

// Root / Health route
app.get('/', (req, res) => {
  res.json({ message: 'Blog Portfolio Backend API is running', status: 'OK' });
});

// GET all blogs
app.get('/api/blogs', async (req, res) => {
  try {
    const blogs = await Blog.find({}).sort({ createdAt: -1 });
    res.json(blogs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET single blog by ID
app.get('/api/blogs/:id', async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' });
    }
    res.json(blog);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST create blog
app.post('/api/blogs', async (req, res) => {
  try {
    const title = req.body.newTitle || req.body.title;
    const content = req.body.newContent || req.body.content;
    const date = req.body.date || new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    const likes = req.body.likes !== undefined ? Number(req.body.likes) : 0;

    if (!title || !content) {
      return res.status(400).json({ message: 'Title and Content are required' });
    }

    const blog = new Blog({
      newTitle: title,
      newContent: content,
      date: date,
      likes: likes
    });

    const newBlog = await blog.save();
    res.status(201).json(newBlog);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PUT update blog
app.put('/api/blogs/:id', async (req, res) => {
  try {
    const { newTitle, newContent, title, content, date } = req.body;
    const updateData = {};
    if (newTitle !== undefined || title !== undefined) {
      updateData.newTitle = newTitle !== undefined ? newTitle : title;
    }
    if (newContent !== undefined || content !== undefined) {
      updateData.newContent = newContent !== undefined ? newContent : content;
    }
    if (date !== undefined) {
      updateData.date = date;
    }

    const updatedBlog = await Blog.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedBlog) {
      return res.status(404).json({ message: 'Blog not found' });
    }

    res.json(updatedBlog);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE blog
app.delete('/api/blogs/:id', async (req, res) => {
  try {
    const deletedBlog = await Blog.findByIdAndDelete(req.params.id);
    if (!deletedBlog) {
      return res.status(404).json({ message: 'Blog not found' });
    }
    res.json({ message: 'Blog deleted successfully', id: req.params.id });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PATCH like blog
app.patch('/api/blogs/like/:id', async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' });
    }

    const updatedBlog = await Blog.findByIdAndUpdate(
      req.params.id,
      { $inc: { likes: 1 } },
      { new: true }
    );

    res.json(updatedBlog);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

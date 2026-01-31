const Comment = require('../models/Comment');
const Task = require('../models/Task');
const { createNotification } = require('./notificationController');

const getComments = async (req, res) => {
    try {
        const { taskId } = req.params; // We will mock this in server.js
        const comments = await Comment.find({ task: taskId }).populate('author', 'username');
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(comments));
    } catch (error) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'Server error', error: error.message }));
    }
};

const createComment = async (req, res) => {
    try {
        const { content, taskId, authorId } = req.body;
        const newComment = new Comment({ content, task: taskId, author: authorId });
        await newComment.save();

        // Populate author to return immediately
        await newComment.populate('author', 'username');

        // Notify task owner or assignee (simplified: notify assignee if exists and not self)
        const task = await Task.findById(taskId);
        if (task.assignedTo && task.assignedTo.toString() !== authorId) {
            await createNotification(task.assignedTo, `New comment on task: ${task.title}`, 'COMMENT');
        }

        res.writeHead(201, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(newComment));
    } catch (error) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'Server error', error: error.message }));
    }
};

module.exports = { getComments, createComment };

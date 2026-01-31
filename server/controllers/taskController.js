const Task = require('../models/Task');

const getTasks = async (req, res) => {
    try {
        const tasks = await Task.find().populate('createdBy', 'username');
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(tasks));
    } catch (error) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'Server error' }));
    }
};

const createTask = async (req, res) => {
    try {
        const { title, description, priority, deadline, tags, createdBy } = req.body;
        const newTask = new Task({ title, description, priority, deadline, tags, createdBy });
        await newTask.save();
        res.writeHead(201, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(newTask));
    } catch (error) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'Server error', error: error.message }));
    }
};

const { createNotification } = require('./notificationController');

// ... (existing imports/code)

const updateTask = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, status, priority, deadline, tags, assignedTo } = req.body;

        // Find old task to check for changes
        const oldTask = await Task.findById(id);

        const updatedTask = await Task.findByIdAndUpdate(
            id,
            { title, description, status, priority, deadline, tags, assignedTo },
            { new: true }
        );

        // Trigger notification if assignedTo changed
        if (assignedTo && oldTask.assignedTo?.toString() !== assignedTo) {
            await createNotification(assignedTo, `You were assigned to task: ${updatedTask.title}`, 'ASSIGNMENT');
        }

        if (!updatedTask) {
            res.writeHead(404, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify({ message: 'Task not found' }));
        }
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(updatedTask));
    } catch (error) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'Server error', error: error.message }));
    }
};

const deleteTask = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedTask = await Task.findByIdAndDelete(id);
        if (!deletedTask) {
            res.writeHead(404, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify({ message: 'Task not found' }));
        }
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'Task deleted successfully' }));
    } catch (error) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'Server error', error: error.message }));
    }
};

const getTaskStats = async (req, res) => {
    try {
        const stats = await Task.aggregate([
            { $group: { _id: "$status", count: { $sum: 1 } } }
        ]);

        // Format: { TODO: 5, IN_PROGRESS: 2, DONE: 1 }
        const formattedStats = { TODO: 0, IN_PROGRESS: 0, DONE: 0 };
        stats.forEach(s => formattedStats[s._id] = s.count);

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(formattedStats));
    } catch (error) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'Server error', error: error.message }));
    }
}

module.exports = { getTasks, createTask, updateTask, deleteTask, getTaskStats };

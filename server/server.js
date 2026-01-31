const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');

const { register, login, searchUsers, savePushToken } = require('./controllers/authController');
const { getTasks, createTask, updateTask, deleteTask, getTaskStats } = require('./controllers/taskController');
const { getComments, createComment } = require('./controllers/commentController');
const { getNotifications } = require('./controllers/notificationController');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/collabtask';

// Middleware
app.use(cors());
app.use(express.json());

// Log requests
app.use((req, res, next) => {
    console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.url}`);
    next();
});

// Connect to MongoDB
mongoose.connect(MONGO_URI)
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error('MongoDB connection error:', err));

// Routes
app.get('/', (req, res) => res.json({ message: 'Welcome to CollabTask API' }));
app.get('/api/ping', (req, res) => res.json({ status: 'ok', timestamp: new Date() }));

// Auth
app.post('/api/auth/register', register);
app.post('/api/auth/login', login);
app.post('/api/users/push-token', savePushToken);
app.get('/api/users', searchUsers);

// Tasks
app.get('/api/tasks/stats', getTaskStats);
app.get('/api/tasks', getTasks);
app.post('/api/tasks', createTask);
app.put('/api/tasks/:id', (req, res) => {
    req.params = { id: req.params.id };
    updateTask(req, res);
});
app.delete('/api/tasks/:id', (req, res) => {
    req.params = { id: req.params.id };
    deleteTask(req, res);
});

// Comments
app.get('/api/tasks/:taskId/comments', (req, res) => {
    req.params = { taskId: req.params.taskId };
    getComments(req, res);
});
app.post('/api/comments', createComment);

// Notifications
app.get('/api/notifications/:userId', (req, res) => {
    req.params = { userId: req.params.userId };
    getNotifications(req, res);
});

// Start Server
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
});

const { Expo } = require('expo-server-sdk');
const User = require('../models/User');
const Notification = require('../models/Notification');

let expo = new Expo();

const getNotifications = async (req, res) => {
    try {
        const { userId } = req.params;
        const notifications = await Notification.find({ recipient: userId }).sort({ createdAt: -1 });
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(notifications));
    } catch (error) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'Server error', error: error.message }));
    }
};

const createNotification = async (recipientId, message, type) => {
    try {
        // 1. Create DB Notification
        const notif = new Notification({ recipient: recipientId, message, type });
        await notif.save();

        // 2. Send Push Notification
        const user = await User.findById(recipientId);
        if (user && user.pushToken && Expo.isExpoPushToken(user.pushToken)) {
            const messages = [{
                to: user.pushToken,
                sound: 'default',
                body: message,
                data: { withSome: 'data' },
            }];

            try {
                // We are sending one at a time here, but Expo SDK supports batches
                let ticketChunk = await expo.sendPushNotificationsAsync(messages);
                console.log('Push ticket:', ticketChunk);
            } catch (error) {
                console.error('Error sending push:', error);
            }
        }

    } catch (error) {
        console.error('Error creating notification:', error);
    }
};

module.exports = { getNotifications, createNotification };

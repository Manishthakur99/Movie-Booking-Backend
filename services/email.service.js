const axios = require('axios');
const User = require('../models/user.model');

/**
 * Sends an email notification via the notification service.
 * Fire-and-forget pattern - does not block the main request.
 * @param {string} subject - Email subject
 * @param {string} userId - User ObjectId
 * @param {string} content - Email content
 * @returns {Promise<void>}
 */
const sendMail = async (subject, userId, content) => {
    try {
        const user = await User.findById(userId);
        if (!user || !user.email) {
            console.warn(`User not found or email missing for userId: ${userId}`);
            return;
        }

        await axios.post(process.env.NOTI_SERVICE + '/notiservice/api/v1/notifications', {
            subject: subject,
            recepientEmails: [user.email],
            content: content
        }, {
            timeout: 5000 // 5 second timeout
        });
    } catch (error) {
        // Log error but don't throw - notifications are non-critical
        console.error('Failed to send notification email:', error.message);
    }
};

module.exports = sendMail;
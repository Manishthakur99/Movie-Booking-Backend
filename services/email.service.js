const axios = require('axios');
const User = require('../models/user.model');

/**
 * Email Notification Service
 * 
 * Sends email notifications via an external notification microservice.
 * Uses fire-and-forget pattern - does not block the main request/response cycle.
 * Errors are logged but not thrown to avoid disrupting core functionality.
 * 
 * Configuration:
 * - Requires NOTI_SERVICE environment variable (e.g., "http://localhost:3001")
 * - Notification service must expose POST /notiservice/api/v1/notifications
 * - Expected payload: { subject, recepientEmails[], content }
 */

/**
 * Sends an email notification via the notification service.
 * Fire-and-forget pattern - does not block the main request.
 * @param {string} subject - Email subject line
 * @param {string} userId - User ObjectId (string) to look up email address
 * @param {string} content - Email body content
 * @returns {Promise<void>} Resolves when request is sent (or fails silently)
 */
const sendMail = async (subject, userId, content) => {
    try {
        // Look up user to get their email address
        const user = await User.findById(userId);
        if (!user || !user.email) {
            console.warn(`User not found or email missing for userId: ${userId}`);
            return;
        }

        // Send notification via external service with 5-second timeout
        await axios.post(
            process.env.NOTI_SERVICE + '/notiservice/api/v1/notifications',
            {
                subject: subject,
                recepientEmails: [user.email],
                content: content
            },
            {
                timeout: 5000 // 5 second timeout to prevent hanging
            }
        );
    } catch (error) {
        // Log error but don't throw - notifications are non-critical
        // In production, consider adding to a retry queue or dead letter queue
        console.error('Failed to send notification email:', error.message);
    }
};

module.exports = sendMail;
const nodemailer = require("nodemailer");

const emailConfig = require('../config/email.config');

/**
 * Send an email
 * @param {String} to Email to
 * @param {String} subject Email subject
 * @param {String} htmlContent Html content
 */
exports.sendEmail = async (to, subject, htmlContent) => {
    let transporter = nodemailer.createTransport(emailConfig);

    let info = await transporter.sendMail({
        from: 'Stage IT-University <no-reply@stage.itu-labs.com>',
        to: to,
        subject: subject,
        html: htmlContent
    });

    return info;
}
const errorLogsToEmail = require("./server-log-to-email");

const mailOptions = {
  user: 'user_email',
  pass: 'password',
  to: 'to_user_email',
  subject: 'Error Logs for the Last Hour',
  html: `<p>Dear User,</p>
  <p>Attached, you will find the error logs for the last hour in a neatly formatted JSON file.</p>
  <p>Please don't hesitate to contact us if you have any questions or concerns.</p>
  <p>Thank you!</p>`,
};

const executeAfterSec = 3600; // 1 Hour

global.mailLogger = errorLogsToEmail.logger(executeAfterSec, mailOptions);

mailLogger.error("mail logger is now available for global scope.");
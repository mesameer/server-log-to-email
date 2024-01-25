const errorLogsToEmail = require("./server-log-to-email");

const mailOptions = {
  user: 'user_email',
  pass: 'password',
  to: 'to_user_email_1,to_user_email_2',
  subject: 'Error Logs',
  html: `<p>Dear User,</p>
  <p>Attached, you will find the error logs for the last 30 minutes in a neatly formatted JSON file.</p>
  <p>Please don't hesitate to contact us if you have any questions or concerns.</p>
  <p>Thank you!</p>`,
};

const executeAfterMin = 30; // Note minimum value of executeAfterMin is 1 & maximum value is 43200 

global.mailLogger = errorLogsToEmail.logger(executeAfterMin, mailOptions);

mailLogger.error("mail logger is now available for global scope.");
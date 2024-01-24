const winston = require('winston');
const schedule = require('node-schedule');
const nodemailer = require('nodemailer');
const fs = require('fs');

const { format } = winston;

require('winston-daily-rotate-file');

const { combine, timestamp, prettyPrint } = winston.format

const transportError = new winston.transports.DailyRotateFile({
  json: false,
  filename: 'logs/%DATE%-logs/server-error.log',
  datePattern: 'YYYY-MM-DD',
  format: combine(timestamp()),
  // format: combine(timestamp(), prettyPrint()),
  zippedArchive: true,
  maxSize: '20m',
  maxFiles: '14d',
  level: 'error'
});

const transportInfo = new winston.transports.DailyRotateFile({
  json: false,
  filename: 'logs/%DATE%-logs/server-info.log',
  datePattern: 'YYYY-MM-DD',
  format: combine(timestamp()),
  // format: combine(timestamp(), prettyPrint()),
  zippedArchive: true,
  maxSize: '20m',
  maxFiles: '14d',
  level: 'info'
});

// Function to fetch logs for the last hour
const fetchLogs = async (limit) => {
  // Implement logic to read logs from the daily rotated files for the last hour
  // Return an array of logs
  const currentTimestamp = new Date();
  const limitAgo = new Date(currentTimestamp - limit * 1000);

  // Read logs from the file and filter for the last hour
  const logs = await readLogsFromFile();
  const filteredLogs = logs.filter((log) => new Date(log.timestamp) >= limitAgo);

  return filteredLogs;
}

// Simulated function to read logs from the daily rotated files
const readLogsFromFile = async () => {
  // Implement logic to read logs from the daily rotated files
  // Specify the path to the directory where your log files are stored
  const logDirectory = './logs';

  // Create an array to store logs
  const logs = [];

  // Get the current date for the log file to read
  const currentDate = new Date().toISOString().slice(0, 10);

  // Construct the path to the log file for the current date
  const logFilePath = `${logDirectory}/${currentDate}-logs/server-error.log`;

  // Check if the log file exists
  if (fs.existsSync(logFilePath)) {
    // Read the entire contents of the log file
    const fileContents = fs.readFileSync(logFilePath, 'utf8').trim();

    // Split the contents into JSON objects without newlines
    const jsonObjects = fileContents.split('\n').map((obj) => {
      // Add back the missing curly braces and parse each JSON object
      const fullObject = obj.trim();
      try {
        return JSON.parse(fullObject);
      } catch (error) {
        // Handle parsing errors, if any
        console.error('Error parsing log entry:', error, fullObject);
        return null;
      }
    });

    // Filter out any potential null entries (failed parses)
    const validLogs = jsonObjects.filter((log) => log !== null);

    // Add the parsed logs to the logs array
    logs.push(...validLogs);
  }

  return logs;
}

// Function to send logs via email
const sendLogsByEmail = async (mailOptions, logs) => {
  // Configure Nodemailer for sending emails
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: mailOptions.user,
      pass: mailOptions.pass,
    },
  });

  // Send the email
  await transporter.sendMail({
    from: mailOptions.user,
    to: mailOptions.to,
    subject: mailOptions.subject,
    html: mailOptions.html,
    attachments: [
      {
        filename: 'error_logs.json',
        content: JSON.stringify(logs, null, 2),
      },
    ],
  });
}

const logger = (executeAfterInSec = 60, mailSettings) => {
  const logger = winston.createLogger({
    format: format.combine(
      format.timestamp(),
      format.json()
    ),
    transports: [
      transportError,
      transportInfo
    ]
  });

  // logger.error("Error 1");
  // logger.error("Error 2");

  scheduler(executeAfterInSec, mailSettings);

  return logger;
};

const scheduler = async (executeAfterInSec = 60, mailSettings) => {
  // Schedule a job to run every hour
  schedule.scheduleJob(`*/${executeAfterInSec} * * * * *`, async () => {
    try {
      // Fetch and filter logs for the last hour
      const logs = await fetchLogs(executeAfterInSec);

      // Send logs via email
      await sendLogsByEmail(mailSettings, logs);

      console.log("Hourly mail sent");
    } catch (error) {
      logger.error('Error sending logs via email', error);
    }
  });
};

module.exports = {
  logger,
};
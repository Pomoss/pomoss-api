import Winston from "winston";
import { LoggingWinston } from "@google-cloud/logging-winston";

const { combine, timestamp, json, errors } = Winston.format;

const loggingWinston = new LoggingWinston();
const logger = Winston.createLogger({
  level: 'info',
  format: combine(errors({ stack: true }), timestamp(), json()),
  transports: [
    new Winston.transports.Console(),
    ...(
      process.env.NODE_ENV === 'production'
        ? [loggingWinston]
        : []
    )
  ]
});

export default logger
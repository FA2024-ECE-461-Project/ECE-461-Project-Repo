import * as dotenv from "dotenv";
dotenv.config();
import { Logger } from "tslog";
import { appendFileSync, existsSync, truncateSync, PathLike } from "fs";

const LOG_LEVELS = {
  SILENT: 0,
  INFO: 1,
  DEBUG: 2,
};

const logFilePath = process.env.LOG_FILE as PathLike;

function checkLogFilePath() {
  if (!logFilePath || !existsSync(logFilePath)) {
    console.error("LOG_FILE does not exist or is not set");
    process.exit(1);
  }
}

function setLogLevel() {
  switch (process.env.LOG_LEVEL) {
    case String(LOG_LEVELS.INFO):
      log.settings.minLevel = 3; // information messages
      break;
    case String(LOG_LEVELS.DEBUG):
      log.settings.minLevel = 2; // debug messages
      break;
    default:
      log.settings.minLevel = 7; // default to the highest level (silent)
  }
}

checkLogFilePath();

export const log = new Logger({
  name: "Logger",
  minLevel: 7,
});

// Clear the log file at the beginning of the script
truncateSync(logFilePath, 0);

setLogLevel();

log.attachTransport((logObj) => {
  if (!logFilePath) {
    console.error("LOG_FILE environment variable not set");
    process.exit(1);
  }
  appendFileSync(logFilePath, JSON.stringify(logObj) + "\n");
});

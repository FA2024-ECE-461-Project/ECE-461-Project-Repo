import * as dotenv from "dotenv";
dotenv.config();
import { Logger } from "tslog";
import { appendFileSync, existsSync } from "fs";

export const log = new Logger({
  name: "Logger",
  minLevel: 7,
});

//if LOG_LEVEL is 0, silence all logs
//if LOG_LEVEL is 1, show information logs
//if LOG_LEVEL is 2, show debug logs

// Set log level based on environment variable
if (process.env.LOG_LEVEL === "1") {
  log.settings.minLevel = 3; // information messages
} else if (process.env.LOG_LEVEL === "2") {
  log.settings.minLevel = 2; //debug messages
}

log.attachTransport((logObj) => {
	if (process.env.LOG_FILE === undefined) {
		console.error("LOG_FILE environment variable not set");
		process.exit(1);
	}
	if (!existsSync(process.env.LOG_FILE)) {
		console.error("LOG_FILE does not exist");
		process.exit(1);
	}
  appendFileSync(process.env.LOG_FILE, JSON.stringify(logObj) + "\n");
});

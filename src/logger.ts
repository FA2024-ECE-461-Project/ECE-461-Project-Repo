import * as dotenv from 'dotenv';
dotenv.config();
import { Logger } from "tslog";
import { appendFileSync } from "fs";

export const log = new Logger({
	name: "Logger",
	minLevel: 7,
});

if (process.env.LOG_LEVEL === "1") {
	log.settings.minLevel = 3;
} else if (process.env.LOG_LEVEL === "2") {
	log.settings.minLevel = 0;
}

log.attachTransport((logObj) => {
	if (process.env.LOG_FILE === undefined) {
		console.error("LOG_FILE environment variable not set");
		process.exit(1);
	}
	appendFileSync(process.env.LOG_FILE, JSON.stringify(logObj) + "\n");
});

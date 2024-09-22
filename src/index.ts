//The main entry point of the application.
import { cli } from "./cli";
import { log } from "./logger";

//info log
log.info("Starting application... info");
//debug log
// log.debug('Calling cli function... debug');
cli();

import { startWorker } from "./worker";

startWorker();
console.log("[echocal] running as standalone process (Ctrl+C to stop)");

setInterval(() => {}, 1 << 30);

import { startWorker } from "./worker";

startWorker();
console.log("[calagg worker] running as standalone process (Ctrl+C to stop)");

setInterval(() => {}, 1 << 30);

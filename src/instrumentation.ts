export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;
  if (process.env.ENABLE_WORKER === "false") return;
  if (process.env.VERCEL === "1") return;
  const { startWorker } = await import("./lib/worker");
  startWorker();
}

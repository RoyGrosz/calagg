/**
 * Next compiles this file for both Node and Edge. Do not statically import
 * googleapis/worker here or the Edge graph fails on missing `http`/`https`.
 */
export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;
  if (process.env.ENABLE_WORKER === "false") return;
  if (process.env.VERCEL === "1") return;
  await import(/* webpackIgnore: true */ "./instrumentation.node");
}

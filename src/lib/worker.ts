import { prisma } from "./prisma";
import { syncRoute } from "./sync/engine";

let started = false;
let timer: NodeJS.Timeout | null = null;

export async function runAllEnabledRoutes(): Promise<void> {
  const routes = await prisma.syncRoute.findMany({
    where: { enabled: true },
    select: { id: true },
  });
  for (const route of routes) {
    try {
      await syncRoute(route.id);
    } catch (err) {
      console.error(`[calagg worker] route ${route.id} failed`, err);
    }
  }
}

export function startWorker(): void {
  if (started) return;
  if (process.env.ENABLE_WORKER === "false") return;
  if (process.env.NEXT_PHASE === "phase-production-build") return;
  started = true;

  const interval = Number(process.env.SYNC_INTERVAL_MS || 5 * 60 * 1000);
  console.log(`[calagg worker] polling every ${Math.round(interval / 1000)}s`);

  const kick = () => {
    runAllEnabledRoutes().catch((err) => console.error("[calagg worker] tick failed", err));
  };

  timer = setInterval(kick, interval);
  if (timer.unref) timer.unref();
  setTimeout(kick, 15_000);
}

export function stopWorker(): void {
  if (timer) clearInterval(timer);
  timer = null;
  started = false;
}

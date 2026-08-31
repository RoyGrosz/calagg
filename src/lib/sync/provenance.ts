import type { MapContext, SourceEvent } from "../types";

export function buildProvenanceBlock(ctx: MapContext, event: SourceEvent): string {
  const lines = [
    `Source: ${ctx.sourceLabel} · ${ctx.sourceCalendarName}`,
    `Account: ${ctx.sourceAccountEmail}`,
  ];
  if (event.htmlLink) {
    lines.push(`Open original: ${event.htmlLink}`);
  }
  lines.push("Synced by CalAgg · do not edit");
  return lines.join("\n");
}

export function withTitlePrefix(prefix: string, title: string): string {
  const trimmed = prefix.trim();
  if (!trimmed) return title;
  const wrapped = trimmed.startsWith("[") ? trimmed : `[${trimmed}]`;
  if (title.startsWith(wrapped)) return title;
  return `${wrapped} ${title}`;
}

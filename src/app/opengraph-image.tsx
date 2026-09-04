import { ImageResponse } from "next/og";

export const alt = "EchoCal — one-way calendar mirrors";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "72px 80px",
          background: "#0b0d10",
          color: "#e8edf4",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: -80,
            left: -40,
            width: 420,
            height: 420,
            borderRadius: 999,
            background: "rgba(94, 224, 181, 0.10)",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: -40,
            right: -60,
            width: 360,
            height: 360,
            borderRadius: 999,
            background: "rgba(122, 184, 255, 0.08)",
          }}
        />
        <div style={{ display: "flex", alignItems: "center", gap: 20, marginBottom: 36 }}>
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: 16,
              border: "2px solid #5ee0b5",
              background: "#1e2630",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#5ee0b5",
              fontSize: 28,
              fontWeight: 700,
            }}
          >
            E
          </div>
          <div style={{ fontSize: 42, fontWeight: 600, letterSpacing: -1 }}>EchoCal</div>
        </div>
        <div style={{ fontSize: 58, fontWeight: 600, lineHeight: 1.15, maxWidth: 900, letterSpacing: -1 }}>
          One-way Google Calendar mirrors, with provenance.
        </div>
        <div style={{ marginTop: 28, fontSize: 26, color: "#8b97a8" }}>
          Open source · MIT · No extension · Sync about every 5 minutes
        </div>
      </div>
    ),
    { ...size },
  );
}

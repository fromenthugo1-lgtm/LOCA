import { ImageResponse } from "next/og";

export const alt = "SpendEdge : vos demandes de prix fournisseurs, automatisées";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** Image de partage (Open Graph) aux couleurs de la marque, sans photo ni illustration générée. */
export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#14243A",
          padding: 80,
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <svg width="64" height="64" viewBox="0 0 32 32">
            <rect x="0.5" y="0.5" width="31" height="31" rx="7.5" fill="#14243A" stroke="#24364F" />
            <circle cx="9.5" cy="16" r="3" fill="#FFFFFF" />
            <path d="M13.5 16H20.5" stroke="#18B6A4" strokeWidth="2" strokeLinecap="round" />
            <path d="M23.5 8.5V23.5" stroke="#FFFFFF" strokeWidth="3" />
          </svg>
          <div style={{ fontSize: 40, fontWeight: 600, color: "#FFFFFF" }}>SpendEdge</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div style={{ fontSize: 64, fontWeight: 600, color: "#FFFFFF", lineHeight: 1.1, maxWidth: 960 }}>
            Vos demandes de prix fournisseurs, automatisées par l&apos;IA.
          </div>
          <div style={{ fontSize: 30, color: "#94A3B8", maxWidth: 900 }}>
            Déléguez vos demandes d&apos;achat. Concentrez-vous sur votre activité.
          </div>
        </div>
        <div style={{ display: "flex", height: 4, width: 160, background: "#3563E9" }} />
      </div>
    ),
    size,
  );
}

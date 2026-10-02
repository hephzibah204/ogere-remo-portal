import React from "react";

export default function IncidentListPanel({
  loading,
  displayedIncidents,
  activeIncident,
  setActiveIncident,
  setDispatchAgency,
  setDispatchUnit,
  setAgencyNotes,
  THREAT_LEVELS,
  SlaBadge,
}) {
  return (
    <>
      {/* Left: Live Alerts Feed */}
      <div style={{ display: "grid", gap: "0.8rem" }}>
        {loading ? (
          <div
            style={{
              textAlign: "center",
              padding: "3rem",
              color: "rgba(255,255,255,0.5)",
            }}
          >
            Connecting to Emergency Dispatch Bus...
          </div>
        ) : displayedIncidents.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              padding: "3rem",
              background: "rgba(255,255,255,0.02)",
              borderRadius: "8px",
            }}
          >
            <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>🟢</div>
            <div
              className="cinzel"
              style={{ fontSize: "1rem", color: "var(--gold)" }}
            >
              All Sectors Clear
            </div>
            <div style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.5)" }}>
              No active emergency reports matching the selected filters.
            </div>
          </div>
        ) : (
          displayedIncidents.map((inc) => {
            const threat =
              THREAT_LEVELS[inc.threat_level] || THREAT_LEVELS.CODE_YELLOW;
            const isSelected = activeIncident?.id === inc.id;
            const isSilent = inc.is_silent_panic;
            const isCodeRed =
              inc.threat_level === "CODE_RED" ||
              inc.category?.toLowerCase().includes("robbery") ||
              inc.category?.toLowerCase().includes("terror");

            return (
              <div
                key={inc.id}
                onClick={() => {
                  setActiveIncident(inc);
                  setDispatchAgency(inc.assigned_agency || "Police");
                  setDispatchUnit(inc.responding_unit || "");
                  setAgencyNotes(inc.agency_notes || "");
                }}
                style={{
                  background: isSelected ? "rgba(201,150,58,0.15)" : threat.bg,
                  border: isSelected
                    ? "2px solid var(--gold)"
                    : `1px solid ${threat.border}`,
                  borderLeft: `6px solid ${threat.color}`,
                  borderRadius: "8px",
                  padding: "1.2rem",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  position: "relative",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    marginBottom: "0.5rem",
                    flexWrap: "wrap",
                    gap: "0.5rem",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.6rem",
                      flexWrap: "wrap",
                    }}
                  >
                    <span
                      style={{
                        background: threat.color,
                        color: "#ffffff",
                        fontSize: "0.62rem",
                        fontWeight: 900,
                        padding: "0.2rem 0.55rem",
                        borderRadius: "4px",
                        letterSpacing: "0.08em",
                      }}
                    >
                      {threat.badge}
                    </span>

                    <SlaBadge incident={inc} />

                    {isSilent && (
                      <span
                        style={{
                          background: "#000000",
                          color: "#ef4444",
                          border: "1px solid #ef4444",
                          fontSize: "0.6rem",
                          fontWeight: 900,
                          padding: "0.15rem 0.45rem",
                          borderRadius: "4px",
                        }}
                      >
                        🤫 SILENT PANIC (NO SIREN)
                      </span>
                    )}

                    {inc.is_live_tracking && (
                      <span
                        style={{
                          background: "#052e16",
                          color: "#4ade80",
                          border: "1px solid #22c55e",
                          fontSize: "0.6rem",
                          fontWeight: 900,
                          padding: "0.15rem 0.5rem",
                          borderRadius: "4px",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "0.3rem",
                          animation: "liveRadarGlow 2s infinite",
                        }}
                      >
                        <span
                          style={{ animation: "liveTargetBeacon 1s infinite" }}
                        >
                          🟢
                        </span>{" "}
                        LIVE RADAR
                      </span>
                    )}

                    {(inc.camera_feed_active || inc.media_url) && (
                      <span
                        style={{
                          background: "#450a0a",
                          color: "#fca5a5",
                          border: "1px solid #ef4444",
                          fontSize: "0.6rem",
                          fontWeight: 900,
                          padding: "0.15rem 0.5rem",
                          borderRadius: "4px",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "0.2rem",
                        }}
                      >
                        📹 CAM
                      </span>
                    )}

                    {inc.audio_feed_active && (
                      <span
                        style={{
                          background: "#064e3b",
                          color: "#6ee7b7",
                          border: "1px solid #10b981",
                          fontSize: "0.6rem",
                          fontWeight: 900,
                          padding: "0.15rem 0.5rem",
                          borderRadius: "4px",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "0.2rem",
                        }}
                      >
                        🎙️ AUDIO
                      </span>
                    )}

                    <span
                      style={{
                        fontSize: "0.75rem",
                        fontWeight: 800,
                        color: "var(--gold)",
                      }}
                    >
                      ID: {inc.id}
                    </span>
                  </div>

                  <span
                    style={{
                      textTransform: "uppercase",
                      fontSize: "0.65rem",
                      fontWeight: 800,
                      padding: "0.2rem 0.6rem",
                      borderRadius: "12px",
                      background:
                        inc.status === "resolved"
                          ? "rgba(34,197,94,0.2)"
                          : inc.status === "dispatched"
                            ? "rgba(245,158,11,0.2)"
                            : "rgba(239,68,68,0.2)",
                      color:
                        inc.status === "resolved"
                          ? "#86efac"
                          : inc.status === "dispatched"
                            ? "#fde047"
                            : "#fca5a5",
                    }}
                  >
                    ● {inc.status}
                  </span>
                </div>

                <div
                  style={{
                    fontSize: "1rem",
                    fontWeight: 800,
                    color: "#ffffff",
                    marginBottom: "0.4rem",
                  }}
                >
                  {inc.category}
                </div>

                <div
                  style={{
                    fontSize: "0.82rem",
                    color: "rgba(255,255,255,0.7)",
                    lineHeight: 1.5,
                    marginBottom: "0.8rem",
                  }}
                >
                  {inc.description}
                </div>

                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    flexWrap: "wrap",
                    gap: "0.5rem",
                    borderTop: "1px solid rgba(255,255,255,0.1)",
                    paddingTop: "0.6rem",
                    fontSize: "0.72rem",
                  }}
                >
                  <span style={{ color: "var(--gold-light)" }}>
                    📍 <strong>{inc.location}</strong>
                    {inc.latitude && inc.longitude && (
                      <a
                        href={
                          inc.google_maps_url ||
                          `https://www.google.com/maps?q=${inc.latitude},${inc.longitude}&z=18`
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        style={{
                          marginLeft: "0.4rem",
                          color: "#60a5fa",
                          fontSize: "0.68rem",
                          fontWeight: 800,
                          textDecoration: "none",
                          background: "rgba(96,165,250,0.15)",
                          padding: "0.1rem 0.4rem",
                          borderRadius: "4px",
                        }}
                      >
                        🗺️ Map
                      </a>
                    )}
                  </span>
                  <span style={{ color: "rgba(255,255,255,0.5)" }}>
                    Assigned:{" "}
                    <strong>{inc.assigned_agency || "Pending"}</strong>{" "}
                    {inc.responding_unit ? `(${inc.responding_unit})` : ""}
                  </span>
                  {inc.is_live_tracking ? (
                    <span
                      style={{
                        color: "#4ade80",
                        fontWeight: 800,
                        fontSize: "0.7rem",
                      }}
                    >
                      ⚡ {inc.speed ? `${inc.speed} km/h` : "Moving"} · Pinged{" "}
                      {inc.last_ping_at
                        ? new Date(inc.last_ping_at).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                            second: "2-digit",
                          })
                        : "Live"}
                    </span>
                  ) : (
                    <span style={{ color: "rgba(255,255,255,0.4)" }}>
                      🕒{" "}
                      {new Date(inc.created_at).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  )}
                </div>
                {/* Telemetry row: GPS, accuracy, reporter IP */}
                {(inc.latitude || inc.ip_address || inc.accuracy) && (
                  <div
                    style={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: "0.4rem",
                      marginTop: "0.5rem",
                      paddingTop: "0.4rem",
                      borderTop: "1px solid rgba(255,255,255,0.07)",
                      fontSize: "0.65rem",
                    }}
                  >
                    {inc.latitude && inc.longitude && (
                      <span
                        style={{
                          background: "rgba(56,189,248,0.1)",
                          border: "1px solid rgba(56,189,248,0.3)",
                          borderRadius: "4px",
                          padding: "2px 6px",
                          color: "#38bdf8",
                          fontFamily: "monospace",
                          fontWeight: 700,
                        }}
                      >
                        🎯 {Number(inc.latitude).toFixed(4)}°N,{" "}
                        {Number(inc.longitude).toFixed(4)}°E
                      </span>
                    )}
                    {inc.accuracy && (
                      <span
                        style={{
                          background: "rgba(34,197,94,0.1)",
                          border: "1px solid rgba(34,197,94,0.3)",
                          borderRadius: "4px",
                          padding: "2px 6px",
                          color: "#4ade80",
                          fontWeight: 700,
                        }}
                      >
                        📏 ±{Math.round(inc.accuracy)}m
                      </span>
                    )}
                    {inc.ip_address && (
                      <span
                        style={{
                          background: "rgba(148,163,184,0.1)",
                          border: "1px solid rgba(148,163,184,0.3)",
                          borderRadius: "4px",
                          padding: "2px 6px",
                          color: "#94a3b8",
                          fontFamily: "monospace",
                        }}
                      >
                        🌐 IP: {inc.ip_address}
                      </span>
                    )}
                  </div>
                )}

                {/* AI Routing & Officer Claim Status Banner */}
                {(() => {
                  const claim = claimedIncidents[inc.id];
                  return claim ? (
                    <div
                      style={{
                        marginTop: "0.5rem",
                        background: "rgba(34, 197, 94, 0.15)",
                        border: "1px solid #22c55e",
                        borderRadius: "4px",
                        padding: "0.35rem 0.6rem",
                        fontSize: "0.68rem",
                        color: "#86efac",
                        fontWeight: 800,
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <span>
                        ✅ Claimed by {claim.officerName} ({claim.badge}) ·{" "}
                        {claim.unitName}
                      </span>
                      <span
                        style={{
                          color: "#4ade80",
                          background: "rgba(34,197,94,0.25)",
                          padding: "1px 5px",
                          borderRadius: "3px",
                        }}
                      >
                        EN ROUTE
                      </span>
                    </div>
                  ) : (
                    <div
                      style={{
                        marginTop: "0.5rem",
                        background: "rgba(56, 189, 248, 0.1)",
                        border: "1px solid rgba(56, 189, 248, 0.3)",
                        borderRadius: "4px",
                        padding: "0.35rem 0.6rem",
                        fontSize: "0.68rem",
                        color: "#38bdf8",
                        fontWeight: 700,
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <span>
                        ⚡ AI Auto-Routed to closest available Ogere Sector Unit
                      </span>
                      <span>ETA ~3m</span>
                    </div>
                  );
                })()}
              </div>
            );
          })
        )}
      </div>
    </>
  );
}

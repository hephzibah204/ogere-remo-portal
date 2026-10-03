import React from "react";

export default function ActiveDispatchTerminal({
  activeIncident,
  setActiveIncident,
  dispatchAgency,
  setDispatchAgency,
  dispatchUnit,
  setDispatchUnit,
  agencyNotes,
  setAgencyNotes,
  AGENCIES,
  isUpdating,
  handleUpdateStatus,
  handleScanCctv,
  CCTV_CAMERAS,
  claimedIncidents,
  adminSelectedStation,
  setAdminSelectedStation,
  adminRouteToStation,
  SlaBadge,
}) {
  if (!activeIncident) return null;
  return (
    <>
      {/* Right: Tactical Dispatch Control Panel */}
        <div
          style={{
            background: "rgba(18,10,7,0.95)",
            border: "1px solid var(--gold)",
            borderRadius: "8px",
            padding: "1.5rem",
            position: "sticky",
            top: "100px",
            height: "fit-content",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "1rem",
              borderBottom: "1px solid rgba(201,150,58,0.2)",
              paddingBottom: "0.8rem",
            }}
          >
            <div>
              <span
                className="cinzel"
                style={{
                  fontSize: "0.65rem",
                  color: "var(--gold)",
                  letterSpacing: "0.1em",
                }}
              >
                TACTICAL INCIDENT DISPATCH
              </span>
              <div
                style={{
                  fontSize: "1.2rem",
                  fontWeight: 900,
                  color: "#ffffff",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.6rem",
                  flexWrap: "wrap",
                }}
              >
                <span>{activeIncident.id}</span>
                <SlaBadge incident={activeIncident} />
              </div>
            </div>
            <button
              onClick={() => setActiveIncident(null)}
              style={{
                background: "transparent",
                border: "none",
                color: "#ffffff",
                fontSize: "1.2rem",
                cursor: "pointer",
              }}
            >
              âœ•
            </button>
          </div>

          {/* Threat Alert Badge */}
          <div
            style={{
              background:
                activeIncident.threat_level === "CODE_RED"
                  ? "rgba(239,68,68,0.2)"
                  : "rgba(234,179,8,0.15)",
              border: `1px solid ${activeIncident.threat_level === "CODE_RED" ? "#ef4444" : "#eab308"}`,
              padding: "0.8rem",
              borderRadius: "6px",
              marginBottom: "1rem",
            }}
          >
            <div
              style={{
                fontSize: "0.78rem",
                fontWeight: 900,
                color:
                  activeIncident.threat_level === "CODE_RED"
                    ? "#fca5a5"
                    : "#fde047",
              }}
            >
              {activeIncident.threat_level === "CODE_RED"
                ? "ðŸš¨ TACTICAL ARMED INCIDENT"
                : "âš ï¸ CIVIC SAFETY ALERT"}
            </div>
            <div
              style={{
                fontSize: "0.72rem",
                color: "#f5edd8",
                marginTop: "0.2rem",
              }}
            >
              {activeIncident.is_silent_panic
                ? "CRITICAL: Citizen activated SILENT PANIC. Approach covertly without sirens."
                : "Direct response requested."}
            </div>
          </div>

          {/* Details breakdown */}
          <div
            style={{
              display: "grid",
              gap: "0.6rem",
              fontSize: "0.78rem",
              marginBottom: "1.2rem",
            }}
          >
            <div>
              <span style={{ color: "var(--gold)", fontWeight: 700 }}>
                Location:{" "}
              </span>
              <span style={{ color: "#ffffff" }}>
                {activeIncident.location}
              </span>
            </div>

            {/* â”€â”€ Citizen Live Tactical Camera & Audio Surveillance Feed â”€â”€ */}
            {(activeIncident.camera_feed_active ||
              activeIncident.audio_feed_active ||
              activeIncident.media_url) && (
              <div
                style={{
                  background:
                    "linear-gradient(180deg, rgba(35, 10, 10, 0.95) 0%, rgba(18, 6, 6, 0.98) 100%)",
                  border: "2px solid #ef4444",
                  borderRadius: "8px",
                  padding: "0.9rem",
                  boxShadow: "0 0 25px rgba(239, 68, 68, 0.35)",
                  animation: "pulseGlow 2.5s infinite",
                }}
              >
                {/* Header */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "0.6rem",
                  }}
                >
                  <div
                    style={{
                      fontSize: "0.78rem",
                      fontWeight: 900,
                      color: "#fca5a5",
                      display: "flex",
                      alignItems: "center",
                      gap: "0.4rem",
                    }}
                  >
                    <span
                      style={{
                        width: "9px",
                        height: "9px",
                        borderRadius: "50%",
                        background: "#ef4444",
                        display: "inline-block",
                        animation: "liveTargetBeacon 0.8s infinite",
                      }}
                    />
                    <span>CITIZEN LIVE TACTICAL SURVEILLANCE FEED</span>
                  </div>
                  <div style={{ display: "flex", gap: "0.3rem" }}>
                    {(activeIncident.camera_feed_active ||
                      activeIncident.media_url) && (
                      <span
                        style={{
                          fontSize: "0.62rem",
                          background: "#ef4444",
                          color: "#ffffff",
                          padding: "0.15rem 0.45rem",
                          borderRadius: "3px",
                          fontWeight: 800,
                        }}
                      >
                        ðŸ“¹ CAM LIVE
                      </span>
                    )}
                    {activeIncident.audio_feed_active && (
                      <span
                        style={{
                          fontSize: "0.62rem",
                          background: "#10b981",
                          color: "#ffffff",
                          padding: "0.15rem 0.45rem",
                          borderRadius: "3px",
                          fontWeight: 800,
                        }}
                      >
                        ðŸŽ™ï¸ MIC LIVE
                      </span>
                    )}
                  </div>
                </div>

                {/* Camera Snapshot / Video Stream Frame */}
                {(activeIncident.camera_feed_active ||
                  activeIncident.media_url) && (
                  <div
                    style={{
                      position: "relative",
                      borderRadius: "6px",
                      overflow: "hidden",
                      border: "1px solid rgba(239,68,68,0.5)",
                      background: "#000000",
                      marginBottom: "0.6rem",
                    }}
                  >
                    {activeIncident.media_url ? (
                      <img
                        src={activeIncident.media_url}
                        alt="Live Citizen Camera Evidence Feed"
                        style={{
                          width: "100%",
                          maxHeight: "240px",
                          objectFit: "cover",
                          display: "block",
                          cursor: "zoom-in",
                        }}
                        onClick={() =>
                          setFullscreenMedia(activeIncident.media_url)
                        }
                      />
                    ) : (
                      <div
                        style={{
                          height: "130px",
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "#fca5a5",
                          fontSize: "0.75rem",
                          gap: "0.4rem",
                        }}
                      >
                        <span style={{ fontSize: "1.8rem" }}>ðŸ“¡</span>
                        <span>
                          Citizen Camera Active Â· Awaiting First Frame Packet...
                        </span>
                      </div>
                    )}

                    <div
                      style={{
                        position: "absolute",
                        bottom: "6px",
                        left: "6px",
                        background: "rgba(0,0,0,0.75)",
                        padding: "2px 6px",
                        borderRadius: "4px",
                        fontSize: "0.62rem",
                        color: "#f87171",
                        fontWeight: 800,
                      }}
                    >
                      SECURE TACTICAL UPLINK Â· CITIZEN IN DISTRESS
                    </div>

                    {activeIncident.media_url && (
                      <button
                        type="button"
                        onClick={() =>
                          setFullscreenMedia(activeIncident.media_url)
                        }
                        style={{
                          position: "absolute",
                          top: "6px",
                          right: "6px",
                          background: "rgba(0,0,0,0.75)",
                          border: "1px solid rgba(255,255,255,0.3)",
                          color: "#fff",
                          borderRadius: "4px",
                          padding: "2px 7px",
                          fontSize: "0.65rem",
                          fontWeight: 700,
                          cursor: "pointer",
                        }}
                      >
                        ðŸ” Fullscreen View
                      </button>
                    )}
                  </div>
                )}

                {/* Ambient Audio Monitor Bar */}
                {activeIncident.audio_feed_active && (
                  <div
                    style={{
                      background: "rgba(6, 78, 59, 0.45)",
                      border: "1px solid #10b981",
                      borderRadius: "6px",
                      padding: "0.55rem",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem",
                      }}
                    >
                      <span style={{ fontSize: "1.1rem" }}>ðŸŽ™ï¸</span>
                      <div>
                        <div
                          style={{
                            fontSize: "0.72rem",
                            fontWeight: 800,
                            color: "#6ee7b7",
                          }}
                        >
                          AMBIENT AUDIO SURVEILLANCE ACTIVE
                        </div>
                        <div style={{ fontSize: "0.62rem", color: "#a7f3d0" }}>
                          Citizen device is silently streaming background audio
                          & acoustics.
                        </div>
                      </div>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "2px",
                        height: "18px",
                      }}
                    >
                      {[40, 75, 100, 60, 85, 45, 90, 65].map((h, idx) => (
                        <span
                          key={idx}
                          style={{
                            width: "3px",
                            height: `${h}%`,
                            background: "#10b981",
                            borderRadius: "1px",
                            animation: `liveTargetBeacon ${0.4 + idx * 0.1}s infinite alternate`,
                          }}
                        />
                      ))}
                    </div>
                  </div>
                )}

                <div
                  style={{
                    fontSize: "0.64rem",
                    color: "#fca5a5",
                    marginTop: "0.4rem",
                    textAlign: "center",
                  }}
                >
                  âš¡ Feeds are verified & saved in Palace Command Evidence Log
                  for prosecution.
                </div>
              </div>
            )}

            {/* â”€â”€ Real-Time Live Radar HUD (When is_live_tracking is active) â”€â”€ */}
            {activeIncident.is_live_tracking && (
              <div
                style={{
                  background: "rgba(5, 46, 22, 0.6)",
                  border: "2px solid #22c55e",
                  borderRadius: "6px",
                  padding: "0.8rem",
                  animation: "liveRadarGlow 2s infinite",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "0.5rem",
                  }}
                >
                  <span
                    style={{
                      fontSize: "0.75rem",
                      fontWeight: 900,
                      color: "#4ade80",
                      display: "flex",
                      alignItems: "center",
                      gap: "0.4rem",
                    }}
                  >
                    <span style={{ animation: "liveTargetBeacon 1s infinite" }}>
                      ðŸŸ¢
                    </span>{" "}
                    LIVE MOVING TARGET RADAR
                  </span>
                  <span
                    style={{
                      fontSize: "0.65rem",
                      background: "#22c55e",
                      color: "#052e16",
                      padding: "0.1rem 0.4rem",
                      borderRadius: "3px",
                      fontWeight: 800,
                    }}
                  >
                    STREAMING
                  </span>
                </div>

                {/* Telemetry Metrics Grid */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(4, 1fr)",
                    gap: "0.4rem",
                    textAlign: "center",
                    margin: "0.5rem 0",
                  }}
                >
                  <div
                    style={{
                      background: "rgba(0,0,0,0.4)",
                      padding: "0.35rem",
                      borderRadius: "4px",
                    }}
                  >
                    <div style={{ fontSize: "0.58rem", color: "#86efac" }}>
                      SPEED
                    </div>
                    <div
                      style={{
                        fontSize: "0.82rem",
                        fontWeight: 900,
                        color: "#ffffff",
                      }}
                    >
                      {activeIncident.speed !== null &&
                      activeIncident.speed !== undefined
                        ? `${activeIncident.speed} km/h`
                        : "Moving"}
                    </div>
                  </div>
                  <div
                    style={{
                      background: "rgba(0,0,0,0.4)",
                      padding: "0.35rem",
                      borderRadius: "4px",
                    }}
                  >
                    <div style={{ fontSize: "0.58rem", color: "#86efac" }}>
                      HEADING
                    </div>
                    <div
                      style={{
                        fontSize: "0.82rem",
                        fontWeight: 900,
                        color: "#ffffff",
                      }}
                    >
                      {activeIncident.heading
                        ? `${Math.round(activeIncident.heading)}Â°`
                        : "Tracked"}
                    </div>
                  </div>
                  <div
                    style={{
                      background: "rgba(0,0,0,0.4)",
                      padding: "0.35rem",
                      borderRadius: "4px",
                    }}
                  >
                    <div style={{ fontSize: "0.58rem", color: "#86efac" }}>
                      ACCURACY
                    </div>
                    <div
                      style={{
                        fontSize: "0.82rem",
                        fontWeight: 900,
                        color: "#ffffff",
                      }}
                    >
                      Â±{activeIncident.accuracy || 5}m
                    </div>
                  </div>
                  <div
                    style={{
                      background: "rgba(0,0,0,0.4)",
                      padding: "0.35rem",
                      borderRadius: "4px",
                    }}
                  >
                    <div style={{ fontSize: "0.58rem", color: "#86efac" }}>
                      BREADCRUMBS
                    </div>
                    <div
                      style={{
                        fontSize: "0.82rem",
                        fontWeight: 900,
                        color: "#ffffff",
                      }}
                    >
                      {breadcrumbs.length} pings
                    </div>
                  </div>
                </div>

                <div
                  style={{
                    fontSize: "0.68rem",
                    color: "#bbf7d0",
                    marginTop: "0.2rem",
                  }}
                >
                  Citizen is perpetually streaming live movement coordinates.
                  Map auto-centers on each live update.
                </div>
              </div>
            )}

            {/* â”€â”€ Google Maps with Satellite Hybrid & Street Toggles â”€â”€ */}
            {activeIncident.latitude &&
              activeIncident.longitude &&
              (() => {
                const ogereLoc = resolveOgereLocation(
                  activeIncident.latitude,
                  activeIncident.longitude,
                  activeIncident.accuracy || 10,
                );
                const mapUrls = getOgereMapUrls(
                  activeIncident.latitude,
                  activeIncident.longitude,
                  "Ogere Security Target",
                );

                return (
                  <div style={{ display: "grid", gap: "0.5rem" }}>
                    {/* Hyper-Local Ogere Landmark Reference */}
                    <div
                      style={{
                        background: "#0f172a",
                        border: "1px solid #38bdf8",
                        padding: "0.5rem 0.8rem",
                        borderRadius: "6px",
                        fontSize: "0.74rem",
                      }}
                    >
                      <div
                        style={{
                          color: "#38bdf8",
                          fontWeight: 900,
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                        }}
                      >
                        <span>ðŸ“ OGERE REMO PINPOINT:</span>
                        <span style={{ color: "#ffffff" }}>
                          {ogereLoc.formattedText}
                        </span>
                      </div>
                      <div
                        style={{
                          color: "#94a3b8",
                          fontSize: "0.66rem",
                          marginTop: "3px",
                          display: "flex",
                          justifyContent: "space-between",
                        }}
                      >
                        <span>Sector: {ogereLoc.sector}</span>
                        <span>
                          ðŸš“ ~{ogereLoc.distanceToPolice}m from Ogere Police
                          Station (ETA: ~{ogereLoc.policeEtaMinutes} mins)
                        </span>
                      </div>
                    </div>

                    {/* Map Controls */}
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <div style={{ display: "flex", gap: "6px" }}>
                        <button
                          type="button"
                          onClick={() => setDashboardMapMode("hybrid")}
                          style={{
                            background:
                              dashboardMapMode === "hybrid"
                                ? "#0284c7"
                                : "#1e293b",
                            border:
                              dashboardMapMode === "hybrid"
                                ? "1px solid #38bdf8"
                                : "1px solid #475569",
                            color: "#ffffff",
                            padding: "0.3rem 0.6rem",
                            borderRadius: "4px",
                            fontSize: "0.68rem",
                            fontWeight: 800,
                            cursor: "pointer",
                          }}
                        >
                          ðŸ›°ï¸ Satellite View (Rooftops)
                        </button>
                        <button
                          type="button"
                          onClick={() => setDashboardMapMode("roadmap")}
                          style={{
                            background:
                              dashboardMapMode === "roadmap"
                                ? "#0284c7"
                                : "#1e293b",
                            border:
                              dashboardMapMode === "roadmap"
                                ? "1px solid #38bdf8"
                                : "1px solid #475569",
                            color: "#ffffff",
                            padding: "0.3rem 0.6rem",
                            borderRadius: "4px",
                            fontSize: "0.68rem",
                            fontWeight: 800,
                            cursor: "pointer",
                          }}
                        >
                          ðŸ—ºï¸ Street Map
                        </button>
                      </div>
                      <a
                        href={mapUrls.satellitePin}
                        target="_blank" rel="noopener noreferrer"
                        rel="noreferrer"
                        style={{
                          color: "#38bdf8",
                          fontSize: "0.68rem",
                          textDecoration: "none",
                          fontWeight: 800,
                        }}
                      >
                        â†— Open Satellite Pin
                      </a>
                    </div>

                    {/* Embedded map â€” auto updates when coords change */}
                    <iframe
                      key={`${activeIncident.latitude}-${activeIncident.longitude}-${dashboardMapMode}-${liveRefreshKey}`}
                      title="incident-map"
                      width="100%"
                      height="240"
                      frameBorder="0"
                      style={{
                        borderRadius: "6px",
                        border: activeIncident.is_live_tracking
                          ? "2px solid #22c55e"
                          : "2px solid #ef4444",
                        display: "block",
                      }}
                      src={`https://maps.google.com/maps?q=${activeIncident.latitude},${activeIncident.longitude}&t=${dashboardMapMode === "hybrid" ? "k" : "m"}&z=18&output=embed`}
                      allowFullScreen
                    />

                    {/* Turn-by-Turn Intercept Navigation Button (Crucial for Police/Patrol units) */}
                    <a
                      href={mapUrls.turnByTurnNavigation}
                      target="_blank" rel="noopener noreferrer"
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "0.4rem",
                        background: activeIncident.is_live_tracking
                          ? "#16a34a"
                          : "#1a73e8",
                        color: "#ffffff",
                        padding: "0.65rem 1rem",
                        borderRadius: "4px",
                        textDecoration: "none",
                        fontWeight: 900,
                        fontSize: "0.78rem",
                        letterSpacing: 0.3,
                        boxShadow: activeIncident.is_live_tracking
                          ? "0 0 15px rgba(34,197,94,0.4)"
                          : "none",
                      }}
                    >
                      {activeIncident.is_live_tracking
                        ? "âš¡ Intercept Moving Target (Turn-by-Turn Navigation) â†’"
                        : "ðŸ—ºï¸ Open Rooftop Pin on Google Maps â†’"}
                    </a>

                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        gap: "0.4rem",
                        marginTop: "0.2rem",
                      }}
                    >
                      {/* CCTV Camera Radius Scanner */}
                      <button
                        onClick={handleScanCctv}
                        style={{
                          background: "#374151",
                          border: "1px solid #9ca3af",
                          color: "#ffffff",
                          padding: "0.5rem",
                          borderRadius: "4px",
                          fontSize: "0.72rem",
                          fontWeight: 800,
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: "0.3rem",
                        }}
                      >
                        ðŸ“¹ Scan CCTV (1km)
                      </button>

                      {/* Guardian Family Link */}
                      <button
                        onClick={() => {
                          const url = `${window.location.origin}/track/${activeIncident.id}`;
                          navigator.clipboard.writeText(url);
                          alert(
                            `Guardian Radar Link copied to clipboard:\n${url}\n\nSend to victim's family / next-of-kin via SMS or WhatsApp.`,
                          );
                        }}
                        style={{
                          background: "#065f46",
                          border: "1px solid #34d399",
                          color: "#ffffff",
                          padding: "0.5rem",
                          borderRadius: "4px",
                          fontSize: "0.72rem",
                          fontWeight: 800,
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: "0.3rem",
                        }}
                      >
                        ðŸ”— Guardian Link
                      </button>
                    </div>

                    <div
                      style={{
                        fontSize: "0.68rem",
                        color: "rgba(255,255,255,0.6)",
                        textAlign: "center",
                      }}
                    >
                      Live GPS: {Number(activeIncident.latitude).toFixed(5)}Â°N,{" "}
                      {Number(activeIncident.longitude).toFixed(5)}Â°E
                      {activeIncident.last_ping_at &&
                        ` Â· Last ping: ${new Date(activeIncident.last_ping_at).toLocaleTimeString()}`}
                    </div>

                    {/* Breadcrumbs Route History Trail */}
                    {breadcrumbs.length > 1 && (
                      <div
                        style={{
                          background: "rgba(0,0,0,0.4)",
                          border: "1px solid rgba(255,255,255,0.1)",
                          borderRadius: "4px",
                          padding: "0.5rem",
                          marginTop: "0.3rem",
                        }}
                      >
                        <div
                          style={{
                            fontSize: "0.65rem",
                            fontWeight: 800,
                            color: "var(--gold)",
                            marginBottom: "0.3rem",
                          }}
                        >
                          ðŸ“ MOVEMENT TRAIL ({breadcrumbs.length} RECORDED
                          PINGS)
                        </div>
                        <div
                          style={{
                            maxHeight: "90px",
                            overflowY: "auto",
                            fontSize: "0.65rem",
                            color: "rgba(255,255,255,0.7)",
                          }}
                        >
                          {breadcrumbs
                            .slice(-8)
                            .reverse()
                            .map((b, idx) => (
                              <div
                                key={idx}
                                style={{
                                  display: "flex",
                                  justifyContent: "space-between",
                                  padding: "2px 0",
                                  borderBottom:
                                    "1px solid rgba(255,255,255,0.05)",
                                }}
                              >
                                <span>
                                  #{breadcrumbs.length - idx}:{" "}
                                  {Number(b.latitude).toFixed(5)}Â°N,{" "}
                                  {Number(b.longitude).toFixed(5)}Â°E
                                </span>
                                <span style={{ color: "#86efac" }}>
                                  {b.speed ? `${b.speed} km/h` : ""} Â·{" "}
                                  {new Date(b.created_at).toLocaleTimeString(
                                    [],
                                    {
                                      hour: "2-digit",
                                      minute: "2-digit",
                                      second: "2-digit",
                                    },
                                  )}
                                </span>
                              </div>
                            ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })()}

            <div>
              <span style={{ color: "var(--gold)", fontWeight: 700 }}>
                Reporter:{" "}
              </span>
              <span style={{ color: "#ffffff" }}>
                {activeIncident.reporter_name || "Anonymous"}
              </span>
              {activeIncident.reporter_phone && (
                <a
                  href={`tel:${activeIncident.reporter_phone}`}
                  style={{
                    marginLeft: "0.5rem",
                    color: "#86efac",
                    textDecoration: "none",
                    fontWeight: 700,
                  }}
                >
                  ðŸ“ž Call {activeIncident.reporter_phone}
                </a>
              )}
            </div>

            {/* â”€â”€ Device & Signal Intelligence Grid â”€â”€ */}
            {(activeIncident.device_model ||
              activeIncident.device_os ||
              activeIncident.network_type ||
              activeIncident.battery_level != null ||
              activeIncident.ip_address) && (
              <div
                style={{
                  background: "rgba(0,0,0,0.5)",
                  border: "1px solid rgba(201,150,58,0.3)",
                  borderRadius: "6px",
                  padding: "0.65rem",
                  marginTop: "0.2rem",
                }}
              >
                <div
                  style={{
                    fontSize: "0.65rem",
                    fontWeight: 800,
                    color: "var(--gold)",
                    letterSpacing: "0.05em",
                    marginBottom: "0.4rem",
                  }}
                >
                  ðŸ“± DEVICE & TELEMETRY INTEL
                </div>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(3, 1fr)",
                    gap: "0.35rem",
                    fontSize: "0.65rem",
                  }}
                >
                  {activeIncident.device_model && (
                    <div
                      style={{
                        background: "rgba(255,255,255,0.05)",
                        padding: "0.3rem 0.45rem",
                        borderRadius: "4px",
                      }}
                    >
                      <div
                        style={{
                          color: "rgba(255,255,255,0.4)",
                          fontSize: "0.55rem",
                          fontWeight: 800,
                        }}
                      >
                        DEVICE
                      </div>
                      <div
                        style={{
                          color: "#ffffff",
                          fontWeight: 700,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {activeIncident.device_model}
                      </div>
                    </div>
                  )}
                  {activeIncident.device_os && (
                    <div
                      style={{
                        background: "rgba(255,255,255,0.05)",
                        padding: "0.3rem 0.45rem",
                        borderRadius: "4px",
                      }}
                    >
                      <div
                        style={{
                          color: "rgba(255,255,255,0.4)",
                          fontSize: "0.55rem",
                          fontWeight: 800,
                        }}
                      >
                        OS
                      </div>
                      <div style={{ color: "#ffffff", fontWeight: 700 }}>
                        {activeIncident.device_os}
                      </div>
                    </div>
                  )}
                  {activeIncident.battery_level != null && (
                    <div
                      style={{
                        background: "rgba(255,255,255,0.05)",
                        padding: "0.3rem 0.45rem",
                        borderRadius: "4px",
                      }}
                    >
                      <div
                        style={{
                          color: "rgba(255,255,255,0.4)",
                          fontSize: "0.55rem",
                          fontWeight: 800,
                        }}
                      >
                        BATTERY
                      </div>
                      <div
                        style={{
                          color:
                            activeIncident.battery_level > 20
                              ? "#4ade80"
                              : "#ef4444",
                          fontWeight: 900,
                        }}
                      >
                        ðŸ”‹ {activeIncident.battery_level}%{" "}
                        {activeIncident.battery_level <= 20 ? "âš ï¸ LOW" : ""}
                      </div>
                    </div>
                  )}
                  {activeIncident.network_type && (
                    <div
                      style={{
                        background: "rgba(255,255,255,0.05)",
                        padding: "0.3rem 0.45rem",
                        borderRadius: "4px",
                      }}
                    >
                      <div
                        style={{
                          color: "rgba(255,255,255,0.4)",
                          fontSize: "0.55rem",
                          fontWeight: 800,
                        }}
                      >
                        NETWORK
                      </div>
                      <div style={{ color: "#38bdf8", fontWeight: 700 }}>
                        ðŸ“¶ {activeIncident.network_type.toUpperCase()}
                        {activeIncident.network_generation
                          ? ` Â· ${activeIncident.network_generation}`
                          : ""}
                      </div>
                    </div>
                  )}
                  {activeIncident.ip_address && (
                    <div
                      style={{
                        background: "rgba(255,255,255,0.05)",
                        padding: "0.3rem 0.45rem",
                        borderRadius: "4px",
                      }}
                    >
                      <div
                        style={{
                          color: "rgba(255,255,255,0.4)",
                          fontSize: "0.55rem",
                          fontWeight: 800,
                        }}
                      >
                        PUBLIC IP
                      </div>
                      <div
                        style={{
                          color: "#94a3b8",
                          fontFamily: "monospace",
                          fontWeight: 700,
                        }}
                      >
                        {activeIncident.ip_address}
                      </div>
                    </div>
                  )}
                  {activeIncident.timezone && (
                    <div
                      style={{
                        background: "rgba(255,255,255,0.05)",
                        padding: "0.3rem 0.45rem",
                        borderRadius: "4px",
                      }}
                    >
                      <div
                        style={{
                          color: "rgba(255,255,255,0.4)",
                          fontSize: "0.55rem",
                          fontWeight: 800,
                        }}
                      >
                        TIMEZONE
                      </div>
                      <div style={{ color: "#cbd5e1", fontWeight: 700 }}>
                        ðŸ•’ {activeIncident.timezone}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div>
              <span style={{ color: "var(--gold)", fontWeight: 700 }}>
                Telemetry Description:{" "}
              </span>
              <p
                style={{
                  background: "rgba(0,0,0,0.4)",
                  padding: "0.6rem",
                  borderRadius: "4px",
                  color: "#f5edd8",
                  marginTop: "0.3rem",
                  fontSize: "0.75rem",
                  lineHeight: 1.5,
                }}
              >
                {activeIncident.description}
              </p>
            </div>
          </div>

          {/* Dispatch Controls & AI Routing Panel */}
          <div
            style={{
              borderTop: "1px solid rgba(201,150,58,0.2)",
              paddingTop: "1rem",
              display: "grid",
              gap: "0.8rem",
            }}
          >
            {/* AI Proximity Auto-Routing & Case Pickup Live Monitor */}
            {(() => {
              const claim = claimedIncidents[activeIncident.id];
              const isClaimed = !!claim;

              return (
                <div
                  style={{
                    background: isClaimed
                      ? "rgba(34, 197, 94, 0.12)"
                      : "rgba(56, 189, 248, 0.1)",
                    border: isClaimed
                      ? "1px solid #22c55e"
                      : "1px solid #38bdf8",
                    borderRadius: "6px",
                    padding: "0.65rem",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: "0.35rem",
                    }}
                  >
                    <span
                      style={{
                        fontSize: "0.68rem",
                        fontWeight: 900,
                        color: isClaimed ? "#4ade80" : "#38bdf8",
                        letterSpacing: "0.04em",
                      }}
                    >
                      {isClaimed
                        ? "âœ… DISPATCH CLAIMED BY FIELD OFFICER"
                        : "âš¡ AI PROXIMITY AUTO-ROUTER"}
                    </span>
                    <span
                      style={{
                        fontSize: "0.6rem",
                        color: "#cbd5e1",
                        background: "rgba(0,0,0,0.4)",
                        padding: "1px 5px",
                        borderRadius: "3px",
                      }}
                    >
                      ETA: ~3 mins
                    </span>
                  </div>

                  {isClaimed ? (
                    <div
                      style={{
                        fontSize: "0.68rem",
                        color: "#f8fafc",
                        lineHeight: 1.4,
                      }}
                    >
                      <div>
                        <strong>Officer:</strong> {claim.officerName} (
                        {claim.badge} Â· {claim.rank || "Officer"})
                      </div>
                      <div>
                        <strong>Tactical Unit:</strong>{" "}
                        {claim.unitName || "Rapid Intercept"} (
                        {claim.callsign || "EAGLE"})
                      </div>
                      <div>
                        <strong>Command Base:</strong>{" "}
                        {claim.stationName || "Ogere Divisional HQ"}
                      </div>
                      <div
                        style={{
                          color: "#4ade80",
                          fontWeight: 800,
                          marginTop: "2px",
                        }}
                      >
                        Status: EN ROUTE TO TARGET LOCATION
                      </div>
                    </div>
                  ) : (
                    <div style={{ fontSize: "0.68rem", color: "#cbd5e1" }}>
                      Auto-routed to closest responding station based on GPS
                      coordinates and threat type. Waiting for field unit
                      pickup.
                    </div>
                  )}

                  {/* Admin Manual Station Re-Route Override */}
                  <div
                    style={{
                      marginTop: "0.5rem",
                      borderTop: "1px dashed rgba(255,255,255,0.15)",
                      paddingTop: "0.45rem",
                    }}
                  >
                    <label
                      style={{
                        fontSize: "0.62rem",
                        color: "var(--gold)",
                        fontWeight: 800,
                        display: "block",
                        marginBottom: "0.25rem",
                      }}
                    >
                      ADMIN MANUAL OVERRIDE (Re-Route Incident):
                    </label>
                    <div style={{ display: "flex", gap: "0.4rem" }}>
                      <select
                        value={adminSelectedStation}
                        onChange={(e) =>
                          setAdminSelectedStation(e.target.value)
                        }
                        style={{
                          flex: 1,
                          background: "#1c100b",
                          color: "#f5edd8",
                          border: "1px solid rgba(201,150,58,0.4)",
                          padding: "0.35rem 0.5rem",
                          borderRadius: "4px",
                          fontSize: "0.68rem",
                        }}
                      >
                        {OGERE_STATIONS.map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.name} ({s.agency})
                          </option>
                        ))}
                      </select>
                      <button
                        type="button"
                        onClick={() => handleAdminReassign(activeIncident.id)}
                        style={{
                          background: "#0284c7",
                          color: "#ffffff",
                          border: "none",
                          padding: "0.35rem 0.75rem",
                          borderRadius: "4px",
                          fontSize: "0.68rem",
                          fontWeight: 900,
                          cursor: "pointer",
                          whiteSpace: "nowrap",
                        }}
                      >
                        ðŸ”„ Re-Route
                      </button>
                    </div>
                  </div>
                </div>
              );
            })()}

            <div>
              <label
                style={{
                  fontSize: "0.7rem",
                  color: "var(--gold)",
                  fontWeight: 700,
                  display: "block",
                  marginBottom: "0.3rem",
                }}
              >
                Assign Primary Responding Agency:
              </label>
              <select
                value={dispatchAgency}
                onChange={(e) => setDispatchAgency(e.target.value)}
                style={{
                  width: "100%",
                  background: "#1c100b",
                  color: "#f5edd8",
                  border: "1px solid rgba(201,150,58,0.3)",
                  padding: "0.5rem",
                  borderRadius: "4px",
                  fontSize: "0.75rem",
                }}
              >
                <option value="Police">Nigeria Police Force (Ogere DPO)</option>
                <option value="FRSC">FRSC Expressway Rescue (122)</option>
                <option value="So-Safe">So-Safe Corps (Ogun State)</option>
                <option value="Palace Vigilante">
                  Palace Vigilante Command
                </option>
                <option value="Fire Service">Fire & Rescue Service</option>
                <option value="Joint Taskforce">
                  Joint Taskforce (Police + Vigilante)
                </option>
              </select>
            </div>

            <div>
              <label
                style={{
                  fontSize: "0.7rem",
                  color: "var(--gold)",
                  fontWeight: 700,
                  display: "block",
                  marginBottom: "0.3rem",
                }}
              >
                Tactical Unit Call-Sign / Responders:
              </label>
              <input
                type="text"
                value={dispatchUnit}
                onChange={(e) => setDispatchUnit(e.target.value)}
                placeholder="E.g. Patrol Alpha 01 / DPO Team 2"
                style={{
                  width: "100%",
                  background: "#1c100b",
                  color: "#f5edd8",
                  border: "1px solid rgba(201,150,58,0.3)",
                  padding: "0.5rem",
                  borderRadius: "4px",
                  fontSize: "0.75rem",
                }}
              />
            </div>

            <div>
              <label
                style={{
                  fontSize: "0.7rem",
                  color: "var(--gold)",
                  fontWeight: 700,
                  display: "block",
                  marginBottom: "0.3rem",
                }}
              >
                Agency Incident Notes / SITREP:
              </label>
              <textarea
                rows={2}
                value={agencyNotes}
                onChange={(e) => setAgencyNotes(e.target.value)}
                placeholder="Log status, suspects neutralized or fleeing, medical triage..."
                style={{
                  width: "100%",
                  background: "#1c100b",
                  color: "#f5edd8",
                  border: "1px solid rgba(201,150,58,0.3)",
                  padding: "0.5rem",
                  borderRadius: "4px",
                  fontSize: "0.75rem",
                }}
              />
            </div>

            {/* Dispatch Status Action Buttons */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "0.6rem",
                marginTop: "0.4rem",
              }}
            >
              <button
                disabled={isUpdating}
                onClick={() => handleUpdateStatus("dispatched")}
                style={{
                  background: "#d97706",
                  border: "none",
                  color: "#ffffff",
                  padding: "0.6rem",
                  borderRadius: "4px",
                  fontSize: "0.72rem",
                  fontWeight: 800,
                  cursor: "pointer",
                }}
              >
                ðŸš€ Dispatch Unit
              </button>

              <button
                disabled={isUpdating}
                onClick={() => handleUpdateStatus("on_scene")}
                style={{
                  background: "#2563eb",
                  border: "none",
                  color: "#ffffff",
                  padding: "0.6rem",
                  borderRadius: "4px",
                  fontSize: "0.72rem",
                  fontWeight: 800,
                  cursor: "pointer",
                }}
              >
                ðŸ“ Unit On Scene
              </button>

              <button
                disabled={isUpdating}
                onClick={() => handleUpdateStatus("resolved")}
                style={{
                  background: "#16a34a",
                  border: "none",
                  color: "#ffffff",
                  padding: "0.6rem",
                  borderRadius: "4px",
                  fontSize: "0.72rem",
                  fontWeight: 800,
                  cursor: "pointer",
                  gridColumn: "span 2",
                }}
              >
                âœ… Mark Situation Secured / Resolved
              </button>
            </div>

            {/* â”€â”€ Radio SITREPs & Tactical Communications Log â”€â”€ */}
            <div
              style={{
                background: "rgba(15, 23, 42, 0.7)",
                border: "1px solid rgba(201, 150, 58, 0.25)",
                borderRadius: "6px",
                padding: "0.75rem",
                marginTop: "0.4rem",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "0.4rem",
                }}
              >
                <div
                  style={{
                    fontSize: "0.68rem",
                    fontWeight: 900,
                    color: "var(--gold)",
                    letterSpacing: "0.06em",
                  }}
                >
                  ðŸ“» RADIO SITREPS & DISPATCH LOG
                </div>
                <span style={{ fontSize: "0.6rem", color: "#94a3b8" }}>
                  {Array.isArray(activeIncident.sitreps)
                    ? activeIncident.sitreps.length
                    : 0}{" "}
                  Transmissions
                </span>
              </div>

              {/* Sitrep Messages Feed */}
              <div
                style={{
                  maxHeight: "140px",
                  overflowY: "auto",
                  display: "grid",
                  gap: "0.4rem",
                  marginBottom: "0.6rem",
                }}
              >
                {Array.isArray(activeIncident.sitreps) &&
                activeIncident.sitreps.length > 0 ? (
                  activeIncident.sitreps.map((s, idx) => (
                    <div
                      key={idx}
                      style={{
                        background: "rgba(0, 0, 0, 0.4)",
                        borderLeft: "3px solid #38bdf8",
                        borderRadius: "3px",
                        padding: "0.35rem 0.5rem",
                        fontSize: "0.68rem",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          color: "#94a3b8",
                          fontSize: "0.58rem",
                          marginBottom: "0.15rem",
                        }}
                      >
                        <span style={{ fontWeight: 800, color: "#38bdf8" }}>
                          {s.author || "Radio Unit"}
                        </span>
                        <span>
                          {s.timestamp
                            ? new Date(s.timestamp).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                                second: "2-digit",
                              })
                            : ""}
                        </span>
                      </div>
                      <div style={{ color: "#f1f5f9", lineHeight: 1.35 }}>
                        {s.message}
                      </div>
                    </div>
                  ))
                ) : (
                  <div
                    style={{
                      fontSize: "0.64rem",
                      color: "rgba(255,255,255,0.4)",
                      fontStyle: "italic",
                      padding: "0.4rem 0",
                    }}
                  >
                    No radio SITREPs recorded yet. Broadcast initial sitrep
                    below.
                  </div>
                )}
              </div>

              {/* SITREP Fast Dispatch Form */}
              <div style={{ display: "flex", gap: "0.4rem" }}>
                <input
                  type="text"
                  value={newSitrepText}
                  onChange={(e) => setNewSitrepText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddRadioSitrep();
                    }
                  }}
                  placeholder="Broadcast radio update (e.g. Unit 4 engaged suspects)..."
                  style={{
                    flex: 1,
                    background: "#090d16",
                    border: "1px solid rgba(255, 255, 255, 0.15)",
                    borderRadius: "4px",
                    padding: "0.4rem 0.6rem",
                    color: "#f8fafc",
                    fontSize: "0.68rem",
                  }}
                />
                <button
                  onClick={handleAddRadioSitrep}
                  disabled={!newSitrepText.trim() || isUpdating}
                  style={{
                    background: "#0284c7",
                    border: "none",
                    color: "#ffffff",
                    padding: "0.4rem 0.75rem",
                    borderRadius: "4px",
                    fontSize: "0.68rem",
                    fontWeight: 800,
                    cursor: newSitrepText.trim() ? "pointer" : "default",
                    opacity: newSitrepText.trim() ? 1 : 0.6,
                    whiteSpace: "nowrap",
                  }}
                >
                  ðŸ“¡ Broadcast
                </button>
              </div>
            </div>

            {/* â”€â”€ Multi-Modal Evidence Locker â”€â”€ */}
            {(activeIncident.voice_note_url ||
              (Array.isArray(activeIncident.evidence_files) &&
                activeIncident.evidence_files.length > 0)) && (
              <div
                style={{
                  background: "rgba(30, 27, 75, 0.4)",
                  border: "1px solid #6366f1",
                  borderRadius: "6px",
                  padding: "0.75rem",
                  marginTop: "0.4rem",
                }}
              >
                <div
                  style={{
                    fontSize: "0.68rem",
                    fontWeight: 900,
                    color: "#a5b4fc",
                    letterSpacing: "0.06em",
                    marginBottom: "0.5rem",
                  }}
                >
                  ðŸ“‚ MULTI-MODAL EVIDENCE LOCKER
                </div>

                {/* Voice Note Player */}
                {activeIncident.voice_note_url && (
                  <div
                    style={{
                      marginBottom: "0.5rem",
                      background: "rgba(0,0,0,0.5)",
                      padding: "0.5rem",
                      borderRadius: "4px",
                    }}
                  >
                    <div
                      style={{
                        fontSize: "0.62rem",
                        fontWeight: 800,
                        color: "#818cf8",
                        marginBottom: "0.3rem",
                      }}
                    >
                      ðŸŽ™ï¸ CITIZEN AUDIO VOICE MEMO
                    </div>
                    <audio
                      controls
                      src={activeIncident.voice_note_url}
                      style={{ width: "100%", height: "32px" }}
                    />
                  </div>
                )}

                {/* Attached Evidence Files */}
                {Array.isArray(activeIncident.evidence_files) &&
                  activeIncident.evidence_files.length > 0 && (
                    <div style={{ display: "grid", gap: "0.3rem" }}>
                      {activeIncident.evidence_files.map((file, fIdx) => (
                        <div
                          key={fIdx}
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            background: "rgba(0,0,0,0.4)",
                            padding: "0.35rem 0.5rem",
                            borderRadius: "4px",
                            fontSize: "0.65rem",
                          }}
                        >
                          <span
                            style={{
                              color: "#e2e8f0",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                              maxWidth: "200px",
                            }}
                          >
                            ðŸ“Ž {file.name || `Evidence Attachment #${fIdx + 1}`}
                          </span>
                          {file.url && (
                            <a
                              href={file.url}
                              target="_blank" rel="noopener noreferrer"
                              style={{
                                color: "#818cf8",
                                fontWeight: 700,
                                textDecoration: "none",
                              }}
                            >
                              View / Download â†—
                            </a>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
              </div>
            )}
          </div>
        </div>
    </>
  );
}

import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { supabase } from "../lib/supabase";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
});

export default function PanelCliente() {
  const router = useRouter();

  const [data, setData] = useState([]);
  const [filtro, setFiltro] = useState("Todos");
  const [busqueda, setBusqueda] = useState("");

  useEffect(() => {
    cargar();
    const interval = setInterval(cargar, 10000);
    return () => clearInterval(interval);
  }, []);

  const cargar = async () => {
    const { data } = await supabase
      .from("registros")
      .select("*")
      .order("id", { ascending: false });

    setData(data || []);
  };

  const diasSinActualizar = (fecha) => {
    if (!fecha) return 999;

    const hoy = new Date();
    const ultima = new Date(fecha);
    const diff = hoy - ultima;

    return Math.floor(diff / (1000 * 60 * 60 * 24));
  };

  const prioridad = (r) => {
    if (r.riesgo === "Crítico") return 1;
    if (r.riesgo === "Alto") return 2;
    if (diasSinActualizar(r.ultima_actualizacion) >= 7) return 3;
    if (r.riesgo === "Medio") return 4;
    return 5;
  };

  const colorRiesgo = (riesgo) => {
    if (riesgo === "Crítico") return "#dc2626";
    if (riesgo === "Alto") return "#f97316";
    if (riesgo === "Medio") return "#f59e0b";
    if (riesgo === "Bajo") return "#22c55e";
    return "#64748b";
  };

  const filtrados = data
    .filter((r) => {
      const texto = busqueda.toLowerCase();

      const coincideBusqueda =
        r.nombre?.toLowerCase().includes(texto) ||
        r.apodo?.toLowerCase().includes(texto) ||
        r.run?.toLowerCase().includes(texto) ||
        r.sector?.toLowerCase().includes(texto);

      const coincideEstado =
        filtro === "Todos" || r.estado === filtro;

      return coincideBusqueda && coincideEstado;
    })
    .sort((a, b) => prioridad(a) - prioridad(b));

  const estados = [
    "Todos",
    "En calle",
    "Atendido",
    "Trasladado",
    "Derivado a salud",
    "Sin ubicación"
  ];

  const abrirGoogleMaps = (lat, lng) => {
    window.open(
      `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`,
      "_blank"
    );
  };

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1.8fr 1fr",
        height: "calc(100vh - 60px)"
      }}
    >
      <div>
        <MapContainer
          center={[-35.97, -71.68]}
          zoom={14}
          style={{ height: "100%", width: "100%" }}
        >
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

          {filtrados.map((r) =>
            r.lat && r.lng ? (
              <Marker
                key={r.id}
                position={[Number(r.lat), Number(r.lng)]}
              >
                <Popup>
                  <div style={{ width: 220 }}>
                    {r.foto && (
                      <img
                        src={r.foto}
                        alt="foto"
                        style={{
                          width: "100%",
                          height: 150,
                          objectFit: "cover",
                          borderRadius: 12,
                          marginBottom: 10
                        }}
                      />
                    )}

                    <h3>{r.nombre || "Sin nombre"}</h3>
                    <p><b>Apodo:</b> {r.apodo || "Sin dato"}</p>
                    <p><b>RUN:</b> {r.run || "Sin dato"}</p>
                    <p><b>Estado:</b> {r.estado || "Sin dato"}</p>
                    <p>
                      <b>Riesgo:</b>{" "}
                      <span style={{ color: colorRiesgo(r.riesgo), fontWeight: "bold" }}>
                        {r.riesgo || "Sin dato"}
                      </span>
                    </p>

                    <button
                      className="btn"
                      onClick={() => router.push(`/registro/${r.id}`)}
                      style={{ width: "100%", marginBottom: 8 }}
                    >
                      📄 Ver ficha
                    </button>

                    <button
                      onClick={() => abrirGoogleMaps(r.lat, r.lng)}
                      style={{
                        width: "100%",
                        padding: 10,
                        borderRadius: 12,
                        border: "none",
                        background: "#f59e0b",
                        color: "white",
                        fontWeight: "bold"
                      }}
                    >
                      🧭 Google Maps
                    </button>
                  </div>
                </Popup>
              </Marker>
            ) : null
          )}
        </MapContainer>
      </div>

      <aside
        style={{
          padding: 15,
          overflowY: "auto",
          background: "#f8fafc",
          borderLeft: "1px solid #dbe3ea"
        }}
      >
        <div className="card">
          <h2>🚨 Panel Operativo</h2>

          <p>
            Registros visibles: <b>{filtrados.length}</b>
          </p>

          <input
            placeholder="Buscar nombre, apodo, RUN o sector"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />

          <div style={{ display: "grid", gap: 8 }}>
            {estados.map((e) => (
              <button
                key={e}
                onClick={() => setFiltro(e)}
                style={{
                  padding: 10,
                  borderRadius: 12,
                  border: "1px solid #dbe3ea",
                  background: filtro === e ? "#1d4ed8" : "#fff",
                  color: filtro === e ? "#fff" : "#0f172a",
                  fontWeight: "bold",
                  cursor: "pointer"
                }}
              >
                {e}
              </button>
            ))}
          </div>
        </div>

        {filtrados.map((r) => {
          const dias = diasSinActualizar(r.ultima_actualizacion);
          const vencido = dias >= 7;

          return (
            <div
              key={r.id}
              className="card"
              style={{
                borderLeft: `8px solid ${colorRiesgo(r.riesgo)}`
              }}
            >
              {r.foto && (
                <img
                  src={r.foto}
                  alt="foto"
                  style={{
                    width: "100%",
                    height: 140,
                    objectFit: "cover",
                    borderRadius: 14,
                    marginBottom: 10
                  }}
                />
              )}

              <h3>{r.nombre || "Sin nombre"}</h3>

              <p>Apodo: {r.apodo || "Sin dato"}</p>
              <p>RUN: {r.run || "Sin dato"}</p>
              <p>Sector: {r.sector || "Sin dato"}</p>
              <p>Estado: {r.estado || "Sin dato"}</p>

              <p>
                Riesgo:{" "}
                <b style={{ color: colorRiesgo(r.riesgo) }}>
                  {r.riesgo || "Sin dato"}
                </b>
              </p>

              {r.ultima_actualizacion ? (
                <p>
                  Última actualización:{" "}
                  {new Date(r.ultima_actualizacion).toLocaleDateString("es-CL")}
                </p>
              ) : (
                <p style={{ color: "#dc2626", fontWeight: "bold" }}>
                  ⚠️ Sin actualización registrada
                </p>
              )}

              {vencido && (
                <p style={{ color: "#dc2626", fontWeight: "bold" }}>
                  🚨 Sin actualización hace {dias} días
                </p>
              )}

              {r.riesgo === "Crítico" && (
                <p style={{ color: "#dc2626", fontWeight: "bold" }}>
                  🔴 Prioridad inmediata
                </p>
              )}

              <button
                className="btn"
                onClick={() => router.push(`/registro/${r.id}`)}
              >
                📚 Ver ficha e historial
              </button>
            </div>
          );
        })}
      </aside>
    </div>
  );
}
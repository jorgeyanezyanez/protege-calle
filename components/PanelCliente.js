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

  const filtrados = data.filter((r) => {
    const texto = busqueda.toLowerCase();

    const coincideBusqueda =
      r.nombre?.toLowerCase().includes(texto) ||
      r.apodo?.toLowerCase().includes(texto) ||
      r.run?.toLowerCase().includes(texto);

    const coincideEstado = filtro === "Todos" || r.estado === filtro;

    return coincideBusqueda && coincideEstado;
  });

  const estados = [
    "Todos",
    "En calle",
    "Atendido",
    "Trasladado",
    "Derivado a salud",
    "Sin ubicación"
  ];

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1.8fr 1fr",
        height: "calc(100vh - 60px)",
        background: "#eef3f8"
      }}
    >
      <div style={{ height: "100%" }}>
        <MapContainer
          center={[-35.97, -71.68]}
          zoom={14}
          style={{ height: "100%", width: "100%" }}
        >
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

          {filtrados.map((r) =>
            r.lat && r.lng ? (
              <Marker key={r.id} position={[Number(r.lat), Number(r.lng)]}>
                <Popup>
                  {r.foto && (
                    <img
                      src={r.foto}
                      alt="foto"
                      style={{
                        width: "180px",
                        height: "180px",
                        objectFit: "cover",
                        borderRadius: 12,
                        marginBottom: 8
                      }}
                    />
                  )}

                  <b>{r.nombre || "Sin nombre"}</b>
                  <br />
                  Apodo: {r.apodo || "Sin dato"}
                  <br />
                  RUN: {r.run || "Sin dato"}
                  <br />
                  Estado: {r.estado || "Sin dato"}
                  <br />
                  Riesgo: {r.riesgo || "Sin dato"}
                </Popup>
              </Marker>
            ) : null
          )}
        </MapContainer>
      </div>

      <aside
        style={{
          padding: 16,
          overflowY: "auto",
          background: "#f8fafc",
          borderLeft: "1px solid #dbe3ea"
        }}
      >
        <div className="card">
          <h2>🧭 Panel Operativo</h2>
          <p>
            Registros visibles: <b>{filtrados.length}</b>
          </p>

          <input
            placeholder="Buscar nombre, apodo o RUN"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />

          <div
            style={{
              display: "grid",
              gap: 8,
              marginTop: 10
            }}
          >
            {estados.map((e) => (
              <button
                key={e}
                onClick={() => setFiltro(e)}
                style={{
                  padding: 10,
                  borderRadius: 12,
                  border: "1px solid #dbe3ea",
                  background: filtro === e ? "#1d4ed8" : "#ffffff",
                  color: filtro === e ? "#ffffff" : "#0f172a",
                  fontWeight: 700,
                  cursor: "pointer"
                }}
              >
                {e}
              </button>
            ))}
          </div>
        </div>

        {filtrados.map((r) => (
          <div key={r.id} className="card">
            {r.foto && (
              <img
                src={r.foto}
                alt="foto"
                style={{
                  width: "100%",
                  height: 150,
                  objectFit: "cover",
                  borderRadius: 14,
                  marginBottom: 10
                }}
              />
            )}

            <h3>{r.nombre || "Sin nombre"}</h3>
            <p>Apodo: {r.apodo || "Sin dato"}</p>
            <p>RUN: {r.run || "Sin dato"}</p>
            <p>Estado: {r.estado || "Sin dato"}</p>
            <p>Riesgo: {r.riesgo || "Sin dato"}</p>
            <p>Sector: {r.sector || "Sin dato"}</p>

            <button
              className="btn"
              onClick={() => router.push(`/registro/${r.id}`)}
            >
              📚 Ver ficha e historial
            </button>
          </div>
        ))}
      </aside>
    </div>
  );
}
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

    const interval = setInterval(() => {
      cargar();
    }, 10000);

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

    const coincideEstado =
      filtro === "Todos" || r.estado === filtro;

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
    <div style={{ display: "flex", height: "100vh" }}>

      <div style={{ flex: 2 }}>
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
                  {r.foto && (
                    <img
                      src={r.foto}
                      alt="foto"
                      style={{
                        width: "220px",
                        height: "220px",
                        objectFit: "cover",
                        borderRadius: 8,
                        marginBottom: 8
                      }}
                    />
                  )}

                  <b>{r.nombre}</b>
                  <br />
                  Apodo: {r.apodo}
                  <br />
                  RUN: {r.run}
                  <br />
                  Estado: {r.estado}
                  <br />
                  Riesgo: {r.riesgo}
                </Popup>
              </Marker>
            ) : null
          )}
        </MapContainer>
      </div>

      <div
        style={{
          flex: 1,
          padding: 15,
          overflowY: "auto",
          borderLeft: "1px solid #ccc"
        }}
      >
        <h2>🧭 Panel Operativo</h2>

        <input
          placeholder="Buscar por nombre, apodo o RUN"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />

        <div style={{ marginBottom: 10 }}>
          {estados.map((e) => (
            <button
              key={e}
              onClick={() => setFiltro(e)}
              style={{
                display: "block",
                marginBottom: 5,
                padding: 8,
                width: "100%",
                background: filtro === e ? "#2563eb" : "#eee",
                color: filtro === e ? "white" : "black",
                border: "none",
                borderRadius: 6,
                cursor: "pointer"
              }}
            >
              {e}
            </button>
          ))}
        </div>

        {filtrados.map((r) => (
          <div key={r.id} className="card">
            {r.foto && (
              <img
                src={r.foto}
                alt="foto"
                style={{
                  width: "100%",
                  maxHeight: 180,
                  objectFit: "cover",
                  borderRadius: 8,
                  marginBottom: 8
                }}
              />
            )}

            <b>{r.nombre}</b>
            <p>Apodo: {r.apodo}</p>
            <p>RUN: {r.run}</p>
            <p>Estado: {r.estado}</p>
            <p>Riesgo: {r.riesgo}</p>

            <button
              className="btn"
              onClick={() => router.push(`/registro/${r.id}`)}
            >
              📚 Ver historial
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
import { useEffect, useState } from "react";
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

export default function Panel() {

  const [data, setData] = useState([]);
  const [filtro, setFiltro] = useState("Todos");

  // 🔄 CARGA INICIAL
  useEffect(() => {
    cargar();

    // ⏱️ LIVE UPDATE CADA 10s
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

  // 🎯 FILTROS
  const filtrados = data.filter((r) => {
    if (filtro === "Todos") return true;
    return r.estado === filtro;
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

      {/* 🗺️ MAPA */}
      <div style={{ flex: 2 }}>
        <MapContainer
          center={[-35.97, -71.68]} // Longaví
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
                  <b>{r.nombre}</b>
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

      {/* 📋 LISTA + FILTROS */}
      <div style={{
        flex: 1,
        padding: 15,
        overflowY: "auto",
        borderLeft: "1px solid #ccc"
      }}>

        <h2>🧭 Panel Operativo</h2>

        {/* FILTROS */}
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

        {/* LISTA */}
        {filtrados.map((r) => (
          <div
            key={r.id}
            style={{
              border: "1px solid #ddd",
              padding: 10,
              marginBottom: 10,
              borderRadius: 8
            }}
          >
            <b>{r.nombre}</b>
            <p>Estado: {r.estado}</p>
            <p>Riesgo: {r.riesgo}</p>
          </div>
        ))}

      </div>
    </div>
  );
}
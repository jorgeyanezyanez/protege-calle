import { useEffect, useState } from "react";

import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline
} from "react-leaflet";

import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { supabase } from "../lib/supabase";

delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
});

export default function MapaHistorial({ registroId, lat, lng }) {
  const [historial, setHistorial] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!registroId) return;
    cargarHistorial();
  }, [registroId]);

  const cargarHistorial = async () => {
    setLoading(true);

    const idNumero = Number(registroId);

    const { data, error } = await supabase
      .from("ubicaciones_historial")
      .select("*")
      .or(`registro_id.eq.${registroId},registro_id.eq.${idNumero}`)
      .order("fecha", { ascending: true });

    if (error) {
      console.log("Error cargando historial:", error);
      alert("Error cargando historial de ubicaciones");
      setHistorial([]);
    } else {
      console.log("Historial encontrado:", data);
      setHistorial(data || []);
    }

    setLoading(false);
  };

  const puntos = historial
    .filter((p) => p.lat && p.lng)
    .map((p) => [Number(p.lat), Number(p.lng)]);

  const centro = [Number(lat), Number(lng)];

  return (
    <div style={{ height: "calc(100vh - 60px)", position: "relative" }}>
      <div
        style={{
          position: "absolute",
          top: 15,
          left: 15,
          zIndex: 1000,
          background: "white",
          padding: 12,
          borderRadius: 14,
          boxShadow: "0 10px 25px rgba(0,0,0,0.2)"
        }}
      >
        <b>🗺️ Historial de ubicaciones</b>
        <p style={{ margin: 0 }}>Registro ID: {registroId}</p>
        <p style={{ margin: 0 }}>Puntos: {historial.length}</p>
        {loading && <p>Cargando...</p>}
      </div>

      <MapContainer
        center={centro}
        zoom={16}
        style={{
          height: "100%",
          width: "100%"
        }}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

        {historial.map((p, index) => (
          <Marker
            key={p.id}
            position={[Number(p.lat), Number(p.lng)]}
          >
            <Popup>
              <b>Ubicación #{index + 1}</b>
              <br />
              Fecha:{" "}
              {new Date(p.fecha).toLocaleString("es-CL", {
                timeZone: "America/Santiago"
              })}
              <br />
              Tipo: {p.tipo}
            </Popup>
          </Marker>
        ))}

        <Marker position={centro}>
          <Popup>📍 Ubicación actual</Popup>
        </Marker>

        {puntos.length > 1 && (
          <Polyline
            positions={puntos}
            pathOptions={{
              color: "red",
              weight: 4
            }}
          />
        )}
      </MapContainer>
    </div>
  );
}
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

export default function MapaCliente({ focusLat, focusLng }) {
  const router = useRouter();
  const [data, setData] = useState([]);

  useEffect(() => {
    cargar();
  }, []);

  const cargar = async () => {
    const { data, error } = await supabase
      .from("registros")
      .select("*")
      .order("id", { ascending: false });

    if (error) {
      console.log(error);
      return;
    }

    setData(data || []);
  };

  const registrosConGPS = data.filter((r) => r.lat && r.lng);

  const center =
    focusLat && focusLng
      ? [Number(focusLat), Number(focusLng)]
      : [-35.97, -71.68];

  const abrirGoogleMaps = (lat, lng) => {
    window.open(
      `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`,
      "_blank"
    );
  };

  return (
    <div style={{ height: "calc(100vh - 60px)", position: "relative" }}>
      <div
        style={{
          position: "absolute",
          top: 15,
          left: 15,
          zIndex: 1000,
          background: "white",
          padding: "12px 15px",
          borderRadius: 16,
          boxShadow: "0 10px 30px rgba(0,0,0,0.15)"
        }}
      >
        <b>🗺️ Mapa territorial</b>
        <p style={{ margin: "5px 0 0" }}>
          Registros con GPS: <b>{registrosConGPS.length}</b>
        </p>
      </div>

      <MapContainer
        center={center}
        zoom={focusLat ? 18 : 13}
        style={{
          height: "100%",
          width: "100%"
        }}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

        {registrosConGPS.map((r) => (
          <Marker
            key={r.id}
            position={[Number(r.lat), Number(r.lng)]}
          >
            <Popup>
              <div style={{ width: 220 }}>
                {r.foto && (
                  <img
                    src={r.foto}
                    alt="Foto"
                    style={{
                      width: "100%",
                      height: 150,
                      objectFit: "cover",
                      borderRadius: 12,
                      marginBottom: 10
                    }}
                  />
                )}

                <h3 style={{ margin: "0 0 6px" }}>
                  {r.nombre || "Sin nombre"}
                </h3>

                <p><b>Apodo:</b> {r.apodo || "Sin dato"}</p>
                <p><b>RUN:</b> {r.run || "Sin dato"}</p>
                <p><b>Estado:</b> {r.estado || "Sin dato"}</p>
                <p><b>Riesgo:</b> {r.riesgo || "Sin dato"}</p>
                <p><b>Sector:</b> {r.sector || "Sin dato"}</p>

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
                    fontWeight: "bold",
                    cursor: "pointer"
                  }}
                >
                  🧭 Google Maps
                </button>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
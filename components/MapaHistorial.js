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
  iconUrl:
    "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",

  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",

  shadowUrl:
    "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
});

export default function MapaHistorial({
  registroId,
  lat,
  lng
}) {

  const [historial, setHistorial] = useState([]);

  useEffect(() => {
    cargarHistorial();
  }, [registroId]);

  const cargarHistorial = async () => {

    const { data } = await supabase
      .from("ubicaciones_historial")
      .select("*")
      .eq("registro_id", registroId)
      .order("fecha", {
        ascending: true
      });

    setHistorial(data || []);
  };

  const puntos = historial.map((p) => [
    Number(p.lat),
    Number(p.lng)
  ]);

  return (

    <div
      style={{
        height: "600px",
        borderRadius: 20,
        overflow: "hidden"
      }}
    >

      <MapContainer
        center={[
          Number(lat),
          Number(lng)
        ]}
        zoom={16}
        style={{
          height: "100%",
          width: "100%"
        }}
      >

        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* HISTORIAL */}
        {historial.map((p) => (

          <Marker
            key={p.id}
            position={[
              Number(p.lat),
              Number(p.lng)
            ]}
          >

            <Popup>

              <div>

                <p>
                  <b>
                    Historial ubicación
                  </b>
                </p>

                <p>
                  {new Date(
                    p.fecha
                  ).toLocaleString(
                    "es-CL",
                    {
                      timeZone:
                        "America/Santiago"
                    }
                  )}
                </p>

                <p>
                  Tipo:
                  {" "}
                  {p.tipo}
                </p>

              </div>

            </Popup>

          </Marker>

        ))}

        {/* UBICACIÓN ACTUAL */}
        <Marker
          position={[
            Number(lat),
            Number(lng)
          ]}
        >

          <Popup>
            📍 Ubicación actual
          </Popup>

        </Marker>

        {/* LÍNEA HISTORIAL */}
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
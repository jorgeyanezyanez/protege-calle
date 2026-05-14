import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

import {
  MapContainer,
  TileLayer,
  Marker,
  Popup
} from "react-leaflet";

import "leaflet/dist/leaflet.css";

import L from "leaflet";

delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconUrl:
    "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",

  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",

  shadowUrl:
    "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
});

export default function MapaCliente({
  focusLat,
  focusLng
}) {

  const [data, setData] = useState([]);

  useEffect(() => {

    const cargar = async () => {

      const { data, error } = await supabase
        .from("registros")
        .select("*");

      if (error) {
        console.log(error);
        return;
      }

      setData(data || []);
    };

    cargar();

  }, []);

  const center =
    focusLat && focusLng
      ? [Number(focusLat), Number(focusLng)]
      : [-35.97, -71.68];

  return (

    <div style={{ height: "100vh" }}>

      <MapContainer
        center={center}
        zoom={focusLat ? 18 : 13}
        style={{
          height: "100%",
          width: "100%"
        }}
      >

        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {data.map((r) =>

          r.lat && r.lng ? (

            <Marker
              key={r.id}
              position={[
                Number(r.lat),
                Number(r.lng)
              ]}
            >

              <Popup>

                {/* 📸 FOTO */}
                {r.foto && (
                  <img
                    src={r.foto}
                    alt="Foto"
                    style={{
                      width: "220px",
                      height: "220px",
                      objectFit: "cover",
                      borderRadius: 10,
                      marginBottom: 10,
                      display: "block"
                    }}
                  />
                )}

                <b>{r.nombre}</b>

                <br />

                RUN: {r.run}

                <br />

                Estado: {r.estado}

                <br />

                Riesgo: {r.riesgo}

                <br />

                Sector: {r.sector}

              </Popup>

            </Marker>

          ) : null

        )}

      </MapContainer>

    </div>
  );
}
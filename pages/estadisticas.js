import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

export default function Estadisticas() {

  const [data, setData] = useState([]);

  useEffect(() => {
    cargar();
  }, []);

  const cargar = async () => {

    const { data } = await supabase
      .from("registros")
      .select("*");

    setData(data || []);
  };

  const total = data.length;

  const enCalle = data.filter(
    (r) => r.estado === "En calle"
  ).length;

  const consumo = data.reduce((acc, r) => {

    const key = r.consumo || "Sin dato";

    acc[key] = (acc[key] || 0) + 1;

    return acc;

  }, {});

  const saludMental = data.reduce((acc, r) => {

    const key = r.saludmental || "Sin dato";

    acc[key] = (acc[key] || 0) + 1;

    return acc;

  }, {});

  const sectores = data.reduce((acc, r) => {

    const key = r.sector || "Sin dato";

    acc[key] = (acc[key] || 0) + 1;

    return acc;

  }, {});

  const sectoresOrdenados =
    Object.entries(sectores)
      .sort((a, b) => b[1] - a[1]);

  return (

    <div className="container">

      <h1>📊 Panel Estadístico</h1>

      <div className="card">

        <h2>Resumen general</h2>

        <p>
          <b>Total registros:</b> {total}
        </p>

        <p>
          <b>Personas en calle:</b> {enCalle}
        </p>

      </div>

      <div className="card">

        <h2>🍺 Consumo</h2>

        {Object.entries(consumo).map(([k, v]) => (

          <p key={k}>
            <b>{k}:</b> {v}
          </p>

        ))}

      </div>

      <div className="card">

        <h2>🧠 Salud mental</h2>

        {Object.entries(saludMental).map(([k, v]) => (

          <p key={k}>
            <b>{k}:</b> {v}
          </p>

        ))}

      </div>

      <div className="card">

        <h2>📍 Sectores críticos</h2>

        {sectoresOrdenados.map(([k, v]) => (

          <p key={k}>
            <b>{k}:</b> {v} registros
          </p>

        ))}

      </div>

    </div>

  );
}
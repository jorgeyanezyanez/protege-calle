import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

export default function Estadisticas() {
  const [data, setData] = useState([]);

  useEffect(() => {
    cargar();
  }, []);

  const cargar = async () => {
    const { data } = await supabase.from("registros").select("*");
    setData(data || []);
  };

  const contar = (campo) => {
    return data.reduce((acc, r) => {
      const key = r[campo] || "Sin dato";
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});
  };

  const ordenar = (obj) =>
    Object.entries(obj).sort((a, b) => b[1] - a[1]);

  const total = data.length;
  const enCalle = data.filter((r) => r.estado === "En calle").length;
  const riesgoAlto = data.filter(
    (r) => r.riesgo === "Alto" || r.riesgo === "Crítico"
  ).length;

  const consumo = ordenar(contar("consumo"));
  const saludMental = ordenar(contar("saludmental"));
  const sectores = ordenar(contar("sector"));

  return (
    <div className="container">
      <div className="card">
        <h1>📊 Panel Estadístico</h1>
        <p>Resumen operativo de registros territoriales.</p>
      </div>

      <div className="grid-btn">
        <div className="card">
          <h2>{total}</h2>
          <p>Total registros</p>
        </div>

        <div className="card">
          <h2>{enCalle}</h2>
          <p>Personas en calle</p>
        </div>

        <div className="card">
          <h2>{riesgoAlto}</h2>
          <p>Riesgo alto/crítico</p>
        </div>
      </div>

      <div className="card">
        <h2>📍 Sectores críticos</h2>

        {sectores.length === 0 && <p>Sin datos.</p>}

        {sectores.map(([sector, cantidad]) => (
          <div key={sector} style={{ marginBottom: 12 }}>
            <p>
              <b>{sector}</b> — {cantidad} registros
            </p>

            <div
              style={{
                height: 10,
                borderRadius: 20,
                background: "#e2e8f0",
                overflow: "hidden"
              }}
            >
              <div
                style={{
                  width: `${total ? (cantidad / total) * 100 : 0}%`,
                  height: "100%",
                  background: "#1d4ed8"
                }}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="grid-btn">
        <div className="card">
          <h2>🍺 Consumo</h2>

          {consumo.map(([tipo, cantidad]) => (
            <p key={tipo}>
              <b>{tipo}:</b> {cantidad}
            </p>
          ))}
        </div>

        <div className="card">
          <h2>🧠 Salud mental</h2>

          {saludMental.map(([tipo, cantidad]) => (
            <p key={tipo}>
              <b>{tipo}:</b> {cantidad}
            </p>
          ))}
        </div>
      </div>
    </div>
  );
}
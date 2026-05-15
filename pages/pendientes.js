import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

export default function Pendientes() {

  const [pendientes, setPendientes] = useState([]);

  useEffect(() => {
    cargarPendientes();
  }, []);

  const cargarPendientes = () => {

    const data = JSON.parse(
      localStorage.getItem("registros_pendientes") || "[]"
    );

    setPendientes(data);
  };

  const sincronizar = async () => {

    if (!navigator.onLine) {
      alert("Sin conexión a internet");
      return;
    }

    if (pendientes.length === 0) {
      alert("No hay registros pendientes");
      return;
    }

    let exitosos = 0;

    for (const registro of pendientes) {

      const { error } = await supabase
        .from("registros")
        .insert([registro]);

      if (!error) {
        exitosos++;
      }
    }

    if (exitosos > 0) {

      localStorage.removeItem("registros_pendientes");

      setPendientes([]);

      alert(`${exitosos} registros sincronizados`);
    }
  };

  return (
    <div className="container">

      <h1>📡 Registros pendientes</h1>

      <button
        className="btn"
        onClick={sincronizar}
        style={{ marginBottom: 20 }}
      >
        🔄 Sincronizar
      </button>

      {pendientes.length === 0 && (
        <p>No hay registros pendientes.</p>
      )}

      {pendientes.map((r, index) => (

        <div
          key={index}
          className="card"
        >

          <h3>{r.nombre}</h3>

          <p>RUN: {r.run}</p>

          <p>Sector: {r.sector}</p>

          <p>Estado: {r.estado}</p>

          <p>Riesgo: {r.riesgo}</p>

          <p>
            Guardado offline:
            {" "}
            {new Date(r.pendiente_fecha)
              .toLocaleString("es-CL")}
          </p>

        </div>

      ))}

    </div>
  );
}
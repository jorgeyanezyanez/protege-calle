import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

export default function Pendientes() {
  const [pendientes, setPendientes] = useState([]);
  const [sincronizando, setSincronizando] = useState(false);

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

    setSincronizando(true);

    let exitosos = 0;

    for (const registro of pendientes) {
      const { error } = await supabase
        .from("registros")
        .insert([registro]);

      if (!error) {
        exitosos++;
      }
    }

    if (exitosos === pendientes.length) {
      localStorage.removeItem("registros_pendientes");
      setPendientes([]);
      alert(`${exitosos} registros sincronizados correctamente`);
    } else {
      alert(`${exitosos} registros sincronizados. Algunos quedaron pendientes.`);
    }

    setSincronizando(false);
  };

  const eliminarPendientes = () => {
    const confirmar = confirm(
      "¿Seguro que deseas eliminar todos los registros pendientes?"
    );

    if (!confirmar) return;

    localStorage.removeItem("registros_pendientes");
    setPendientes([]);
  };

  return (
    <div className="container">
      <div className="card">
        <h1>📡 Pendientes offline</h1>

        <p>
          Registros guardados temporalmente en este dispositivo:
          {" "}
          <b>{pendientes.length}</b>
        </p>

        <div className="grid-btn">
          <button
            className="btn"
            onClick={sincronizar}
            disabled={sincronizando}
          >
            {sincronizando ? "Sincronizando..." : "🔄 Sincronizar"}
          </button>

          <button
            onClick={eliminarPendientes}
            style={{
              background: "#dc2626",
              border: "none",
              padding: "12px 16px",
              borderRadius: 14,
              color: "white",
              cursor: "pointer",
              fontWeight: "bold"
            }}
          >
            🗑️ Eliminar pendientes
          </button>
        </div>
      </div>

      {pendientes.length === 0 && (
        <div className="card">
          <p>No hay registros pendientes.</p>
        </div>
      )}

      {pendientes.map((r, index) => (
        <div key={index} className="card">
          <h2>{r.nombre || "Sin nombre"}</h2>

          <p><b>Apodo:</b> {r.apodo || "Sin dato"}</p>
          <p><b>RUN:</b> {r.run || "Sin dato"}</p>
          <p><b>Sector:</b> {r.sector || "Sin dato"}</p>
          <p><b>Estado:</b> {r.estado || "Sin dato"}</p>
          <p><b>Riesgo:</b> {r.riesgo || "Sin dato"}</p>

          <p>
            <b>Guardado offline:</b>{" "}
            {r.pendiente_fecha
              ? new Date(r.pendiente_fecha).toLocaleString("es-CL")
              : "Sin fecha"}
          </p>
        </div>
      ))}
    </div>
  );
}
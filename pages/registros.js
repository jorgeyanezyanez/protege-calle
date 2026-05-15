import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import Link from "next/link";

export default function Registros() {
  const [registros, setRegistros] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargar();
  }, []);

  const cargar = async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from("registros")
      .select("*")
      .order("id", { ascending: false });

    if (error) {
      console.log(error);
      setRegistros([]);
    } else {
      setRegistros(data || []);
    }

    setLoading(false);
  };

  const filtrados = registros.filter((r) => {
    const t = busqueda.toLowerCase();

    return (
      r.nombre?.toLowerCase().includes(t) ||
      r.apodo?.toLowerCase().includes(t) ||
      r.run?.toLowerCase().includes(t) ||
      r.sector?.toLowerCase().includes(t)
    );
  });

  return (
    <div className="container">
      <div className="card">
        <h1>📋 Registros</h1>
        <p>Total visibles: <b>{filtrados.length}</b></p>

        <input
          placeholder="Buscar por nombre, apodo, RUN o sector"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />
      </div>

      {loading && <p>Cargando...</p>}

      {!loading && filtrados.length === 0 && (
        <div className="card">
          <p>No hay registros encontrados.</p>
        </div>
      )}

      {!loading &&
        filtrados.map((r) => (
          <Link key={r.id} href={`/registro/${r.id}`}>
            <div className="card" style={{ cursor: "pointer" }}>
              <div
                style={{
                  display: "flex",
                  gap: 15,
                  alignItems: "center"
                }}
              >
                {r.foto ? (
                  <img
                    src={r.foto}
                    alt="Foto"
                    style={{
                      width: 85,
                      height: 85,
                      objectFit: "cover",
                      borderRadius: 16,
                      border: "1px solid #ddd"
                    }}
                  />
                ) : (
                  <div
                    style={{
                      width: 85,
                      height: 85,
                      borderRadius: 16,
                      background: "#e2e8f0",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 28
                    }}
                  >
                    👤
                  </div>
                )}

                <div>
                  <h3>{r.nombre || "Sin nombre"}</h3>
                  <p>Apodo: {r.apodo || "Sin dato"}</p>
                  <p>RUN: {r.run || "Sin dato"}</p>
                  <p>Sector: {r.sector || "Sin dato"}</p>
                  <p>
                    Estado: <b>{r.estado || "Sin dato"}</b> | Riesgo:{" "}
                    <b>{r.riesgo || "Sin dato"}</b>
                  </p>
                </div>
              </div>
            </div>
          </Link>
        ))}
    </div>
  );
}
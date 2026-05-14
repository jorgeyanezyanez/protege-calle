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
      r.run?.toLowerCase().includes(t)
    );
  });

  return (
    <div style={{ padding: 20 }}>

      <h1>📋 Registros</h1>

      <input
        placeholder="Buscar por nombre, apodo o RUN"
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
        style={{
          padding: 10,
          width: "100%",
          marginBottom: 15
        }}
      />

      {loading && <p>Cargando...</p>}

      {!loading && filtrados.map((r) => (
        <Link key={r.id} href={`/registro/${r.id}`}>
          <div style={{
            border: "1px solid #ccc",
            padding: 15,
            marginBottom: 10,
            borderRadius: 8,
            cursor: "pointer"
          }}>
            <h3>{r.nombre}</h3>
            <p>RUN: {r.run}</p>
            <p>Estado: {r.estado}</p>
            <p>Riesgo: {r.riesgo}</p>
          </div>
        </Link>
      ))}

    </div>
  );
}
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { supabase } from "../../lib/supabase";

export default function Detalle() {

  const router = useRouter();
  const { id } = router.query;

  const [form, setForm] = useState(null);

  useEffect(() => {
    if (!router.isReady || !id) return;
    cargar();
  }, [router.isReady, id]);

  const cargar = async () => {
    const { data } = await supabase
      .from("registros")
      .select("*")
      .eq("id", id)
      .single();

    setForm(data);
  };

  const handle = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const guardar = async () => {
    await supabase
      .from("registros")
      .update({
        nombre: form.nombre,
        run: form.run,
        sector: form.sector,
        riesgo: form.riesgo,
        estado: form.estado,
        observaciones: form.observaciones
      })
      .eq("id", id);

    alert("Actualizado");
  };

  // 📍 IR AL MAPA
  const verEnMapa = () => {
    router.push(`/mapa?lat=${form.lat}&lng=${form.lng}`);
  };

  if (!form) return <p style={{ padding: 20 }}>Cargando...</p>;

  return (
    <div style={{ padding: 20, maxWidth: 500 }}>

      <h2>📄 Ficha Operativa</h2>

      {/* 📸 FOTO */}
      {form.foto && (
        <img
          src={form.foto}
          alt="Foto"
          style={{
            width: "100%",
            maxWidth: 300,
            borderRadius: 10,
            marginBottom: 15,
            border: "1px solid #ccc"
          }}
        />
      )}

      <input
        name="nombre"
        value={form.nombre || ""}
        onChange={handle}
        placeholder="Nombre"
      />

      <input
        name="run"
        value={form.run || ""}
        onChange={handle}
        placeholder="RUN"
      />

      <input
        name="sector"
        value={form.sector || ""}
        onChange={handle}
        placeholder="Sector"
      />

      <select
        name="estado"
        value={form.estado || ""}
        onChange={handle}
      >
        <option>En calle</option>
        <option>Atendido</option>
        <option>Trasladado</option>
        <option>Derivado a salud</option>
        <option>Sin ubicación</option>
      </select>

      <select
        name="riesgo"
        value={form.riesgo || ""}
        onChange={handle}
      >
        <option>Bajo</option>
        <option>Medio</option>
        <option>Alto</option>
        <option>Crítico</option>
      </select>

      <textarea
        name="observaciones"
        value={form.observaciones || ""}
        onChange={handle}
        placeholder="Observaciones"
        rows={4}
      />

      <p>
        📍 GPS: {form.lat}, {form.lng}
      </p>

      {/* BOTONES */}
      <button
        onClick={guardar}
        style={{
          marginTop: 10,
          padding: 10
        }}
      >
        💾 Guardar
      </button>

      <button
        onClick={verEnMapa}
        style={{
          marginTop: 10,
          marginLeft: 10,
          padding: 10,
          background: "#0ea5e9",
          color: "white",
          border: "none",
          borderRadius: 6
        }}
      >
        🗺️ Ver en mapa
      </button>

    </div>
  );
}
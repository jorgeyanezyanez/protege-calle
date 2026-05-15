import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { supabase } from "../../lib/supabase";

export default function Detalle() {
  const router = useRouter();
  const { id } = router.query;

  const [form, setForm] = useState(null);
  const [intervenciones, setIntervenciones] = useState([]);

  const [nueva, setNueva] = useState({
    accion: "",
    derivacion: "",
    observaciones: ""
  });

  useEffect(() => {
    if (!router.isReady || !id) return;
    cargar();
    cargarIntervenciones();
  }, [router.isReady, id]);

  const cargar = async () => {
    const { data } = await supabase
      .from("registros")
      .select("*")
      .eq("id", id)
      .single();

    setForm(data);
  };

  const cargarIntervenciones = async () => {
    const { data } = await supabase
      .from("intervenciones")
      .select("*")
      .eq("registro_id", id)
      .order("fecha", { ascending: false });

    setIntervenciones(data || []);
  };

  const handle = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleNueva = (e) => {
    setNueva({ ...nueva, [e.target.name]: e.target.value });
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

    alert("Ficha actualizada");
  };

  const guardarIntervencion = async () => {
    const { data: userData } = await supabase.auth.getUser();

    const funcionario =
      userData?.user?.email || "Funcionario no identificado";

    const { error } = await supabase.from("intervenciones").insert([
      {
        registro_id: id,
        funcionario,
        accion: nueva.accion,
        derivacion: nueva.derivacion,
        observaciones: nueva.observaciones
      }
    ]);

    if (error) {
      console.log(error);
      alert("Error al guardar intervención");
      return;
    }

    setNueva({
      accion: "",
      derivacion: "",
      observaciones: ""
    });

    cargarIntervenciones();
    alert("Intervención guardada");
  };

  const verEnMapa = () => {
    router.push(`/mapa?lat=${form.lat}&lng=${form.lng}`);
  };

  if (!form) return <p style={{ padding: 20 }}>Cargando...</p>;

  return (
    <div style={{ padding: 20, maxWidth: 650 }}>

      <h2>📄 Ficha Operativa</h2>

      {form.foto && (
        <img
          src={form.foto}
          alt="Foto"
          style={{
            width: "180px",
            height: "180px",
            objectFit: "cover",
            borderRadius: 10,
            marginBottom: 15,
            border: "1px solid #ccc"
          }}
        />
      )}

      <input name="nombre" value={form.nombre || ""} onChange={handle} />
      <input name="run" value={form.run || ""} onChange={handle} />
      <input name="sector" value={form.sector || ""} onChange={handle} />

      <select name="estado" value={form.estado || ""} onChange={handle}>
        <option value="">Estado</option>
        <option>En calle</option>
        <option>Atendido</option>
        <option>Trasladado</option>
        <option>Derivado a salud</option>
        <option>Sin ubicación</option>
      </select>

      <select name="riesgo" value={form.riesgo || ""} onChange={handle}>
        <option value="">Riesgo</option>
        <option>Bajo</option>
        <option>Medio</option>
        <option>Alto</option>
        <option>Crítico</option>
      </select>

      <textarea
        name="observaciones"
        value={form.observaciones || ""}
        onChange={handle}
        placeholder="Observaciones generales"
        rows={4}
      />

      <p>📍 GPS: {form.lat}, {form.lng}</p>

      <button onClick={guardar} className="btn">
        💾 Guardar ficha
      </button>

      <button
        onClick={verEnMapa}
        style={{
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

      <hr style={{ margin: "25px 0" }} />

      <h2>📝 Nueva intervención</h2>

      <select
        name="accion"
        value={nueva.accion}
        onChange={handleNueva}
      >
        <option value="">Acción realizada</option>
        <option>Contacto en terreno</option>
        <option>Entrega de orientación</option>
        <option>Control preventivo</option>
        <option>Coordinación municipal</option>
        <option>Derivación a salud</option>
        <option>Derivación a albergue</option>
        <option>Rechaza ayuda</option>
        <option>No ubicado</option>
      </select>

      <input
        name="derivacion"
        placeholder="Derivación"
        value={nueva.derivacion}
        onChange={handleNueva}
      />

      <textarea
        name="observaciones"
        placeholder="Observaciones de la intervención"
        value={nueva.observaciones}
        onChange={handleNueva}
        rows={4}
      />

      <button onClick={guardarIntervencion} className="btn">
        ➕ Guardar intervención
      </button>

      <hr style={{ margin: "25px 0" }} />

      <h2>📚 Historial de intervenciones</h2>

      {intervenciones.length === 0 && (
        <p>No hay intervenciones registradas.</p>
      )}

      {intervenciones.map((i) => (
        <div
          key={i.id}
          style={{
            border: "1px solid #ddd",
            padding: 12,
            borderRadius: 8,
            marginBottom: 10,
            background: "#fff"
          }}
        >
          <b>{i.accion}</b>
          <p>
            Fecha:{" "}
            {new Date(i.fecha).toLocaleString("es-CL")}
          </p>
          <p>Funcionario: {i.funcionario}</p>
          <p>Derivación: {i.derivacion}</p>
          <p>Observaciones: {i.observaciones}</p>
        </div>
      ))}

    </div>
  );
}
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { supabase } from "../../lib/supabase";

export default function Detalle() {
  const router = useRouter();
  const { id } = router.query;

  const [form, setForm] = useState(null);
  const [intervenciones, setIntervenciones] = useState([]);
  const [subiendoFoto, setSubiendoFoto] = useState(false);

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
        riesgo: form.riesgo,
        consumo: form.consumo,
        saludmental: form.saludmental,
        aceptaalbergue: form.aceptaalbergue,
        estado: form.estado,
        observaciones: form.observaciones
      })
      .eq("id", id);

    alert("Ficha actualizada");
  };

  const actualizarUbicacion = () => {
    if (!navigator.geolocation) {
      alert("GPS no disponible");
      return;
    }

    navigator.geolocation.getCurrentPosition(async (pos) => {
      const nuevaLat = pos.coords.latitude;
      const nuevaLng = pos.coords.longitude;
      const fechaActual = new Date().toISOString();

      const { error } = await supabase
        .from("registros")
        .update({
          lat: nuevaLat,
          lng: nuevaLng,
          ultima_actualizacion: fechaActual
        })
        .eq("id", id);

      if (error) {
        alert("Error al actualizar ubicación");
        return;
      }

      await supabase.from("ubicaciones_historial").insert([
        {
          registro_id: id,
          lat: nuevaLat,
          lng: nuevaLng,
          fecha: fechaActual,
          tipo: "actualizacion"
        }
      ]);

      setForm({
        ...form,
        lat: nuevaLat,
        lng: nuevaLng,
        ultima_actualizacion: fechaActual
      });

      alert("Ubicación actualizada y guardada en historial");
    });
  };

  const abrirGoogleMaps = () => {
    window.open(
      `https://www.google.com/maps/search/?api=1&query=${form.lat},${form.lng}`,
      "_blank"
    );
  };

  const verHistorialMapa = () => {
    router.push(`/mapa?lat=${form.lat}&lng=${form.lng}&id=${id}`);
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

  if (!form) return <p style={{ padding: 20 }}>Cargando...</p>;

  return (
    <div className="container">
      <div className="card">
        <h1>{form.nombre || "Sin nombre"}</h1>
        <p>Apodo: {form.apodo || "Sin dato"}</p>
        <p>RUN: {form.run || "Sin dato"}</p>
        <p>Estado: <b>{form.estado || "Sin dato"}</b></p>
        <p>Riesgo: <b>{form.riesgo || "Sin dato"}</b></p>

        {form.foto && (
          <img
            src={form.foto}
            alt="Foto"
            style={{
              width: 130,
              height: 130,
              objectFit: "cover",
              borderRadius: 20
            }}
          />
        )}
      </div>

      <div className="card">
        <h2>Acciones rápidas</h2>

        <div className="grid-btn">
          <button className="btn" onClick={guardar}>
            💾 Guardar ficha
          </button>

          <button className="btn" onClick={actualizarUbicacion}>
            📍 Actualizar ubicación
          </button>

          <button className="btn" onClick={verHistorialMapa}>
            🗺️ Ver historial en mapa
          </button>

          <button className="btn" onClick={abrirGoogleMaps}>
            🧭 Google Maps
          </button>

          <button className="btn" onClick={() => window.print()}>
            🖨️ Imprimir / PDF
          </button>
        </div>
      </div>

      <div className="card">
        <h2>⚠️ Situación actual</h2>

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
      </div>

      <div className="card">
        <h2>📝 Nueva intervención</h2>

        <select name="accion" value={nueva.accion} onChange={handleNueva}>
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
          placeholder="Observaciones"
          value={nueva.observaciones}
          onChange={handleNueva}
          rows={4}
        />

        <button className="btn" onClick={guardarIntervencion}>
          ➕ Guardar intervención
        </button>
      </div>

      <div className="card">
        <h2>📚 Historial de intervenciones</h2>

        {intervenciones.length === 0 && (
          <p>No hay intervenciones registradas.</p>
        )}

        {intervenciones.map((i) => (
          <div key={i.id}>
            <h3>{i.accion}</h3>
            <p>
              Fecha:{" "}
              {new Date(i.fecha).toLocaleString("es-CL", {
                timeZone: "America/Santiago"
              })}
            </p>
            <p>Funcionario: {i.funcionario}</p>
            <p>Derivación: {i.derivacion}</p>
            <p>Observaciones: {i.observaciones}</p>
            <hr />
          </div>
        ))}
      </div>
    </div>
  );
}
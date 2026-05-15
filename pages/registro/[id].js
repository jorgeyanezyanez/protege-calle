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
        apodo: form.apodo,
        run: form.run,
        edad: form.edad,
        nacionalidad: form.nacionalidad,
        sexo: form.sexo,
        sector: form.sector,
        referencia: form.referencia,
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

      const { error } = await supabase
        .from("registros")
        .update({
          lat: nuevaLat,
          lng: nuevaLng,
          ultima_actualizacion: new Date().toISOString()
        })
        .eq("id", id);

      if (error) {
        alert("Error al actualizar ubicación");
        return;
      }

      setForm({
        ...form,
        lat: nuevaLat,
        lng: nuevaLng,
        ultima_actualizacion: new Date().toISOString()
      });

      alert("Ubicación actualizada");
    });
  };

  const abrirGoogleMaps = () => {
    window.open(
      `https://www.google.com/maps/search/?api=1&query=${form.lat},${form.lng}`,
      "_blank"
    );
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

  const imprimirFicha = () => {
    window.print();
  };

  if (!form) return <p style={{ padding: 20 }}>Cargando...</p>;

  return (
    <div style={{ padding: 20, maxWidth: 800 }}>

      <style jsx global>{`
        @media print {
          nav,
          .no-print {
            display: none !important;
          }

          body {
            background: white !important;
          }

          .ficha-print {
            border: none !important;
            box-shadow: none !important;
          }
        }
      `}</style>

      <div className="no-print">
        <h2>📄 Ficha Operativa</h2>
      </div>

      <div
        className="ficha-print"
        style={{
          border: "1px solid #ccc",
          borderRadius: 10,
          padding: 20,
          background: "#fff"
        }}
      >
        <h1>Ficha de Registro - Protege Calle</h1>

        {form.foto && (
          <img
            src={form.foto}
            alt="Foto"
            style={{
              width: 160,
              height: 160,
              objectFit: "cover",
              borderRadius: 8,
              border: "1px solid #ccc"
            }}
          />
        )}

        <h2>Identificación</h2>
        <p><b>Nombre:</b> {form.nombre}</p>
        <p><b>Apodo:</b> {form.apodo}</p>
        <p><b>RUN:</b> {form.run}</p>
        <p><b>Edad:</b> {form.edad}</p>
        <p><b>Nacionalidad:</b> {form.nacionalidad}</p>
        <p><b>Sexo:</b> {form.sexo}</p>

        <h2>Ubicación</h2>
        <p><b>Sector:</b> {form.sector}</p>
        <p><b>Referencia:</b> {form.referencia}</p>
        <p><b>Latitud:</b> {form.lat}</p>
        <p><b>Longitud:</b> {form.lng}</p>
        <p>
          <b>Última actualización:</b>{" "}
          {form.ultima_actualizacion
            ? new Date(form.ultima_actualizacion).toLocaleString("es-CL")
            : "Sin información"}
        </p>

        <h2>Situación</h2>
        <p><b>Estado:</b> {form.estado}</p>
        <p><b>Riesgo:</b> {form.riesgo}</p>
        <p><b>Consumo:</b> {form.consumo}</p>
        <p><b>Salud mental:</b> {form.saludmental}</p>
        <p><b>Acepta albergue:</b> {form.aceptaalbergue}</p>

        <h2>Observaciones generales</h2>
        <p>{form.observaciones}</p>

        <h2>Historial de intervenciones</h2>

        {intervenciones.length === 0 && (
          <p>No hay intervenciones registradas.</p>
        )}

        {intervenciones.map((i) => (
          <div
            key={i.id}
            style={{
              borderTop: "1px solid #ddd",
              paddingTop: 10,
              marginTop: 10
            }}
          >
            <p><b>Fecha:</b> {new Date(i.fecha).toLocaleString("es-CL")}</p>
            <p><b>Funcionario:</b> {i.funcionario}</p>
            <p><b>Acción:</b> {i.accion}</p>
            <p><b>Derivación:</b> {i.derivacion}</p>
            <p><b>Observaciones:</b> {i.observaciones}</p>
          </div>
        ))}
      </div>

      <div className="no-print" style={{ marginTop: 20 }}>
        <button onClick={imprimirFicha} className="btn">
          🖨️ Imprimir ficha / Guardar PDF
        </button>

        <button onClick={guardar} className="btn" style={{ marginLeft: 10 }}>
          💾 Guardar ficha
        </button>

        <button
          onClick={actualizarUbicacion}
          style={{
            marginLeft: 10,
            padding: 10,
            background: "#22c55e",
            color: "white",
            border: "none",
            borderRadius: 6
          }}
        >
          📍 Actualizar ubicación
        </button>

        <button
          onClick={abrirGoogleMaps}
          style={{
            marginLeft: 10,
            padding: 10,
            background: "#f59e0b",
            color: "white",
            border: "none",
            borderRadius: 6
          }}
        >
          🧭 Google Maps
        </button>
      </div>

      <hr className="no-print" style={{ margin: "25px 0" }} />

      <div className="no-print">
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
          placeholder="Observaciones de la intervención"
          value={nueva.observaciones}
          onChange={handleNueva}
          rows={4}
        />

        <button onClick={guardarIntervencion} className="btn">
          ➕ Guardar intervención
        </button>
      </div>
    </div>
  );
}
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

    setForm({
      ...form,
      [e.target.name]: e.target.value
    });

  };

  const handleNueva = (e) => {

    setNueva({
      ...nueva,
      [e.target.name]: e.target.value
    });

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

    const { data: userData } =
      await supabase.auth.getUser();

    const funcionario =
      userData?.user?.email ||
      "Funcionario no identificado";

    const { error } = await supabase
      .from("intervenciones")
      .insert([
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

  if (!form)
    return (
      <p style={{ padding: 20 }}>
        Cargando...
      </p>
    );

  return (

    <div className="container">

      <style jsx global>{`
        .only-print {
          display: none;
        }

        @media print {

          nav,
          .no-print {
            display: none !important;
          }

          .only-print {
            display: block !important;
          }

          body {
            background: white !important;
          }

          .card {
            box-shadow: none !important;
            border: 1px solid #ccc !important;
          }
        }
      `}</style>

      {/* CABECERA */}
      <div className="card">

        <div
          style={{
            display: "flex",
            gap: 18,
            alignItems: "center",
            flexWrap: "wrap"
          }}
        >

          {form.foto ? (

            <img
              src={form.foto}
              alt="Foto"
              style={{
                width: 130,
                height: 130,
                objectFit: "cover",
                borderRadius: 24,
                border: "1px solid #ddd"
              }}
            />

          ) : (

            <div
              style={{
                width: 130,
                height: 130,
                borderRadius: 24,
                background: "#e2e8f0",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 45
              }}
            >
              👤
            </div>

          )}

          <div>

            <h1>
              {form.nombre || "Sin nombre"}
            </h1>

            <p>
              Apodo:
              {" "}
              {form.apodo || "Sin dato"}
            </p>

            <p>
              RUN:
              {" "}
              {form.run || "Sin dato"}
            </p>

            <p>
              Estado:
              {" "}
              <b>
                {form.estado || "Sin dato"}
              </b>
            </p>

            <p>
              Riesgo:
              {" "}
              <b>
                {form.riesgo || "Sin dato"}
              </b>
            </p>

          </div>

        </div>

      </div>

      {/* ACCIONES */}
      <div className="no-print card">

        <h2>Acciones rápidas</h2>

        <div className="grid-btn">

          <button
            className="btn"
            onClick={guardar}
          >
            💾 Guardar ficha
          </button>

          <button
            className="btn"
            onClick={() => window.print()}
          >
            🖨️ Imprimir / PDF
          </button>

          <button
            className="btn"
            onClick={actualizarUbicacion}
          >
            📍 Actualizar ubicación
          </button>

          <button
            className="btn"
            onClick={abrirGoogleMaps}
          >
            🧭 Google Maps
          </button>

        </div>

      </div>

      {/* SOLO IMPRESIÓN */}
      <div className="card only-print">

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
          <b>Última actualización:</b>
          {" "}
          {form.ultima_actualizacion
            ? new Date(form.ultima_actualizacion)
                .toLocaleString("es-CL")
            : "Sin información"}
        </p>

      </div>

      {/* SITUACIÓN */}
      <div className="card">

        <h2>⚠️ Situación actual</h2>

        <select
          name="estado"
          value={form.estado || ""}
          onChange={handle}
        >
          <option value="">Estado</option>
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
          <option value="">Riesgo</option>
          <option>Bajo</option>
          <option>Medio</option>
          <option>Alto</option>
          <option>Crítico</option>
        </select>

        <select
          name="consumo"
          value={form.consumo || ""}
          onChange={handle}
        >
          <option value="">Consumo</option>
          <option>No</option>
          <option>Alcohol</option>
          <option>Drogas</option>
          <option>Ambos</option>
        </select>

        <select
          name="saludmental"
          value={form.saludmental || ""}
          onChange={handle}
        >
          <option value="">Salud mental</option>
          <option>Sin diagnóstico</option>
          <option>Sospecha</option>
          <option>Diagnóstico confirmado</option>
          <option>Tratamiento</option>
        </select>

        <select
          name="aceptaalbergue"
          value={form.aceptaalbergue || ""}
          onChange={handle}
        >
          <option value="">
            Acepta albergue
          </option>

          <option>Sí</option>
          <option>No</option>
          <option>Rechaza</option>
          <option>Pendiente</option>

        </select>

        <textarea
          name="observaciones"
          value={form.observaciones || ""}
          onChange={handle}
          placeholder="Observaciones generales"
          rows={4}
        />

      </div>

      {/* NUEVA INTERVENCIÓN */}
      <div className="no-print card">

        <h2>
          📝 Nueva intervención
        </h2>

        <select
          name="accion"
          value={nueva.accion}
          onChange={handleNueva}
        >

          <option value="">
            Acción realizada
          </option>

          <option>
            Contacto en terreno
          </option>

          <option>
            Entrega de orientación
          </option>

          <option>
            Control preventivo
          </option>

          <option>
            Coordinación municipal
          </option>

          <option>
            Derivación a salud
          </option>

          <option>
            Derivación a albergue
          </option>

          <option>
            Rechaza ayuda
          </option>

          <option>
            No ubicado
          </option>

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

        <button
          onClick={guardarIntervencion}
          className="btn"
        >
          ➕ Guardar intervención
        </button>

      </div>

      {/* HISTORIAL */}
      <div className="card">

        <h2>
          📚 Historial de intervenciones
        </h2>

        {intervenciones.length === 0 && (

          <p>
            No hay intervenciones registradas.
          </p>

        )}

        {intervenciones.map((i) => (

          <div
            key={i.id}
            style={{
              borderTop: "1px solid #ddd",
              paddingTop: 12,
              marginTop: 12
            }}
          >

            <h3>
              {i.accion}
            </h3>

            <p>
              Fecha:
              {" "}
              {new Date(i.fecha)
                .toLocaleString("es-CL")}
            </p>

            <p>
              Funcionario:
              {" "}
              {i.funcionario}
            </p>

            <p>
              Derivación:
              {" "}
              {i.derivacion}
            </p>

            <p>
              Observaciones:
              {" "}
              {i.observaciones}
            </p>

          </div>

        ))}

      </div>

    </div>

  );
}
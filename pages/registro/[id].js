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
      .order("fecha", {
        ascending: false
      });

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
        estado: form.estado,
        riesgo: form.riesgo,
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

      const fechaActual =
        new Date().toISOString();

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

      await supabase
        .from("ubicaciones_historial")
        .insert([
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

      alert(
        "Ubicación actualizada"
      );

    });

  };

  const abrirGoogleMaps = () => {

    window.open(
      `https://www.google.com/maps/search/?api=1&query=${form.lat},${form.lng}`,
      "_blank"
    );

  };

  const verHistorialMapa = () => {

    router.push(
      `/mapa?lat=${form.lat}&lng=${form.lng}&id=${id}`
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
      alert(
        "Error al guardar intervención"
      );
      return;
    }

    setNueva({
      accion: "",
      derivacion: "",
      observaciones: ""
    });

    cargarIntervenciones();

    alert(
      "Intervención guardada"
    );

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

        {form.foto && (

          <img
            src={form.foto}
            alt="Foto"
            style={{
              width: 140,
              height: 140,
              objectFit: "cover",
              borderRadius: 20
            }}
          />

        )}

      </div>

      {/* ACCIONES */}
      <div className="card no-print">

        <h2>
          Acciones rápidas
        </h2>

        <div className="grid-btn">

          <button
            className="btn"
            onClick={guardar}
          >
            💾 Guardar ficha
          </button>

          <button
            className="btn"
            onClick={actualizarUbicacion}
          >
            📍 Actualizar ubicación
          </button>

          <button
            className="btn"
            onClick={verHistorialMapa}
          >
            🗺️ Historial mapa
          </button>

          <button
            className="btn"
            onClick={abrirGoogleMaps}
          >
            🧭 Google Maps
          </button>

          <button
            className="btn"
            onClick={() => window.print()}
          >
            🖨️ Imprimir / PDF
          </button>

        </div>

      </div>

      {/* SOLO IMPRESIÓN */}
      <div className="card only-print">

        <h1>
          FICHA TERRITORIAL
        </h1>

        <hr />

        <h2>
          Identificación
        </h2>

        <p><b>Nombre:</b> {form.nombre}</p>
        <p><b>Apodo:</b> {form.apodo}</p>
        <p><b>RUN:</b> {form.run}</p>
        <p><b>Edad:</b> {form.edad}</p>
        <p><b>Sexo:</b> {form.sexo}</p>
        <p><b>Nacionalidad:</b> {form.nacionalidad}</p>

        <hr />

        <h2>
          Ubicación
        </h2>

        <p><b>Sector:</b> {form.sector}</p>
        <p><b>Referencia:</b> {form.referencia}</p>

        <p>
          <b>Latitud:</b>
          {" "}
          {form.lat}
        </p>

        <p>
          <b>Longitud:</b>
          {" "}
          {form.lng}
        </p>

        <p>
          <b>Última actualización:</b>
          {" "}

          {form.ultima_actualizacion
            ? new Date(
                form.ultima_actualizacion
              ).toLocaleString(
                "es-CL",
                {
                  timeZone:
                    "America/Santiago"
                }
              )
            : "Sin información"}

        </p>

        <hr />

        <h2>
          Situación actual
        </h2>

        <p><b>Estado:</b> {form.estado}</p>
        <p><b>Riesgo:</b> {form.riesgo}</p>
        <p><b>Observaciones:</b></p>

        <p>
          {form.observaciones}
        </p>

        <hr />

        <h2>
          Historial intervenciones
        </h2>

        {intervenciones.length === 0 && (

          <p>
            No existen intervenciones registradas.
          </p>

        )}

        {intervenciones.map((i) => (

          <div
            key={i.id}
            style={{
              marginBottom: 20,
              paddingBottom: 10,
              borderBottom:
                "1px solid #ccc"
            }}
          >

            <p>
              <b>Fecha:</b>
              {" "}

              {new Date(i.fecha)
                .toLocaleString(
                  "es-CL",
                  {
                    timeZone:
                      "America/Santiago"
                  }
                )}

            </p>

            <p>
              <b>Funcionario:</b>
              {" "}
              {i.funcionario}
            </p>

            <p>
              <b>Acción:</b>
              {" "}
              {i.accion}
            </p>

            <p>
              <b>Derivación:</b>
              {" "}
              {i.derivacion}
            </p>

            <p>
              <b>Observaciones:</b>
              {" "}
              {i.observaciones}
            </p>

          </div>

        ))}

      </div>

      {/* SITUACIÓN */}
      <div className="card">

        <h2>
          ⚠️ Situación actual
        </h2>

        <select
          name="estado"
          value={form.estado || ""}
          onChange={handle}
        >
          <option value="">
            Estado
          </option>

          <option>
            En calle
          </option>

          <option>
            Atendido
          </option>

          <option>
            Trasladado
          </option>

          <option>
            Derivado a salud
          </option>

          <option>
            Sin ubicación
          </option>

        </select>

        <select
          name="riesgo"
          value={form.riesgo || ""}
          onChange={handle}
        >
          <option value="">
            Riesgo
          </option>

          <option>
            Bajo
          </option>

          <option>
            Medio
          </option>

          <option>
            Alto
          </option>

          <option>
            Crítico
          </option>

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
      <div className="card">

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
          className="btn"
          onClick={guardarIntervencion}
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

          <div key={i.id}>

            <h3>
              {i.accion}
            </h3>

            <p>
              Fecha:
              {" "}

              {new Date(i.fecha)
                .toLocaleString(
                  "es-CL",
                  {
                    timeZone:
                      "America/Santiago"
                  }
                )}

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

            <hr />

          </div>

        ))}

      </div>

    </div>

  );
}
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { supabase } from "../../lib/supabase";

export default function Detalle() {

  const router = useRouter();
  const { id } = router.query;

  const [form, setForm] = useState(null);

  const [intervenciones, setIntervenciones] =
    useState([]);

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
        consumo: form.consumo,
        saludmental: form.saludmental,
        aceptaalbergue:
          form.aceptaalbergue,
        observaciones:
          form.observaciones
      })
      .eq("id", id);

    alert("Ficha actualizada");

  };

  // =====================================
  // IMPRIMIR FICHA
  // =====================================
  const imprimirFicha = () => {

    const historial = intervenciones
      .map((i) => `
        <div style="border-bottom:1px solid #ccc; margin-bottom:12px; padding-bottom:10px;">
          
          <p>
            <b>Fecha:</b>
            ${new Date(i.fecha)
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
            ${i.funcionario || ""}
          </p>

          <p>
            <b>Acción:</b>
            ${i.accion || ""}
          </p>

          <p>
            <b>Derivación:</b>
            ${i.derivacion || ""}
          </p>

          <p>
            <b>Observaciones:</b>
            ${i.observaciones || ""}
          </p>

        </div>
      `)
      .join("");

    const ventana =
      window.open("", "_blank");

    ventana.document.write(`
      <html>

        <head>

          <title>
            Ficha Territorial
          </title>

          <style>

            body {
              font-family: Arial;
              padding: 25px;
              color: #111827;
            }

            img {
              width: 180px;
              height: 180px;
              object-fit: cover;
              border-radius: 14px;
              border: 1px solid #ccc;
              margin-bottom: 20px;
            }

            h1 {
              color: #0f172a;
            }

            h2 {
              margin-top: 30px;
              color: #1e293b;
            }

            p {
              margin: 6px 0;
              font-size: 14px;
            }

            hr {
              margin: 20px 0;
            }

          </style>

        </head>

        <body>

          <h1>
            FICHA TERRITORIAL
          </h1>

          ${
            form.foto
              ? `<img src="${form.foto}" />`
              : ""
          }

          <hr />

          <h2>
            Identificación
          </h2>

          <p>
            <b>Nombre:</b>
            ${form.nombre || ""}
          </p>

          <p>
            <b>Apodo:</b>
            ${form.apodo || ""}
          </p>

          <p>
            <b>RUN:</b>
            ${form.run || ""}
          </p>

          <p>
            <b>Edad:</b>
            ${form.edad || ""}
          </p>

          <p>
            <b>Sexo:</b>
            ${form.sexo || ""}
          </p>

          <p>
            <b>Nacionalidad:</b>
            ${form.nacionalidad || ""}
          </p>

          <hr />

          <h2>
            Ubicación
          </h2>

          <p>
            <b>Sector:</b>
            ${form.sector || ""}
          </p>

          <p>
            <b>Referencia:</b>
            ${form.referencia || ""}
          </p>

          <p>
            <b>Latitud:</b>
            ${form.lat || ""}
          </p>

          <p>
            <b>Longitud:</b>
            ${form.lng || ""}
          </p>

          <p>
            <b>Última actualización:</b>

            ${
              form.ultima_actualizacion
                ? new Date(
                    form.ultima_actualizacion
                  ).toLocaleString(
                    "es-CL",
                    {
                      timeZone:
                        "America/Santiago"
                    }
                  )
                : "Sin información"
            }

          </p>

          <hr />

          <h2>
            Situación actual
          </h2>

          <p>
            <b>Estado:</b>
            ${form.estado || ""}
          </p>

          <p>
            <b>Riesgo:</b>
            ${form.riesgo || ""}
          </p>

          <p>
            <b>Consumo:</b>
            ${form.consumo || ""}
          </p>

          <p>
            <b>Salud mental:</b>
            ${form.saludmental || ""}
          </p>

          <p>
            <b>Acepta albergue:</b>
            ${form.aceptaalbergue || ""}
          </p>

          <p>
            <b>Observaciones:</b>
            ${form.observaciones || ""}
          </p>

          <hr />

          <h2>
            Historial intervenciones
          </h2>

          ${
            historial ||
            "<p>No existen intervenciones registradas.</p>"
          }

        </body>

      </html>
    `);

    ventana.document.close();

    ventana.focus();

    ventana.print();

  };

  // =====================================
  // ACTUALIZAR UBICACIÓN
  // =====================================
  const actualizarUbicacion = () => {

    if (!navigator.geolocation) {

      alert("GPS no disponible");
      return;

    }

    navigator.geolocation.getCurrentPosition(async (pos) => {

      const latAnterior = form.lat;
      const lngAnterior = form.lng;

      const nuevaLat =
        pos.coords.latitude;

      const nuevaLng =
        pos.coords.longitude;

      const fechaActual =
        new Date().toISOString();

      if (latAnterior && lngAnterior) {

        await supabase
          .from(
            "ubicaciones_historial"
          )
          .insert([
            {
              registro_id: id,
              lat: latAnterior,
              lng: lngAnterior,
              fecha: fechaActual,
              tipo:
                "ubicacion_anterior"
            }
          ]);

      }

      await supabase
        .from("registros")
        .update({
          lat: nuevaLat,
          lng: nuevaLng,
          ultima_actualizacion:
            fechaActual
        })
        .eq("id", id);

      await supabase
        .from(
          "ubicaciones_historial"
        )
        .insert([
          {
            registro_id: id,
            lat: nuevaLat,
            lng: nuevaLng,
            fecha: fechaActual,
            tipo:
              "nueva_ubicacion"
          }
        ]);

      setForm({
        ...form,
        lat: nuevaLat,
        lng: nuevaLng,
        ultima_actualizacion:
          fechaActual
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

    const {
      data: userData
    } = await supabase.auth.getUser();

    const funcionario =
      userData?.user?.email ||
      "Funcionario";

    await supabase
      .from("intervenciones")
      .insert([
        {
          registro_id: id,
          funcionario,
          accion: nueva.accion,
          derivacion:
            nueva.derivacion,
          observaciones:
            nueva.observaciones
        }
      ]);

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

      {/* CABECERA */}
      <div className="card">

        <h1>
          {form.nombre ||
            "Sin nombre"}
        </h1>

        <p>
          Apodo:
          {" "}
          {form.apodo}
        </p>

        <p>
          RUN:
          {" "}
          {form.run}
        </p>

        <p>
          Estado:
          {" "}
          <b>
            {form.estado}
          </b>
        </p>

        <p>
          Riesgo:
          {" "}
          <b>
            {form.riesgo}
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
      <div className="card">

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
            onClick={
              actualizarUbicacion
            }
          >
            📍 Actualizar ubicación
          </button>

          <button
            className="btn"
            onClick={
              verHistorialMapa
            }
          >
            🗺️ Historial mapa
          </button>

          <button
            className="btn"
            onClick={
              abrirGoogleMaps
            }
          >
            🧭 Google Maps
          </button>

          <button
            className="btn"
            onClick={imprimirFicha}
          >
            🖨️ Imprimir ficha
          </button>

        </div>

      </div>

      {/* SITUACIÓN */}
      <div className="card">

        <h2>
          Situación actual
        </h2>

        <select
          name="estado"
          value={form.estado || ""}
          onChange={handle}
        >

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
          name="consumo"
          value={
            form.consumo || ""
          }
          onChange={handle}
          placeholder="Consumo"
          rows={2}
        />

        <textarea
          name="saludmental"
          value={
            form.saludmental || ""
          }
          onChange={handle}
          placeholder="Salud mental"
          rows={2}
        />

        <textarea
          name="aceptaalbergue"
          value={
            form.aceptaalbergue ||
            ""
          }
          onChange={handle}
          placeholder="Acepta albergue"
          rows={2}
        />

        <textarea
          name="observaciones"
          value={
            form.observaciones ||
            ""
          }
          onChange={handle}
          placeholder="Observaciones"
          rows={4}
        />

      </div>

      {/* INTERVENCIÓN */}
      <div className="card">

        <h2>
          Nueva intervención
        </h2>

        <input
          name="accion"
          placeholder="Acción"
          value={nueva.accion}
          onChange={handleNueva}
        />

        <input
          name="derivacion"
          placeholder="Derivación"
          value={
            nueva.derivacion
          }
          onChange={handleNueva}
        />

        <textarea
          name="observaciones"
          placeholder="Observaciones"
          value={
            nueva.observaciones
          }
          onChange={handleNueva}
          rows={4}
        />

        <button
          className="btn"
          onClick={
            guardarIntervencion
          }
        >
          ➕ Guardar intervención
        </button>

      </div>

      {/* HISTORIAL */}
      <div className="card">

        <h2>
          Historial intervenciones
        </h2>

        {intervenciones.length ===
          0 && (
          <p>
            No hay intervenciones.
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

              {new Date(
                i.fecha
              ).toLocaleString(
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
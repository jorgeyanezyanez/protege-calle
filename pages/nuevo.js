import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";

export default function Nuevo() {

  const [guardando, setGuardando] = useState(false);

  const [form, setForm] = useState({
    nombre: "",
    apodo: "",
    run: "",
    edad: "",
    nacionalidad: "",
    sexo: "",
    lat: "",
    lng: "",
    sector: "",
    referencia: "",
    riesgo: "",
    consumo: "",
    saludmental: "",
    aceptaalbergue: "",
    estado: "",
    observaciones: "",
    foto: ""
  });

  const [file, setFile] = useState(null);

  useEffect(() => {

    if ("geolocation" in navigator) {

      navigator.geolocation.getCurrentPosition((pos) => {

        setForm((f) => ({
          ...f,
          lat: pos.coords.latitude,
          lng: pos.coords.longitude
        }));

      });

    }

  }, []);

  const handleChange = (e) => {

    setForm({
      ...form,
      [e.target.name]: e.target.value
    });

  };

  const subirFoto = async () => {

    if (!file) return "";

    const fileName = `${Date.now()}-${file.name}`;

    const { error } = await supabase
      .storage
      .from("fotos")
      .upload(fileName, file, { upsert: true });

    if (error) {

      console.log("Error al subir foto:", error);

      return "";
    }

    const { data: urlData } = supabase
      .storage
      .from("fotos")
      .getPublicUrl(fileName);

    return urlData.publicUrl;
  };

  const limpiarFormulario = () => {

    setForm({
      nombre: "",
      apodo: "",
      run: "",
      edad: "",
      nacionalidad: "",
      sexo: "",
      lat: "",
      lng: "",
      sector: "",
      referencia: "",
      riesgo: "",
      consumo: "",
      saludmental: "",
      aceptaalbergue: "",
      estado: "",
      observaciones: "",
      foto: ""
    });

    setFile(null);
  };

  const guardarOffline = (fotoUrl = "") => {

    const pendientes = JSON.parse(
      localStorage.getItem("registros_pendientes") || "[]"
    );

    pendientes.push({
      ...form,
      foto: fotoUrl,
      pendiente_fecha: new Date().toISOString()
    });

    localStorage.setItem(
      "registros_pendientes",
      JSON.stringify(pendientes)
    );

    alert(
      "Sin conexión. Registro guardado temporalmente en el celular."
    );

    limpiarFormulario();
  };

  const guardar = async (e) => {

    e.preventDefault();

    if (guardando) return;

    setGuardando(true);

    try {

      if (!navigator.onLine) {

        guardarOffline("");

        return;
      }

      let fotoUrl = "";

      if (file) {

        fotoUrl = await subirFoto();

      }

      const { error } = await supabase
        .from("registros")
        .insert([
          {
            ...form,
            foto: fotoUrl
          }
        ]);

      if (error) {

        console.log(
          "Error al guardar registro:",
          error
        );

        guardarOffline(fotoUrl);

        return;
      }

      alert("Registro guardado correctamente");

      limpiarFormulario();

    } finally {

      setGuardando(false);

    }

  };

  return (

    <div className="container">

      <h1>➕ Nuevo Registro</h1>

      <form
        className="card"
        onSubmit={guardar}
      >

        <label>Foto de la persona</label>

        <input
          type="file"
          accept="image/*"
          capture="environment"
          onChange={(e) => {

            const original = e.target.files[0];

            if (!original) return;

            const img =
              document.createElement("img");

            const reader = new FileReader();

            reader.readAsDataURL(original);

            reader.onload = (event) => {

              img.src = event.target.result;

            };

            img.onload = () => {

              const MAX_WIDTH = 120;

              let width = img.width;
              let height = img.height;

              if (width > MAX_WIDTH) {

                height =
                  height *
                  (MAX_WIDTH / width);

                width = MAX_WIDTH;
              }

              const canvas =
                document.createElement("canvas");

              canvas.width = width;
              canvas.height = height;

              const ctx =
                canvas.getContext("2d");

              ctx.drawImage(
                img,
                0,
                0,
                width,
                height
              );

              canvas.toBlob(
                (blob) => {

                  const compressedFile =
                    new File(
                      [blob],
                      `${Date.now()}.jpg`,
                      {
                        type: "image/jpeg"
                      }
                    );

                  setFile(compressedFile);

                },
                "image/jpeg",
                0.2
              );

            };

          }}
        />

        <input
          name="nombre"
          placeholder="Nombre"
          value={form.nombre}
          onChange={handleChange}
        />

        <input
          name="apodo"
          placeholder="Apodo"
          value={form.apodo}
          onChange={handleChange}
        />

        <input
          name="run"
          placeholder="RUN"
          value={form.run}
          onChange={handleChange}
        />

        <input
          name="edad"
          placeholder="Edad"
          value={form.edad}
          onChange={handleChange}
        />

        <input
          name="nacionalidad"
          placeholder="Nacionalidad"
          value={form.nacionalidad}
          onChange={handleChange}
        />

        <select
          name="sexo"
          value={form.sexo}
          onChange={handleChange}
        >
          <option value="">Sexo</option>

          <option value="Hombre">
            Hombre
          </option>

          <option value="Mujer">
            Mujer
          </option>

          <option value="No binario">
            No binario
          </option>

          <option value="No responde">
            No responde
          </option>

        </select>

        <input
          name="lat"
          placeholder="Latitud"
          value={form.lat || ""}
          readOnly
        />

        <input
          name="lng"
          placeholder="Longitud"
          value={form.lng || ""}
          readOnly
        />

        <input
          name="sector"
          placeholder="Sector"
          value={form.sector}
          onChange={handleChange}
        />

        <input
          name="referencia"
          placeholder="Referencia"
          value={form.referencia}
          onChange={handleChange}
        />

        <select
          name="riesgo"
          value={form.riesgo}
          onChange={handleChange}
        >

          <option value="">Riesgo</option>

          <option value="Bajo">
            Bajo
          </option>

          <option value="Medio">
            Medio
          </option>

          <option value="Alto">
            Alto
          </option>

          <option value="Crítico">
            Crítico
          </option>

        </select>

        <select
          name="consumo"
          value={form.consumo}
          onChange={handleChange}
        >

          <option value="">Consumo</option>

          <option value="No">
            No
          </option>

          <option value="Alcohol">
            Alcohol
          </option>

          <option value="Drogas">
            Drogas
          </option>

          <option value="Ambos">
            Ambos
          </option>

        </select>

        <select
          name="saludmental"
          value={form.saludmental}
          onChange={handleChange}
        >

          <option value="">
            Salud mental
          </option>

          <option value="Sin diagnóstico">
            Sin diagnóstico
          </option>

          <option value="Sospecha">
            Sospecha
          </option>

          <option value="Diagnóstico confirmado">
            Diagnóstico confirmado
          </option>

          <option value="Tratamiento">
            Tratamiento
          </option>

        </select>

        <select
          name="aceptaalbergue"
          value={form.aceptaalbergue}
          onChange={handleChange}
        >

          <option value="">
            Acepta albergue
          </option>

          <option value="Sí">
            Sí
          </option>

          <option value="No">
            No
          </option>

          <option value="Rechaza">
            Rechaza
          </option>

          <option value="Pendiente">
            Pendiente
          </option>

        </select>

        <select
          name="estado"
          value={form.estado}
          onChange={handleChange}
        >

          <option value="">Estado</option>

          <option value="En calle">
            En calle
          </option>

          <option value="Atendido">
            Atendido
          </option>

          <option value="Trasladado">
            Trasladado
          </option>

          <option value="Derivado a salud">
            Derivado a salud
          </option>

          <option value="Sin ubicación">
            Sin ubicación
          </option>

        </select>

        <textarea
          name="observaciones"
          placeholder="Observaciones"
          value={form.observaciones}
          onChange={handleChange}
          rows={4}
        />

        <button
          className="btn"
          type="submit"
          disabled={guardando}
        >
          {guardando
            ? "Guardando..."
            : "Guardar Registro"}
        </button>

      </form>

    </div>

  );
}
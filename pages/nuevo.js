import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";

export default function Nuevo() {

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

  // 📍 GPS AUTOMÁTICO
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

  // 📸 SUBIR FOTO
  const subirFoto = async () => {

    if (!file) return null;

    const fileName = `${Date.now()}-${file.name}`;

    const { error } = await supabase
      .storage
      .from("fotos")
      .upload(fileName, file, {
        upsert: true
      });

    if (error) {

      console.log("Error al subir foto:", error);

      alert("Error al subir foto");

      return null;
    }

    const { data: urlData } = supabase
      .storage
      .from("fotos")
      .getPublicUrl(fileName);

    return urlData.publicUrl;
  };

  // 💾 GUARDAR REGISTRO
  const guardar = async (e) => {

    e.preventDefault();

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

      console.log("Error al guardar registro:", error);

      alert("Error al guardar registro");

      return;
    }

    alert("Registro guardado correctamente");

    // 🧹 LIMPIAR FORMULARIO
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

  return (

    <div className="container">

      <h1>➕ Nuevo Registro</h1>

      <form className="card" onSubmit={guardar}>

        {/* 📸 FOTO */}
        <label>Foto de la persona</label>

        <input
          type="file"
          accept="image/*"
          capture="environment"
          onChange={(e) => {

            const original = e.target.files[0];

            if (!original) return;

            const img = document.createElement("img");

            const reader = new FileReader();

            reader.readAsDataURL(original);

            reader.onload = (event) => {
              img.src = event.target.result;
            };

            img.onload = () => {

              // 📏 FOTO TIPO CARNET
              const MAX_WIDTH = 300;

              let width = img.width;
              let height = img.height;

              if (width > MAX_WIDTH) {

                height = height * (MAX_WIDTH / width);

                width = MAX_WIDTH;
              }

              const canvas = document.createElement("canvas");

              canvas.width = width;
              canvas.height = height;

              const ctx = canvas.getContext("2d");

              ctx.drawImage(img, 0, 0, width, height);

              // 🗜️ COMPRESIÓN FUERTE
              canvas.toBlob(
                (blob) => {

                  const compressedFile = new File(
                    [blob],
                    `${Date.now()}.jpg`,
                    {
                      type: "image/jpeg"
                    }
                  );

                  setFile(compressedFile);

                  console.log(
                    "Foto comprimida:",
                    Math.round(compressedFile.size / 1024),
                    "KB"
                  );

                },
                "image/jpeg",
                0.4
              );
            };
          }}
        />

        {/* IDENTIFICACIÓN */}
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

        {/* SEXO */}
        <select
          name="sexo"
          value={form.sexo}
          onChange={handleChange}
        >
          <option value="">Sexo</option>
          <option value="Hombre">Hombre</option>
          <option value="Mujer">Mujer</option>
          <option value="No binario">No binario</option>
          <option value="No responde">No responde</option>
        </select>

        {/* UBICACIÓN */}
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

        {/* RIESGO */}
        <select
          name="riesgo"
          value={form.riesgo}
          onChange={handleChange}
        >
          <option value="">Riesgo</option>
          <option value="Bajo">Bajo</option>
          <option value="Medio">Medio</option>
          <option value="Alto">Alto</option>
          <option value="Crítico">Crítico</option>
        </select>

        {/* OBSERVACIONES */}
        <textarea
          name="observaciones"
          placeholder="Observaciones"
          value={form.observaciones}
          onChange={handleChange}
          rows={4}
        />

        <button className="btn" type="submit">
          Guardar Registro
        </button>

      </form>

    </div>
  );
}
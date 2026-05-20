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

  {/* ========================================= */}
  {/* CABECERA */}
  {/* ========================================= */}
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

  {/* ========================================= */}
  {/* SOLO IMPRESIÓN */}
  {/* ========================================= */}
  <div className="card only-print">

    <h1>
      FICHA TERRITORIAL
    </h1>

    <hr />

    {/* FOTO */}
    {form.foto && (

      <div
        style={{
          marginBottom: 20
        }}
      >

        <img
          src={form.foto}
          alt="Foto"
          style={{
            width: 180,
            height: 180,
            objectFit: "cover",
            borderRadius: 20,
            border: "1px solid #ccc"
          }}
        />

      </div>

    )}

    {/* IDENTIFICACIÓN */}
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

    {/* UBICACIÓN */}
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

    {/* SITUACIÓN */}
    <h2>
      Situación actual
    </h2>

    <p>
      <b>Estado:</b>
      {" "}
      {form.estado}
    </p>

    <p>
      <b>Riesgo:</b>
      {" "}
      {form.riesgo}
    </p>

    <p>
      <b>Consumo:</b>
      {" "}
      {form.consumo}
    </p>

    <p>
      <b>Salud mental:</b>
      {" "}
      {form.saludmental}
    </p>

    <p>
      <b>Acepta albergue:</b>
      {" "}
      {form.aceptaalbergue}
    </p>

    <p>
      <b>Observaciones:</b>
    </p>

    <p>
      {form.observaciones}
    </p>

    <hr />

    {/* HISTORIAL */}
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

</div>
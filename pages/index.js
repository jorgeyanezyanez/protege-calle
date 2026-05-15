import Link from "next/link";

export default function Home() {
  return (
    <div className="container">

      <div className="card" style={{ textAlign: "center" }}>
        <img
          src="/logo.png"
          alt="Protege Calle"
          style={{
            width: 95,
            height: 95,
            objectFit: "cover",
            borderRadius: 22,
            marginBottom: 10
          }}
        />

        <h1>Protege Calle</h1>

        <p>
          Registro y seguimiento territorial de personas en situación de calle.
        </p>
      </div>

      <h2>Acciones principales</h2>

      <div className="grid-btn">
        <Link href="/nuevo">
          <button className="btn">➕ Nuevo registro</button>
        </Link>

        <Link href="/registros">
          <button className="btn">🔎 Buscar persona</button>
        </Link>

        <Link href="/panel">
          <button className="btn">🧭 Panel operativo</button>
        </Link>
      </div>

      <h2 style={{ marginTop: 25 }}>Herramientas</h2>

      <div className="grid-btn">
        <Link href="/mapa">
          <button className="btn">🗺️ Mapa</button>
        </Link>

        <Link href="/estadisticas">
          <button className="btn">📊 Estadísticas</button>
        </Link>

        <Link href="/pendientes">
          <button className="btn">📡 Pendientes</button>
        </Link>
      </div>

    </div>
  );
}
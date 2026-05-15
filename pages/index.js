import Link from "next/link";

export default function Home() {
  return (
    <div className="container">
      <div className="card" style={{ textAlign: "center" }}>
        <img
          src="/logo.png"
          alt="Protege Calle"
          style={{
            width: 120,
            height: 120,
            objectFit: "cover",
            borderRadius: 24,
            marginBottom: 15
          }}
        />

        <h1>Protege Calle</h1>

        <p>
          Sistema territorial para registro, seguimiento y apoyo a personas en situación de calle.
        </p>
      </div>

      <div className="grid-btn">
        <Link href="/nuevo">
          <button className="btn">➕ Nuevo registro</button>
        </Link>

        <Link href="/registros">
          <button className="btn">📋 Registros</button>
        </Link>

        <Link href="/mapa">
          <button className="btn">🗺️ Mapa territorial</button>
        </Link>

        <Link href="/panel">
          <button className="btn">🧭 Panel operativo</button>
        </Link>

        <Link href="/estadisticas">
          <button className="btn">📊 Estadísticas</button>
        </Link>

        <Link href="/pendientes">
          <button className="btn">📡 Pendientes offline</button>
        </Link>
      </div>
    </div>
  );
}
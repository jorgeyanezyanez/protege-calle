import Link from "next/link";

export default function Home() {
  return (
    <div className="container">

      <h1>🧭 Protege Calle</h1>

      <p style={{ color: "#64748b" }}>
        Sistema de registro territorial
      </p>

      <div className="grid-btn">

        <Link href="/nuevo">
          <button className="btn">➕ Nuevo Registro</button>
        </Link>

        <Link href="/registros">
          <button className="btn">📋 Ver Registros</button>
        </Link>

        <Link href="/mapa">
          <button className="btn">🗺️ Mapa</button>
        </Link>

      </div>

    </div>
  );
}
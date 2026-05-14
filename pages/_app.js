import Link from "next/link";
import "../styles/globals.css";

export default function App({ Component, pageProps }) {
  return (
    <>
      <nav style={{
        display: "flex",
        gap: 15,
        padding: 15,
        background: "#111",
        color: "white"
      }}>
        <Link href="/">Inicio</Link>
        <Link href="/registros">Registros</Link>
      </nav>

      <Component {...pageProps} />
    </>
  );
}
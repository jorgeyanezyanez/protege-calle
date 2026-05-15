import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";

import { supabase } from "../lib/supabase";

import "../styles/globals.css";

export default function App({ Component, pageProps }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    verificar();

    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange(() => {
      verificar();
    });

    return () => subscription.unsubscribe();
  }, []);

  const verificar = async () => {
    const {
      data: { session }
    } = await supabase.auth.getSession();

    if (!session && router.pathname !== "/login") {
      setLoading(false);
      router.push("/login");
      return;
    }

    if (session && router.pathname === "/login") {
      setLoading(false);
      router.push("/");
      return;
    }

    setLoading(false);
  };

  const cerrarSesion = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  if (router.pathname === "/login") {
    return <Component {...pageProps} />;
  }

  if (loading) {
    return <p style={{ padding: 20 }}>Cargando...</p>;
  }

  return (
    <>
      <nav
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          padding: "10px 14px",
          background: "#0f172a",
          color: "white",
          boxShadow: "0 8px 20px rgba(0,0,0,0.15)",
          flexWrap: "wrap"
        }}
      >
        <Link href="/">
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              cursor: "pointer",
              marginRight: 10
            }}
          >
            <img
              src="/logo.png"
              alt="Logo"
              style={{
                width: 34,
                height: 34,
                borderRadius: 10,
                objectFit: "cover"
              }}
            />
            <b>Protege Calle</b>
          </div>
        </Link>

        <Link href="/nuevo">Nuevo</Link>
        <Link href="/registros">Buscar</Link>
        <Link href="/panel">Panel</Link>
        <Link href="/mapa">Mapa</Link>
        <Link href="/estadisticas">Datos</Link>
        <Link href="/pendientes">Offline</Link>

        <button
          onClick={cerrarSesion}
          style={{
            marginLeft: "auto",
            background: "#ef4444",
            color: "white",
            border: "none",
            padding: "8px 12px",
            borderRadius: 10,
            cursor: "pointer",
            fontWeight: "bold"
          }}
        >
          Salir
        </button>
      </nav>

      <Component {...pageProps} />
    </>
  );
}
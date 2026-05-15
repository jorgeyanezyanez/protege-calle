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
          gap: 15,
          padding: 15,
          background: "#111",
          color: "white",
          alignItems: "center",
          flexWrap: "wrap"
        }}
      >

        <Link href="/">Inicio</Link>

        <Link href="/nuevo">Nuevo</Link>

        <Link href="/registros">Registros</Link>

        <Link href="/mapa">Mapa</Link>

        <Link href="/panel">Panel</Link>

        <Link href="/pendientes">
          Pendientes
        </Link>

        <Link href="/estadisticas">
          Estadísticas
        </Link>

        <button
          onClick={cerrarSesion}
          style={{
            marginLeft: "auto",
            background: "#ef4444",
            color: "white",
            border: "none",
            padding: "8px 12px",
            borderRadius: 6,
            cursor: "pointer"
          }}
        >
          Cerrar sesión
        </button>

      </nav>

      <Component {...pageProps} />
    </>
  );
}
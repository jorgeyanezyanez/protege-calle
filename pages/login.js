import { useState } from "react";
import { useRouter } from "next/router";
import { supabase } from "../lib/supabase";

export default function Login() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [cargando, setCargando] = useState(false);

  const ingresar = async (e) => {
    e.preventDefault();

    if (cargando) return;

    setCargando(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    setCargando(false);

    if (error) {
      alert("Correo o contraseña incorrectos");
      return;
    }

    router.push("/");
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
        background: "linear-gradient(180deg, #0f172a, #1e3a8a)"
      }}
    >
      <div
        className="card"
        style={{
          width: "100%",
          maxWidth: 420,
          textAlign: "center"
        }}
      >
        <img
          src="/logo.png"
          alt="Protege Calle"
          style={{
            width: 110,
            height: 110,
            objectFit: "cover",
            borderRadius: 26,
            marginBottom: 15
          }}
        />

        <h1>Protege Calle</h1>

        <p>
          Acceso seguro al sistema territorial de registro y seguimiento.
        </p>

        <form onSubmit={ingresar}>
          <input
            type="email"
            placeholder="Correo institucional"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button
            className="btn"
            type="submit"
            disabled={cargando}
            style={{ width: "100%" }}
          >
            {cargando ? "Ingresando..." : "Ingresar"}
          </button>
        </form>
      </div>
    </div>
  );
}
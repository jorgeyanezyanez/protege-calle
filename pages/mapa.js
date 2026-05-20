import { useRouter } from "next/router";

import dynamic from "next/dynamic";

const MapaCliente = dynamic(
  () => import("../components/MapaCliente"),
  {
    ssr: false
  }
);

const MapaHistorial = dynamic(
  () => import("../components/MapaHistorial"),
  {
    ssr: false
  }
);

export default function Mapa() {

  const router = useRouter();

  const {
    lat,
    lng,
    id
  } = router.query;

  // =====================================
  // HISTORIAL DE UBICACIONES
  // =====================================
  if (id && lat && lng) {

    return (

      <MapaHistorial
        registroId={id}
        lat={lat}
        lng={lng}
      />

    );

  }

  // =====================================
  // MAPA NORMAL
  // =====================================
  return (

    <MapaCliente
      focusLat={lat}
      focusLng={lng}
    />

  );

}
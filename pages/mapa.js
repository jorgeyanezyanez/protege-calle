import { useRouter } from "next/router";
import dynamic from "next/dynamic";

const MapaCliente = dynamic(
  () => import("../components/MapaCliente"),
  { ssr: false }
);

export default function Mapa() {

  const router = useRouter();

  return (
    <MapaCliente
      focusLat={router.query.lat}
      focusLng={router.query.lng}
    />
  );
}
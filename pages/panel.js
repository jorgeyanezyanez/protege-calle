import dynamic from "next/dynamic";

const PanelCliente = dynamic(
  () => import("../components/PanelCliente"),
  { ssr: false }
);

export default function Panel() {
  return <PanelCliente />;
}
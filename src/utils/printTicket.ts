import { Nota } from "../types";
import * as Print from "expo-print";
import { TICKET_FOOTER_MESSAGE } from "../constants/Config";

export async function printTicket(nota: Nota) {
  const line = (text: string) => `<div>${text}</div>`;
  const productos = nota.productos
    .map(
      (p) =>
        `${p.nombre} x ${p.cantidad ?? 1} = $${(p.precio * (p.cantidad ?? 1)).toFixed(2)}`
    )
    .map(line)
    .join("");

  const html = `
    <div style="font-size:12px;font-family:monospace;">
      ${line(`Operador: ${nota.operador}`)}
      ${line(`Fecha: ${nota.fechaCierre?.replace("T", " ").slice(0, 19)}`)}
      ${line(`Pago: ${nota.metodoPago}`)}
      ${line(`Total: $${nota.total?.toFixed(2)}`)}
      ${line(`Recibido: $${nota.montoRecibido?.toFixed(2)}`)}
      ${line(`Cambio: $${nota.cambio?.toFixed(2)}`)}
      <hr />
      ${productos}
      <hr />
      <div style="text-align:center;margin-top:8px;">${TICKET_FOOTER_MESSAGE}</div>
    </div>`;

  try {
    await Print.printAsync({ html });
  } catch (err) {
    console.warn("[printTicket]", err);
  }
}
import * as FileSystem from "expo-file-system";
import * as Linking from "expo-linking";
import { Buffer } from "buffer";
import { Nota } from "../types";
import { TICKET_FOOTER_MESSAGE } from "../constants/Config";

export async function printTicket(nota: Nota) {
  const ESC = "\x1B";
  const GS = "\x1D";

  const setAlign = (n: "left" | "center" | "right") => {
    const code = n === "left" ? 0 : n === "center" ? 1 : 2;
    return `${ESC}a${String.fromCharCode(code)}`;
  };

  const boldOn = `${ESC}E\x01`;
  const boldOff = `${ESC}E\x00`;
  const cutPaper = `${GS}V\x00`;

  const line = (text: string = "") => `${text}\n`;

  const productos = nota.productos
    .map(
      (p) =>
        `${p.nombre} x ${p.cantidad ?? 1} = $${(p.precio * (p.cantidad ?? 1)).toFixed(2)}`
    )
    .map(line)
    .join("");

  const ticketText =
    ESC + "@\n" +
    setAlign("center") +
    boldOn +
    line("TICKET DE COMPRA") +
    boldOff +
    setAlign("left") +
    line(`Operador: ${nota.operador}`) +
    line(`Fecha: ${nota.fechaCierre?.replace("T", " ").slice(0, 19)}`) +
    line(`Pago: ${nota.metodoPago}`) +
    line(`Total: $${nota.total?.toFixed(2)}`) +
    line(`Recibido: $${nota.montoRecibido?.toFixed(2)}`) +
    line(`Cambio: $${nota.cambio?.toFixed(2)}`) +
    line("--------------------------------") +
    productos +
    line("--------------------------------") +
    setAlign("center") +
    line(TICKET_FOOTER_MESSAGE) +
    line("\n\n\n") +
    cutPaper;

  try {
    const fileUri = FileSystem.cacheDirectory + "ticket.txt";
    await FileSystem.writeAsStringAsync(fileUri, ticketText, {
      encoding: FileSystem.EncodingType.UTF8,
    });

    const base64 = Buffer.from(ticketText, "binary").toString("base64");
    const url = `rawbt:base64,${base64}`;
    console.log("URL", url);
    await Linking.openURL(url);
    console.log("ya paso ");
  } catch (err) {
    console.warn("[printTicketWithRawBT]", err);
  }
}

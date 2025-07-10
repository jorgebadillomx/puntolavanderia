// src/storage/notasRemoto.ts
import { collection, addDoc, query, where, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import { Nota } from "../types";

const notasRef = collection(db, "notas");

export async function guardarNota(nota: Nota) {
  try {
    await addDoc(notasRef, nota);
  } catch (error) {
    console.error("[notas.ts] ERROR al guardar nota:", error);
  }
}

export async function cargarNotasPorTurno(idTurno: string): Promise<Nota[]> {
  try {
    const q = query(notasRef, where("idTurno", "==", idTurno));
    const snapshot = await getDocs(q);
    const notas: Nota[] = snapshot.docs.map(doc => doc.data() as Nota);
    return notas;
  } catch (error) {
    console.error("[notas.ts] ERROR al cargar notas:", error);
    return [];
  }
}
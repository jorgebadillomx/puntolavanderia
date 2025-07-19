import {
  collection,
  setDoc,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
  getDoc
} from "firebase/firestore";
import { db } from "../firebase";
import { RegistroCaja } from "../types";

const registrosRef = collection(db, "registrosCaja");

export async function crearRegistro(registro: RegistroCaja) {
  try {
    const ref = doc(db, "registrosCaja", registro.id);
        await setDoc(ref, {
      ...registro,
      fecha: registro.fecha ?? new Date().toISOString(),
      tipo:
        registro.tipo ?? (registro.cantidad >= 0 ? "ingreso" : "gasto"),
    });
  } catch (error) {
    console.error("[registrosCaja.ts] Error al crear registro:", error);
  }
}

export async function cargarRegistrosPorTurno(idTurno: string): Promise<RegistroCaja[]> {
  try {
    const q = query(registrosRef, where("idTurno", "==", idTurno));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(d => ({ ...(d.data() as RegistroCaja), id: d.id }));
  } catch (error) {
    console.error("[registrosCaja.ts] Error al cargar registros:", error);
    return [];
  }
}

export async function actualizarRegistro(id: string, data: Partial<RegistroCaja>) {
  try {
    const ref = doc(db, "registrosCaja", id);
    await updateDoc(ref, data);
  } catch (error) {
    console.error("[registrosCaja.ts] Error al actualizar registro:", error);
  }
}

export async function getRegistro(id: string): Promise<RegistroCaja | null> {
  try {
    const ref = doc(db, "registrosCaja", id);
    const snap = await getDoc(ref);
    return snap.exists() ? (snap.data() as RegistroCaja) : null;
  } catch (error) {
    console.error("[registrosCaja.ts] Error al obtener registro:", error);
    return null;
  }
}
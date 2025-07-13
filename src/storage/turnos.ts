import {
  collection,
  getDocs,
  updateDoc,
  doc,
  getDoc,
    setDoc,
} from "firebase/firestore";
import { db } from "../firebase";
import { Turno } from "../types";

const turnosRef = collection(db, "turnos");

export async function agregarTurno(turno: Turno) {
  try {
    const ref = doc(db, "turnos", turno.id);
    await setDoc(ref, turno);
  } catch (error) {
    console.error("[turnos.ts] Error al agregar turno:", error);
  }
}

export async function cargarTurnos(): Promise<Turno[]> {
  try {
    const snapshot = await getDocs(turnosRef);
    return snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Turno));
  } catch (error) {
    console.error("[turnos.ts] Error al cargar turnos:", error);
    return [];
  }
}

export async function actualizarTurno(id: string, data: Partial<Turno>) {
  try {
    const ref = doc(db, "turnos", id);
    await updateDoc(ref, data);
  } catch (error) {
    console.error("[turnos.ts] Error al actualizar turno:", error);
  }
}

export async function getTurno(id: string): Promise<Turno | null> {
  try {
    const ref = doc(db, "turnos", id);
    const snap = await getDoc(ref);
    return snap.exists() ? (snap.data() as Turno) : null;
  } catch (error) {
    console.error("[turnos.ts] Error al obtener turno:", error);
    return null;
  }
}

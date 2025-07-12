// src/storage/notasRemoto.ts
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
import { Nota } from "../types";

const notasRef = collection(db, "notas");

export async function guardarNota(nota: Nota) {
  try {
        // Use the nota id as the document id to keep consistency
    const notaRef = doc(notasRef, nota.id);
    await setDoc(notaRef, nota);
  } catch (error) {
    console.error("[notas.ts] ERROR al guardar nota:", error);
  }
}

export async function cargarNotasPorTurno(
  idTurno: string,
  cerrada: boolean
): Promise<Nota[]> {
  try {
    const q = query(
      notasRef,
      where("idTurno", "==", idTurno),
      where("cerrada", "==", cerrada) 
    );
    const snapshot = await getDocs(q);

    const notas: Nota[] = snapshot.docs.map((d) => ({
      ...(d.data() as Nota),
    }));

    return notas;
  } catch (error) {
    console.error("[notas.ts] ERROR al cargar notas:", error);
    return [];
  }
}

export async function actualizarNota(nota: Nota | null) {
  try {
    if (!nota || !nota.id) {
      throw new Error("Nota inválida o sin ID");
    }
    const notaRef = doc(notasRef, nota.id);
    await updateDoc(notaRef, { ...nota });
  } catch (error) {
    console.error("[notas.ts] ERROR al actualizar nota:", error);
  }
}

export async function getNotaPorId(id: string): Promise<Nota | null> {
  try {
    const notaRef = doc(notasRef, id); // Obtener la referencia al documento por ID
    const notaSnap = await getDoc(notaRef);

    if (notaSnap.exists()) {
      return { ...notaSnap.data(), id: notaSnap.id } as Nota;
    } else {
      return null; // No existe el documento con ese ID
    }
  } catch (error) {
    console.error("[notas.ts] ERROR al obtener nota por ID:", error);
    return null;
  }
}


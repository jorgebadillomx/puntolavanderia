// src/storage/notasRemoto.ts
import {
  collection,
  setDoc,
  getDocs,
  deleteDoc,
  doc,
  updateDoc,
} from "firebase/firestore";
import { db } from "../firebase";
import { Producto } from "../types";

const productosRef = collection(db, "productos");

export async function cargarProductos(): Promise<Producto[]> {
  try {
    const snapshot = await getDocs(productosRef);
    return snapshot.docs.map((docSnap) => {
      const data = docSnap.data();
      return {
        ...data,
        id: docSnap.id,
        orden: data.orden ?? 0,
      } as Producto;
    });
  } catch (error) {
    console.error("[productos.ts] Error al cargar productos:", error);
    return [];
  }
}

export async function guardarProducto(producto: Producto) {
  try {
    const Ref = doc(db, "productos", producto.id);
    const prodClean = { ...producto };
    if (prodClean.gasto === undefined || prodClean.gasto === "") {
      delete prodClean.gasto;
    }
    await setDoc(Ref, prodClean);
  } catch (error) {
    console.error("[productos.ts] ERROR al guardar producto:", error);
  }
}

export async function actualizarProducto(
  id: string,
  producto: Partial<Producto>
) {
  try {

    const ref = doc(db, "productos", id);
        const prodClean = { ...producto };
    if (prodClean.gasto === undefined || prodClean.gasto === "") {
      delete prodClean.gasto;
    }

   await updateDoc(ref, { ...prodClean });
  } catch (error) {
    console.error("[productos.ts] Error al actualizar producto:", error);
  }
}

export async function eliminarProducto(id: string) {
  try {
    const ref = doc(db, "productos", id);
    await deleteDoc(ref);
  } catch (error) {
    console.error("[productos.ts] Error al eliminar producto:", error);
  }
}

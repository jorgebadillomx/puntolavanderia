import React, { useState, useEffect } from "react";
import { View, FlatList, StyleSheet, TextInput } from "react-native";
import { Producto } from "../types";
import {
  cargarProductos,
  guardarProducto,
  actualizarProducto,
  eliminarProducto,
} from "../storage/productos";
import ProductoForm from "../components/ProductoForm";
import ProductoItem from "../components/ProductoItem";

export default function GestionProductos() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [productoEdit, setProductoEdit] = useState<Producto | null>(null);
  const [busqueda, setBusqueda] = useState<string>("");

  useEffect(() => {
    cargar();
  }, []);

  const cargar = async () => {
    const data = await cargarProductos();
    data.sort((a, b) => (a.orden ?? 0) - (b.orden ?? 0));
    setProductos(data);
  };

    const guardarOrdenes = async (lista: Producto[]) => {
    for (let i = 0; i < lista.length; i++) {
      const p = lista[i];
      if (p.orden !== i) {
        p.orden = i;
        await actualizarProducto(p.id, { orden: i });
      }
    }
  };

  const agregar = async (nuevo: Omit<Producto, "id" | "orden">) => {
    if (productoEdit) {
      await actualizarProducto(productoEdit.id, nuevo);
      await cargar();
      setProductoEdit(null);
    } else {
      const maxOrden = productos.reduce((m, p) => Math.max(m, p.orden), -1);
      await guardarProducto({
        ...nuevo,
        id: Date.now().toString(),
        orden: maxOrden + 1,
      });
      await cargar();
    }
  };

  const eliminar = async (id: string) => {
    await eliminarProducto(id);
    const restantes = productos.filter((p) => p.id !== id);
    await guardarOrdenes(restantes);
    setProductos(restantes);
    if (productoEdit?.id === id) setProductoEdit(null);
  };

  const mover = async (id: string, dir: "up" | "down") => {
    const index = productos.findIndex((p) => p.id === id);
    const targetIndex = dir === "up" ? index - 1 : index + 1;
    if (index === -1 || targetIndex < 0 || targetIndex >= productos.length) {
      return;
    }
    const updated = [...productos];
    const a = { ...updated[index] };
    const b = { ...updated[targetIndex] };
    const temp = a.orden;
    a.orden = b.orden;
    b.orden = temp;
    updated[index] = b;
    updated[targetIndex] = a;
    await guardarOrdenes(updated);
    setProductos([...updated]);
  };

  const productosFiltrados = productos.filter((p) =>
    p.nombre.toLowerCase().includes(busqueda.toLowerCase()),
  );

  return (
    <View style={styles.container}>
      <ProductoForm
        onSubmit={agregar}
        productoEdit={productoEdit}
        onCancelEdit={() => setProductoEdit(null)}
      />
      <TextInput
        placeholder="Buscar producto"
        value={busqueda}
        onChangeText={setBusqueda}
        style={styles.input}
      />
      <FlatList
        data={productosFiltrados}
        renderItem={({ item }) => (
          <ProductoItem
            producto={item}
            onEdit={() => setProductoEdit(item)}
            onDelete={() => eliminar(item.id)}
            onMoveUp={() => mover(item.id, "up")}
            onMoveDown={() => mover(item.id, "down")}
          />
        )}
        keyExtractor={(item) => item.id}
        style={{ marginTop: 20 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, flex: 1 },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 8,
    marginBottom: 10,
    borderRadius: 5,
  },
});

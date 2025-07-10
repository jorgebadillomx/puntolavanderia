import React, { useState, useEffect } from "react";
import { View, FlatList, StyleSheet, TextInput } from "react-native";
import { Producto } from "../types";
import { cargarProductos, guardarProducto, actualizarProducto, eliminarProducto } from "../storage/productos";
import ProductoForm from "../components/ProductoForm";
import ProductoItem from "../components/ProductoItem";

export default function GestionProductos() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [productoEdit, setProductoEdit] = useState<Producto | null>(null);
  const [busqueda, setBusqueda] = useState<string>("");

  useEffect(() => { cargar(); }, []);

  const cargar = async () => {
    const data = await cargarProductos();
    setProductos(data);
  };

  const agregar = async (nuevo: Omit<Producto, "id">) => {
    if (productoEdit) {
      await actualizarProducto(productoEdit.id, nuevo);
      await cargar();
      setProductoEdit(null);
    } else {

      console.log("[productos.ts] Guardando producto:", nuevo);
      await guardarProducto({ ...nuevo, id: Date.now().toString() });
       console.log("[productos.ts] Producto guardado con éxito");
      await cargar();
    }
  };

  const eliminar = async (id: string) => {
    await eliminarProducto(id);
    await cargar();
    if (productoEdit?.id === id) setProductoEdit(null);
  };

  const productosFiltrados = productos.filter(p =>
    p.nombre.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <View style={styles.container}>
      <ProductoForm onSubmit={agregar} productoEdit={productoEdit} onCancelEdit={() => setProductoEdit(null)} />
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
          />
        )}
        keyExtractor={item => item.id}
        style={{ marginTop: 20 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, flex: 1 },
  input: { borderWidth: 1, borderColor: "#ccc", padding: 8, marginBottom: 10, borderRadius: 5 }
});
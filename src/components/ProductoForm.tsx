import React, { useState, useEffect } from "react";
import { View, TextInput, Button, StyleSheet, Alert } from "react-native";
import { Producto } from "../types";

interface Props {
  onSubmit: (producto: Omit<Producto, "id" | "orden">) => void;
  productoEdit?: Producto | null;
  onCancelEdit?: () => void;
}
export default function ProductoForm({ onSubmit, productoEdit, onCancelEdit }: Props) {
  const [nombre, setNombre] = useState("");
  const [precio, setPrecio] = useState("");
  const [gasto, setGasto] = useState("");

  useEffect(() => {
    if (productoEdit) {
      setNombre(productoEdit.nombre);
      setPrecio(productoEdit.precio.toString());
      setGasto(productoEdit.gasto ? productoEdit.gasto.toString() : "");
    } else {
      setNombre("");
      setPrecio("");
      setGasto("");
    }
  }, [productoEdit]);

  const handleSubmit = () => {
    if (!nombre.trim() || !precio.trim()) {
      Alert.alert("Nombre y precio son obligatorios");
      return;
    }
    onSubmit({
      nombre,
      precio: parseFloat(precio),
      gasto: gasto ? parseFloat(gasto) : undefined,
    });
    setNombre("");
    setPrecio("");
    setGasto("");
  };

  return (
    <View>
      <TextInput
        placeholder="Nombre"
        value={nombre}
        onChangeText={setNombre}
        style={styles.input}
      />
      <TextInput
        placeholder="Precio"
        value={precio}
        onChangeText={setPrecio}
        keyboardType="decimal-pad"
        style={styles.input}
      />
      <TextInput
        placeholder="Gasto (opcional)"
        value={gasto}
        onChangeText={setGasto}
        keyboardType="decimal-pad"
        style={styles.input}
      />
      <Button title={productoEdit ? "Actualizar" : "Agregar"} onPress={handleSubmit} />
      {productoEdit && <Button title="Cancelar edición" onPress={onCancelEdit} color="#bbb" />}
    </View>
  );
}

const styles = StyleSheet.create({
  input: { borderWidth: 1, borderColor: "#ccc", padding: 8, marginBottom: 10, borderRadius: 5 },
});

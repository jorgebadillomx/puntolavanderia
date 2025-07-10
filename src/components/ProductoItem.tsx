import React from "react";
import { View, Text, Button, StyleSheet } from "react-native";
import { Producto } from "../types";

interface Props {
  producto: Producto;
  onEdit: () => void;
  onDelete: () => void;
}
export default function ProductoItem({ producto, onEdit, onDelete }: Props) {
  return (
    <View style={styles.item}>
      <Text style={styles.itemText}>{producto.nombre} - ${producto.precio}</Text>
      {producto.gasto !== undefined && (
        <Text style={styles.gasto}>Gasto: ${producto.gasto}</Text>
      )}
      <View style={{ flexDirection: "row", marginTop: 4 }}>
        <Button title="Editar" onPress={onEdit} />
        <View style={{ width: 8 }} />
        <Button title="Eliminar" onPress={onDelete} color="#c22" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  item: { marginBottom: 10, backgroundColor: "#f0f0f0", padding: 10, borderRadius: 6 },
  itemText: { fontWeight: "bold" },
  gasto: { fontStyle: "italic", fontSize: 12 },
});

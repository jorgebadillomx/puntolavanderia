import React from "react";
import { View, Text, Button, StyleSheet, TouchableOpacity } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { Producto } from "../types";

interface Props {
  producto: Producto;
  onEdit: () => void;
  onDelete: () => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
}
export default function ProductoItem({
  producto,
  onEdit,
  onDelete,
  onMoveUp,
  onMoveDown,
}: Props) {
  return (
    <View style={styles.item}>
      <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
        <Text style={styles.itemText}>
          {producto.nombre} - ${producto.precio}
        </Text>

      </View>
      {producto.gasto !== undefined && (
        <Text style={styles.gasto}>Gasto: ${producto.gasto}</Text>
      )}
      <View style={{ flexDirection: "row", marginTop: 4 }}>
        <Button title="Editar" onPress={onEdit} />
        <View style={{ width: 8 }} />
        <Button title="Eliminar" onPress={onDelete} color="#c22" />
          <View style={{ width: 8 }} />
                  <TouchableOpacity onPress={onMoveUp}>
            <MaterialIcons name="arrow-upward" size={24} />
          </TouchableOpacity>
  <View style={{ width: 8 }} />
                    <TouchableOpacity onPress={onMoveDown}>
            <MaterialIcons name="arrow-downward" size={24} />
          </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  item: {
    marginBottom: 10,
    backgroundColor: "#f0f0f0",
    padding: 10,
    borderRadius: 6,
  },
  itemText: { fontWeight: "bold" },
  gasto: { fontStyle: "italic", fontSize: 12 },
});

import React, { useEffect, useState } from "react";
import { View, Text, FlatList, StyleSheet, Button  } from "react-native";
import { useRoute, useNavigation  } from "@react-navigation/native";
import { Nota } from "../types";
import { cargarNotasPorTurno } from "../storage/notas";

export default function HistorialNotas() {
  const route = useRoute();
  const { idTurno } = route.params as { idTurno: string };
  const navigation = useNavigation();
  const [notas, setNotas] = useState<Nota[]>([]);

  useEffect(() => {
    const fetchNotas = async () => {
      if (!idTurno) return;
      const data = await cargarNotasPorTurno(idTurno);
      setNotas(data);
    };
    fetchNotas();
  }, [idTurno]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Notas del Turno</Text>

       {/* Botón manual de regreso */}
      <Button title="Volver" onPress={() => navigation.goBack()} />

      <FlatList
        data={notas}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.nota}>
            <Text style={styles.mote}>{item.mote || "Sin mote"}</Text>
            <Text>Operador: {item.operador}</Text>
            <Text>Total: ${item.total?.toFixed(2)}</Text>
            <Text>Pago: {item.metodoPago}</Text>
            <Text>Recibido: ${item.montoRecibido?.toFixed(2)}</Text>
            <Text>Cambio: ${item.cambio?.toFixed(2)}</Text>
            <Text>Fecha: {item.fechaCierre?.replace("T", " ").slice(0, 19)}</Text>
            <Text style={{ marginTop: 6, fontWeight: "bold" }}>Productos:</Text>
            {item.productos.map((p) => (
              <Text key={p.id}>
                - {p.nombre} x {p.cantidad ?? 1} = ${p.precio * (p.cantidad ?? 1)}
              </Text>
            ))}
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: 20, fontWeight: "bold", marginBottom: 12 },
  nota: { borderWidth: 1, borderColor: "#ccc", padding: 12, marginBottom: 12, borderRadius: 8 },
  mote: { fontSize: 16, fontWeight: "bold" },
});

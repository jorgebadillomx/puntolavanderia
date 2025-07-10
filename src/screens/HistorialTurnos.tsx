import React, { useState, useCallback } from "react";
import { View, Text, FlatList, TouchableOpacity, StyleSheet  } from "react-native";
import { Turno } from "../types";
import { cargarTurnos } from "../storage/turnos";
import { useNavigation, useFocusEffect } from "@react-navigation/native";

export default function HistorialTurnos() {
  const [turnos, setTurnos] = useState<Turno[]>([]);
  const navigation = useNavigation();

  useFocusEffect (
    useCallback(() => {
      const cargar = async () => {
        const data = await cargarTurnos(); // ← este debe consultar Firestore
        setTurnos(data); // ← asegúrate de reemplazar completamente
      };
      cargar();
    }, [])
  );

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Historial de Turnos</Text>
      <FlatList
        data={turnos}
        keyExtractor={t => t.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.turnoItem}
            onPress={() => navigation.navigate("HistorialNotas", { idTurno: item.id })}
          >
            <Text style={styles.turnoUsuario}>Operador: {item.usuario}</Text>
            <Text>Inicio: {item.fechaApertura.replace("T", " ").slice(0, 19)}</Text>
            {item.fechaCierre && <Text>Fin: {item.fechaCierre.replace("T", " ").slice(0, 19)}</Text>}
            <Text>Caja inicial: ${item.billetesInicial + item.monedasInicial}</Text>
            {item.billetesFinal !== undefined && item.monedasFinal !== undefined && (
              <Text>Caja final: ${item.billetesFinal + item.monedasFinal}</Text>
            )}
            {item.totalVendido !== undefined && (
              <Text>Total vendido: ${item.totalVendido}</Text>
            )}
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  titulo: { fontSize: 22, fontWeight: "bold", marginBottom: 20 },
  turnoItem: { padding: 16, backgroundColor: "#e8e8e8", borderRadius: 8, marginBottom: 12 },
  turnoUsuario: { fontWeight: "bold", fontSize: 16 },
});

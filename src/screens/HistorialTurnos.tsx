import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { Turno } from "../types";
import { cargarTurnos } from "../storage/turnos";
import { cargarRegistrosPorTurno } from "../storage/registrosCaja";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { useSucursal } from "../context/SucursalContext";

interface TurnoConRegistros extends Turno {
  ingresos: number;
  gastos: number;
}


export default function HistorialTurnos() {
  const [turnos, setTurnos] = useState<TurnoConRegistros[]>([]);
  const navigation = useNavigation();
  const { sucursal } = useSucursal();

  useFocusEffect(
    useCallback(() => {
      const cargar = async () => {
             const data = await cargarTurnos();
        const filtrados = data.filter((t) => t.idSucursal === sucursal?.id);
        const conRegistros: TurnoConRegistros[] = [];
        for (const t of filtrados) {
          const regs = await cargarRegistrosPorTurno(t.id);
          const ingresos = regs
            .filter((r) => r.cantidad >= 0)
            .reduce((s, r) => s + r.cantidad, 0);
          const gastos = regs
            .filter((r) => r.cantidad < 0)
            .reduce((s, r) => s + Math.abs(r.cantidad), 0);
          conRegistros.push({ ...t, ingresos, gastos });
        }
        setTurnos(conRegistros);
      };
      cargar();
    }, [sucursal])
  );

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Historial de Turnos</Text>
      <FlatList
        data={turnos}
        keyExtractor={(t) => t.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.turnoItem}
            onPress={() =>
              navigation.navigate("HistorialNotas", { idTurno: item.id })
            }
          >
            <Text style={styles.turnoUsuario}>Operador: {item.usuario}</Text>
            <Text>
              Inicio: {item.fechaApertura.replace("T", " ").slice(0, 19)}
            </Text>
            {item.fechaCierre && (
              <Text>
                Fin: {item.fechaCierre.replace("T", " ").slice(0, 19)}
              </Text>
            )}
            <Text>Billetes inicial: ${item.billetesInicial}</Text>
            <Text>Monedas inicial: ${item.monedasInicial}</Text>
            <Text>
              Caja inicial: ${item.billetesInicial + item.monedasInicial}
            </Text>
            {item.billetesFinal !== undefined && (
              <Text>Monedas Final: ${item.billetesFinal}</Text>
            )}
            {item.monedasFinal !== undefined && (
              <Text>Total vendido: ${item.monedasFinal}</Text>
            )}
            {item.billetesFinal !== undefined &&
              item.monedasFinal !== undefined && (
                <Text>
                  Caja final: ${item.billetesFinal + item.monedasFinal}
                </Text>
              )}
            <Text>Ingresos: ${item.ingresos}</Text>
            <Text>Gastos: ${item.gastos}</Text>
            {item.totalVendido !== undefined && (
              <Text>Total vendido: ${item.totalVendido}</Text>
            )}
            {item.totalCaja !== undefined && (
              <Text>Total final: ${item.totalCaja}</Text>
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
  turnoItem: {
    padding: 16,
    backgroundColor: "#e8e8e8",
    borderRadius: 8,
    marginBottom: 12,
  },
  turnoUsuario: { fontWeight: "bold", fontSize: 16 },
});

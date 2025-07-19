import React, { useEffect, useState } from "react";
import { View, Text, FlatList, StyleSheet, Button, TouchableOpacity  } from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import { Nota, Turno } from "../types";
import { cargarNotasPorTurno } from "../storage/notas";
import { getTurno } from "../storage/turnos";
import { printTicket } from "../utils/printTicket";
import { MaterialIcons } from "@expo/vector-icons";

export default function HistorialNotas() {
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const handlePrint = async (item: Nota) => {
    if (loadingId) return; // Si ya está imprimiendo algo
    setLoadingId(item.id);
    try {
      await printTicket(item);
      // Aquí podrías mostrar un Toast de "Impresión enviada"
    } catch (e: any) {
      alert("Error al imprimir: " + (e?.message || e));
    } finally {
      setLoadingId(null);
    }
  };
  const route = useRoute();
  const { idTurno } = route.params as { idTurno: string };
  const navigation = useNavigation();
  const [notas, setNotas] = useState<Nota[]>([]);
  const [turno, setTurno] = useState<Turno | null>(null);

  useEffect(() => {
    const fetchNotas = async () => {
      if (!idTurno) return;
      const data = await cargarNotasPorTurno(idTurno);
      setNotas(data);
      const t = await getTurno(idTurno);
      setTurno(t);
    };
    fetchNotas();
  }, [idTurno]);

  const totalTurno = notas.reduce((s, n) => s + (n.total || 0), 0);
  const productosTurno = notas.reduce(
    (s, n) => s + n.productos.reduce((sp, p) => sp + (p.cantidad ?? 1), 0),
    0
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Notas del Turno</Text>

      {/* Botón manual de regreso */}
      <Button title="Volver" onPress={() => navigation.goBack()} />

      {turno && (
        <View style={styles.detalleTurno}>
          <Text style={styles.detalleTitulo}>Detalle del Turno</Text>
          <Text>Operador: {turno.usuario}</Text>
          <Text>
            Inicio: {turno.fechaApertura.replace("T", " ").slice(0, 19)}
          </Text>
          {turno.fechaCierre && (
            <Text>Fin: {turno.fechaCierre.replace("T", " ").slice(0, 19)}</Text>
          )}
          <Text>
            Caja inicial: ${turno.billetesInicial + turno.monedasInicial}
          </Text>
          {turno.billetesFinal !== undefined &&
            turno.monedasFinal !== undefined && (
              <Text>
                Caja final: ${turno.billetesFinal + turno.monedasFinal}
              </Text>
            )}
          <Text style={{ marginTop: 4 }}>
            Productos vendidos: {productosTurno}
          </Text>
          <Text style={{ fontWeight: "bold" }}>
            Total vendido: ${totalTurno.toFixed(2)}
          </Text>
        </View>
        
      )}

            <FlatList
        data={notas}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.nota}>
            <Text style={styles.mote}>{item.mote || "Sin mote"}</Text>
            <Text style={{ fontWeight: "bold" }}>
              Total: ${item.total?.toFixed(2)}
            </Text>
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
            <TouchableOpacity
              onPress={() => handlePrint(item)}
              style={{ marginTop: 8, alignSelf: "flex-start", opacity: loadingId === item.id ? 0.5 : 1 }}
              disabled={loadingId === item.id}
            >
              <MaterialIcons name="print" size={24} color="black" />
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: 20, fontWeight: "bold", marginBottom: 12 },
  nota: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 12,
    marginBottom: 12,
    borderRadius: 8,
  },
  mote: { fontSize: 16, fontWeight: "bold" },
  detalleTurno: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 12,
    borderRadius: 8,
    marginVertical: 12,
  },
  detalleTitulo: { fontSize: 16, fontWeight: "bold", marginBottom: 4 },
});

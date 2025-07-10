import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Turno } from "../types";

interface Props {
  turno: Turno;
}

export default function TurnoHeader({ turno }: Props) {
  return (
    <View style={styles.header}>
      <Text>Turno de: {turno.usuario} | Inicio: {turno.fechaApertura.replace("T", " ").slice(0, 19)}</Text>
      <Text>Billetes inicial: ${turno.billetesInicial} | Monedas inicial: ${turno.monedasInicial}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    padding: 10,
    backgroundColor: "#e0e7ff",
    borderRadius: 8,
    marginBottom: 10
  }
});

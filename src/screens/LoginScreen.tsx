import React, { useState } from "react";
import { View, Text, TextInput, Button, StyleSheet } from "react-native";
import { useAuth } from "../context/AuthContext";

export default function LoginScreen() {
  const { abrirTurno } = useAuth();
  const [usuario, setUsuario] = useState("");
  const [billetes, setBilletes] = useState("");
  const [monedas, setMonedas] = useState("");

  const iniciar = () => {
    if (usuario.trim()) {
      console.log("[LoginScreen] Enviando datos a abrirTurno:", {
        username: usuario.trim(),
        billetes,
        monedas,
      });

      abrirTurno({
        username: usuario.trim(),

        billetes,
        monedas,
      });
    } else {
      console.warn("[LoginScreen] Usuario vacío. No se envía nada.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Nombre del operador:</Text>
      <TextInput
        style={styles.input}
        value={usuario}
        onChangeText={setUsuario}
        placeholder="Ej. Jorge"
      />

      <Text style={styles.label}>Billetes iniciales:</Text>
      <TextInput
        style={styles.input}
        value={billetes}
        onChangeText={setBilletes}
        keyboardType="decimal-pad"
      />

      <Text style={styles.label}>Monedas iniciales:</Text>
      <TextInput
        style={styles.input}
        value={monedas}
        onChangeText={setMonedas}
        keyboardType="decimal-pad"
      />

      <Button title="Iniciar turno" onPress={iniciar} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
  },
  label: {
    fontWeight: "bold",
    marginTop: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
  },
});

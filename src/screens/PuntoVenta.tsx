import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Modal,
  Pressable,
  Alert,
} from "react-native";
import { Producto, Nota, Turno } from "../types";
import { cargarProductos } from "../storage/productos";
import { agregarTurno, actualizarTurno, cargarTurnos } from "../storage/turnos";
import { guardarNota, cargarNotasPorTurno } from "../storage/notas";
import { useAuth } from "../context/AuthContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { MaterialIcons } from "@expo/vector-icons";

export default function PuntoVenta({ navigation }: any) {
  const { user, turno, abrirTurno, cerrarTurno } = useAuth();

  const [usuario, setUsuario] = useState("");
  const [billetes, setBilletes] = useState("");
  const [monedas, setMonedas] = useState("");
  const [turnoActivo, setTurnoActivo] = useState<Turno | null>(null);

  const [notas, setNotas] = useState<Nota[]>([]);
  const [notaActiva, setNotaActiva] = useState<string | null>(null);
  const [mote, setMote] = useState("");
  const [productosBase, setProductosBase] = useState<Producto[]>([]);

  const [mostrarModal, setMostrarModal] = useState(false);
  const [pagoSeleccionado, setPagoSeleccionado] = useState<
    "efectivo" | "tarjeta" | "transferencia" | null
  >(null);
  const [montoPago, setMontoPago] = useState("");
  const [modalCierreTurno, setModalCierreTurno] = useState(false);
  const [billetesFinal, setBilletesFinal] = useState("");
  const [monedasFinal, setMonedasFinal] = useState("");

  useEffect(() => {
    cargarTodo();
    const unsubscribe = navigation.addListener("focus", cargarTodo);
    return unsubscribe;
  }, [navigation]);

  async function cargarTodo() {
    const lista = await cargarProductos();
    setProductosBase(lista);

    const turnos = await cargarTurnos();
    const actual = turnos.find((t) => !t.fechaCierre); // solo turno abierto

    if (actual) {
      setTurnoActivo(actual);
      setUsuario(actual.usuario);
      const notasCerradas = await cargarNotasPorTurno(actual.id);
      const abiertasJSON = await AsyncStorage.getItem(
        `notasAbiertas_${actual.id}`
      );
      const notasAbiertas: Nota[] = abiertasJSON
        ? JSON.parse(abiertasJSON)
        : [];
      setNotas([...notasAbiertas, ...notasCerradas]);
    } else {
      // 🔒 Si no hay turno abierto, vaciar todo
      setTurnoActivo(null);
      setUsuario("");
      setNotas([]);
    }

    setBilletes("");
    setMonedas("");
    setNotaActiva(null);
    setMote("");
  }

  const iniciarTurno = async () => {
    if (!usuario.trim() || !billetes.trim() || !monedas.trim()) {
      Alert.alert("Usuario y caja inicial son obligatorios");
      return;
    }

    const nuevoTurno: Turno = {
      id: Date.now().toString(),
      usuario: usuario.trim(),
      fechaApertura: new Date().toISOString(),
      billetesInicial: parseFloat(billetes),
      monedasInicial: parseFloat(monedas),
    };

    await agregarTurno(nuevoTurno);
    setTurnoActivo(nuevoTurno);
    setUsuario(nuevoTurno.usuario);
    setNotas([]);
    setNotaActiva(null);
    setMote("");
    setBilletes("");
    setMonedas("");
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener("cerrarTurno", () => {
      solicitarCerrarTurno();
    });

    return unsubscribe;
  }, [navigation]);

  const solicitarCerrarTurno = () => {
    setModalCierreTurno(true);
    setBilletesFinal("");
    setMonedasFinal("");
  };

  const cerrarTurnoFirestore = async () => {
    if (!billetesFinal.trim() || !monedasFinal.trim()) {
      Alert.alert("Debes indicar billetes y monedas finales.");
      return;
    }
    if (!turnoActivo) return;

    const totalVendido = notas
      .filter((n) => n.idTurno === turnoActivo.id && n.cerrada)
      .reduce((s, n) => s + (n.total || 0), 0);

    await actualizarTurno(turnoActivo.id, {
      fechaCierre: new Date().toISOString(),
      billetesFinal: parseFloat(billetesFinal),
      monedasFinal: parseFloat(monedasFinal),
      totalVendido,
    });

    await AsyncStorage.removeItem(`notasAbiertas_${turnoActivo.id}`);

    setTurnoActivo(null);
    setUsuario("");
    setNotas([]);
    setNotaActiva(null);
    setMote("");
    setModalCierreTurno(false);
    Alert.alert("Turno cerrado", "Se cerró el turno correctamente.");
  };

  const agregarNota = () => {
    if (!turnoActivo) {
      Alert.alert("Primero debes iniciar un turno.");
      return;
    }
    const nueva: Nota = {
      id: Date.now().toString(),
      mote,
      productos: [],
      operador: usuario,
      cerrada: false,
      idTurno: turnoActivo.id,
    };
    setNotas([...notas, nueva]);
    setNotaActiva(nueva.id);
    setMote("");
  };

  const agregarProductoANota = (producto: Producto) => {
    setNotas(
      notas.map((nota) => {
        if (nota.id !== notaActiva || nota.cerrada) return nota;
        const productos = [...nota.productos];
        const idx = productos.findIndex((p) => p.id === producto.id);
        if (idx >= 0) productos[idx].cantidad += 1;
        else productos.push({ ...producto, cantidad: 1 });
        return { ...nota, productos };
      })
    );
  };

  const quitarProductoDeNota = (idProducto: string) => {
    setNotas(
      notas.map((nota) => {
        if (nota.id !== notaActiva || nota.cerrada) return nota;
        const productos = [...nota.productos];
        const idx = productos.findIndex((p) => p.id === idProducto);
        if (idx >= 0) {
          if (productos[idx].cantidad > 1) productos[idx].cantidad -= 1;
          else productos.splice(idx, 1);
        }
        return { ...nota, productos };
      })
    );
  };

  const cerrarNota = async (
    id: string,
    metodoPago: string,
    montoRecibido: number
  ) => {
    const nuevasNotas = notas.map((n) => {
      if (n.id !== id) return n;
      const total = n.productos.reduce(
        (s, p) => s + p.precio * (p.cantidad ?? 1),
        0
      );
      const fechaCierre = new Date().toISOString();
      const nuevaNota: Nota = {
        ...n,
        cerrada: true,
        metodoPago,
        montoRecibido,
        fechaCierre,
        cambio: metodoPago === "efectivo" ? montoRecibido - total : undefined,
        total,
        idTurno: turnoActivo?.id ?? "",
      };
      guardarNota(nuevaNota);
      return nuevaNota;
    });
    setNotas(nuevasNotas);
    setNotaActiva(null);
    setMostrarModal(false);
    setPagoSeleccionado(null);
    setMontoPago("");
  };

  useEffect(() => {
    if (!turnoActivo) return;
    const abiertas = notas.filter((n) => !n.cerrada);
    AsyncStorage.setItem(
      `notasAbiertas_${turnoActivo.id}`,
      JSON.stringify(abiertas)
    );
  }, [notas, turnoActivo]);

  const notaSeleccionada = notas.find((n) => n.id === notaActiva);
  const totalNotaSeleccionada = notaSeleccionada
    ? notaSeleccionada.productos.reduce(
        (s, p) => s + p.precio * (p.cantidad ?? 1),
        0
      )
    : 0;

  if (!turnoActivo) {
    return (
      <View style={{ padding: 20 }}>
        <Text style={{ fontSize: 20, marginBottom: 10 }}>Inicia tu turno</Text>
        <TextInput
          placeholder="Usuario"
          value={usuario}
          onChangeText={setUsuario}
          style={styles.input}
        />
        <TextInput
          placeholder="Billetes (caja inicial)"
          value={billetes}
          onChangeText={setBilletes}
          keyboardType="decimal-pad"
          style={styles.input}
        />
        <TextInput
          placeholder="Monedas (caja inicial)"
          value={monedas}
          onChangeText={setMonedas}
          keyboardType="decimal-pad"
          style={styles.input}
        />
        <Button title="Iniciar turno" onPress={iniciarTurno} />
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={{ padding: 16 }}>
      <View style={styles.menuSuperior}>
        <Text style={{ fontWeight: "bold" }}>
          Usuario: {turnoActivo.usuario}
        </Text>
        {/* <Button
          title="Historial turnos"
          onPress={() => navigation.navigate("HistorialTurnos")}
        /> */}
        <Button
          title="Cerrar turno"
          color="#c22"
          onPress={solicitarCerrarTurno}
        />
      </View>

      <Text style={{ fontSize: 16 }}>
        Abierto desde:{" "}
        {turnoActivo.fechaApertura.replace("T", " ").slice(0, 19)}
      </Text>
      <Text>
        Caja inicial: ${turnoActivo.billetesInicial} billetes, $
        {turnoActivo.monedasInicial} monedas
      </Text>

      <Button
        title="Administrar productos"
        onPress={() => navigation.navigate("GestionProductos")}
      />

      <TextInput
        placeholder="Mote para nueva nota"
        value={mote}
        onChangeText={setMote}
        style={styles.input}
      />
      <Button title="Nueva nota" onPress={agregarNota} />

      <FlatList
        data={productosBase}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => agregarProductoANota(item)}
            style={styles.productoItem}
          >
            <Text>{item.nombre}</Text>
            <Text style={{ fontWeight: "bold" }}>${item.precio}</Text>
          </TouchableOpacity>
        )}
        keyExtractor={(item) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ marginVertical: 8 }}
      />

      <View style={{ flexDirection: "row", marginTop: 16 }}>
        <View style={{ flex: 1, marginRight: 8 }}>
          <Text style={{ fontSize: 20 }}>Abiertas:</Text>
          {notas
            .filter((n) => !n.cerrada)
            .map((nota) => (
              <TouchableOpacity
                key={nota.id}
                onPress={() => setNotaActiva(nota.id)}
                style={{ marginVertical: 4 }}
              >
                <Text style={{ fontWeight: "bold", fontSize: 16 }}>
                  {nota.mote || "Sin mote"}
                </Text>
              </TouchableOpacity>
            ))}
        </View>
        <View style={{ flex: 1, marginLeft: 8 }}>
          <Text style={{ fontSize: 20 }}>Cerradas:</Text>
          {notas
            .filter((n) => n.cerrada)
            .map((nota) => (
              <TouchableOpacity
                key={nota.id}
                onPress={() => setNotaActiva(nota.id)}
                style={{ marginVertical: 4 }}
              >
                <Text style={{ fontWeight: "bold", fontSize: 16 }}>
                  {nota.mote || "Sin mote"}
                </Text>
              </TouchableOpacity>
            ))}
        </View>
      </View>

      {notaSeleccionada && (
        <View style={{ marginTop: 16 }}>
          <Text style={{ fontSize: 20 }}>Nota: {notaSeleccionada.mote}</Text>
          {notaSeleccionada.productos.map((p) => (
            <View
              key={p.id}
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginVertical: 2,
              }}
            >
              <Text style={{ flex: 1 }}>
                {p.nombre} x {p.cantidad ?? 1} = ${p.precio * (p.cantidad ?? 1)}
              </Text>
              {!notaSeleccionada.cerrada && (
                <TouchableOpacity
                  onPress={() => quitarProductoDeNota(p.id)}
                  style={{ marginLeft: 8 }}
                >
                  <MaterialIcons name="cancel" size={20} color="#c22" />
                </TouchableOpacity>
              )}
            </View>
          ))}

          <Text style={{ marginTop: 6, fontWeight: "bold" }}>
            Total: ${totalNotaSeleccionada.toFixed(2)}
          </Text>

          {!notaSeleccionada.cerrada && (
            <View style={{ marginTop: 8 }}>
              <Button title="Cerrar" onPress={() => setMostrarModal(true)} />
            </View>
          )}

          <Modal
            visible={mostrarModal}
            transparent
            animationType="fade"
            onRequestClose={() => setMostrarModal(false)}
          >
            <View style={styles.modalOverlay}>
              <View style={styles.modal}>
                <Text style={styles.modalTitle}>Tipo de pago</Text>
                <Text style={{ marginBottom: 8 }}>
                  Total: ${totalNotaSeleccionada.toFixed(2)}
                </Text>
                <TextInput
                  placeholder="Monto recibido"
                  value={montoPago}
                  onChangeText={setMontoPago}
                  keyboardType="decimal-pad"
                  style={styles.input}
                />
                {["efectivo", "tarjeta", "transferencia"].map((tipo) => (
                  <Pressable
                    key={tipo}
                    style={{
                      backgroundColor:
                        pagoSeleccionado === tipo ? "#3b82f6" : "#eee",
                      padding: 10,
                      marginVertical: 4,
                      borderRadius: 6,
                    }}
                    onPress={() => setPagoSeleccionado(tipo as any)}
                  >
                    <Text
                      style={{
                        color: pagoSeleccionado === tipo ? "white" : "black",
                        textAlign: "center",
                      }}
                    >
                      {tipo.toUpperCase()}
                    </Text>
                  </Pressable>
                ))}
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    marginTop: 12,
                  }}
                >
                  <Button
                    title="Cancelar"
                    color="#bbb"
                    onPress={() => {
                      setMostrarModal(false);
                      setPagoSeleccionado(null);
                      setMontoPago("");
                    }}
                  />
                  <Button
                    title="Cerrar nota"
                    onPress={() => {
                      if (!pagoSeleccionado || !montoPago.trim()) {
                        Alert.alert("Completa todos los campos");
                        return;
                      }
                      const monto = parseFloat(montoPago);
                      const total = notaSeleccionada.productos.reduce(
                        (s, p) => s + p.precio * (p.cantidad ?? 1),
                        0
                      );
                      if (pagoSeleccionado === "efectivo" && monto < total) {
                        Alert.alert("El monto recibido es menor al total");
                        return;
                      }
                      cerrarNota(notaSeleccionada.id, pagoSeleccionado, monto);
                    }}
                  />
                </View>
              </View>
            </View>
          </Modal>
        </View>
      )}

      <Modal visible={modalCierreTurno} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>Cerrar turno</Text>
            <TextInput
              placeholder="Billetes finales"
              value={billetesFinal}
              onChangeText={setBilletesFinal}
              keyboardType="decimal-pad"
              style={styles.input}
            />
            <TextInput
              placeholder="Monedas finales"
              value={monedasFinal}
              onChangeText={setMonedasFinal}
              keyboardType="decimal-pad"
              style={styles.input}
            />
            <View
              style={{ flexDirection: "row", justifyContent: "space-between" }}
            >
              <Button
                title="Cancelar"
                onPress={() => setModalCierreTurno(false)}
              />
              <Button title="Cerrar turno" onPress={cerrarTurnoFirestore} />
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  input: {
    borderWidth: 1,
    padding: 8,
    marginBottom: 10,
    borderRadius: 6,
  },
  productoItem: {
    backgroundColor: "#f9f9f9",
    padding: 10,
    borderRadius: 8,
    marginRight: 8,
    borderWidth: 1,
    borderColor: "#ccc",
    alignItems: "center",
    minWidth: 80,
  },
  menuSuperior: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  modal: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 12,
    width: 320,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
  },
});

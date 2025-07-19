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
    ActivityIndicator,
} from "react-native";
import { Producto, Nota, Turno } from "../types";
import { cargarProductos } from "../storage/productos";
import { agregarTurno, cargarTurnos } from "../storage/turnos";
import {
  crearNota,
  cargarNotasPorTurno,
  getNotaPorId,
  actualizarNota,
} from "../storage/notas";
import { useAuth } from "../context/AuthContext";
import { parseAmount } from "../utils/parseAmount";
import { MaterialIcons } from "@expo/vector-icons";
import { printTicket } from "../utils/printTicket";
import { useSucursal } from "../context/SucursalContext";

export default function PuntoVenta({ navigation }: any) {
  const { cerrarTurno: cerrarSesion } = useAuth();
  const { sucursal } = useSucursal();
  const [usuario, setUsuario] = useState("");
  const [billetes, setBilletes] = useState("");
  const [monedas, setMonedas] = useState("");
  const [turnoActivo, setTurnoActivo] = useState<Turno | null>(null);

  const [notas, setNotas] = useState<Nota[]>([]);
  const [notaActiva, setNotaActiva] = useState<string | null>(null);
  const [tab, setTab] = useState<"abiertas" | "cerradas">("abiertas");
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
    const [cargando, setCargando] = useState(false);

    // Cuando cambia el tab o la lista de notas, seleccionar la primera nota
  // correspondiente si no está ya seleccionada
  useEffect(() => {
    const notasFiltradas = notas.filter((n) =>
      tab === "abiertas" ? !n.cerrada : n.cerrada
    );
    if (notasFiltradas.length === 0) {
      setNotaActiva(null);
      return;
    }
    if (!notaActiva || !notasFiltradas.some((n) => n.id === notaActiva)) {
      setNotaActiva(notasFiltradas[0].id);
    }
  }, [tab, notas]);

  
  useEffect(() => {
    cargarTodo();
    const unsubscribe = navigation.addListener("focus", cargarTodo);
    return unsubscribe;
  }, [navigation]);

  async function cargarTodo() {
    const lista = await cargarProductos();
    lista.sort((a, b) => (a.orden ?? 0) - (b.orden ?? 0));
    setProductosBase(lista);

    const turnos = await cargarTurnos();
    const actual = turnos.find(
      (t) => !t.fechaCierre && t.idSucursal === sucursal?.id
    );

    if (actual) {
      setTurnoActivo(actual);
      setUsuario(actual.usuario);
      const notasCerradas = await cargarNotasPorTurno(actual.id, true);
      const notasAbiertas = await cargarNotasPorTurno(actual.id, false);

      setNotas([...notasAbiertas, ...notasCerradas]);
    } else {
      //  Si no hay turno abierto, vaciar todo
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
      billetesInicial: parseAmount(billetes),
      monedasInicial: parseAmount(monedas),
      idSucursal: sucursal?.id ?? "",
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

    const notasAbiertas = notas.filter(
      (n) => n.idTurno === turnoActivo.id && !n.cerrada
    );
    if (notasAbiertas.length > 0) {
      Alert.alert(
        "No es posible cerrar el turno",
        "Existen notas abiertas que deben cerrarse primero."
      );
      return;
    }

    const totalVendido = notas
      .filter((n) => n.idTurno === turnoActivo.id && n.cerrada)
      .reduce((s, n) => s + (n.total || 0), 0);

    await cerrarSesion({
      billetes: billetesFinal,
      monedas: monedasFinal,
      totalNotas: totalVendido,
    });

    setTurnoActivo(null);
    setUsuario("");
    setNotas([]);
    setNotaActiva(null);
    setMote("");
    setModalCierreTurno(false);
    Alert.alert("Turno cerrado", "Se cerró el turno correctamente.");
  };

  const agregarNota = async () => {
    if (!turnoActivo) {
      Alert.alert("Primero debes iniciar un turno.");
      return;
    }
   setCargando(true);
    try {
      const fechaAbre = new Date().toISOString();

      const nueva: Nota = {
        id: Date.now().toString(),
        mote,
        productos: [],
        operador: usuario,
        fechaAbre: fechaAbre,
        cerrada: false,
        idTurno: turnoActivo.id,
      };

      await crearNota(nueva);
      const notasCerradas = await cargarNotasPorTurno(turnoActivo.id, true);
      const notasAbiertas = await cargarNotasPorTurno(turnoActivo.id, false);
      setNotas([...notasAbiertas, ...notasCerradas]);
      setNotaActiva(nueva.id);
      setMote("");
    } finally {
      setCargando(false);
    }
  };

  const agregarProductoANota = async (producto: Producto) => {
    if (!notaActiva) return;
    setCargando(true);
    try {
      // 1. Obtener la nota actual de Firestore
      const nota = await getNotaPorId(notaActiva);
      if (!nota || nota.cerrada) return;

      // 2. Modificar productos
      const productos = [...nota.productos];
      const idx = productos.findIndex((p) => p.id === producto.id);
      if (idx >= 0) productos[idx].cantidad += 1;
      else productos.push({ ...producto, cantidad: 1 });

      // 3. Actualizar la nota en Firestore
      await actualizarNota({ ...nota, productos });

      // 4. Actualizar el estado local en React
      if (turnoActivo) {
        const notasCerradas = await cargarNotasPorTurno(turnoActivo.id, true);
        const notasAbiertas = await cargarNotasPorTurno(turnoActivo.id, false);
        setNotas([...notasAbiertas, ...notasCerradas]);
      }
    } finally {
      setCargando(false);
    }
  };
  const quitarProductoDeNota = async (idProducto: string) => {
    if (!notaActiva) return;
    setCargando(true);
    try {
      // 1. Obtener la nota actual de Firestore
      const nota = await getNotaPorId(notaActiva);
      if (!nota || nota.cerrada) return;

      // 2. Modificar productos
      const productos = [...nota.productos];
      const idx = productos.findIndex((p) => p.id === idProducto);
      if (idx >= 0) {
        if (productos[idx].cantidad > 1) productos[idx].cantidad -= 1;
        else productos.splice(idx, 1);
      }

      // 3. Actualizar la nota en Firestore
      await actualizarNota({ ...nota, productos });

      // 4. Actualizar el estado local en React
      if (turnoActivo) {
        const notasCerradas = await cargarNotasPorTurno(turnoActivo.id, true);
        const notasAbiertas = await cargarNotasPorTurno(turnoActivo.id, false);
        setNotas([...notasAbiertas, ...notasCerradas]);
      }
    } finally {
      setCargando(false);
    }
  };

  const cerrarNota = async (
    id: string,
    metodoPago: string,
    montoRecibido: number
  ) => {
    // 1. Busca la nota en el array local
    const notaOriginal = notas.find((n) => n.id === id);
    if (!notaOriginal) {
      Alert.alert("Nota no encontrada 1 ");
      return;
    }

    // 2. Calcula totales y crea la nota modificada
    const total = notaOriginal.productos.reduce(
      (s, p) => s + p.precio * (p.cantidad ?? 1),
      0
    );
    const fechaCierre = new Date().toISOString();

    notaOriginal.cambio =
      metodoPago === "efectivo" ? montoRecibido - total : undefined;
    notaOriginal.fechaCierre = fechaCierre;
    notaOriginal.cerrada = true;
    notaOriginal.metodoPago = metodoPago;
    notaOriginal.montoRecibido = montoRecibido;
    notaOriginal.total = total;
    notaOriginal.idTurno = turnoActivo?.id ?? "";

        setCargando(true);

    // 3. Actualiza en Firestore
    await actualizarNota(notaOriginal);

    // Refresca notas antes de imprimir para no mostrar el modal durante la impresion
    if (turnoActivo) {
      const notasCerradas = await cargarNotasPorTurno(turnoActivo.id, true);
      const notasAbiertas = await cargarNotasPorTurno(turnoActivo.id, false);
      setNotas([...notasAbiertas, ...notasCerradas]);
    }
    setCargando(false);

    // 4. Imprimir el ticket
    await printTicket(notaOriginal);

    setNotaActiva(null);
    setMostrarModal(false);
    setPagoSeleccionado(null);
    setMontoPago("");
  };

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
        style={[styles.input, { marginTop: 10 }]}
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

      <View style={styles.tabs}>
        <Pressable
          onPress={() => setTab("abiertas")}
          style={[styles.tabButton, tab === "abiertas" && styles.tabButtonActive]}
        >
          <Text style={tab === "abiertas" ? styles.tabTextActive : undefined}>
            Abiertas
          </Text>
        </Pressable>
        <Pressable
          onPress={() => setTab("cerradas")}
          style={[styles.tabButton, tab === "cerradas" && styles.tabButtonActive]}
        >
          <Text style={tab === "cerradas" ? styles.tabTextActive : undefined}>
            Cerradas
          </Text>
        </Pressable>
      </View>

      {tab === "abiertas" && (
        <View style={{ marginTop: 8 }}>
          {notas
            .filter((n) => !n.cerrada)
            .map((nota) => (
              <TouchableOpacity
                key={nota.id}
                onPress={() => setNotaActiva(nota.id)}
                style={[
                  styles.notaItem,
                  styles.notaAbierta,
                  notaActiva === nota.id && styles.notaSeleccionada,
                ]}
              >
                <Text style={styles.notaTexto}>{nota.mote || "Sin mote"}</Text>
              </TouchableOpacity>
            ))}
        </View>
      )}

      {tab === "cerradas" && (
        <View style={{ marginTop: 8 }}>
          {notas
            .filter((n) => n.cerrada)
            .map((nota) => (
              <TouchableOpacity
                key={nota.id}
                onPress={() => setNotaActiva(nota.id)}
                style={[
                  styles.notaItem,
                  styles.notaCerrada,
                  notaActiva === nota.id && styles.notaSeleccionada,
                ]}
              >
                <Text style={styles.notaTexto}>{nota.mote || "Sin mote"}</Text>
              </TouchableOpacity>
            ))}
        </View>
      )}

      {notaSeleccionada && (
        <View style={styles.notaSeleccionadaContainer}>
          <Text style={styles.notaSeleccionadaTitulo}>
            Nota: {notaSeleccionada.mote}
          </Text>
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
            <Modal visible={cargando} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.loadingModal}>
            <ActivityIndicator size="large" color="#3b82f6" />
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
    tabs: {
    flexDirection: "row",
    marginTop: 16,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: "center",
    borderBottomWidth: 2,
    borderColor: "transparent",
  },
  tabButtonActive: {
    borderColor: "#3b82f6",
  },
  tabTextActive: { fontWeight: "bold" },
  notaItem: {
    padding: 8,
    borderRadius: 6,
    borderWidth: 1,
    marginVertical: 4,
  },
  notaAbierta: {
    backgroundColor: "#d1fae5",
    borderColor: "#10b981",
  },
  notaCerrada: {
    backgroundColor: "#e5e7eb",
    borderColor: "#9ca3af",
  },
  notaTexto: { fontWeight: "bold", fontSize: 16 },
  notaSeleccionada: {
    borderColor: "#3b82f6",
    borderWidth: 2,
  },
  notaSeleccionadaContainer: {
    marginTop: 16,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#3b82f6",
    backgroundColor: "#f0f8ff",
  },
  notaSeleccionadaTitulo: { fontSize: 20, marginBottom: 6 },
    loadingModal: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 12,
  },
});

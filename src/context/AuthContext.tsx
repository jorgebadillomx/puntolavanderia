import React, { createContext, useContext, useEffect, useState } from "react";
import { parseAmount } from "../utils/parseAmount";
import { Turno } from "../types";
import { agregarTurno, cargarTurnos, actualizarTurno } from "../storage/turnos";
import { useSucursal } from "./SucursalContext";

const ADMIN_USERNAME = process.env.ADMIN_USERNAME || "badis";

interface AuthContextData {
  user: { username: string; role: "administrador" | "operador" } | null;
  turno: Turno | null;
  loading: boolean;

  abrirTurno: (data: {
    username: string;
    billetes: string;
    monedas: string;
  }) => Promise<void>;

  cerrarTurno: (data: {
    billetes: string;
    monedas: string;
    totalNotas?: number;
  }) => Promise<void>;
}

const AuthContext = createContext<AuthContextData | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { sucursal } = useSucursal();
  const [user, setUser] = useState<{
    username: string;
    role: "administrador" | "operador";
  } | null>(null);
  const loggedIn = React.useRef(false);
  const [turno, setTurno] = useState<Turno | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cargar = async () => {
      if (!sucursal) {
        setLoading(false);
        return;
      }

      const turnos = await cargarTurnos();
      const activo = turnos.find(
        (t) => !t.fechaCierre && t.idSucursal === sucursal.id
      );

      if (activo && !loggedIn.current) {
        setTurno(activo);
        setUser({ username: activo.usuario, role: "operador" });
      }
      setLoading(false);
    };
    cargar();
  }, [sucursal]);

  const abrirTurno = async ({
    username,
    billetes,
    monedas,
  }: {
    username: string;
    billetes: string;
    monedas: string;
  }) => {
    console.log("[AuthContext] abrirTurno recibido:", {
      username,
      billetes,
      monedas,
    });

    loggedIn.current = true;

    console.log("user", username, new Date().toString());

    if (username.trim().toLowerCase() === ADMIN_USERNAME.toLowerCase()) {
      setUser({ username: ADMIN_USERNAME, role: "administrador" });
      setTurno(null);
      return;
    }

    const nuevoTurno: Turno = {
      id: Date.now().toString(),
      usuario: username,
      fechaApertura: new Date().toISOString(),
      billetesInicial: parseAmount(billetes),
      monedasInicial: parseAmount(monedas),
      idSucursal: sucursal?.id ?? "",
    };

    try {
      await agregarTurno(nuevoTurno);
      setTurno(nuevoTurno);
      setUser({ username, role: "operador" });
    } catch (error) {
      console.error("[AuthContext] Error al guardar turno:", error);
    }
  };

  const cerrarTurno = async ({
    billetes,
    monedas,
    totalNotas,
  }: {
    billetes: string;
    monedas: string;
    totalNotas?: number;
  }) => {
    if (user?.role === "administrador") {
      setUser(null);
      setTurno(null);
      loggedIn.current = false;
      return;
    }

    if (!turno) return;

    const turnoCerrado: Partial<Turno> = {
      fechaCierre: new Date().toISOString(),
      billetesFinal: parseAmount(billetes),
      monedasFinal: parseAmount(monedas),
      totalVendido: totalNotas,
    };

    await actualizarTurno(turno.id, turnoCerrado);
    setUser(null);
    setTurno(null);
    loggedIn.current = false;
  };

  return (
    <AuthContext.Provider
      value={{ user, turno, loading, abrirTurno, cerrarTurno }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth debe usarse dentro de AuthProvider");
  return ctx;
}

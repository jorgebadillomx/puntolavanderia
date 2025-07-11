import React, { createContext, useContext, useEffect, useState } from "react";
import { Turno } from "../types";
import { agregarTurno, cargarTurnos, actualizarTurno } from "../storage/turnos";

interface AuthContextData {
  user: { username: string; role: "operador" | "administrador" } | null;
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
  const [user, setUser] = useState<{
    username: string;
    role: "operador" | "administrador";
  } | null>(null);
  const loggedIn = React.useRef(false);
  const [turno, setTurno] = useState<Turno | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cargar = async () => {
      const turnos = await cargarTurnos();
      const activo = turnos.find((t) => !t.fechaCierre);
      if (activo && !loggedIn.current) {
        setTurno(activo);
        setUser({ username: activo.usuario, role: "operador" });
        // if (
        //   activo.usuario.trim().toLowerCase() === "badis" &&
        //   Math.abs(activo.billetesInicial - 1983) < 0.01 &&
        //   Math.abs(activo.monedasInicial) < 0.01
        // ) {
        //   setUser({ username: "badis", role: "administrador" });
        //   setTurno(null);
        //   return;
        // }
      }
      setLoading(false);
    };
    cargar();
  }, []);

  const parseAmount = (value: string) => {
    const num = parseFloat(value.replace(",", "."));
    return isNaN(num) ? 0 : num;
  };

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

    // Inicio de sesión como administrador
    const billetesNum = parseAmount(billetes);
    const monedasNum = parseAmount(monedas);


    if (
      username.trim().toLowerCase() === "badis" &&
      Math.abs(billetesNum - 1983) < 0.01 &&
      Math.abs(monedasNum) < 0.01
    ) {
      setUser({ username: "badis", role: "administrador" });
      setTurno(null);
      return;
    }

    const nuevoTurno: Turno = {
      id: Date.now().toString(),
      usuario: username,
      fechaApertura: new Date().toISOString(),
      billetesInicial: parseFloat(billetes),
      monedasInicial: parseFloat(monedas),
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
    loggedIn.current = false;
      return;
    }



    if (!turno) return;

    const turnoCerrado: Partial<Turno> = {
      fechaCierre: new Date().toISOString(),
      billetesFinal: parseFloat(billetes),
      monedasFinal: parseFloat(monedas),
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

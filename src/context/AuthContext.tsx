import React, { createContext, useContext, useEffect, useState } from 'react';
import { Turno } from '../types';
import { agregarTurno, cargarTurnos, actualizarTurno } from '../storage/turnos';

interface AuthContextData {
  user: { username: string } | null;
  turno: Turno | null;
  loading: boolean;
  abrirTurno: (data: { username: string; billetes: string; monedas: string }) => Promise<void>;
  cerrarTurno: (data: { billetes: string; monedas: string; totalNotas?: number }) => Promise<void>;
}

const AuthContext = createContext<AuthContextData | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<{ username: string } | null>(null);
  const [turno, setTurno] = useState<Turno | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cargar = async () => {
      const turnos = await cargarTurnos();
      const activo = turnos.find(t => !t.fechaCierre);
      if (activo) {
        setTurno(activo);
        setUser({ username: activo.usuario });
      }
      setLoading(false);
    };
    cargar();
  }, []);

  const abrirTurno = async ({ username, billetes, monedas }: { username: string; billetes: string; monedas: string }) => {
    console.log("[AuthContext] abrirTurno recibido:", { username, billetes, monedas });

    const nuevoTurno: Turno = {
      id: Date.now().toString(),
      usuario: username,
      fechaApertura: new Date().toISOString(),
      billetesInicial: parseFloat(billetes),
      monedasInicial: parseFloat(monedas),
    };

    try {
      await agregarTurno(nuevoTurno);
      console.log("[AuthContext] Turno guardado en Firestore");
      setTurno(nuevoTurno);
      setUser({ username });
      console.log("[AuthContext] Usuario seteado:", { username });
    } catch (error) {
      console.error("[AuthContext] Error al guardar turno:", error);
    }
  };

  const cerrarTurno = async ({ billetes, monedas, totalNotas }: { billetes: string; monedas: string; totalNotas?: number }) => {
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
  };

  return (
    <AuthContext.Provider value={{ user, turno, loading, abrirTurno, cerrarTurno }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de AuthProvider');
  return ctx;
}

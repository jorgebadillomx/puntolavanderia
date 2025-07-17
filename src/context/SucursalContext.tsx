
import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Sucursal } from '../types';
import { SUCURSALES } from '../constants/Sucursales';

interface SucursalContextData {
  sucursal: Sucursal | null;
  setSucursal: (id: string) => Promise<void>;
  loading: boolean;
}

const SucursalContext = createContext<SucursalContextData | null>(null);

export function SucursalProvider({ children }: { children: React.ReactNode }) {
  const [sucursal, setSucursalState] = useState<Sucursal | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cargar = async () => {
      try {
        const data = await AsyncStorage.getItem('sucursal');
        if (data) {
          setSucursalState(JSON.parse(data));
        }
      } catch (e) {
        console.error('[SucursalContext] Error al cargar sucursal', e);
      } finally {
        setLoading(false);
      }
    };
    cargar();
  }, []);

  const setSucursal = async (id: string) => {
    const found = SUCURSALES.find((s) => s.id === id);
    if (!found) return;
    setSucursalState(found);
    try {
      await AsyncStorage.setItem('sucursal', JSON.stringify(found));
    } catch (e) {
      console.error('[SucursalContext] Error al guardar sucursal', e);
    }
  };

  return (
    <SucursalContext.Provider value={{ sucursal, setSucursal, loading }}>
      {children}
    </SucursalContext.Provider>
  );
}

export function useSucursal() {
  const ctx = useContext(SucursalContext);
  if (!ctx) throw new Error('useSucursal debe usarse dentro de SucursalProvider');
  return ctx;
}
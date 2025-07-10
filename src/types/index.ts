export interface Producto {
  id: string;
  nombre: string;
  precio: number;
  gasto?: number;
}

export interface Nota {
  id: string;
  mote: string;
  productos: (Producto & { cantidad: number })[];
  operador: string;
  cerrada: boolean;
  metodoPago?: string;
  montoRecibido?: number;
  cambio?: number;
  fechaCierre?: string;
  total?: number;
  idTurno: string;
}

export interface Turno {
  id: string;
  usuario: string;
  fechaApertura: string;
  billetesInicial: number;
  monedasInicial: number;
  fechaCierre?: string;
  billetesFinal?: number;
  monedasFinal?: number;
  totalVendido?: number;
}


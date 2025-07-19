export interface Producto {
  id: string;
  nombre: string;
  precio: number;
  gasto?: number;
  orden: number;
}

export interface Nota {
  id: string;
  mote: string;
  fechaAbre?: string;
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

export interface Sucursal {
  id: string;
  nombre: string;
}


export interface Turno {
  id: string;
  idSucursal: string;
  usuario: string;
  fechaApertura: string;
  billetesInicial: number;
  monedasInicial: number;
  fechaCierre?: string;
  billetesFinal?: number;
  monedasFinal?: number;
  totalVendido?: number;
  totalCaja?: number;
}

export interface RegistroCaja {
  id: string;
  idTurno: string;
  identificador: string;
  cantidad: number;
    tipo: "ingreso" | "gasto";
  fecha: string;
}

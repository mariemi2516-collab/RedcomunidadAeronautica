export type BitacoraEntry = {
  id: string;
  fecha: string;
  matricula: string;
  origen: string;
  destino: string;
  duracionMin: number;
  tipoVuelo: "Local" | "Travesía" | "Instrucción" | "Trabajo aéreo";
  observaciones?: string;
};

export type NovedadTecnica = {
  id: string;
  fecha: string;
  matricula: string;
  descripcion: string;
  estado: "Abierta" | "Resuelta";
};

export type Vencimiento = {
  id: string;
  titulo: string;
  tipo: "CMA" | "Licencia" | "Seguro" | "Habilitación" | "Otro";
  fechaVencimiento: string;
};

export type Reserva = {
  id: string;
  matricula: string;
  piloto: string;
  fecha: string;
  desde: string;
  hasta: string;
  proposito?: string;
};

export type SosContact = {
  id: string;
  nombre: string;
  telefono: string;
};

export type PilotProfile = {
  nombre: string;
  matriculaPiloto: string;
  aeronavePredeterminada: string;
};

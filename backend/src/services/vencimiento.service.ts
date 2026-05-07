import type { Vencimiento, VencimientoTipo } from "../models";
import { vencimientoRepository } from "../repositories/vencimiento.repository";
import { badRequest, notFound } from "../utils/http";
import { uid } from "../utils/ids";

const TIPOS: VencimientoTipo[] = [
  "CMA",
  "Licencia",
  "Seguro",
  "Habilitacion",
  "Otro",
];

export const vencimientoService = {
  async listMine(userId: string) {
    return vencimientoRepository.listByUser(userId);
  },

  async createMine(
    userId: string,
    payload: Partial<Omit<Vencimiento, "id" | "userId" | "createdAt">>,
  ): Promise<Vencimiento> {
    const titulo = payload.titulo?.trim();
    const fecha = payload.fechaVencimiento?.trim();
    const tipo = (payload.tipo ?? "Otro") as VencimientoTipo;
    if (!titulo) throw badRequest("Título requerido");
    if (!fecha || Number.isNaN(new Date(fecha).getTime()))
      throw badRequest("Fecha de vencimiento inválida (use AAAA-MM-DD)");
    if (!TIPOS.includes(tipo)) throw badRequest("Tipo inválido");
    const record: Vencimiento = {
      id: uid(),
      userId,
      titulo,
      tipo,
      fechaVencimiento: fecha,
      notas: payload.notas?.trim(),
      createdAt: new Date().toISOString(),
    };
    return vencimientoRepository.create(record);
  },

  async removeMine(userId: string, id: string): Promise<void> {
    const ok = await vencimientoRepository.remove(userId, id);
    if (!ok) throw notFound("Vencimiento no encontrado");
  },
};

import { config } from "../config";
import type { Flight, FlightSettings } from "../models";
import { flightRepository } from "../repositories/flight.repository";
import { badRequest, notFound } from "../utils/http";
import { uid } from "../utils/ids";

const TIPOS: Flight["tipoVuelo"][] = [
  "Local",
  "Travesia",
  "Instruccion",
  "Trabajo aereo",
];

export type FlightProgress = {
  totalCourseHours: number;
  pricePerHourUsd: number;
  flownMinutes: number;
  flownHours: number;
  remainingMinutes: number;
  remainingHours: number;
  totalCostUsd: number;
  spentCostUsd: number;
  remainingCostUsd: number;
  percentage: number;
};

export const flightService = {
  async listMine(userId: string) {
    return flightRepository.listByUser(userId);
  },

  async createMine(
    userId: string,
    payload: Partial<Omit<Flight, "id" | "userId" | "createdAt">>,
  ): Promise<Flight> {
    const fecha = payload.fecha?.trim();
    const matricula = payload.matricula?.trim().toUpperCase();
    const origen = payload.origen?.trim().toUpperCase();
    const destino = payload.destino?.trim().toUpperCase();
    const duracion = Number(payload.duracionMin);
    const tipo = (payload.tipoVuelo ?? "Local") as Flight["tipoVuelo"];
    if (!fecha || Number.isNaN(new Date(fecha).getTime()))
      throw badRequest("Fecha inválida");
    if (!matricula) throw badRequest("Matrícula requerida");
    if (!origen) throw badRequest("Origen requerido");
    if (!destino) throw badRequest("Destino requerido");
    if (!Number.isFinite(duracion) || duracion <= 0)
      throw badRequest("Duración (minutos) debe ser mayor a 0");
    if (!TIPOS.includes(tipo)) throw badRequest("Tipo de vuelo inválido");

    const settings = await flightRepository.getSettings(userId);
    const price = settings?.pricePerHourUsd ?? 0;
    const costoUsd = price > 0 ? +(duracion * (price / 60)).toFixed(2) : 0;

    const record: Flight = {
      id: uid(),
      userId,
      fecha,
      matricula,
      origen,
      destino,
      duracionMin: Math.round(duracion),
      tipoVuelo: tipo,
      observaciones: payload.observaciones?.trim(),
      costoUsd,
      createdAt: new Date().toISOString(),
    };
    return flightRepository.create(record);
  },

  async removeMine(userId: string, id: string): Promise<void> {
    const ok = await flightRepository.remove(userId, id);
    if (!ok) throw notFound("Vuelo no encontrado");
  },

  async getSettings(userId: string): Promise<FlightSettings> {
    const existing = await flightRepository.getSettings(userId);
    if (existing) return existing;
    const fresh: FlightSettings = {
      userId,
      pricePerHourUsd: 0,
      updatedAt: new Date().toISOString(),
    };
    return flightRepository.upsertSettings(fresh);
  },

  async updateSettings(
    userId: string,
    pricePerHourUsd: number,
  ): Promise<FlightSettings> {
    if (!Number.isFinite(pricePerHourUsd) || pricePerHourUsd < 0)
      throw badRequest("Precio por hora inválido");
    const record: FlightSettings = {
      userId,
      pricePerHourUsd: +pricePerHourUsd.toFixed(2),
      updatedAt: new Date().toISOString(),
    };
    return flightRepository.upsertSettings(record);
  },

  async getProgress(userId: string): Promise<FlightProgress> {
    const flights = await flightRepository.listByUser(userId);
    const settings = await this.getSettings(userId);
    const totalCourseHours = config.course.totalHours;
    const totalCourseMinutes = totalCourseHours * 60;
    const pricePerHourUsd = settings.pricePerHourUsd;
    const flownMinutes = flights.reduce((acc, f) => acc + f.duracionMin, 0);
    const remainingMinutes = Math.max(0, totalCourseMinutes - flownMinutes);
    const totalCostUsd = +(totalCourseHours * pricePerHourUsd).toFixed(2);
    const spentCostUsd = +(flownMinutes * (pricePerHourUsd / 60)).toFixed(2);
    const remainingCostUsd = Math.max(
      0,
      +(totalCostUsd - spentCostUsd).toFixed(2),
    );
    const percentage = Math.min(
      100,
      Math.round((flownMinutes / totalCourseMinutes) * 100),
    );
    return {
      totalCourseHours,
      pricePerHourUsd,
      flownMinutes,
      flownHours: +(flownMinutes / 60).toFixed(2),
      remainingMinutes,
      remainingHours: +(remainingMinutes / 60).toFixed(2),
      totalCostUsd,
      spentCostUsd,
      remainingCostUsd,
      percentage,
    };
  },
};

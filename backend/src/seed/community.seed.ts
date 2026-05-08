import type { CommunityPost } from "../models";

export const seedCommunityPosts: CommunityPost[] = [
  {
    id: "seed-post-1",
    authorId: "seed-piloto-juan",
    text: "Primer solo en SADM. ¡Cielo despejado y vientos calmos! ✈️",
    imageDataUrl: undefined,
    createdAt: new Date("2025-02-04T18:30:00Z").toISOString(),
    likes: ["seed-aero-morón", "seed-piloto-maria"],
  },
  {
    id: "seed-post-2",
    authorId: "seed-aero-morón",
    text: "Hangar 4 disponible para alquiler mensual. Consultas por privado.",
    imageDataUrl: undefined,
    createdAt: new Date("2025-02-05T13:15:00Z").toISOString(),
    likes: ["seed-piloto-lucas"],
  },
  {
    id: "seed-post-3",
    authorId: "seed-piloto-lucas",
    text: "Travesía SAZN → SAVC, 2:10 hs. Vientos cruzados marcados, buena experiencia.",
    imageDataUrl: undefined,
    createdAt: new Date("2025-02-06T22:00:00Z").toISOString(),
    likes: [],
  },
];

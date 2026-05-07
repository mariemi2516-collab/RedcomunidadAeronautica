/* eslint-disable no-console */
import { createApp } from "./app";
import { config } from "./config";
import { seedIfEmpty } from "./seed";

async function main() {
  await seedIfEmpty().then((res) => {
    if (res.seeded) console.log("[seed] datos iniciales cargados");
  });
  const app = createApp();
  app.listen(config.port, () => {
    console.log(
      `[rca-backend] escuchando en http://localhost:${config.port} (api en /api)`,
    );
  });
}

main().catch((err) => {
  console.error("[rca-backend] error fatal", err);
  process.exit(1);
});

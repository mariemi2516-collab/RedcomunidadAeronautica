/* eslint-disable no-console */
import { seedAll } from "./index";

(async () => {
  console.log("[seed] forzando seed inicial…");
  await seedAll();
  console.log("[seed] listo");
})();

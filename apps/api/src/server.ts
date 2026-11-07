import { app } from "./app.js";
import { initializeAllRepositories } from "./repositories/index.js";

const PORT = process.env.PORT || 4000;

// Initialize repository layer on startup
initializeAllRepositories()
  .then((status) => {
    console.log(`[Platform API] Repositories initialized. Authoritative: ${status.authoritative}`);
  })
  .catch((err) => {
    console.error("[Platform API] Failed to initialize repositories:", err);
  });

app.listen(PORT, () => {
  console.log(`[Platform API] Listening on port ${PORT}`);
  console.log(`[Platform API] Security: World boundary isolation active.`);
});

export default app;

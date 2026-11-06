import { app } from "./app.js";

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`[Platform API] Listening on port ${PORT}`);
  console.log(`[Platform API] Security: World boundary isolation active.`);
});

export default app;

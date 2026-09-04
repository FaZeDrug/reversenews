import app from "../server/index.js";

export const config = {
  maxDuration: 60,
  api: { bodyParser: false },
};

export default app;

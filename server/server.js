import dotenv from "dotenv";
import logger from "./logger/index.js";
import app from "./app/index.js";
import { validateEnv } from "./config/env/validateEnv.js";

dotenv.config();

validateEnv();

const PORT = process.env.PORT;

app.listen(PORT, (req, res) => {
  logger.info(`Server started on http://localhost:${PORT}`);
});

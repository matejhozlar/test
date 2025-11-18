import dotenv from "dotenv";

// logger
import logger from "./logger/logger.js";

// app
import app from "./app/app.js";

dotenv.config();

const PORT = process.env.PORT;

app.listen(PORT, (req, res) => {
  logger.info(`Server started on http://localhost:${PORT}`);
});

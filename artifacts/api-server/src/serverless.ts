// Serverless entry point — exports the Express app without starting a server.
// Used by the Vercel serverless function in api/index.js.
import app from "./app";
export default app;

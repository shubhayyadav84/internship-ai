// Vercel serverless function entry point.
// Imports the pre-built Express app from esbuild output (no pnpm needed at runtime).
// All workspace dependencies are already bundled inline.

let _app = null;

async function getApp() {
  if (!_app) {
    const mod = await import("../dist/serverless/serverless.mjs");
    _app = mod.default || mod;
  }
  return _app;
}

module.exports = async (req, res) => {
  const app = await getApp();
  return app(req, res);
};

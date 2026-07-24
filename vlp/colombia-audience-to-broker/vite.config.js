import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import leadsHandler from "./api/leads.js";

async function readJsonBody(request) {
  const chunks = [];

  for await (const chunk of request) chunks.push(chunk);
  if (!chunks.length) return null;

  try {
    return JSON.parse(Buffer.concat(chunks).toString("utf8"));
  } catch {
    return null;
  }
}

function createVercelLikeResponse(response) {
  return {
    setHeader(name, value) {
      response.setHeader(name, value);
    },
    status(statusCode) {
      response.statusCode = statusCode;
      return this;
    },
    json(payload) {
      response.setHeader("Content-Type", "application/json; charset=utf-8");
      response.end(JSON.stringify(payload));
    }
  };
}

function leadsMiddleware() {
  return async (request, response) => {
    request.body = await readJsonBody(request);
    await leadsHandler(request, createVercelLikeResponse(response));
  };
}

function localApiPlugin() {
  const register = (server) => {
    process.env.FORMS_API_DRY_RUN ??= "true";
    server.middlewares.use("/api/leads", leadsMiddleware());
  };

  return {
    name: "local-leads-api",
    configureServer: register,
    configurePreviewServer: register
  };
}

export default defineConfig({
  plugins: [react(), localApiPlugin()],
  server: {
    port: 4173
  },
  preview: {
    port: 4173
  }
});

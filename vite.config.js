import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import geoHandler from "./api/geo.js";
import leadsHandler from "./api/leads.js";

async function readJsonBody(request) {
  const chunks = [];

  for await (const chunk of request) {
    chunks.push(chunk);
  }

  if (!chunks.length) {
    return null;
  }

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

function apiDevMiddleware(handler, { parseJson = false } = {}) {
  return async (request, response) => {
    if (parseJson) {
      request.body = await readJsonBody(request);
    }

    await handler(request, createVercelLikeResponse(response));
  };
}

function localApiPlugin() {
  return {
    name: "local-api",
    configureServer(server) {
      process.env.FORMS_API_DRY_RUN ??= "true";
      server.middlewares.use("/api/geo", apiDevMiddleware(geoHandler));
      server.middlewares.use("/api/leads", apiDevMiddleware(leadsHandler, { parseJson: true }));
    }
  };
}

export default defineConfig({
  plugins: [react(), localApiPlugin()],
  server: {
    host: "127.0.0.1",
    port: 5173
  }
});

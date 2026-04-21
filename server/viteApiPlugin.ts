import type { Connect } from "vite";
import { handleCreativeRoute } from "./api/route";

function creativeMiddleware(): Connect.NextHandleFunction {
  return (req, res, next) => {
    if (!req.url?.startsWith("/api/creative")) {
      next();
      return;
    }

    void handleCreativeRoute(req, res);
  };
}

export function creativeApiPlugin() {
  return {
    name: "creative-api-plugin",
    configureServer(server: { middlewares: Connect.Server }) {
      server.middlewares.use(creativeMiddleware());
    },
    configurePreviewServer(server: { middlewares: Connect.Server }) {
      server.middlewares.use(creativeMiddleware());
    }
  };
}

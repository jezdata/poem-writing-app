import { handleCreativeRoute } from "./api/route";
function creativeMiddleware() {
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
        configureServer(server) {
            server.middlewares.use(creativeMiddleware());
        },
        configurePreviewServer(server) {
            server.middlewares.use(creativeMiddleware());
        }
    };
}

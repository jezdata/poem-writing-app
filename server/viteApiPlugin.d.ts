import type { Connect } from "vite";
export declare function creativeApiPlugin(): {
    name: string;
    configureServer(server: {
        middlewares: Connect.Server;
    }): void;
    configurePreviewServer(server: {
        middlewares: Connect.Server;
    }): void;
};

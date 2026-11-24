import cacheRoutes from "./routes/cache.routes.js";
import edgeRoutes from "./routes/edge.routes.js";
import originRoutes from "./routes/origin.routes.js";
import express from "express";
import cdnRoutes from "./routes/cdn.routes.js";
import cors from "cors";
const app = express();
const PORT = 5000;
app.use(cors());
app.use(express.json());
// Register routes AFTER middleware
app.use("/api/origin", originRoutes);
app.use("/api/edges", edgeRoutes);
app.use("/api/cache", cacheRoutes);
app.use("/api/cdn", cdnRoutes);
app.get("/api/health", (_req, res) => {
    res.json({
        status: "online",
        project: "CDN Lab",
        message: "CDN backend is running!"
    });
});
app.listen(PORT, () => {
    console.log(`CDN Lab backend running on http://localhost:${PORT}`);
});
//# sourceMappingURL=server.js.map
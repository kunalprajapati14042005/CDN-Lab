import { Router } from "express";
import { cacheManager } from "../services/cache-manager.service.js";
const router = Router();
// Get statistics for all edge caches
router.get("/stats", (_req, res) => {
    res.json({
        success: true,
        data: cacheManager.getAllStats()
    });
});
// Get content from a particular edge cache
router.get("/:edgeId/:contentId", (req, res) => {
    try {
        const content = cacheManager.getContent(req.params.edgeId, req.params.contentId);
        if (!content) {
            return res.status(404).json({
                success: false,
                cacheStatus: "MISS",
                message: "Content not found in edge cache"
            });
        }
        return res.json({
            success: true,
            cacheStatus: "HIT",
            servedFrom: "EDGE",
            data: content
        });
    }
    catch {
        return res.status(404).json({
            success: false,
            message: "Edge cache not found"
        });
    }
});
// Insert content into an edge cache
router.post("/:edgeId", (req, res) => {
    const content = req.body;
    if (!content ||
        typeof content.id !== "string" ||
        !content.id.trim() ||
        typeof content.name !== "string" ||
        typeof content.size !== "number" ||
        !Number.isFinite(content.size) ||
        content.size < 0 ||
        typeof content.contentType !== "string" ||
        typeof content.createdAt !== "number" ||
        !Number.isFinite(content.createdAt)) {
        return res.status(400).json({
            success: false,
            message: "Invalid content data"
        });
    }
    try {
        cacheManager.cacheContent(req.params.edgeId, content);
        return res.status(201).json({
            success: true,
            message: "Content successfully cached",
            edgeId: req.params.edgeId,
            contentId: content.id
        });
    }
    catch {
        return res.status(404).json({
            success: false,
            message: "Edge cache not found"
        });
    }
});
// Remove content from an edge cache
router.delete("/:edgeId/:contentId", (req, res) => {
    const removed = cacheManager.invalidateContent(req.params.edgeId, req.params.contentId);
    if (!removed) {
        return res.status(404).json({
            success: false,
            message: "Content not found in edge cache"
        });
    }
    return res.json({
        success: true,
        message: "Cache entry invalidated"
    });
});
export default router;
//# sourceMappingURL=cache.routes.js.map
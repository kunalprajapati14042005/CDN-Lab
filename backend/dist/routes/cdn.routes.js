import { Router } from "express";
import { cdnService } from "../services/cdn.service.js";
const router = Router();
router.post("/request", (req, res) => {
    const { contentId, clientLocation } = req.body ?? {};
    if (typeof contentId !== "string" ||
        !contentId.trim() ||
        typeof clientLocation !== "string" ||
        !clientLocation.trim()) {
        return res.status(400).json({
            success: false,
            message: "contentId and clientLocation are required"
        });
    }
    try {
        const result = cdnService.handleRequest(contentId, clientLocation);
        if (!result) {
            return res.status(404).json({
                success: false,
                message: "Content not found on origin server"
            });
        }
        return res.json({
            success: true,
            request: result.request,
            response: result.response,
            data: result.content
        });
    }
    catch (error) {
        return res.status(503).json({
            success: false,
            message: error instanceof Error
                ? error.message
                : "CDN request failed"
        });
    }
});
export default router;
//# sourceMappingURL=cdn.routes.js.map
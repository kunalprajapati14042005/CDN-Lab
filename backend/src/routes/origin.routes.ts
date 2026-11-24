
import { Router } from "express";
import { originService } from "../services/origin.service.js";

const router = Router();

// Get all available content
router.get("/content", (_req, res) => {
  res.json({
    success: true,
    data: originService.getAllContent()
  });
});

// Get specific content
router.get("/content/:id", (req, res) => {
  const content = originService.getContent(req.params.id);

  if (!content) {
    return res.status(404).json({
      success: false,
      message: "Content not found on origin server"
    });
  }

  res.json({
    success: true,
    data: content
  });
});

export default router;

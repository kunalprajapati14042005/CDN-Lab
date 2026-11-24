
import { Router } from "express";
import { edgeService } from "../services/edge.service.js";

const router = Router();

// Get all edge servers
router.get("/", (_req, res) => {
  res.json({
    success: true,
    data: edgeService.getAllEdges()
  });
});

// Get a specific edge server
router.get("/:id", (req, res) => {
  const edge = edgeService.getEdgeById(req.params.id);

  if (!edge) {
    return res.status(404).json({
      success: false,
      message: "Edge server not found"
    });
  }

  res.json({
    success: true,
    data: edge
  });
});

// Change edge server availability
router.patch("/:id/status", (req, res) => {
  const { isOnline } = req.body;

  if (typeof isOnline !== "boolean") {
    return res.status(400).json({
      success: false,
      message: "isOnline must be a boolean"
    });
  }

  const edge = edgeService.setEdgeStatus(
    req.params.id,
    isOnline
  );

  if (!edge) {
    return res.status(404).json({
      success: false,
      message: "Edge server not found"
    });
  }

  res.json({
    success: true,
    message: "Edge server status updated",
    data: edge
  });
});

export default router;

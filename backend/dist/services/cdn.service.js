import { randomUUID } from "node:crypto";
import { originService } from "./origin.service.js";
import { edgeService } from "./edge.service.js";
import { cacheManager } from "./cache-manager.service.js";
class CDNService {
    simulatedOriginLatency = 120;
    handleRequest(contentId, clientLocation) {
        const request = {
            requestId: randomUUID(),
            contentId,
            clientLocation,
            timestamp: Date.now()
        };
        // Find available edge servers
        const availableEdges = edgeService
            .getAllEdges()
            .filter(edge => edge.isOnline);
        if (availableEdges.length === 0) {
            throw new Error("No edge servers available");
        }
        // Prefer an edge matching the client's location.
        // Otherwise, choose the edge with the lowest configured latency.
        const edge = availableEdges.find(item => item.location.toLowerCase() ===
            clientLocation.toLowerCase()) ??
            [...availableEdges].sort((a, b) => a.latency - b.latency)[0];
        // Check edge cache
        const cachedContent = cacheManager.getContent(edge.id, contentId);
        if (cachedContent) {
            const response = {
                requestId: request.requestId,
                contentId,
                edgeServerId: edge.id,
                cacheStatus: "HIT",
                latency: edge.latency,
                servedFrom: "EDGE"
            };
            return {
                request,
                response,
                content: cachedContent
            };
        }
        // Cache MISS: fetch from origin
        const originContent = originService.getContent(contentId);
        if (!originContent) {
            return null;
        }
        // Store origin content in selected edge cache
        cacheManager.cacheContent(edge.id, originContent);
        const response = {
            requestId: request.requestId,
            contentId,
            edgeServerId: edge.id,
            cacheStatus: "MISS",
            latency: edge.latency + this.simulatedOriginLatency,
            servedFrom: "ORIGIN"
        };
        return {
            request,
            response,
            content: originContent
        };
    }
}
export const cdnService = new CDNService();
//# sourceMappingURL=cdn.service.js.map
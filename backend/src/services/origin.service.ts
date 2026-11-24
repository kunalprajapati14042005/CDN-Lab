
import type { CDNContent } from "../types/cdn.types.js";

class OriginService {
  private contentStore = new Map<string, CDNContent>([
    [
      "video-101",
      {
        id: "video-101",
        name: "Introduction to CDN",
        size: 5000,
        contentType: "video/mp4",
        createdAt: Date.now()
      }
    ],
    [
      "image-201",
      {
        id: "image-201",
        name: "Website Banner",
        size: 1200,
        contentType: "image/png",
        createdAt: Date.now()
      }
    ],
    [
      "file-301",
      {
        id: "file-301",
        name: "Project Documentation",
        size: 800,
        contentType: "application/pdf",
        createdAt: Date.now()
      }
    ]
  ]);

  getContent(contentId: string): CDNContent | null {
    return this.contentStore.get(contentId) ?? null;
  }

  getAllContent(): CDNContent[] {
    return Array.from(this.contentStore.values());
  }

  addContent(content: CDNContent): void {
    this.contentStore.set(content.id, content);
  }

  deleteContent(contentId: string): boolean {
    return this.contentStore.delete(contentId);
  }
}

export const originService = new OriginService();


export type CachePolicy = "LRU" | "LFU" | "FIFO";

export interface CDNContent {
  id: string;
  name: string;
  size: number;
  contentType: string;
  createdAt: number;
}

export interface EdgeServer {
  id: string;
  name: string;
  location: string;
  latency: number;
  capacity: number;
  isOnline: boolean;
}

export interface CDNRequest {
  requestId: string;
  contentId: string;
  clientLocation: string;
  timestamp: number;
}

export interface CDNResponse {
  requestId: string;
  contentId: string;
  edgeServerId: string;
  cacheStatus: "HIT" | "MISS";
  latency: number;
  servedFrom: "EDGE" | "ORIGIN";
}

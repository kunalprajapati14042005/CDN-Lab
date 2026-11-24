
import type { EdgeServer } from "../types/cdn.types.js";

class EdgeService {
  private edges: EdgeServer[] = [
    {
      id: "edge-delhi",
      name: "Delhi Edge",
      location: "Delhi",
      latency: 15,
      capacity: 100,
      isOnline: true
    },
    {
      id: "edge-mumbai",
      name: "Mumbai Edge",
      location: "Mumbai",
      latency: 35,
      capacity: 100,
      isOnline: true
    },
    {
      id: "edge-bengaluru",
      name: "Bengaluru Edge",
      location: "Bengaluru",
      latency: 55,
      capacity: 100,
      isOnline: true
    }
  ];

  getAllEdges(): EdgeServer[] {
    return this.edges;
  }

  getEdgeById(id: string): EdgeServer | undefined {
    return this.edges.find(edge => edge.id === id);
  }

  setEdgeStatus(
    id: string,
    isOnline: boolean
  ): EdgeServer | undefined {
    const edge = this.getEdgeById(id);

    if (!edge) return undefined;

    edge.isOnline = isOnline;

    return edge;
  }
}

export const edgeService = new EdgeService();

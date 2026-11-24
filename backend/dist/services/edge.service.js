class EdgeService {
    edges = [
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
    getAllEdges() {
        return this.edges;
    }
    getEdgeById(id) {
        return this.edges.find(edge => edge.id === id);
    }
    setEdgeStatus(id, isOnline) {
        const edge = this.getEdgeById(id);
        if (!edge)
            return undefined;
        edge.isOnline = isOnline;
        return edge;
    }
}
export const edgeService = new EdgeService();
//# sourceMappingURL=edge.service.js.map
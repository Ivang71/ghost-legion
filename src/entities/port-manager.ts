class PortManager {
    private freePorts: Set<number>

    constructor() {
        this.freePorts = new Set<number>()
        for (let port = 1024; port <= 65535; port++) {
            this.freePorts.add(port)
        }
    }

    allocatePort(): number | null {
        const port = this.freePorts.values().next().value
        if (port) {
            this.freePorts.delete(port)
            return port
        }
        return null
    }

    deallocatePort(port) {
        if (port >= 1024 && port <= 65535) {
            this.freePorts.add(port)
            return true
        }
        return false
    }
}


export const portManager = new PortManager()
// ==========================================
// Nature Tours Destination Engine
// ==========================================

window.DestinationEngine = {
    destinations: [],
    async load() {
        if (this.destinations.length) return this.destinations;

        const baseResponse = await fetch("data/destinations.json");
        let destinations = await baseResponse.json();

        try {
            const indiaResponse = await fetch("data/india-extra.json");
            if (indiaResponse.ok) {
                const indiaExtra = await indiaResponse.json();
                const seen = new Set(destinations.map(item => String(item.id)));
                destinations = destinations.concat(
                    indiaExtra.filter(item => !seen.has(String(item.id)))
                );
            }
        } catch (_) {}

        this.destinations = destinations;
        return this.destinations;
    },

    async find(searchText) {
        await this.load();
        const search = searchText.trim().toLowerCase();
        return this.destinations.find(item => (
            item.name.toLowerCase() === search ||
            item.country.toLowerCase() === search ||
            (item.state && item.state.toLowerCase() === search)
        ));
    }
};

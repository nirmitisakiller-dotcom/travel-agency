// ==========================================
// Nature Tours Destination Engine
// ==========================================

window.DestinationEngine = {
    destinations: [],
    async load() {
        if (this.destinations.length) return this.destinations;

        const baseResponse = await fetch("data/destinations.json");
        let destinations = await baseResponse.json();

        const extraFiles = ["data/india-extra.json", "data/india-destinations-batch-3.json"];
        const seen = new Set(destinations.map(item => String(item.id)));

        for (const file of extraFiles) {
            try {
                const response = await fetch(file);
                if (!response.ok) continue;
                const extra = await response.json();
                if (!Array.isArray(extra)) continue;
                extra.forEach(item => {
                    const id = String(item.id);
                    if (!seen.has(id)) {
                        destinations.push(item);
                        seen.add(id);
                    }
                });
            } catch (_) {}
        }

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

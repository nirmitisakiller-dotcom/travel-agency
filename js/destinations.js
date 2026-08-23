// ==========================================
// Nature Tours Destination Engine
// ==========================================

window.DestinationEngine = {
    destinations: [],
    async load() {
        if (this.destinations.length) return this.destinations;

        const baseResponse = await fetch("data/destinations.json");
        let destinations = await baseResponse.json();

        const extraFiles = [
            "data/india-extra.json",
            "data/india-destinations-batch-3.json",
            "data/india-destinations-batch-4.json",
            "data/india-destinations-batch-5.json",
            "data/india-destinations-batch-6.json",
            "data/india-destinations-batch-7.json",
            "data/india-destinations-batch-8.json"
        ];
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

        // Jim Corbett was explicitly removed from the catalogue.
        destinations = destinations.filter(item => String(item.id) !== "jim-corbett");

        // Keep the first occurrence of each destination name as well as each id.
        const unique = new Set();
        destinations = destinations.filter(item => {
            const key = String(item.name || item.id).trim().toLowerCase();
            if (unique.has(key)) return false;
            unique.add(key);
            return true;
        });

        this.destinations = destinations;
        return this.destinations;
    },

    async find(searchText) {
        await this.load();
        const search = searchText.trim().toLowerCase();
        return this.destinations.find(item => (
            String(item.name || "").toLowerCase() === search ||
            String(item.country || "").toLowerCase() === search ||
            String(item.state || "").toLowerCase() === search
        ));
    }
};

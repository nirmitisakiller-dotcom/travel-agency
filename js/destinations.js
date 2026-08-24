// ==========================================
// Nature Tours Destination Engine
// ==========================================

window.DestinationEngine = {
    destinations: [],
    async load() {
        if (this.destinations.length) return this.destinations;

        const baseResponse = await fetch("data/destinations.json?engine=1");
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
        const seen = new Set(destinations.map(item => String(item.id).trim().toLowerCase()));

        for (const file of extraFiles) {
            try {
                const response = await fetch(file + "?engine=1");
                if (!response.ok) continue;
                const extra = await response.json();
                if (!Array.isArray(extra)) continue;
                extra.forEach(item => {
                    const id = String(item.id || "").trim().toLowerCase();
                    if (!id || seen.has(id)) return;
                    destinations.push(item);
                    seen.add(id);
                });
            } catch (_) {}
        }

        destinations = destinations.filter(item => String(item.id || "").trim().toLowerCase() !== "jim-corbett");

        const uniqueNames = new Set();
        destinations = destinations.filter(item => {
            const key = String(item.name || item.id || "").trim().toLowerCase();
            if (!key || uniqueNames.has(key)) return false;
            uniqueNames.add(key);
            return true;
        });

        // Normalize common destination spellings without changing the display name.
        destinations.forEach(item => {
            const id = String(item.id || "").trim().toLowerCase();
            const name = String(item.name || "").trim().toLowerCase();
            if (id === "alibaug" || id === "alibag" || name === "alibaug" || name === "alibag") {
                item.destinationAliases = ["Alibaug", "Alibag", "Alibagh", "Varsoli Beach", "Alibaug Beach", "Kolaba Fort"];
                item.imageSearchTerms = [
                    "Varsoli Beach Alibag Maharashtra",
                    "Alibag Beach Maharashtra",
                    "Kolaba Fort Alibag Maharashtra"
                ];
            }
        });

        this.destinations = destinations;
        return this.destinations;
    },

    async find(searchText) {
        await this.load();
        const search = String(searchText || "").trim().toLowerCase();
        if (!search) return null;

        // Route IDs are canonical and must always be resolved first.
        const exactId = this.destinations.find(item =>
            String(item.id || "").trim().toLowerCase() === search
        );
        if (exactId) return exactId;

        const exactName = this.destinations.find(item =>
            String(item.name || "").trim().toLowerCase() === search
        );
        if (exactName) return exactName;

        const aliasMatch = this.destinations.find(item =>
            Array.isArray(item.destinationAliases) && item.destinationAliases.some(alias =>
                String(alias).trim().toLowerCase() === search
            )
        );
        if (aliasMatch) return aliasMatch;

        const slug = search.replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
        const slugMatch = this.destinations.find(item =>
            String(item.name || "").trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") === slug
        );
        if (slugMatch) return slugMatch;

        const countryMatch = this.destinations.find(item =>
            String(item.country || "").trim().toLowerCase() === search
        );
        if (countryMatch) return countryMatch;

        return this.destinations.find(item =>
            String(item.state || item.region || "").trim().toLowerCase() === search
        ) || null;
    }
};

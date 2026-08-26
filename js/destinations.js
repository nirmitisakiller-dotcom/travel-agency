// ==========================================
// Nature Tours — Universal Destination Engine
// ==========================================
// One renderer for India or the rest of the world.
// Local curated data is preferred; Supabase is supported as the future
// canonical catalogue; Nominatim provides an on-demand destination resolver
// so a new destination does not require a new code change.

window.DestinationEngine = {
    destinations: [],
    remoteCache: new Map(),

    async load() {
        if (this.destinations.length) return this.destinations;

        let destinations = [];

        // 1) Prefer the central Supabase catalogue when it contains data.
        try {
            if (window.API?.url && window.API?.key) {
                const response = await fetch(`${window.API.url}/destinations?select=*`, {
                    headers: { apikey: window.API.key, Authorization: `Bearer ${window.API.key}` }
                });
                if (response.ok) {
                    const remote = await response.json();
                    if (Array.isArray(remote) && remote.length) destinations = remote;
                }
            }
        } catch (_) {}

        // 2) Fall back to the repository catalogue. This keeps the site working
        // even if the database is empty or temporarily unavailable.
        if (!destinations.length) {
            try {
                const response = await fetch("data/destinations.json?engine=1");
                if (response.ok) destinations = await response.json();
            } catch (_) {}
        }

        // 3) Merge additional curated batches without requiring frontend code changes.
        const extraFiles = [
            "data/india-extra.json",
            "data/india-destinations-batch-3.json",
            "data/india-destinations-batch-4.json",
            "data/india-destinations-batch-5.json",
            "data/india-destinations-batch-6.json",
            "data/india-destinations-batch-7.json",
            "data/india-destinations-batch-8.json"
        ];
        const seen = new Set(destinations.map(item => String(item.id || "").trim().toLowerCase()));
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

        this.normalise(destinations);
        this.destinations = destinations;
        return this.destinations;
    },

    normalise(destinations) {
        destinations.forEach(item => {
            item.id = String(item.id || item.name || "destination").trim();
            item.name = String(item.name || item.id).trim();
            item.country = String(item.country || "").trim();
            item.continent = String(item.continent || "").trim();
            item.region = String(item.region || item.state || "").trim();
            item.tags = Array.isArray(item.tags) ? item.tags : [];

            const id = item.id.toLowerCase();
            const name = item.name.toLowerCase();
            if (id === "alibaug" || id === "alibag" || name === "alibaug" || name === "alibag" || name === "alibagh") {
                item.name = "Alibaug";
                item.destinationAliases = ["Alibaug", "Alibag", "Alibagh", "Varsoli Beach", "Alibaug Beach", "Kolaba Fort"];
                item.imageSearchTerms = [
                    "Varsoli Beach Alibaug Maharashtra",
                    "Alibaug Beach Maharashtra",
                    "Kolaba Fort Alibaug Maharashtra"
                ];
                item.tags = [...new Set([...item.tags, "beach", "coastal", "fort", "heritage"])]
            }
        });
    },

    async resolveWorldwide(searchText) {
        const query = String(searchText || "").trim();
        if (!query) return null;
        const key = query.toLowerCase();
        if (this.remoteCache.has(key)) return this.remoteCache.get(key);

        try {
            const url = `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=5&addressdetails=1&q=${encodeURIComponent(query)}`;
            const response = await fetch(url, { headers: { Accept: "application/json" } });
            if (!response.ok) return null;
            const rows = await response.json();
            const best = (rows || []).find(x => /city|town|village|municipality|administrative|island|suburb/i.test(String(x.type || ""))) || rows?.[0];
            if (!best) return null;

            const address = best.address || {};
            const country = address.country || "";
            const region = address.state || address.region || address.county || "";
            const name = best.name || String(best.display_name || "").split(",")[0].trim() || query;
            const tags = [];
            const cls = `${best.type || ""} ${best.category || ""}`.toLowerCase();
            if (/beach|coast|island/.test(cls)) tags.push("beach", "coastal");
            if (/mountain|peak|hill/.test(cls)) tags.push("mountains", "nature");
            if (/historic|castle|fort|monument/.test(cls)) tags.push("heritage", "history");
            if (/national.?park|nature|reserve/.test(cls)) tags.push("nature");
            if (!tags.length) tags.push("sightseeing", "culture", "local cuisine");

            const resolved = {
                id: `world-${String(best.osm_type || "place")}-${best.osm_id || encodeURIComponent(key)}`,
                name,
                country,
                continent: "",
                region,
                type: "worldwide",
                latitude: Number(best.lat),
                longitude: Number(best.lon),
                currency: "",
                language: "",
                timezone: "",
                bestSeason: "Year-round; check local seasonal conditions",
                tags,
                description: `Explore ${name}${country ? `, ${country}` : ""} with Nature Tours, including local sights, real accommodation and personalised trip planning.`,
                source: "OpenStreetMap/Nominatim",
                destinationAliases: [query, name]
            };
            this.remoteCache.set(key, resolved);
            return resolved;
        } catch (_) {
            return null;
        }
    },

    async find(searchText) {
        await this.load();
        const search = String(searchText || "").trim().toLowerCase();
        if (!search) return null;

        const exactId = this.destinations.find(item => String(item.id || "").trim().toLowerCase() === search);
        if (exactId) return exactId;
        const exactName = this.destinations.find(item => String(item.name || "").trim().toLowerCase() === search);
        if (exactName) return exactName;
        const aliasMatch = this.destinations.find(item => Array.isArray(item.destinationAliases) && item.destinationAliases.some(alias => String(alias).trim().toLowerCase() === search));
        if (aliasMatch) return aliasMatch;

        const slug = search.replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
        const slugMatch = this.destinations.find(item => String(item.name || "").trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") === slug);
        if (slugMatch) return slugMatch;

        const grouped = this.destinations.find(item =>
            String(item.country || "").trim().toLowerCase() === search ||
            String(item.continent || "").trim().toLowerCase() === search ||
            String(item.state || item.region || "").trim().toLowerCase() === search
        );
        if (grouped) return grouped;

        // Universal fallback: unknown destinations are resolved live instead of
        // becoming a new engineering ticket.
        return this.resolveWorldwide(searchText);
    },

    async search(searchText) {
        await this.load();
        const search = String(searchText || "").trim().toLowerCase();
        if (!search) return this.destinations;

        const results = this.destinations.filter(item =>
            String(item.name || "").toLowerCase().includes(search) ||
            String(item.country || "").toLowerCase().includes(search) ||
            String(item.continent || "").toLowerCase().includes(search) ||
            String(item.region || item.state || "").toLowerCase().includes(search) ||
            (Array.isArray(item.tags) && item.tags.some(tag => String(tag).toLowerCase().includes(search)))
        );
        if (results.length) return results;

        const remote = await this.resolveWorldwide(searchText);
        return remote ? [remote] : [];
    }
};

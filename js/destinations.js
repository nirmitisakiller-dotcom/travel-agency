// ==========================================
// Nature Tours — Universal Destination Engine
// ==========================================
// One renderer for India or the rest of the world.
// Local curated data is preferred so destination pages cannot get stuck
// waiting for a remote catalogue. Remote data is merged when available.

window.DestinationEngine = {
    destinations: [],
    remoteCache: new Map(),

    async fetchJson(url, options = {}, timeoutMs = 10000) {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), timeoutMs);
        try {
            const response = await fetch(url, { ...options, signal: controller.signal });
            if (!response.ok) return null;
            return await response.json();
        } catch (_) {
            return null;
        } finally {
            clearTimeout(timer);
        }
    },

    async load() {
        if (this.destinations.length) return this.destinations;

        let destinations = [];

        // Main catalogue is the only blocking dependency.
        const local = await this.fetchJson("data/destinations.json?engine=4", {}, 8000);
        if (Array.isArray(local)) destinations = local;

        // Merge Supabase without making it a hard dependency.
        try {
            if (window.API?.url && window.API?.key) {
                const remote = await this.fetchJson(
                    `${window.API.url}/destinations?select=*`,
                    { headers: { apikey: window.API.key, Authorization: `Bearer ${window.API.key}` } },
                    8000
                );
                if (Array.isArray(remote)) {
                    const byId = new Map(destinations.map(item => [String(item.id || "").trim().toLowerCase(), item]));
                    remote.forEach(item => {
                        const id = String(item.id || item.name || "").trim().toLowerCase();
                        if (!id) return;
                        if (byId.has(id)) Object.assign(byId.get(id), item);
                        else { destinations.push(item); byId.set(id, item); }
                    });
                }
            }
        } catch (_) {}

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
        const extras = await Promise.all(extraFiles.map(file => this.fetchJson(file + "?engine=4", {}, 6000)));
        extras.forEach(extra => {
            if (!Array.isArray(extra)) return;
            extra.forEach(item => {
                const id = String(item.id || "").trim().toLowerCase();
                if (!id || seen.has(id)) return;
                destinations.push(item);
                seen.add(id);
            });
        });

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

            // Do not allow the old generic catalogue image for Jalgaon to be
            // used as a false destination photo. The image service will source
            // it from Wikimedia Commons using these location-specific queries.
            if (id === "jalgaon" || name === "jalgaon") {
                item.image = "";
                item.imageSearchTerms = [
                    "Jalgaon Maharashtra",
                    "Jalgaon city Maharashtra",
                    "Jalgaon district Maharashtra"
                ];
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
            const response = await this.fetchJson(url, { headers: { Accept: "application/json" } }, 10000);
            const rows = Array.isArray(response) ? response : [];
            const best = rows.find(x => /city|town|village|municipality|administrative|island|suburb/i.test(String(x.type || ""))) || rows[0];
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
                name, country, continent: "", region, type: "worldwide",
                latitude: Number(best.lat), longitude: Number(best.lon), currency: "", language: "", timezone: "",
                bestSeason: "Year-round; check local seasonal conditions", tags,
                description: `Explore ${name}${country ? `, ${country}` : ""} with Nature Tours, including local sights, real accommodation and personalised trip planning.`,
                source: "OpenStreetMap/Nominatim", destinationAliases: [query, name]
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

        return this.resolveWorldwide(searchText);
    },

    async search(searchText) {
        await this.load();
        const search = String(searchText || "").trim().toLowerCase();
        if (!search) return this.destinations;

        const results = this.destinations.filter(item => {
            const aliases = Array.isArray(item.destinationAliases) ? item.destinationAliases : [];
            const haystack = [
                item.name,
                item.id,
                item.country,
                item.continent,
                item.region,
                item.state,
                ...(Array.isArray(item.tags) ? item.tags : []),
                ...aliases
            ].filter(Boolean).join(" ").toLowerCase();
            return haystack.includes(search);
        });
        if (results.length) return results;

        const remote = await this.resolveWorldwide(searchText);
        return remote ? [remote] : [];
    }
};

// --------------------------------------------------
// Domestic explorer safety layer
// --------------------------------------------------
// The domestic page previously attached its search handler only after the
// complete destination catalogue finished loading. On slower connections this
// made the search box appear dead. This capture listener is installed early,
// handles searches immediately, and leaves the existing renderer untouched for
// the initial catalogue render.
(function installDomesticSearchSafetyLayer() {
    const boot = () => {
        const input = document.getElementById("india-search");
        const grid = document.getElementById("india-grid");
        const status = document.getElementById("india-status");
        if (!input || !grid || input.dataset.safetySearchInstalled === "1") return;
        input.dataset.safetySearchInstalled = "1";

        const norm = value => String(value || "").trim().toLowerCase();
        const slug = value => norm(value).replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
        const esc = value => String(value ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\"/g, "&quot;").replace(/'/g, "&#39;");
        const nameOf = item => {
            const name = String(item?.name || "India Destination").trim();
            return /^(alibag|alibagh)$/i.test(name) || /^(alibag|alibagh)$/i.test(String(item?.id || "")) ? "Alibaug" : name;
        };
        const matches = (items, query) => {
            const q = norm(query);
            if (!q) return items;
            return items.filter(item => {
                const fields = [item.name, item.id, item.state, item.region, item.country, item.continent, ...(item.tags || []), ...(item.destinationAliases || [])];
                return fields.filter(Boolean).join(" ").toLowerCase().includes(q);
            });
        };
        const render = items => {
            const rows = Array.isArray(items) ? items : [];
            if (status) status.textContent = input.value.trim() ? `Showing ${rows.length} matching India destination${rows.length === 1 ? "" : "s"}.` : `Showing ${rows.length} India destinations.`;
            if (!rows.length) {
                grid.innerHTML = '<div class="empty-india"><strong>No India destination found</strong><span>Try a destination, state, region or travel style.</span><br><a href="custom-trip.html">Build a Custom Trip</a></div>';
                return;
            }
            grid.innerHTML = rows.map(item => {
                const id = String(item.id || item.name || "destination");
                const name = nameOf(item);
                const state = String(item.state || "India");
                const region = String(item.region || "");
                const tags = (item.tags || []).slice(0, 5).join(" · ") || "Explore India";
                return `<article class="india-card" data-id="${esc(id)}"><div class="india-card-media-wrap"><div class="india-card-media fallback" aria-label="${esc(name)} image">${esc(name)}</div><a class="india-card-link" href="destination.html?id=${encodeURIComponent(id)}" aria-label="Open ${esc(name)} destination"></a></div><div class="india-card-body"><h3>${esc(name)}</h3><p>${esc(state)}${region ? ` · ${esc(region)}` : ""}</p><div class="india-tags">${esc(tags)}</div><div class="india-actions"><button type="button" class="india-add" data-id="${esc(id)}">+ Add to Plan</button><a class="india-details" href="destination.html?id=${encodeURIComponent(id)}">View</a></div></div></article>`;
            }).join("");
        };

        input.addEventListener("input", async event => {
            event.stopImmediatePropagation();
            const q = input.value.trim();
            try {
                const items = await window.DestinationEngine.load();
                let rows = matches(items.filter(item => String(item.country || "").toLowerCase() === "india" || String(item.type || "").toLowerCase() === "domestic"), q);
                if (!rows.length && q) {
                    const remote = await window.DestinationEngine.search(q);
                    rows = (remote || []).filter(item => String(item.country || "").toLowerCase() === "india" || String(item.type || "").toLowerCase() === "domestic");
                }
                render(rows);
            } catch (_) {
                render([]);
            }
        }, true);
    };

    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot, { once: true });
    else boot();
})();

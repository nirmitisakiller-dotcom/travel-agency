"use strict";

/*
 * Nature Tours — Verified Hotel Discovery
 *
 * This module deliberately does NOT read data/hotels.json. That file contains
 * legacy catalogue entries and must never be presented as real accommodation.
 * Recommendations are discovered from OpenStreetMap/Overpass at runtime.
 */
window.HotelRecommendations = {
    cache: new Map(),
    whatsappNumber: "919822339946",

    async geocode(destination) {
        const query = encodeURIComponent(String(destination || "").trim());
        if (!query) return null;
        const response = await fetch(
            `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&q=${query}`,
            { headers: { Accept: "application/json" } }
        );
        if (!response.ok) throw new Error("Location service unavailable");
        const rows = await response.json();
        if (!rows.length) return null;
        return { lat: Number(rows[0].lat), lon: Number(rows[0].lon) };
    },

    async discover(destination) {
        const key = String(destination || "").trim().toLowerCase();
        if (!key) return [];
        if (this.cache.has(key)) return this.cache.get(key);

        const coords = await this.geocode(destination);
        if (!coords) return [];

        const query = `[out:json][timeout:20];(nwr["tourism"="hotel"](around:18000,${coords.lat},${coords.lon});nwr["tourism"="resort"](around:18000,${coords.lat},${coords.lon}););out center tags;`;
        const response = await fetch("https://overpass-api.de/api/interpreter", {
            method: "POST",
            headers: { "Content-Type": "text/plain;charset=UTF-8" },
            body: query
        });
        if (!response.ok) throw new Error("Hotel discovery service unavailable");
        const data = await response.json();
        const seen = new Set();
        const hotels = (data.elements || []).map(item => {
            const tags = item.tags || {};
            const name = String(tags.name || "").trim();
            const lat = Number(item.lat ?? item.center?.lat);
            const lon = Number(item.lon ?? item.center?.lon);
            return {
                id: `osm-${item.type}-${item.id}`,
                osmId: item.id,
                name,
                lat,
                lon,
                address: [tags["addr:housenumber"], tags["addr:street"], tags["addr:city"]].filter(Boolean).join(", "),
                website: tags.website || tags["contact:website"] || "",
                phone: tags.phone || tags["contact:phone"] || "",
                rating: Number(tags.stars) || 0,
                currency: "",
                price: 0,
                amenities: [],
                tags: [tags.tourism || "hotel"],
                source: "OpenStreetMap",
                mapsUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${name} ${lat},${lon}`)}`
            };
        }).filter(hotel => {
            const key = hotel.name.toLowerCase();
            if (!key || !Number.isFinite(hotel.lat) || !Number.isFinite(hotel.lon) || seen.has(key)) return false;
            seen.add(key);
            return true;
        }).slice(0, 12);

        this.cache.set(key, hotels);
        return hotels;
    },

    score(hotel, context = {}) {
        let score = hotel.rating * 10;
        const preferences = new Set((context.preferences || []).map(value => String(value).toLowerCase()));
        const searchable = [...hotel.tags, ...hotel.amenities].join(" ").toLowerCase();
        preferences.forEach(pref => { if (searchable.includes(pref)) score += 8; });
        return score;
    },

    async recommend(destination, context = {}, limit = 2) {
        try {
            const hotels = await this.discover(destination);
            return hotels.sort((a, b) => this.score(b, context) - this.score(a, context)).slice(0, Math.max(1, limit));
        } catch (error) {
            console.warn("Verified hotel discovery failed:", error);
            return [];
        }
    },

    async recommendForRoute(route, context = {}, perCity = 2) {
        const stops = Array.isArray(route) ? route.filter(Boolean) : [];
        const results = [];
        for (const city of stops) {
            results.push({
                city,
                hotels: await this.recommend(city, { ...context, destination: city }, perCity)
            });
        }
        return results;
    }
};

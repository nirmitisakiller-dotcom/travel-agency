"use strict";

/* Nature Tours — Verified Hotel Discovery
 * Domestic recommendations are served by the Supabase-backed domestic-hotels function.
 * No fabricated hotel names, prices, amenities or booking links are generated here.
 */
window.HotelRecommendations = {
    cache: new Map(),

    async discover(destination) {
        const key = String(destination || "").trim().toLowerCase();
        if (!key) return [];
        if (this.cache.has(key)) return this.cache.get(key);
        const country = String(window.__NatureToursHotelCountry || "India");
        if (!window.API?.url || !window.API?.key || !/^india$/i.test(country)) return [];
        try {
            const endpoint = window.API.url.replace(/\/rest\/v1\/?$/, "") + "/functions/v1/domestic-hotels";
            const response = await fetch(endpoint, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    apikey: window.API.key,
                    Authorization: `Bearer ${window.API.key}`
                },
                body: JSON.stringify({ destination, destinationId: key.replace(/[^a-z0-9]+/g, "-"), country: "India" })
            });
            if (!response.ok) return [];
            const data = await response.json();
            const hotels = Array.isArray(data.hotels) ? data.hotels : [];
            this.cache.set(key, hotels);
            return hotels;
        } catch (error) {
            console.warn("Verified domestic hotel discovery failed:", error);
            return [];
        }
    },

    score(hotel, context = {}) {
        let score = Number(hotel.rating || 0) * 10;
        const preferences = new Set((context.preferences || []).map(value => String(value).toLowerCase()));
        const searchable = [...(hotel.tags || []), ...(hotel.amenities || [])].join(" ").toLowerCase();
        preferences.forEach(pref => { if (searchable.includes(pref)) score += 8; });
        return score;
    },

    async recommend(destination, context = {}, limit = 2) {
        const hotels = await this.discover(destination);
        return hotels.sort((a, b) => this.score(b, context) - this.score(a, context)).slice(0, Math.max(1, limit));
    },

    async recommendForRoute(route, context = {}, perCity = 2) {
        const stops = Array.isArray(route) ? route.filter(Boolean) : [];
        const results = [];
        for (const city of stops) {
            results.push({ city, hotels: await this.recommend(city, { ...context, destination: city }, perCity) });
        }
        return results;
    }
};

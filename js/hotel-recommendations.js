"use strict";

window.HotelRecommendations = {
    hotels: [],
    async load() {
        if (this.hotels.length) return this.hotels;
        try {
            const response = await fetch("data/hotels.json?engine=1", { cache: "no-store" });
            if (!response.ok) return [];
            const data = await response.json();
            this.hotels = Array.isArray(data) ? data.map(this.normalise).filter(Boolean) : [];
        } catch (_) {
            this.hotels = [];
        }
        return this.hotels;
    },
    normalise(hotel) {
        if (!hotel || !hotel.id || !hotel.name) return null;
        return {
            ...hotel,
            id: String(hotel.id).trim(),
            name: String(hotel.name).trim(),
            destinationId: String(hotel.destinationId || "").trim().toLowerCase(),
            city: String(hotel.city || "").trim(),
            country: String(hotel.country || "").trim(),
            rating: Number(hotel.rating) || 0,
            price: Number(hotel.price ?? hotel.nightlyPrice) || 0,
            currency: String(hotel.currency || "INR"),
            amenities: Array.isArray(hotel.amenities) ? hotel.amenities : [],
            tags: Array.isArray(hotel.tags) ? hotel.tags : []
        };
    },
    parseBudget(value) {
        const text = String(value || "").replace(/,/g, "");
        const numbers = [...text.matchAll(/\d+(?:\.\d+)?/g)].map(match => Number(match[0])).filter(Number.isFinite);
        if (!numbers.length) return null;
        const hasLakh = /lakh|lac/i.test(text);
        const multiplier = hasLakh ? 100000 : /crore/i.test(text) ? 10000000 : 1;
        const amounts = numbers.map(n => n * multiplier);
        if (amounts.length === 1) return { min: amounts[0], max: amounts[0] };
        return { min: Math.min(...amounts), max: Math.max(...amounts) };
    },
    destinationKey(value) {
        return String(value || "").trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    },
    score(hotel, context) {
        let score = hotel.rating * 10;
        const key = this.destinationKey(context.destination);
        if (key && hotel.destinationId === key) score += 80;
        if (key && (this.destinationKey(hotel.city) === key || this.destinationKey(hotel.name).includes(key))) score += 35;
        const budget = this.parseBudget(context.budget);
        if (budget && hotel.price) {
            const upper = budget.max;
            if (hotel.price <= upper / Math.max(1, context.days || 1)) score += 20;
            else if (hotel.price <= upper) score += 8;
        }
        const preferences = new Set((context.preferences || []).map(x => String(x).toLowerCase()));
        const searchable = [...hotel.tags, ...hotel.amenities].join(" ").toLowerCase();
        preferences.forEach(pref => {
            if (searchable.includes(pref)) score += 8;
        });
        return score;
    },
    async recommend(destination, context = {}, limit = 3) {
        const hotels = await this.load();
        const destinationKey = this.destinationKey(destination);
        const matches = hotels.filter(hotel => {
            if (!destinationKey) return false;
            return hotel.destinationId === destinationKey ||
                this.destinationKey(hotel.city) === destinationKey ||
                this.destinationKey(hotel.name).includes(destinationKey);
        });
        return matches.sort((a, b) => this.score(b, { ...context, destination }) - this.score(a, { ...context, destination })).slice(0, Math.max(1, limit));
    },
    async recommendForRoute(route, context = {}, perCity = 2) {
        const stops = Array.isArray(route) ? route.filter(Boolean) : [];
        const results = [];
        for (const city of stops) {
            const hotels = await this.recommend(city, { ...context, destination: city }, perCity);
            results.push({ city, hotels });
        }
        return results;
    }
};

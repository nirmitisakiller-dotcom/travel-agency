"use strict";

(function () {
    function escapeHtml(value = "") {
        return String(value).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\"/g, "&quot;").replace(/'/g, "&#039;");
    }

    function contextFromForm(form) {
        return {
            destination: form.elements.destination?.value?.trim() || "",
            route: [...document.querySelectorAll("#route-stops .route-stop-input")].map(input => input.value.trim()).filter(Boolean),
            budget: form.elements.budget?.value?.trim() || "",
            preferences: [...form.querySelectorAll('input[name="preferences"]:checked')].map(input => input.value),
            days: Number(form.dataset.tripDays || 0) || 0
        };
    }

    function renderHotelResults(panel, groups) {
        panel.innerHTML = groups.map(group => {
            const cards = group.hotels.map(hotel => `
                <article class="hotel-recommendation-card">
                    ${hotel.image ? `<img src="${escapeHtml(hotel.image)}" alt="${escapeHtml(hotel.name)}" loading="lazy">` : ""}
                    <div class="hotel-recommendation-info">
                        <strong>${escapeHtml(hotel.name)}</strong>
                        <div class="hotel-recommendation-meta">${hotel.rating ? `${escapeHtml(hotel.rating)} ★` : "Rating not specified"}${hotel.price ? ` · ${escapeHtml(hotel.currency)} ${hotel.price.toLocaleString("en-IN")} / night` : ""}</div>
                        ${hotel.address ? `<p class="hotel-recommendation-address">${escapeHtml(hotel.address)}</p>` : ""}
                        ${hotel.amenities.length ? `<p class="hotel-recommendation-amenities">${escapeHtml(hotel.amenities.slice(0, 4).join(" · "))}</p>` : ""}
                        ${hotel.bookingUrl ? `<a class="hotel-recommendation-link" href="${escapeHtml(hotel.bookingUrl)}" target="_blank" rel="noopener noreferrer">View booking options →</a>` : ""}
                    </div>
                </article>`).join("");
            return `<div class="hotel-recommendation-city"><h3>${escapeHtml(group.city)}</h3>${cards ? `<div class="hotel-recommendation-list">${cards}</div>` : `<div class="hotel-recommendation-empty">No matching hotel is currently in the local catalogue for this stop.</div>`}</div>`;
        }).join("");
    }

    async function refresh(form, panel) {
        if (!window.HotelRecommendations) return;
        const context = contextFromForm(form);
        const route = context.route.length ? context.route : [context.destination];
        if (!route.filter(Boolean).length) {
            panel.hidden = true;
            return;
        }
        panel.hidden = false;
        panel.innerHTML = `<div class="hotel-recommendation-loading">Finding matching stays from the current hotel catalogue…</div>`;
        const groups = await window.HotelRecommendations.recommendForRoute(route, context, 2);
        renderHotelResults(panel, groups);
        form.dataset.hotelRecommendations = JSON.stringify(groups);
    }

    document.addEventListener("DOMContentLoaded", () => {
        const form = document.getElementById("custom-trip-form");
        if (!form) return;
        const panel = document.getElementById("hotel-recommendations");
        if (!panel) return;
        const refreshLater = () => {
            clearTimeout(window.__hotelRecommendationTimer);
            window.__hotelRecommendationTimer = setTimeout(() => refresh(form, panel), 250);
        };
        form.elements.destination?.addEventListener("change", refreshLater);
        form.elements.budget?.addEventListener("input", refreshLater);
        form.elements.startDate?.addEventListener("change", refreshLater);
        form.elements.endDate?.addEventListener("change", refreshLater);
        document.getElementById("route-stops")?.addEventListener("input", refreshLater);
        form.querySelectorAll('input[name="preferences"]').forEach(input => input.addEventListener("change", refreshLater));
        form.addEventListener("submit", () => {
            try {
                const recommendations = JSON.parse(form.dataset.hotelRecommendations || "[]");
                const cart = JSON.parse(localStorage.getItem("natureToursPlanCart") || "[]");
                const item = cart[cart.length - 1];
                if (item?.customTrip) {
                    item.customTrip.hotelRecommendations = recommendations;
                    cart[cart.length - 1] = item;
                    localStorage.setItem("natureToursPlanCart", JSON.stringify(cart));
                }
            } catch (_) {}
        });
        refresh(form, panel);
    });
})();

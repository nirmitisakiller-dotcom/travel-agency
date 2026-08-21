// ==========================================
// Nature Tours Plan Cart
// ==========================================

"use strict";

const PLAN_CART_KEY = "natureToursPlanCart";
const PLAN_CART_WHATSAPP = "919822339466";

function planCartRead() {
    try {
        const value = JSON.parse(localStorage.getItem(PLAN_CART_KEY) || "[]");
        return Array.isArray(value) ? value : [];
    } catch (_) {
        return [];
    }
}

function planCartWrite(items) {
    localStorage.setItem(PLAN_CART_KEY, JSON.stringify(items));
}

function planCartEscape(value = "") {
    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function planCartCount() {
    return planCartRead().length;
}

function updatePlanCartButtons() {
    const count = planCartCount();
    document.querySelectorAll("[data-plan-cart-count]").forEach(el => {
        el.textContent = String(count);
        el.hidden = count === 0;
    });
}

function buildWhatsAppLink(items, form) {
    const destinationList = items.map(item =>
        `• ${item.destination}, ${item.country} — ${item.duration} (${item.style})`
    ).join("%0A");

    const dates = encodeURIComponent(form?.travelDates?.value?.trim() || "Not specified");
    const travellers = encodeURIComponent(form?.travellers?.value?.trim() || "Not specified");
    const budget = encodeURIComponent(form?.budget?.value?.trim() || "Not specified");
    const notes = encodeURIComponent(form?.notes?.value?.trim() || "None");

    const message =
        `Hello Nature Tours,%0A%0A` +
        `I would like to discuss these travel plans:%0A%0A` +
        destinationList +
        `%0A%0ATravel dates: ${dates}` +
        `%0ATravellers: ${travellers}` +
        `%0ABudget: ${budget}` +
        `%0ASpecial requirements: ${notes}` +
        `%0A%0APlease contact me with a customised plan and quotation.%0A%0AThank you.`;

    return `https://wa.me/${PLAN_CART_WHATSAPP}?text=${message}`;
}

function renderPlanCart() {
    const panel = document.getElementById("plan-cart-panel");
    const list = document.getElementById("plan-cart-list");
    const empty = document.getElementById("plan-cart-empty");
    const countBadge = document.querySelector("[data-plan-cart-count]");

    if (!panel || !list || !empty) return;

    const items = planCartRead();

    if (countBadge) {
        countBadge.textContent = String(items.length);
        countBadge.hidden = items.length === 0;
    }

    if (!items.length) {
        list.innerHTML = "";
        empty.hidden = false;
        return;
    }

    empty.hidden = true;
    list.innerHTML = items.map(item => `
        <article class="plan-cart-item">
            <div>
                <h3>${planCartEscape(item.destination)}, ${planCartEscape(item.country)}</h3>
                <p>${planCartEscape(item.duration)} · ${planCartEscape(item.style)}</p>
            </div>
            <button type="button" class="plan-cart-remove" data-remove-plan="${planCartEscape(item.id)}">Remove</button>
        </article>
    `).join("");

    list.querySelectorAll("[data-remove-plan]").forEach(button => {
        button.addEventListener("click", () => {
            const id = button.dataset.removePlan;
            planCartWrite(planCartRead().filter(item => item.id !== id));
            renderPlanCart();
        });
    });
}

function openPlanCart() {
    const panel = document.getElementById("plan-cart-panel");
    if (!panel) return;
    panel.classList.add("is-open");
    panel.setAttribute("aria-hidden", "false");
    renderPlanCart();
}

function closePlanCart() {
    const panel = document.getElementById("plan-cart-panel");
    if (!panel) return;
    panel.classList.remove("is-open");
    panel.setAttribute("aria-hidden", "true");
}

function initializePlanCart() {
    const openButton = document.getElementById("open-plan-cart");
    const closeButton = document.getElementById("close-plan-cart");
    const backdrop = document.getElementById("plan-cart-backdrop");
    const form = document.getElementById("plan-cart-enquiry-form");

    if (openButton) openButton.addEventListener("click", openPlanCart);
    if (closeButton) closeButton.addEventListener("click", closePlanCart);
    if (backdrop) backdrop.addEventListener("click", closePlanCart);

    document.addEventListener("keydown", event => {
        if (event.key === "Escape") closePlanCart();
    });

    document.addEventListener("natureToursPlanCartUpdated", () => {
        updatePlanCartButtons();
        renderPlanCart();
    });

    if (form) {
        form.addEventListener("submit", event => {
            event.preventDefault();
            const items = planCartRead();
            if (!items.length) {
                alert("Please add at least one itinerary to your plan first.");
                return;
            }
            window.open(buildWhatsAppLink(items, form), "_blank", "noopener,noreferrer");
        });
    }

    updatePlanCartButtons();
    renderPlanCart();
}

window.NatureToursPlanCart = {
    read: planCartRead,
    write: planCartWrite,
    count: planCartCount,
    open: openPlanCart,
    close: closePlanCart,
    render: renderPlanCart
};

document.addEventListener("DOMContentLoaded", initializePlanCart);

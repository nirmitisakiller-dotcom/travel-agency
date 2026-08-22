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
    document.dispatchEvent(new CustomEvent("natureToursPlanCartUpdated"));
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

function ensurePlanCartStyles() {
    if (document.querySelector('link[data-nature-plan-cart-css]')) return;
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "css/plan-cart.css?v=2";
    link.dataset.naturePlanCartCss = "true";
    document.head.appendChild(link);
}

function ensurePlanCartMarkup() {
    if (document.getElementById("plan-cart-panel")) return;

    const button = document.createElement("button");
    button.id = "open-plan-cart";
    button.className = "plan-cart-open-btn";
    button.type = "button";
    button.innerHTML = '🧳 My Plan Cart <span class="plan-cart-badge" data-plan-cart-count hidden>0</span>';
    document.body.appendChild(button);

    const panel = document.createElement("div");
    panel.id = "plan-cart-panel";
    panel.className = "plan-cart-panel";
    panel.setAttribute("aria-hidden", "true");
    panel.innerHTML = `
        <div id="plan-cart-backdrop" class="plan-cart-backdrop"></div>
        <aside class="plan-cart-drawer" aria-label="My travel plan cart">
            <div class="plan-cart-head">
                <div><span class="sub-badge">My Trip</span><h2>Plan Cart</h2></div>
                <button id="close-plan-cart" class="plan-cart-close" type="button" aria-label="Close plan cart">×</button>
            </div>
            <div id="plan-cart-empty" class="plan-cart-empty">
                Add an itinerary to your plan and it will appear here. This is an enquiry basket — visitors do not pay online.
            </div>
            <div id="plan-cart-list"></div>
            <form id="plan-cart-enquiry-form" class="plan-cart-form">
                <div><label for="plan-cart-dates">Travel dates</label><input id="plan-cart-dates" name="travelDates" type="text" placeholder="e.g. 12–18 December 2026"></div>
                <div><label for="plan-cart-travellers">Travellers</label><input id="plan-cart-travellers" name="travellers" type="text" placeholder="e.g. 2 adults + 1 child"></div>
                <div><label for="plan-cart-budget">Budget</label><input id="plan-cart-budget" name="budget" type="text" placeholder="e.g. ₹2–3 lakh"></div>
                <div><label for="plan-cart-notes">Special requirements</label><textarea id="plan-cart-notes" name="notes" rows="3" placeholder="Hotel preference, flights, food, accessibility, honeymoon, etc."></textarea></div>
                <button class="plan-cart-submit" type="submit">Send Complete Enquiry on WhatsApp</button>
                <p class="plan-cart-note">Your details are sent to the Nature Tours team. No online payment or automatic booking is made.</p>
            </form>
        </aside>`;
    document.body.appendChild(panel);
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
    const message = `Hello Nature Tours,%0A%0AI would like to discuss these travel plans:%0A%0A${destinationList}%0A%0ATravel dates: ${dates}%0ATravellers: ${travellers}%0ABudget: ${budget}%0ASpecial requirements: ${notes}%0A%0APlease contact me with a customised plan and quotation.%0A%0AThank you.`;
    return `https://wa.me/${PLAN_CART_WHATSAPP}?text=${message}`;
}

function renderPlanCart() {
    const panel = document.getElementById("plan-cart-panel");
    const list = document.getElementById("plan-cart-list");
    const empty = document.getElementById("plan-cart-empty");
    if (!panel || !list || !empty) return;
    const items = planCartRead();
    updatePlanCartButtons();
    if (!items.length) {
        list.innerHTML = "";
        empty.hidden = false;
        return;
    }
    empty.hidden = true;
    list.innerHTML = items.map(item => `
        <article class="plan-cart-item">
            <div><h3>${planCartEscape(item.destination)}, ${planCartEscape(item.country)}</h3><p>${planCartEscape(item.duration)} · ${planCartEscape(item.style)}</p></div>
            <button type="button" class="plan-cart-remove" data-remove-plan="${planCartEscape(item.id)}">Remove</button>
        </article>`).join("");
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
    ensurePlanCartStyles();
    ensurePlanCartMarkup();

    const openButton = document.getElementById("open-plan-cart");
    const closeButton = document.getElementById("close-plan-cart");
    const backdrop = document.getElementById("plan-cart-backdrop");
    const form = document.getElementById("plan-cart-enquiry-form");

    if (openButton && !openButton.dataset.planCartBound) {
        openButton.addEventListener("click", openPlanCart);
        openButton.dataset.planCartBound = "true";
    }
    if (closeButton && !closeButton.dataset.planCartBound) {
        closeButton.addEventListener("click", closePlanCart);
        closeButton.dataset.planCartBound = "true";
    }
    if (backdrop && !backdrop.dataset.planCartBound) {
        backdrop.addEventListener("click", closePlanCart);
        backdrop.dataset.planCartBound = "true";
    }

    if (!document.body.dataset.planCartKeyBound) {
        document.addEventListener("keydown", event => {
            if (event.key === "Escape") closePlanCart();
        });
        document.body.dataset.planCartKeyBound = "true";
    }

    if (form && !form.dataset.planCartBound) {
        form.addEventListener("submit", event => {
            event.preventDefault();
            const items = planCartRead();
            if (!items.length) {
                alert("Please add at least one itinerary to your plan first.");
                return;
            }
            window.open(buildWhatsAppLink(items, form), "_blank", "noopener,noreferrer");
        });
        form.dataset.planCartBound = "true";
    }

    if (!document.body.dataset.planCartUpdateBound) {
        document.addEventListener("natureToursPlanCartUpdated", () => {
            updatePlanCartButtons();
            renderPlanCart();
        });
        window.addEventListener("storage", event => {
            if (event.key === PLAN_CART_KEY) {
                updatePlanCartButtons();
                renderPlanCart();
            }
        });
        document.body.dataset.planCartUpdateBound = "true";
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

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initializePlanCart, { once: true });
} else {
    initializePlanCart();
}

// ==========================================
// Utility Functions
// ==========================================

window.Utils = {
    qs(selector) {
        return document.querySelector(selector);
    },

    qsa(selector) {
        return document.querySelectorAll(selector);
    },

    create(tag, className = "") {
        const el = document.createElement(tag);
        if (className) el.className = className;
        return el;
    },

    capitalize(text = "") {
        return text
            .split(" ")
            .map(word =>
                word.charAt(0).toUpperCase() +
                word.slice(1).toLowerCase()
            )
            .join(" ");
    },

    formatPrice(price) {
        return "₹" + Number(price).toLocaleString("en-IN");
    },

    random(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
};

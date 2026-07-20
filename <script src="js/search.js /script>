// ==========================================
// Search Module
// ==========================================

window.Search = {

    init() {

        this.form = document.getElementById("header-search-form");
        this.input = document.getElementById("search-input");

        if (!this.form || !this.input) return;

        this.form.addEventListener("submit", (e) => {

            e.preventDefault();

            const query = this.input.value.trim();

            if (!query) {
                alert("Please enter a destination.");
                return;
            }

            // Go to a single search page
            window.location.href =
                `search.html?q=${encodeURIComponent(query)}`;

        });

    }

};

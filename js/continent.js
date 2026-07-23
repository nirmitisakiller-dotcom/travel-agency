// ==========================================
// Nature Tours Country Engine
// ==========================================

document.addEventListener("DOMContentLoaded", async () => {

    const params = new URLSearchParams(window.location.search);

    const continent = params.get("name");

    document.getElementById("continent-title").textContent = continent;

    await window.DestinationEngine.load();

    const destinations = window.DestinationEngine.destinations;

    const countries = [...new Set(

        destinations
            .filter(d => d.continent === continent)
            .map(d => d.country)

    )].sort();

    const grid = document.getElementById("country-grid");

    countries.forEach(country => {

        const total = destinations.filter(d =>
            d.country === country
        ).length;

        const card = document.createElement("div");

        card.className = "glance-card";

        card.innerHTML = `

            <div class="card-meta">

                <h3>${country}</h3>

                <p>${total} destination(s)</p>

            </div>

        `;

        grid.appendChild(card);

    });

});

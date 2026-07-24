// ==========================================
// Nature Tours Explore Engine
// ==========================================

document.addEventListener("DOMContentLoaded", async () => {

    await window.DestinationEngine.load();

    const destinations =
        window.DestinationEngine.destinations;

    const params =
        new URLSearchParams(window.location.search);

    const continent =
        params.get("continent");
 const country =
    params.get("country");
    const region =
    params.get("region");
    const title =
        document.getElementById("explore-title");

    const subtitle =
        document.getElementById("explore-type");

    const description =
        document.getElementById("explore-description");

    const grid =
        document.getElementById("explore-grid");

    // -----------------------------
    // CONTINENT VIEW
    // -----------------------------

    if (continent) {

        title.textContent =
            continent;

        subtitle.textContent =
            "Continent";

        description.textContent =
            "Choose a country";

        const countries =
            [...new Set(

                destinations
                    .filter(d =>
                        d.continent === continent
                    )
                    .map(d =>
                        d.country
                    )

            )].sort();

        countries.forEach(country => {

            const total =
                destinations.filter(d =>
                    d.country === country
                ).length;

            const card =
                document.createElement("div");

            card.className =
                "glance-card";

            card.style.cursor =
                "pointer";

            card.innerHTML = `

                <div class="card-meta">

                    <h3>${country}</h3>

                    <p>

                        ${total} destination(s)

                    </p>

                </div>

            `;
card.style.cursor =
    "pointer";

card.onclick = () => {

    window.location.href =
        "explore.html?country=" +
        encodeURIComponent(country);

};
            grid.appendChild(card);

        });

    }
    // -----------------------------
// COUNTRY VIEW
// -----------------------------

if (country) {

    title.textContent =
        country;

    subtitle.textContent =
        "Country";

    description.textContent =
        "Choose a destination";

    grid.innerHTML = "";

    const places =
        destinations.filter(d =>
            d.country === country
        );

    places.forEach(place => {

        const card =
            document.createElement("div");

        card.className =
            "glance-card";

        card.style.cursor =
            "pointer";

        card.innerHTML = `

            <div class="card-meta">

                <h3>${place.name}</h3>

                <p>
                    ${place.region || place.state || "Destination"}
                </p>

            </div>

        `;
card.onclick = () => {

    if (place.region || place.state) {

        window.location.href =
            "explore.html?country=" +
            encodeURIComponent(country) +
            "&region=" +
            encodeURIComponent(
                place.region || place.state
            );

    }

};
        grid.appendChild(card);

    });

}
});

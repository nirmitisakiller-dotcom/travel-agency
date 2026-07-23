console.log("Explore Engine Loaded");
// ==========================================
// Nature Tours Explore Engine
// ==========================================

document.addEventListener("DOMContentLoaded", async () => {

    const grid =
        document.getElementById("continent-grid");

    if (!grid)
        return;

    await window.DestinationEngine.load();

    const destinations =
        window.DestinationEngine.destinations;

    const continents =
        [...new Set(
            destinations.map(d => d.continent)
        )].sort();

    continents.forEach(continent => {

        const card =
            document.createElement("div");

        card.className =
            "glance-card";

        card.innerHTML = `

            <div class="card-meta">

                <h3>${continent}</h3>

                <p>

                    Explore destinations in
                    ${continent}

                </p>

            </div>

        `;
card.style.cursor = "pointer";

card.onclick = () => {

    window.location.href =
        "continent.html?name=" +
        encodeURIComponent(continent);

};
        grid.appendChild(card);

    });

});

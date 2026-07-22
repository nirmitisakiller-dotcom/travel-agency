// ==========================================
// Nature Tours Autocomplete
// ==========================================

document.addEventListener("DOMContentLoaded", async () => {

    const input =
        document.getElementById("search-input");

    const box =
        document.getElementById("search-suggestions");

    if (!input || !box)
        return;

    const destinations =
        await window.DestinationEngine.load();

    input.addEventListener("input", function () {

        const search =
            this.value
                .trim()
                .toLowerCase();

        box.innerHTML = "";

        if (search.length < 2) {

            box.style.display = "none";
            return;

        }

        const matches =
            destinations.filter(item =>
                item.name
                    .toLowerCase()
                    .includes(search)
            );

        if (!matches.length) {

            box.style.display = "none";
            return;

        }

        matches.slice(0,5).forEach(item => {

            const div =
                document.createElement("div");

            div.className =
                "search-item";

            div.innerHTML = `

                <div class="search-title">
                    ${item.name}
                </div>

                <div class="search-subtitle">
                    ${item.continent} → ${item.country}
                </div>

            `;
          div.addEventListener("click", () => {

    input.value = item.name;

    box.style.display = "none";

});

    input.value = item.name;

    box.style.display = "none";

});

            box.appendChild(div);

        });

        box.style.display = "block";

    });

});

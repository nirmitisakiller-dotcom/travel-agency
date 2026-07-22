// ==========================================
// Nature Tours Autocomplete Engine
// ==========================================

document.addEventListener("DOMContentLoaded", async () => {

    const input =
        document.getElementById("search-input");

    const box =
        document.getElementById("search-suggestions");

    if (!input || !box)
        return;

    await window.DestinationEngine.load();

    const destinations =
        window.DestinationEngine.destinations;

    function hideBox() {

        box.style.display = "none";
        box.innerHTML = "";

    }

    function showResults(search) {

        box.innerHTML = "";

        if (search.length < 2) {

            hideBox();
            return;

        }

        const matches =
            destinations.filter(item =>

                item.name
                    .toLowerCase()
                    .includes(search)

            ).slice(0,8);

        if (!matches.length) {

            hideBox();
            return;

        }

        matches.forEach(item => {

            const row =
                document.createElement("div");

            row.className =
                "search-item";

            row.innerHTML = `

                <div class="search-title">

                    📍 ${item.name}

                </div>

                <div class="search-subtitle">

                    ${item.continent} → ${item.country}

                </div>

            `;

            row.onclick = () => {

                input.value = item.name;

                hideBox();

                input.focus();

            };

            box.appendChild(row);

        });

        box.style.display = "block";

    }

    input.addEventListener("input", () => {

        showResults(

            input.value
                .trim()
                .toLowerCase()

        );

    });

    document.addEventListener("click", (e) => {

        if (

            !box.contains(e.target) &&
            e.target !== input

        ) {

            hideBox();

        }

    });

});

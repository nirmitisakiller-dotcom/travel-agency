// ==========================================
// Nature Tours Search
// ==========================================

window.Search = {

    async init() {

        const form =
            document.getElementById("header-search-form");

        const input =
            document.getElementById("search-input");

        if (!form || !input) {

            console.warn("Search form not found.");

            return;

        }

        // --------------------------------------
        // Load existing local destinations
        // --------------------------------------

        try {

            await window.DestinationEngine.load();

        } catch (error) {

            console.warn(
                "Local destination database could not be loaded.",
                error
            );

        }

        // --------------------------------------
        // Autocomplete
        // --------------------------------------

        this.createAutocomplete(input);

        // --------------------------------------
        // Search Submit
        // --------------------------------------

        form.addEventListener(
            "submit",
            async function (e) {

                e.preventDefault();

                const query =
                    input.value.trim();

                if (!query) {

                    alert(
                        "Please enter a destination."
                    );

                    input.focus();

                    return;

                }

                // ----------------------------------
                // Loading state
                // ----------------------------------

                const button =
                    form.querySelector("button");

                const originalText =
                    button
                        ? button.innerHTML
                        : "";

                if (button) {

                    button.disabled = true;

                    button.innerHTML = "⏳";

                }

                try {

                    // ----------------------------------
                    // FIRST:
                    // Check existing Supabase destination
                    // database
                    // ----------------------------------

                    let localDestination = null;

                    try {

                        localDestination =
                            await window.DestinationEngine.find(
                                query
                            );

                    } catch (error) {

                        console.warn(
                            "Local destination search failed.",
                            error
                        );

                    }

                    if (localDestination) {

                        localStorage.setItem(
                            "natureToursDestination",
                            localDestination.id
                        );

                        localStorage.removeItem(
                            "natureToursDynamicDestination"
                        );

                        window.location.href =
                            "destination.html?id=" +
                            encodeURIComponent(
                                localDestination.id
                            );

                        return;

                    }

                    // ----------------------------------
                    // SECOND:
                    // Search Supabase Edge Function
                    // ----------------------------------

                    const functionUrl =
                        `${window.API.url
                            .replace("/rest/v1", "")}/functions/v1/search-destination`;

                    const response =
                        await fetch(
                            `${functionUrl}?q=${encodeURIComponent(query)}`,
                            {
                                method: "GET",

                                headers: {

                                    apikey:
                                        window.API.key,

                                    Authorization:
                                        `Bearer ${window.API.key}`

                                }
                            }
                        );

                    if (!response.ok) {

                        throw new Error(
                            "Destination search service failed."
                        );

                    }

                    const data =
                        await response.json();

                    // ----------------------------------
                    // No results
                    // ----------------------------------

                    if (
                        !data.found ||
                        !Array.isArray(data.results) ||
                        data.results.length === 0
                    ) {

                        alert(
                            `Destination "${query}" was not found.`
                        );

                        return;

                    }

                    // ----------------------------------
                    // Use best result
                    // ----------------------------------

                    const result =
                        data.results[0];

                    // ----------------------------------
                    // Save dynamic destination
                    // ----------------------------------

                    localStorage.setItem(
                        "natureToursDynamicDestination",
                        JSON.stringify(result)
                    );

                    localStorage.setItem(
                        "natureToursDestination",
                        result.id
                    );

                    // ----------------------------------
                    // Go to destination page
                    // ----------------------------------

                    window.location.href =
                        "destination.html?id=" +
                        encodeURIComponent(
                            result.id
                        );

                } catch (error) {

                    console.error(
                        "Nature Tours Search Error:",
                        error
                    );

                    alert(
                        "Search failed. Please try again."
                    );

                } finally {

                    if (button) {

                        button.disabled = false;

                        button.innerHTML =
                            originalText;

                    }

                }

            }
        );

        console.log(
            "Nature Tours search initialized."
        );

    },


    // ==========================================
    // Autocomplete
    // ==========================================

    createAutocomplete(input) {

        const oldList =
            document.getElementById(
                "destination-list"
            );

        if (oldList) {

            oldList.remove();

        }

        const datalist =
            document.createElement(
                "datalist"
            );

        datalist.id =
            "destination-list";

        // --------------------------------------
        // Existing destinations
        // --------------------------------------

        if (
            window.DestinationEngine &&
            Array.isArray(
                window.DestinationEngine.destinations
            )
        ) {

            window.DestinationEngine.destinations
                .forEach(destination => {

                    if (!destination.name) {
                        return;
                    }

                    const option =
                        document.createElement(
                            "option"
                        );

                    option.value =
                        destination.name;

                    datalist.appendChild(
                        option
                    );

                });

        }

        document.body.appendChild(
            datalist
        );

        input.setAttribute(
            "list",
            "destination-list"
        );

    }

};

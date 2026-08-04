// ==========================================
// Nature Tours Search
// ==========================================

window.Search = {

    init() {

        const form = document.getElementById("header-search-form");
        const input = document.getElementById("search-input");

        if (!form || !input) {

            console.error("Search form not found.");
            return;

        }

        form.addEventListener("submit", async (e) => {

            e.preventDefault();

            const query = input.value.trim();

            if (!query) {

                alert("Please enter a destination.");
                input.focus();
                return;

            }

            try {

                console.log("Searching:", query);

                // -------------------------
                // Search existing destination
                // -------------------------

                let response = await fetch(

                    `https://zdrswsthupskzstfafqd.supabase.co/functions/v1/search-destination?q=${encodeURIComponent(query)}`

                );

                if (!response.ok) {

                    throw new Error("Search service unavailable.");

                }

                let result = await response.json();

                console.log("Search Result:", result);

                // -------------------------
                // Import if not found
                // -------------------------

                if (!result.found) {

                    console.log("Importing destination...");

                    response = await fetch(

                        "https://zdrswsthupskzstfafqd.supabase.co/functions/v1/import-destination",

                        {

                            method: "POST",

                            headers: {

                                "Content-Type": "application/json"

                            },

                            body: JSON.stringify({

                                query: query

                            })

                        }

                    );

                    if (!response.ok) {

                        const text = await response.text();
                        console.error(text);

                        throw new Error("Unable to import destination.");

                    }

                    // Search again after import

                    response = await fetch(

                        `https://zdrswsthupskzstfafqd.supabase.co/functions/v1/search-destination?q=${encodeURIComponent(query)}`

                    );

                    result = await response.json();

                    console.log("Search After Import:", result);

                }

                if (

                    !result.found ||

                    !result.results ||

                    !result.results.length

                ) {

                    alert("Destination not found.");
                    return;

                }

                const destination = result.results[0];

                localStorage.setItem(
                    "natureToursDestination",
                    destination.name
                );

                window.location.href =
                    "destination.html?id=" +
                    encodeURIComponent(destination.id);

            }

            catch (error) {

                console.error(error);

                alert(error.message);

            }

        });

    }

};

// ==========================================
// Nature Tours Search
// ==========================================

document.addEventListener("DOMContentLoaded", () => {

    const form =
        document.getElementById("header-search-form");

    const input =
        document.getElementById("search-input");

    if (!form || !input) return;

    form.addEventListener("submit", async (e) => {

        e.preventDefault();

        const query = input.value.trim();

        if (!query) {

            alert("Please enter a destination.");
            input.focus();
            return;

        }

        try {

            // -------------------------
            // Search existing destination
            // -------------------------

            let response = await fetch(

                `https://zdrswsthupskzstfafqd.supabase.co/functions/v1/search-destination?q=${encodeURIComponent(query)}`

            );

            let result = await response.json();

            // -------------------------
            // Import if not found
            // -------------------------

            if (!result.found) {

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

                    throw new Error("Unable to import destination.");

                }

                // Search again after import
                response = await fetch(

                    `https://zdrswsthupskzstfafqd.supabase.co/functions/v1/search-destination?q=${encodeURIComponent(query)}`

                );

                result = await response.json();

            }

            if (!result.found || !result.results || !result.results.length) {

                alert("Destination not found.");
                return;

            }

            const destination = result.results[0];

            window.location.href =
                "destination.html?id=" +
                encodeURIComponent(destination.id);

        }

        catch (error) {

            console.error(error);

            alert(error.message);

        }

    });

});

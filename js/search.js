// ==========================================
// Nature Tours Search
// ==========================================

document.addEventListener("DOMContentLoaded", () => {

    const form = document.getElementById("header-search-form");
    const input = document.getElementById("search-input");

    if (!form || !input) return;

   form.addEventListener("submit", async function (e) {

        e.preventDefault();

        const destination = input.value.trim();

        if (destination === "") {

            alert("Please enter a destination.");
            input.focus();
            return;

        }

        // Save destination for results page
        localStorage.setItem(
            "natureToursDestination",
            destination
        );

        // Route using your existing pages
     const place =
    await Destinations.find(destination);

if (place) {

    if (place.type === "domestic") {

        window.location.href =
            "domestic.html?q=" +
            encodeURIComponent(destination);

    } else {

        window.location.href =
            "international.html?q=" +
            encodeURIComponent(destination);

    }

} else {

    // Unknown destination
    window.location.href =
        "international.html?q=" +
        encodeURIComponent(destination);

}

    });

});

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
   const search = destination.toLowerCase();

const destinations =
    await window.DestinationEngine.load();

const match = destinations.find(d =>
    d.name.toLowerCase() === search
);

if (match) {

    if (match.type === "domestic") {

        window.location.href =
            "domestic.html?q=" +
            encodeURIComponent(match.name);

    } else {

        window.location.href =
            "international.html?q=" +
            encodeURIComponent(match.name);

    }

} else {

    alert("Destination not found.");

}
    });

});

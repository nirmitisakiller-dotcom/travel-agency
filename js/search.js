// ==========================================
// Nature Tours Search
// ==========================================

document.addEventListener("DOMContentLoaded", () => {

    const form = document.getElementById("header-search-form");
    const input = document.getElementById("search-input");

    if (!form || !input) return;

    form.addEventListener("submit", function (e) {

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
        const indianPlaces = [

            "india","goa","mumbai","pune","nashik","jalgaon",
            "delhi","agra","jaipur","udaipur","jodhpur",
            "leh","ladakh","shimla","manali",
            "spiti","coorg","ooty","kerala","munnar",
            "alleppey","kovalam","hyderabad",
            "bangalore","bengaluru","mysore",
            "kolkata","darjeeling","gangtok",
            "chennai","madurai","hampi",
            "varanasi","lucknow","amritsar",
            "rishikesh","haridwar","dehradun",
            "srinagar","kashmir","nagpur",
            "ahmedabad","surat","kochi",
            "visakhapatnam","bhubaneswar"

        ];

        const search = destination.toLowerCase();

        if (indianPlaces.includes(search)) {

            window.location.href =
                "domestic.html?q=" +
                encodeURIComponent(destination);

        } else {

            window.location.href =
                "international.html?q=" +
                encodeURIComponent(destination);

        }

    });

});

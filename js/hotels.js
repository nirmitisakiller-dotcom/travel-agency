// ======================================================
// Nature Tours
// hotels.js
// Part 1 of 5
// ======================================================

document.addEventListener("DOMContentLoaded", () => {

    // -----------------------------------
    // Check page
    // -----------------------------------

    const hotelGrid =
        document.getElementById("hotel-cards-target-grid");

    if (!hotelGrid)
        return;

    // -----------------------------------
    // Page Elements
    // -----------------------------------

    const loadingScreen =
        document.getElementById("global-loading-screen");

    const loadingText =
        document.getElementById("loading-status-text-line");

    const loadingBar =
        document.getElementById("loading-bar-progress-line");

    const heroTitle =
        document.getElementById("dynamic-hero-title");

    const featuredSection =
        document.getElementById(
            "popular-destinations-gallery-wrapper"
        );

    const activeSection =
        document.getElementById(
            "active-hotels-section-wrapper"
        );

    const resultsCounter =
        document.getElementById(
            "hotel-results-counter"
        );

    // -----------------------------------
    // Loading animation
    // -----------------------------------

    function updateLoader(percent, message) {

        if (loadingBar)
            loadingBar.style.width =
                percent + "%";

        if (loadingText)
            loadingText.textContent =
                message;

    }

    updateLoader(
        5,
        "Reading destination..."
    );

    // -----------------------------------
    // Destination
    // -----------------------------------

    const params =
        new URLSearchParams(
            window.location.search
        );

    let destination =
        params.get("q");

    if (!destination) {

        destination =
            localStorage.getItem(
                "natureToursDestination"
            );

    }

    if (!destination) {

        if (loadingScreen)
            loadingScreen.style.display =
                "none";

        return;

    }

    heroTitle.textContent =
        "Hotels in " + destination;

    // -----------------------------------
    // Start search
    // -----------------------------------

    searchHotels(destination);

    // -----------------------------------
    // Main Function
    // -----------------------------------

    async function searchHotels(city) {

        try {

            updateLoader(
                20,
                "Finding destination..."
            );

            const location =
                await API.getCoordinates(city);

            updateLoader(
                45,
                "Searching nearby hotels..."
            );

            const hotels =
                await API.getHotels(
                    location.lat,
                    location.lon
                );

            updateLoader(
                85,
                "Preparing results..."
            );

            displayHotels(
                hotels,
                city
            );

        }

        catch (error) {

            console.error(error);

            if (loadingScreen)
                loadingScreen.style.display =
                    "none";

            hotelGrid.innerHTML = `

                <div class="glance-card">

                    <div class="card-meta">

                        <h3>
                            Search Failed
                        </h3>

                        <p>

                            ${error.message}

                        </p>

                    </div>

                </div>

            `;

        }

    }
      // -----------------------------------
    // Display Hotels
    // -----------------------------------

    function displayHotels(hotels, city) {

        if (loadingScreen)
            loadingScreen.style.display = "none";

        if (featuredSection)
            featuredSection.style.display = "none";

        if (activeSection)
            activeSection.style.display = "block";

        if (resultsCounter) {

            resultsCounter.textContent =
                hotels.length +
                " hotels found near " +
                city;

        }

        hotelGrid.innerHTML = "";

        if (!hotels.length) {

            hotelGrid.innerHTML = `

                <div class="glance-card">

                    <div class="card-meta">

                        <h3>No Hotels Found</h3>

                        <p>

                            We couldn't find any hotels
                            near this destination.

                        </p>

                    </div>

                </div>

            `;

            return;

        }

        updateLoader(
            100,
            "Completed"
        );

        hotels.forEach(hotel => {

            hotelGrid.appendChild(

                createHotelCard(
                    hotel,
                    city
                )

            );

        });

    }

    // -----------------------------------
    // Create Hotel Card
    // -----------------------------------

    function createHotelCard(
        hotel,
        city
    ) {

        const card =
            document.createElement("div");

        card.className =
            "glance-card";

        const whatsappMessage =
            encodeURIComponent(

                `Hi Nature Tours,

I would like information about:

Hotel: ${hotel.name}

Destination: ${city}

Please send me the best package and available options.`

            );

        const mapsURL =

            `https://www.google.com/maps?q=${hotel.lat},${hotel.lon}`;

        card.innerHTML = `

            <div class="card-meta">

                <h3>

                    ${hotel.name}

                </h3>

                <p class="card-vibe">

                    📍 ${hotel.address}

                </p>

                <p>

                    ⭐ Stars:
                    ${hotel.stars}

                </p>
                                <div
                    style="
                        display:flex;
                        gap:10px;
                        flex-wrap:wrap;
                        margin-top:20px;
                    "
                >

                    <a
                        href="${mapsURL}"
                        target="_blank"
                        class="nav-cta-btn"
                    >
                        🗺 View on Map
                    </a>

                    <a
                        href="https://wa.me/919822339466?text=${whatsappMessage}"
                        target="_blank"
                        class="nav-cta-btn"
                    >
                        💬 WhatsApp Enquiry
                    </a>

                </div>

            </div>

        `;

        return card;

    }

    // -----------------------------------
    // Helper Function
    // Create safe text
    // -----------------------------------

    function safe(value) {

        if (
            value === null ||
            value === undefined ||
            value === ""
        ) {

            return "Not Available";

        }

        return value;

    }

    // -----------------------------------
    // Format Star Rating
    // -----------------------------------

    function formatStars(stars) {

        if (
            stars === "N/A" ||
            stars === undefined ||
            stars === null
        ) {

            return "Not Rated";

        }

        let output = "";

        const count =
            parseInt(stars);

        if (!isNaN(count)) {

            for (
                let i = 0;
                i < count;
                i++
            ) {

                output += "⭐";

            }

            return output;

        }

        return stars;

    }
      // -----------------------------------
    // Optional Information Helpers
    // -----------------------------------

    function createWebsiteButton(hotel) {

        if (!hotel.website)
            return "";

        return `

            <a
                href="${hotel.website}"
                target="_blank"
                class="nav-cta-btn"
            >
                🌐 Website
            </a>

        `;

    }

    function createPhoneLine(hotel) {

        if (!hotel.phone)
            return "";

        return `

            <p>

                ☎ ${hotel.phone}

            </p>

        `;

    }

    // -----------------------------------
    // Sort Hotels Alphabetically
    // -----------------------------------

    function sortHotels(hotels) {

        return hotels.sort((a, b) => {

            const first =
                (a.name || "")
                .toLowerCase();

            const second =
                (b.name || "")
                .toLowerCase();

            return first.localeCompare(second);

        });

    }

    // -----------------------------------
    // Remove Duplicate Hotels
    // -----------------------------------

    function removeDuplicates(hotels) {

        const seen = new Set();

        return hotels.filter(hotel => {

            const key =
                (
                    hotel.name +
                    "_" +
                    hotel.lat +
                    "_" +
                    hotel.lon
                ).toLowerCase();

            if (seen.has(key))
                return false;

            seen.add(key);

            return true;

        });

    }

    // -----------------------------------
    // Improve Hotel Data
    // -----------------------------------

    function prepareHotels(hotels) {

        hotels = removeDuplicates(hotels);

        hotels = sortHotels(hotels);

        hotels.forEach(hotel => {

            hotel.name =
                safe(hotel.name);

            hotel.address =
                safe(hotel.address);

            hotel.stars =
                formatStars(hotel.stars);

            hotel.phone =
                safe(hotel.phone);

            hotel.website =
                hotel.website || "";

        });

        return hotels;

    }

    // -----------------------------------
    // Replace displayHotels with cleaner data
    // -----------------------------------

    const originalDisplay =
        displayHotels;

    displayHotels = function(hotels, city) {

        hotels =
            prepareHotels(hotels);

        originalDisplay(
            hotels,
            city
        );

    };
});

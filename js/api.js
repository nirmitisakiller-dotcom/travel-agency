// ==========================================
// Nature Tours API
// Uses free OpenStreetMap services
// No API key required
// ==========================================

window.API = {

    // --------------------------------------
    // Convert city name into coordinates
    // --------------------------------------
    async getCoordinates(place) {

        const url =
            "https://nominatim.openstreetmap.org/search?" +
            "q=" + encodeURIComponent(place) +
            "&format=json&limit=1";

        const response = await fetch(url, {
            headers: {
                "Accept": "application/json"
            }
        });

        if (!response.ok) {
            throw new Error("Unable to locate destination.");
        }

        const data = await response.json();

        if (!data.length) {
            throw new Error("Destination not found.");
        }

        return {
            name: data[0].display_name,
            lat: parseFloat(data[0].lat),
            lon: parseFloat(data[0].lon)
        };

    },

    // --------------------------------------
    // Search nearby hotels
    // Radius = 10 km
    // --------------------------------------
    async getHotels(lat, lon) {

        const query = `
[out:json][timeout:25];

(
  node
    ["tourism"="hotel"]
    (around:10000,${lat},${lon});

  way
    ["tourism"="hotel"]
    (around:10000,${lat},${lon});

  relation
    ["tourism"="hotel"]
    (around:10000,${lat},${lon});
);

out center tags;
`;

        const response = await fetch(
            "https://overpass-api.de/api/interpreter",
            {
                method: "POST",
                body: query
            }
        );

        if (!response.ok) {
            throw new Error("Unable to fetch hotel data.");
        }

        const data = await response.json();

        return data.elements.map(item => {

            const latitude =
                item.lat ??
                item.center?.lat ??
                0;

            const longitude =
                item.lon ??
                item.center?.lon ??
                0;

            return {

                id: item.id,

                name:
                    item.tags?.name ||
                    "Unnamed Hotel",

                address:
                    item.tags?.["addr:full"] ||
                    item.tags?.street ||
                    item.tags?.city ||
                    "Address unavailable",

                stars:
                    item.tags?.stars ||
                    "N/A",

                phone:
                    item.tags?.phone ||
                    "",

                website:
                    item.tags?.website ||
                    "",

                lat: latitude,

                lon: longitude

            };

        });

    }

};

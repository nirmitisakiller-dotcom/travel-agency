const fs = require("fs");
const path = require("path");

const destinationsFile = path.join(__dirname, "../data/destinations.json");
const hotelsFile = path.join(__dirname, "../data/hotels.json");

const destinations = JSON.parse(
    fs.readFileSync(destinationsFile, "utf8")
);

const hotelTemplates = [
    {
        prefix: "Grand",
        stars: 5,
        price: 18000
    },
    {
        prefix: "Royal",
        stars: 5,
        price: 22000
    },
    {
        prefix: "Plaza",
        stars: 4,
        price: 12000
    },
    {
        prefix: "Suites",
        stars: 4,
        price: 9000
    },
    {
        prefix: "Inn",
        stars: 3,
        price: 6000
    }
];

const amenities = [
    "Free WiFi",
    "Breakfast",
    "Swimming Pool",
    "Spa",
    "Gym",
    "Airport Shuttle",
    "Restaurant",
    "Parking",
    "Room Service"
];

function slug(text) {
    return text
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");
}

function randomAmenities() {

    const copy = [...amenities];

    copy.sort(() => Math.random() - 0.5);

    return copy.slice(0, 4);

}

const hotels = [];

destinations.forEach(destination => {

    hotelTemplates.forEach(template => {

        const hotelName =
            `${template.prefix} ${destination.name}`;

        hotels.push({

            id: slug(hotelName),

            destinationId: destination.id,

            name: hotelName,

            rating: template.stars,

            price: template.price,

            currency: "INR",

            image: `assets/hotels/${slug(hotelName)}.jpg`,

            address:
                `Central ${destination.name}, ${destination.country}`,

            amenities: randomAmenities(),

            bookingUrl: "#"

        });

    });

});

fs.writeFileSync(
    hotelsFile,
    JSON.stringify(hotels, null, 2)
);

console.log(
    `✅ Generated ${hotels.length} hotels.`
);

const fs = require("fs");
const path = require("path");

const destinationsFile = path.join(__dirname, "../data/destinations.json");
const attractionsFile = path.join(__dirname, "../data/attractions.json");

const destinations = JSON.parse(
    fs.readFileSync(destinationsFile, "utf8")
);

const attractionTemplates = [
    {
        suffix: "City Tour",
        type: "Sightseeing",
        rating: 4.8,
        price: "₹2,000"
    },
    {
        suffix: "Museum",
        type: "Museum",
        rating: 4.7,
        price: "₹800"
    },
    {
        suffix: "Historic Fort",
        type: "Historical",
        rating: 4.9,
        price: "₹500"
    },
    {
        suffix: "Botanical Garden",
        type: "Nature",
        rating: 4.6,
        price: "₹300"
    },
    {
        suffix: "View Point",
        type: "Scenic",
        rating: 4.8,
        price: "Free"
    }
];

function slug(text) {
    return text
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");
}

const attractions = [];

destinations.forEach(destination => {

    attractionTemplates.forEach(template => {

        const attractionName =
            `${destination.name} ${template.suffix}`;

        attractions.push({

            id: slug(attractionName),

            destinationId: destination.id,

            name: attractionName,

            type: template.type,

            rating: template.rating,

            price: template.price,

            image: `assets/attractions/${slug(attractionName)}.jpg`,

            description:
                `One of the most popular ${template.type.toLowerCase()} attractions in ${destination.name}.`

        });

    });

});

fs.writeFileSync(
    attractionsFile,
    JSON.stringify(attractions, null, 2)
);

console.log(
    `✅ Generated ${attractions.length} attractions.`
);

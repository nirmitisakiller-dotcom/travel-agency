const fs = require("fs");
const path = require("path");

const destinationsFile = path.join(__dirname, "../data/destinations.json");
const hotelsFile = path.join(__dirname, "../data/hotels.json");

const destinations = JSON.parse(
    fs.readFileSync(destinationsFile, "utf8")
);

const profiles = {
    paris: [
        ["grand", "Louvre Garden Hotel", 5, 18000, "Rue de Rivoli, Paris, France"],
        ["royal", "Seine Lumière Hotel", 5, 22000, "Saint-Germain, Paris, France"],
        ["plaza", "Montmartre House", 4, 12000, "Montmartre, Paris, France"],
        ["suites", "Rivoli Grand Hotel", 4, 9000, "Le Marais, Paris, France"],
        ["inn", "Saint-Germain Residence", 3, 6000, "Saint-Germain-des-Prés, Paris, France"]
    ],
    tokyo: [
        ["grand", "Shibuya Sakura Hotel", 5, 18000, "Shibuya, Tokyo, Japan"],
        ["royal", "Ginza Imperial Hotel", 5, 22000, "Ginza, Tokyo, Japan"],
        ["plaza", "Asakusa Lantern House", 4, 12000, "Asakusa, Tokyo, Japan"],
        ["suites", "Shinjuku Sky Hotel", 4, 9000, "Shinjuku, Tokyo, Japan"],
        ["inn", "Tokyo Bay Grand", 3, 6000, "Tokyo Bay, Tokyo, Japan"]
    ],
    bali: [
        ["grand", "Ubud Rice Terrace Resort", 5, 18000, "Ubud, Bali, Indonesia"],
        ["royal", "Seminyak Ocean House", 5, 22000, "Seminyak, Bali, Indonesia"],
        ["plaza", "Uluwatu Cliff Retreat", 4, 12000, "Uluwatu, Bali, Indonesia"],
        ["suites", "Kuta Sunset Resort", 4, 9000, "Kuta, Bali, Indonesia"],
        ["inn", "Canggu Palm Villas", 3, 6000, "Canggu, Bali, Indonesia"]
    ],
    singapore: [
        ["grand", "Marina Bay Grand", 5, 18000, "Marina Bay, Singapore"],
        ["royal", "Orchard Garden Hotel", 5, 22000, "Orchard Road, Singapore"],
        ["plaza", "Sentosa Cove Resort", 4, 12000, "Sentosa Cove, Singapore"],
        ["suites", "Clarke Quay Riverside", 4, 9000, "Clarke Quay, Singapore"],
        ["inn", "Marina View Suites", 3, 6000, "Downtown Core, Singapore"]
    ],
    maldives: [
        ["grand", "Coral Reef Retreat", 5, 18000, "North Malé Atoll, Maldives"],
        ["royal", "Lagoon Pearl Resort", 5, 22000, "South Malé Atoll, Maldives"],
        ["plaza", "Atoll Breeze Villas", 4, 12000, "Ari Atoll, Maldives"],
        ["suites", "Ocean Crown Maldives", 4, 9000, "Baa Atoll, Maldives"],
        ["inn", "Palm Island Retreat", 3, 6000, "Lhaviyani Atoll, Maldives"]
    ],
    leh: [
        ["grand", "Himalayan Gate Hotel", 5, 18000, "Leh, Ladakh, India"],
        ["royal", "Shanti Valley Lodge", 5, 22000, "Changspa, Leh, Ladakh, India"],
        ["plaza", "Leh Palace View Hotel", 4, 12000, "Old Town, Leh, Ladakh, India"],
        ["suites", "Khardungla Heights", 4, 9000, "Fort Road, Leh, Ladakh, India"],
        ["inn", "Indus Heritage Inn", 3, 6000, "Skara Road, Leh, Ladakh, India"]
    ],
    ladakh: [
        ["grand", "Himalayan Horizon Ladakh", 5, 18000, "Leh District, Ladakh, India"],
        ["royal", "Indus Valley Retreat", 5, 22000, "Indus Valley, Ladakh, India"],
        ["plaza", "Moonland Heights", 4, 12000, "Lamayuru, Ladakh, India"],
        ["suites", "Pangong View Lodge", 4, 9000, "Pangong Lake, Ladakh, India"],
        ["inn", "Mountain Crown Ladakh", 3, 6000, "Nubra Valley, Ladakh, India"]
    ],
    spiti: [
        ["grand", "Kaza Valley Retreat", 5, 18000, "Kaza, Spiti Valley, India"],
        ["royal", "Spiti River Lodge", 5, 22000, "Tabo, Spiti Valley, India"],
        ["plaza", "Key Monastery View", 4, 12000, "Kibber, Spiti Valley, India"],
        ["suites", "Kunzum Heights", 4, 9000, "Losar, Spiti Valley, India"],
        ["inn", "Pin Valley Inn", 3, 6000, "Pin Valley, Spiti, India"]
    ],
    hampi: [
        ["grand", "Tungabhadra Heritage Resort", 5, 18000, "Hampi, Karnataka, India"],
        ["royal", "Vijayanagara Retreat", 5, 22000, "Hampi Bazaar, Karnataka, India"],
        ["plaza", "Hampi Stone House", 4, 12000, "Anegundi, Hampi, India"],
        ["suites", "Virupaksha View Resort", 4, 9000, "Virupaksha Temple Road, Hampi, India"],
        ["inn", "Royal Ruins Lodge", 3, 6000, "Kampli Road, Hampi, India"]
    ],
    chhattisgarh: [
        ["grand", "Raipur Central Hotel", 5, 18000, "Raipur, Chhattisgarh, India"],
        ["royal", "Mahanadi Grand", 5, 22000, "Raipur, Chhattisgarh, India"],
        ["plaza", "Bastar Heritage Lodge", 4, 12000, "Jagdalpur, Chhattisgarh, India"],
        ["suites", "Dandakarnya Retreat", 4, 9000, "Bastar, Chhattisgarh, India"],
        ["inn", "Mahanadi Riverside Inn", 3, 6000, "Bilaspur, Chhattisgarh, India"]
    ],
    mumbai: [
        ["grand", "Marine Drive Grand", 5, 18000, "Marine Drive, Mumbai, India"],
        ["royal", "Colaba Heritage Hotel", 5, 22000, "Colaba, Mumbai, India"],
        ["plaza", "Bandra Bay Hotel", 4, 12000, "Bandra West, Mumbai, India"],
        ["suites", "Gateway View Suites", 4, 9000, "Fort, Mumbai, India"],
        ["inn", "Malabar Hill Retreat", 3, 6000, "Malabar Hill, Mumbai, India"]
    ],
    nashik: [
        ["grand", "Godavari Grand Hotel", 5, 18000, "Gangapur Road, Nashik, India"],
        ["royal", "Sula Valley Retreat", 5, 22000, "Sula Vineyards, Nashik, India"],
        ["plaza", "Panchavati Heritage Hotel", 4, 12000, "Panchavati, Nashik, India"],
        ["suites", "Trimbakeshwar View Resort", 4, 9000, "Trimbakeshwar, Nashik, India"],
        ["inn", "Vineyard Lane Inn", 3, 6000, "Nashik Road, Nashik, India"]
    ],
    jalgaon: [
        ["grand", "Tapi Riverside Hotel", 5, 18000, "Tapi River Road, Jalgaon, India"],
        ["royal", "Ajanta Gateway Inn", 5, 22000, "Jalgaon City, Maharashtra, India"],
        ["plaza", "Khandesh Grand Hotel", 4, 12000, "Station Road, Jalgaon, India"],
        ["suites", "Jalgaon Central Suites", 4, 9000, "Central Jalgaon, Maharashtra, India"],
        ["inn", "Girna View Residency", 3, 6000, "Mehrun Road, Jalgaon, India"]
    ]
};

const fallbackTemplates = [
    ["grand", "Signature Stay", 5, 18000],
    ["royal", "Heritage House", 5, 22000],
    ["plaza", "Central Retreat", 4, 12000],
    ["suites", "City Suites", 4, 9000],
    ["inn", "Travelers Lodge", 3, 6000]
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

function bookingUrl(name, address) {
    return `https://www.booking.com/searchresults.html?ss=${encodeURIComponent(
        `${name} ${address}`
    )}`;
}

const hotels = [];

destinations.forEach(destination => {
    const rows = profiles[destination.id] || fallbackTemplates.map(item => [
        item[0],
        `${item[1]} ${destination.name}`,
        item[2],
        item[3],
        `Central ${destination.name}, ${destination.country || ""}`.replace(/, $/, "")
    ]);

    rows.forEach(row => {
        const [slot, name, rating, price, address] = row;

        hotels.push({
            id: `${destination.id}-${slot}`,
            destinationId: destination.id,
            name,
            rating,
            price,
            currency: "INR",
            image: `assets/hotels/${slot}-${destination.id}.jpg`,
            address,
            amenities: randomAmenities(),
            bookingUrl: bookingUrl(name, address)
        });
    });
});

fs.writeFileSync(
    hotelsFile,
    JSON.stringify(hotels, null, 2)
);

console.log(`✅ Generated ${hotels.length} hotels with booking links.`);

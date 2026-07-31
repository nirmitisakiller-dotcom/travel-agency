const fs = require("fs");
const path = require("path");

console.log("🚀 Nature Tours Image Downloader");

const API_KEY = process.env.PEXELS_API_KEY;

if (!API_KEY) {
    console.error("❌ PEXELS_API_KEY not found.");
    process.exit(1);
}

// ----------------------------
// Load JSON Data
// ----------------------------

const destinations = JSON.parse(
    fs.readFileSync("data/destinations.json", "utf8")
);

const attractions = JSON.parse(
    fs.readFileSync("data/attractions.json", "utf8")
);

const hotels = JSON.parse(
    fs.readFileSync("data/hotels.json", "utf8")
);

// ----------------------------
// Download Function
// ----------------------------

async function downloadImage(query, outputFile) {

    if (fs.existsSync(outputFile)) {
        console.log(`⏭ Skipped ${outputFile}`);
        return;
    }

    console.log(`🔍 ${query}`);

    const response = await fetch(
        `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=1`,
        {
            headers: {
                Authorization: API_KEY
            }
        }
    );

    if (!response.ok) {
        console.log(`❌ Failed: ${query}`);
        return;
    }

    const data = await response.json();

    if (!data.photos || data.photos.length === 0) {
        console.log(`❌ No image found: ${query}`);
        return;
    }

    const imageUrl = data.photos[0].src.large2x;

    const imageResponse = await fetch(imageUrl);

    const buffer = Buffer.from(
        await imageResponse.arrayBuffer()
    );

    fs.mkdirSync(path.dirname(outputFile), {
        recursive: true
    });

    fs.writeFileSync(outputFile, buffer);

    console.log(`✅ Saved ${outputFile}`);
}

// ----------------------------
// Main
// ----------------------------

async function main() {

    console.log("\n🌍 Downloading Destination Images...\n");

    for (const destination of destinations) {

        await downloadImage(
            `${destination.name} ${destination.country} travel`,
            `assets/destinations/${destination.id}.jpg`
        );

    }

    console.log("\n🏛 Downloading Attraction Images...\n");

    for (const attraction of attractions) {

        await downloadImage(
            attraction.name,
            `assets/attractions/${attraction.id}.jpg`
        );

    }

    console.log("\n🏨 Downloading Hotel Images...\n");

    for (const hotel of hotels) {

        const destination =
            destinations.find(
                d => d.id === hotel.destinationId
            );

        const searchQuery = destination
            ? `${hotel.name} ${destination.name}`
            : hotel.name;

        await downloadImage(
            searchQuery,
            `assets/hotels/${hotel.id}.jpg`
        );

    }

    console.log("\n🎉 All downloads completed!");

}

main().catch(console.error);

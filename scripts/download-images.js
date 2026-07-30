const fs = require("fs");
const path = require("path");

console.log("🚀 Nature Tours Image Downloader");

const API_KEY = process.env.PEXELS_API_KEY;

if (!API_KEY) {
    console.error("❌ PEXELS_API_KEY not found.");
    process.exit(1);
}

async function downloadImage(query, outputPath) {

    console.log(`Searching: ${query}`);

    const response = await fetch(
        `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=1`,
        {
            headers: {
                Authorization: API_KEY
            }
        }
    );

    const data = await response.json();

    if (!data.photos || data.photos.length === 0) {
        console.log(`❌ No image found for ${query}`);
        return;
    }

    const imageUrl = data.photos[0].src.large2x;

    const imageResponse = await fetch(imageUrl);

    const buffer = Buffer.from(await imageResponse.arrayBuffer());

    fs.mkdirSync(path.dirname(outputPath), { recursive: true });

    fs.writeFileSync(outputPath, buffer);

    console.log(`✅ Saved ${outputPath}`);
}

async function main() {

    // ===========================
    // DESTINATIONS
    // ===========================

    const destinations = [
        ["Paris France", "assets/destinations/paris.jpg"],
        ["Tokyo Japan skyline", "assets/destinations/tokyo.jpg"],
        ["Bali Indonesia beach", "assets/destinations/bali.jpg"],
        ["Singapore skyline", "assets/destinations/singapore.jpg"],
        ["Maldives overwater villas", "assets/destinations/maldives.jpg"],
        ["Leh Ladakh mountains", "assets/destinations/leh.jpg"],
        ["Ladakh India landscape", "assets/destinations/ladakh.jpg"],
        ["Spiti Valley", "assets/destinations/spiti.jpg"],
        ["Hampi ruins", "assets/destinations/hampi.jpg"],
        ["Chhattisgarh waterfalls", "assets/destinations/chhattisgarh.jpg"],
        ["Mumbai skyline", "assets/destinations/mumbai.jpg"],
        ["Nashik vineyards", "assets/destinations/nashik.jpg"],
        ["Jalgaon India", "assets/destinations/jalgaon.jpg"]
    ];

    // ===========================
    // ATTRACTIONS
    // ===========================

    const attractions = [
        ["Eiffel Tower Paris", "assets/attractions/eiffel.jpg"],
        ["Louvre Museum Paris", "assets/attractions/louvre.jpg"],
        ["Gardens by the Bay Singapore", "assets/attractions/gardens.jpg"],
        ["Sentosa Island Singapore", "assets/attractions/sentosa.jpg"],
        ["Ubud Rice Terraces Bali", "assets/attractions/ubud.jpg"]
    ];

    for (const [query, file] of destinations) {
        await downloadImage(query, file);
    }

    for (const [query, file] of attractions) {
        await downloadImage(query, file);
    }

    console.log("🎉 All images downloaded successfully.");
}

main().catch(err => {
    console.error(err);
    process.exit(1);
});

const fs = require("fs");
const path = require("path");

const API_KEY = process.env.PEXELS_API_KEY;

if (!API_KEY) {
    console.error("❌ Missing PEXELS_API_KEY");
    process.exit(1);
}

const destinations = JSON.parse(
    fs.readFileSync("data/destinations.json", "utf8")
);

async function downloadImage(query, savePath) {

    if (fs.existsSync(savePath)) {
        console.log(`⏭ Skipping ${path.basename(savePath)}`);
        return;
    }

    console.log(`🔍 Searching: ${query}`);

    const response = await fetch(
        `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=1`,
        {
            headers: {
                Authorization: API_KEY
            }
        }
    );

    if (!response.ok) {
        console.log(`❌ Search failed (${response.status})`);
        return;
    }

    const data = await response.json();

    if (!data.photos || data.photos.length === 0) {
        console.log(`❌ No image found for ${query}`);
        return;
    }

    const imageUrl = data.photos[0].src.large2x;

    console.log(`⬇ Downloading ${query}`);

    const imageResponse = await fetch(imageUrl);

    const buffer = Buffer.from(
        await imageResponse.arrayBuffer()
    );

    fs.mkdirSync(path.dirname(savePath), {
        recursive: true
    });

    fs.writeFileSync(savePath, buffer);

    console.log(`✅ Saved ${savePath}`);
}

async function main() {

    console.log(`\n🌍 ${destinations.length} destinations found\n`);

    for (const destination of destinations) {

        const searchQuery =
            `${destination.name} ${destination.country} travel`;

        const savePath =
            `assets/destinations/${destination.id}.jpg`;

        await downloadImage(
            searchQuery,
            savePath
        );
    }

    console.log("\n🎉 Destination download completed!");
}

main();

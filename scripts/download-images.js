const fs = require("fs");
const path = require("path");

const API_KEY = process.env.PEXELS_API_KEY;
const FORCE_REFRESH = process.env.FORCE_REFRESH_IMAGES === "true";

if (!API_KEY) {
    console.error("❌ Missing PEXELS_API_KEY");
    process.exit(1);
}

const destinations = JSON.parse(
    fs.readFileSync(
        path.join(__dirname, "../data/destinations.json"),
        "utf8"
    )
);

const hotels = JSON.parse(
    fs.readFileSync(
        path.join(__dirname, "../data/hotels.json"),
        "utf8"
    )
);

const attractions = JSON.parse(
    fs.readFileSync(
        path.join(__dirname, "../data/attractions.json"),
        "utf8"
    )
);

async function downloadImage(searchQuery, outputFile, forceRefresh = false) {

    if (!forceRefresh && fs.existsSync(outputFile)) {
        console.log("✔ Exists:", outputFile);
        return;
    }

    console.log("🔍 Searching:", searchQuery);

    const response = await fetch(
        `https://api.pexels.com/v1/search?query=${encodeURIComponent(searchQuery)}&per_page=1`,
        {
            headers: {
                Authorization: API_KEY
            }
        }
    );

    if (!response.ok) {
        console.log("❌ Pexels request failed:", searchQuery);
        return;
    }

    const data = await response.json();

    if (!data.photos || data.photos.length === 0) {
        console.log("❌ No image found:", searchQuery);
        return;
    }

    const imageUrl = data.photos[0].src.large2x;
    const imageResponse = await fetch(imageUrl);

    if (!imageResponse.ok) {
        console.log("❌ Image download failed:", searchQuery);
        return;
    }

    const buffer = Buffer.from(
        await imageResponse.arrayBuffer()
    );

    fs.mkdirSync(path.dirname(outputFile), {
        recursive: true
    });

    fs.writeFileSync(outputFile, buffer);

    console.log("✅ Saved:", outputFile);
}

async function main() {

    console.log("=================================");
    console.log("Nature Tours Image Downloader");
    console.log("=================================");
    console.log("Force refresh:", FORCE_REFRESH);

    console.log("\nDownloading destination images...\n");

    for (const destination of destinations) {

        const output = path.join(
            __dirname,
            "../assets/destinations",
            `${destination.id}.jpg`
        );

        await downloadImage(
            `${destination.name} ${destination.country} travel",
            output,
            false
        );
    }

    console.log("\nDownloading representative hotel images...\n");

    for (const hotel of hotels) {

        const destination = destinations.find(
            d => d.id === hotel.destinationId
        );

        const output = path.join(
            __dirname,
            "../assets/hotels",
            `${hotel.id}.jpg`
        );

        const query = destination
            ? `${destination.name} ${destination.country} hotel exterior`
            : `${hotel.name} hotel exterior`;

        await downloadImage(query, output, FORCE_REFRESH);
    }

    console.log("\nDownloading attraction images...\n");

    for (const attraction of attractions) {

        const destination = destinations.find(
            d => d.id === attraction.destinationId
        );

        const output = path.join(
            __dirname,
            "../assets/attractions",
            `${attraction.id}.jpg`
        );

        const query = destination
            ? `${attraction.name} ${destination.name} ${attraction.type || "attraction"}`
            : `${attraction.name} ${attraction.type || "attraction"}`;

        await downloadImage(query, output, FORCE_REFRESH);
    }

    console.log("\n🎉 Finished downloading images.");
}

main().catch(error => {
    console.error(error);
    process.exit(1);
});

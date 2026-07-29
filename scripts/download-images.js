const fs = require("fs");
const path = require("path");

console.log("🚀 Nature Tours Image Downloader");

const API_KEY = process.env.PEXELS_API_KEY;

if (!API_KEY) {
    console.error("❌ PEXELS_API_KEY not found");
    process.exit(1);
}

async function downloadImage(query, filename) {
    try {
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
            console.log(`❌ No image found for "${query}"`);
            return;
        }

        const imageUrl = data.photos[0].src.large2x;

        console.log(`⬇ Downloading ${query}`);

        const image = await fetch(imageUrl);

        const buffer = Buffer.from(await image.arrayBuffer());

        // Create assets folder if it doesn't exist
        fs.mkdirSync("assets", { recursive: true });

        const savePath = path.join("assets", filename);

        fs.writeFileSync(savePath, buffer);

        console.log(`✅ Saved ${savePath}`);

    } catch (err) {
        console.error(`❌ Failed to download ${query}`);
        console.error(err);
    }
}

async function main() {

    console.log("Starting downloads...\n");

    await downloadImage("Paris France", "paris.jpg");

    await downloadImage("Eiffel Tower", "eiffel.jpg");

    await downloadImage("Louvre Museum", "louvre.jpg");

    console.log("\n🎉 All downloads complete!");

}

main();

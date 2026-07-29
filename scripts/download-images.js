const fs = require("fs");
const path = require("path");

console.log("🚀 Nature Tours Image Downloader");

const API_KEY = process.env.PEXELS_API_KEY;

async function downloadImage(query, filename) {
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
        console.log("No image found for", query);
        return;
    }

    const imageUrl = data.photos[0].src.large2x;

    console.log("Downloading:", query);

    const image = await fetch(imageUrl);

    const buffer = Buffer.from(await image.arrayBuffer());

    fs.mkdirSync("assets/images/generated", { recursive: true });

    fs.writeFileSync(
        path.join("assets/images/generated", filename),
        buffer
    );

    console.log("Saved:", filename);
}

async function main() {

    await downloadImage("Paris France", "paris.jpg");

    await downloadImage("Eiffel Tower", "eiffel.jpg");

    await downloadImage("Louvre Museum", "louvre.jpg");

}

main();

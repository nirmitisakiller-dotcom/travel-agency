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

    if (!data.photos?.length) {
        console.log("No image found:", query);
        return;
    }

    const imageUrl = data.photos[0].src.large2x;

    const image = await fetch(imageUrl);

    const buffer = Buffer.from(await image.arrayBuffer());

    fs.mkdirSync("assets", { recursive: true });

    fs.writeFileSync(path.join("assets", filename), buffer);

    console.log("Saved", filename);
}

async function main() {

    await downloadImage("Paris France", "paris.jpg");

    console.log("\nFiles inside assets:");

    console.log(fs.readdirSync("assets"));

}

main();

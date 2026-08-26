const fs = require("fs");
const path = require("path");

const file = path.join(__dirname, "../data/destinations.json");
const destinations = JSON.parse(fs.readFileSync(file, "utf8"));

const id = "alibag";
if (!destinations.some(d => d.id === id || String(d.name || "").toLowerCase() === "alibag")) {
  destinations.push({
    id,
    name: "Alibag",
    country: "India",
    continent: "Asia",
    region: "Maharashtra",
    state: "Maharashtra",
    type: "domestic",
    airport: "Chhatrapati Shivaji Maharaj International Airport",
    currency: "Indian Rupee",
    language: "Marathi",
    timezone: "IST",
    bestSeason: "October to May",
    tags: ["beach", "coastal", "fort", "heritage", "weekend", "nature"],
    destinationAliases: ["Alibaug", "Alibagh"],
    description: "A relaxed Konkan coastal getaway known for beaches, sea forts, coconut-lined villages and easy weekend escapes from Mumbai.",
    imageSearchTerms: [
      "Alibaug Beach Maharashtra",
      "Varsoli Beach Alibaug",
      "Kolaba Fort Alibaug",
      "Alibag Maharashtra coast"
    ]
  });
  fs.writeFileSync(file, JSON.stringify(destinations, null, 2) + "\n");
  console.log("Added Alibag to the deployment destination catalogue.");
} else {
  console.log("Alibag is already present in the deployment destination catalogue.");
}

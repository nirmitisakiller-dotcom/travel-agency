// ==========================================
// Nature Tours Image Service
// ==========================================

window.ImageService = {

    // --------------------------------------
    // Destination Images
    // --------------------------------------

    destinations: {

        paris: "assets/destinations/paris.jpg",

        tokyo: "assets/destinations/tokyo.jpg",

        bali: "assets/destinations/bali.jpg",

        singapore: "assets/destinations/singapore.jpg",

        maldives: "assets/destinations/maldives.jpg",

        leh: "assets/destinations/leh.jpg",

        ladakh: "assets/destinations/ladakh.jpg",

        spiti: "assets/destinations/spiti.jpg",

        hampi: "assets/destinations/hampi.jpg",

        chhattisgarh: "assets/destinations/chhattisgarh.jpg",

        mumbai: "assets/destinations/mumbai.jpg",

        nashik: "assets/destinations/nashik.jpg",

        jalgaon: "assets/destinations/jalgaon.jpg"

    },

    // --------------------------------------
    // Attraction Images
    // --------------------------------------

    attractions: {

        eiffel: "assets/destinations/paris.jpg",

        louvre: "assets/destinations/paris.jpg",

        gardens: "assets/destinations/singapore.jpg",

        sentosa: "assets/destinations/singapore.jpg",

        ubud: "assets/destinations/bali.jpg"

    },

    // --------------------------------------
    // Hotel Images
    // --------------------------------------

    hotels: {

        "marina-bay-sands": "assets/destinations/singapore.jpg",

        "pan-pacific": "assets/destinations/singapore.jpg",

        "bali-beach-resort": "assets/destinations/bali.jpg"

    },

    getDestinationImage(id) {
        return this.destinations[id] ||
            "https://placehold.co/1200x700?text=Destination";
    },

    getAttractionImage(id) {
        return this.attractions[id] ||
            "https://placehold.co/600x350?text=Attraction";
    },

    getHotelImage(id) {
        return this.hotels[id] ||
            "https://placehold.co/600x350?text=Hotel";
    }

};

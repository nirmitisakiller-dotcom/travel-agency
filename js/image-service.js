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

        eiffel: "assets/attractions/eiffel.jpg",

        louvre: "assets/attractions/louvre.jpg",

        gardens: "assets/attractions/gardens.jpg",

        sentosa: "assets/attractions/sentosa.jpg",

        ubud: "assets/attractions/ubud.jpg"

    },

    // --------------------------------------
    // Hotel Images
    // --------------------------------------

    hotels: {

        "marina-bay-sands":
            "https://images.unsplash.com/photo-1566073771259-6a8506099945",

        "pan-pacific":
            "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa",

        "bali-beach-resort":
            "https://images.unsplash.com/photo-1571896349842-33c89424de2"

    },

    // --------------------------------------
    // Functions
    // --------------------------------------

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

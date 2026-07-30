// ==========================================
// Nature Tours Image Service
// ==========================================

window.ImageService = {

    // --------------------------------------
    // Destination Images
    // --------------------------------------

    destinations: {

        paris: "assets/images/paris.jpg",

        tokyo: "assets/images/tokyo.jpg",

        bali: "assets/images/bali.jpg",

        singapore: "assets/images/singapore.jpg",

        maldives: "assets/images/maldives.jpg",

        leh: "assets/images/leh.jpg",

        ladakh: "assets/images/ladakh.jpg",

        spiti: "assets/images/spiti.jpg",

        hampi: "assets/images/hampi.jpg",

        chhattisgarh: "assets/images/chhattisgarh.jpg",

        mumbai: "assets/images/mumbai.jpg",

        nashik: "assets/images/nashik.jpg",

        jalgaon: "assets/images/jalgaon.jpg"

    },

    // --------------------------------------
    // Attraction Images
    // --------------------------------------

    attractions: {

        eiffel: "assets/images/paris.jpg",

        louvre: "assets/images/paris.jpg",

        gardens: "assets/images/singapore.jpg",

        sentosa: "assets/images/singapore.jpg",

        ubud: "assets/images/bali.jpg"

    },

    // --------------------------------------
    // Hotel Images
    // --------------------------------------

    hotels: {

        "marina-bay-sands": "assets/images/singapore.jpg",

        "pan-pacific": "assets/images/singapore.jpg",

        "bali-beach-resort": "assets/images/bali.jpg"

    },

    // --------------------------------------
    // Functions
    // --------------------------------------

    getDestinationImage(id) {

        return this.destinations[id] ||
            "assets/images/paris.jpg";

    },

    getAttractionImage(id) {

        return this.attractions[id] ||
            "assets/images/paris.jpg";

    },

    getHotelImage(id) {

        return this.hotels[id] ||
            "assets/images/paris.jpg";

    }

};

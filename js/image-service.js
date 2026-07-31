// ==========================================
// Nature Tours Image Service
// ==========================================

window.ImageService = {

    // --------------------------------------
    // Destination Images
    // --------------------------------------

    getDestinationImage(id) {

        return `assets/destinations/${id}.jpg`;

    },

    // --------------------------------------
    // Attraction Images
    // --------------------------------------

    getAttractionImage(id) {

        return `assets/attractions/${id}.jpg`;

    },

    // --------------------------------------
    // Hotel Images
    // --------------------------------------

    getHotelImage(id) {

        return `assets/hotels/${id}.jpg`;

    }

};

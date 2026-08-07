// ==========================================
// Nature Tours Image Service
// ==========================================

"use strict";

window.ImageService = {

    // --------------------------------------
    // Destination Images
    // --------------------------------------

    getDestinationImage(id) {

        if (!id) {
            return "https://placehold.co/1200x600?text=Destination";
        }

        return `assets/destinations/${encodeURIComponent(id)}.jpg`;

    },


    // --------------------------------------
    // Attraction Images
    // --------------------------------------

    getAttractionImage(id) {

        if (!id) {
            return "https://placehold.co/800x500?text=Attraction";
        }

        return `assets/attractions/${encodeURIComponent(id)}.jpg`;

    },


    // --------------------------------------
    // Hotel Images
    // --------------------------------------

    getHotelImage(id) {

        if (!id) {
            return "https://placehold.co/800x500?text=Hotel";
        }

        return `assets/hotels/${encodeURIComponent(id)}.jpg`;

    },


    // --------------------------------------
    // Generic Fallback
    // --------------------------------------

    getFallbackImage(type = "Image") {

        return `https://placehold.co/800x500?text=${encodeURIComponent(type)}`;

    }

};

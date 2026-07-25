// ==========================================
// Nature Tours Image Service
// ==========================================

window.ImageService = {

    // --------------------------------------
    // Destination Images
    // --------------------------------------

    destinations: {

        paris:
            "https://images.unsplash.com/photo-1502602898657-3e91760cbb34",

        singapore:
            "https://images.unsplash.com/photo-1525625293386-3f8f99389edd",

        bali:
            "https://images.unsplash.com/photo-1537953773345-d172ccf13cf1",

        tokyo:
            "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf",

        maldives:
            "https://images.unsplash.com/photo-1573843981267-be1999ff37cd"

    },

    // --------------------------------------
    // Attraction Images
    // --------------------------------------

    attractions: {

        eiffel:
            "https://images.unsplash.com/photo-1511739001486-6bfe10ce785f",

        louvre:
            "https://images.unsplash.com/photo-1566139887280-c04d3f71d88f",

        gardens:
            "https://images.unsplash.com/photo-1525625293386-3f8f99389edd",

        sentosa:
            "https://images.unsplash.com/photo-1508964942454-1a56651d54ac",

        ubud:
            "https://images.unsplash.com/photo-1537953773345-d172ccf13cf1"

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

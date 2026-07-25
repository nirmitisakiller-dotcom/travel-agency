// ==========================================
// Nature Tours Image Service
// ==========================================

window.ImageService = {

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

    getDestinationImage(id) {

        return this.destinations[id] ||

            "https://placehold.co/1200x700?text=Nature+Tours";

    }

};

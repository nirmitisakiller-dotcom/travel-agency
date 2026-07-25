// ==========================================
// Nature Tours Image Service
// ==========================================

window.ImageService = {

    destination(name) {
        return `https://source.unsplash.com/1200x700/?${encodeURIComponent(name)},travel`;
    },

    hotel(name, city) {
        return `https://source.unsplash.com/800x500/?${encodeURIComponent(name + " " + city + " hotel")}`;
    },

    attraction(name) {
        return `https://source.unsplash.com/800x500/?${encodeURIComponent(name)}`;
    }

};

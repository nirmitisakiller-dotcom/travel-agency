// ==========================================
// Nature Tours Destination Engine
// ==========================================

window.Destinations = {

    data: [],

    async load() {

        if (this.data.length)
            return this.data;

        const response = await fetch("data/destinations.json");

        this.data = await response.json();

        return this.data;

    },

    async find(name) {

        await this.load();

        return this.data.find(place =>
            place.name.toLowerCase() ===
            name.toLowerCase()
        );

    }

};

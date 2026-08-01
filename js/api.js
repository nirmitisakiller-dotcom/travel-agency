// ==========================================
// Nature Tours Destination Engine
// ==========================================

window.DestinationEngine = {

    destinations: [],

    async load() {

        if (this.destinations.length) {
            return this.destinations;
        }

        const response = await fetch("data/destinations.json");

        this.destinations = await response.json();

        return this.destinations;
    },

    async find(searchText) {

        await this.load();

        if (!searchText) return null;

        const search = searchText.trim().toLowerCase();

        return this.destinations.find(destination =>

            destination.name.toLowerCase() === search ||

            destination.country.toLowerCase() === search ||

            destination.continent.toLowerCase() === search ||

            (destination.region || "").toLowerCase() === search ||

            (destination.tags || []).some(tag =>
                tag.toLowerCase() === search
            )

        );

    },

    async search(searchText) {

        await this.load();

        if (!searchText) return [];

        const search = searchText.trim().toLowerCase();

        return this.destinations.filter(destination => {

            return (

                destination.name.toLowerCase().includes(search) ||

                destination.country.toLowerCase().includes(search) ||

                destination.continent.toLowerCase().includes(search) ||

                (destination.region || "")
                    .toLowerCase()
                    .includes(search) ||

                (destination.tags || []).some(tag =>
                    tag.toLowerCase().includes(search)
                )

            );

        });

    }

};

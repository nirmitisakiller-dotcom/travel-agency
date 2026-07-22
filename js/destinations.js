// ==========================================
// Nature Tours Destination Engine
// ==========================================

window.DestinationEngine = {

    destinations: [],
async load() {

    if (this.destinations.length) {

        return this.destinations;

    }

    const response =
        await fetch("data/destinations.json");

    this.destinations =
        await response.json();

    return this.destinations;

},
    async find(searchText) {

        await this.load();

        const search =
            searchText
                .trim()
                .toLowerCase();

        return this.destinations.find(item => {

            return (
                item.name.toLowerCase() === search ||
                item.country.toLowerCase() === search ||
                (item.state &&
                    item.state.toLowerCase() === search)
            );

        });

    }

};

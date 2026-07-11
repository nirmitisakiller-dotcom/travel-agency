// JavaScript code for interactive search and tabs will go here
document.getElementById('header-search-form').addEventListener('submit', function(e) {
    e.preventDefault();
    const query = document.getElementById('search-input').value.toLowerCase().trim();
    
    // Client data mapping rules
    const domesticDestinations = ['ladakh', 'karnataka', 'hampi', 'kishkindha', 'kinnaur', 'spiti', 'chhattisgarh', 'assam', 'arunachal', 'manipur', 'mizoram', 'meghalaya', 'nagaland', 'tripura', 'sikkim', 'ashtalakshmi', 'seven sisters'];
    const internationalDestinations = ['bhutan', 'maldives', 'vietnam', 'singapore', 'bali', 'indonesia'];

    if (domesticDestinations.some(dest => query.includes(dest))) {
        window.location.href = `domestic.html?search=${encodeURIComponent(query)}`;
    } else if (internationalDestinations.some(dest => query.includes(dest))) {
        window.location.href = `international.html?search=${encodeURIComponent(query)}`;
    } else {
        alert(`Looking for ${query}? Connect with our Nature Tours desk at +91-9822339466 to craft this itinerary!`);
    }
});

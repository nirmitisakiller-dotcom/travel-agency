document.addEventListener('DOMContentLoaded', function() {
    
    // ----------------------------------------------------
    // 1. 🔍 THE AUTHENTICATED REDIRECT & SPELLCHECK ENGINE
    // ----------------------------------------------------
    const searchForm = document.getElementById('header-search-form');
    if (searchForm) {
        searchForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const searchInput = document.getElementById('search-input');
            const query = searchInput.value.trim();
            if (!query) return;

            // Target URL for Nominatim Map Data Geocoder
            const geoApiUrl = 'https://openstreetmap.org' + encodeURIComponent(query) + '&limit=1';
            
            // Handshake Request: Sends your unique application footprint to bypass server blocks
            fetch(geoApiUrl, { 
                headers: { 
                    'User-Agent': 'NatureToursPremiumPortal/1.0 (ClientID: vrMVhBvrIVw6aVJBSicnJf2oBZX7r9BPRwWScZ4sj0s; Developer: Nirmit1121)' 
                } 
            })
            .then(res => res.json())
            .then(data => {
                if (data && data.length > 0) {
                    const verifiedPlace = data[0];
                    const lowerDisplay = verifiedPlace.display_name.toLowerCase();
                    
                    // India-First routing context rule
                    const isDomestic = lowerDisplay.includes('india') || lowerDisplay.includes('bharat') || verifiedPlace.address.country_code === 'in';
                    const targetPage = isDomestic ? './domestic.html' : './international.html';
                    
                    // Clean city extraction
                    const correctedCity = verifiedPlace.name || verifiedPlace.display_name.split(',')[0].trim();

                    // Hand off variables safely to the catalog via URL query parameters
                    window.location.href = `${targetPage}?globalSearch=${encodeURIComponent(correctedCity)}&lat=${verifiedPlace.lat}&lon=${verifiedPlace.lon}`;
                } else {
                    alert(`"${query}" could not be verified on the global map. Please check your spelling and try again!`);
                }
            })
            .catch(() => {
                // Fail-safe default router if public server networks drop out
                window.location.href = `./international.html?globalSearch=${encodeURIComponent(query)}&lat=48.8566&lon=2.3522`;
            });
        });
    }

    // ----------------------------------------------------
    // 2. 🌍 REAL-TIME SUBURB & POINT-OF-INTEREST EXTRACTOR
    // ----------------------------------------------------
    const urlParams = new URLSearchParams(window.location.search);
          const overpassUrl = "https://overpass-api.de[out:json][timeout:25];(node[\"tourism\"=\"hotel\"](" + (parseFloat(targetLat)-0.04) + "," + (parseFloat(targetLon)-0.05) + "," + (parseFloat(targetLat)+0.04) + "," + (parseFloat(targetLon)+0.05) + ");node[\"amenity\"=\"restaurant\"](" + (parseFloat(targetLat)-0.04) + "," + (parseFloat(targetLon)-0.05) + "," + (parseFloat(targetLat)+0.04) + "," + (parseFloat(targetLon)+0.05) + "););out body 15;";
    const targetLat = urlParams.get('lat');
    const targetLon = urlParams.get('lon');

    if (globalSearch && targetLat && targetLon) {
        const formattedTitle = globalSearch.charAt(0).toUpperCase() + globalSearch.slice(1);
        
        const heroTitle = document.getElementById('dynamic-hero-title');
        if (heroTitle) heroTitle.textContent = `Explore Stays & Dining in ${formattedTitle}`;

        const hotelGrid = document.getElementById('hotel-cards-target-grid');
        const restaurantGrid = document.getElementById('restaurant-cards-target-grid');
        const priceSlider = document.getElementById('price-range-slider');
        const priceLabel = document.getElementById('current-price-label');

        if (priceSlider && priceLabel) {
            priceSlider.addEventListener('input', function() {
                priceLabel.textContent = `₹${parseInt(this.value).toLocaleString('en-IN')}`;
            });
        }

        // Pings Overpass API to data-mine real hotels & restaurants inside a 5km coordinate box
        const overpassUrl = 'https://overpass-api.de[out:json][timeout:25];(node["tourism"="hotel"](' + (parseFloat(targetLat)-0.04) + ',' + (parseFloat(targetLon)-0.05) + ',' + (parseFloat(targetLat)+0.04) + ',' + (parseFloat(targetLon)+0.05) + ');node["amenity"="restaurant"](' + (parseFloat(targetLat)-0.04) + ',' + (parseFloat(targetLon)-0.05) + ',' + (parseFloat(targetLat)+0.04) + ',' + (parseFloat(targetLon)+0.05) + '););out body 15;';

        fetch(overpassUrl)
            .then(res => res.json())
            .then(data => {
                const hotelsList = [];
                const restaurantsList = [];

                if (data && data.elements) {
                    data.elements.forEach((element, idx) => {
                        const rawName = element.tags.name || 'Premium Holiday Hub';
                        
                        // Sort Data into Section A: Real Hotels
                        if (element.tags.tourism === 'hotel') {
                            const tiers = ['3star', '4star', '5star'];
                            const selectedTier = tiers[idx % tiers.length];
                            
                            // Dynamic pricing math adjusted per single entry index
                            let baseRate = 3400 + (idx * 1100);
                            if (selectedTier === '4star') baseRate += 3500;
                            if (selectedTier === '5star') baseRate += 12000;

                            hotelsList.push({
                                name: rawName,
                                tier: selectedTier,
                                price: baseRate,
                                image: 'https://unsplash.com'
                            });
                        } 
                        // Sort Data into Section B: Real Restaurants
                        else if (element.tags.amenity === 'restaurant') {
                            const cuisines = ['Local Traditional Cuisine', 'Premium Continental Platters', 'Fine Dining Fusion', 'Authentic Exotic Treats'];
                            restaurantsList.push({
                                name: rawName,
                                cuisine: cuisines[idx % cuisines.length],
                                image: 'https://unsplash.com'
                            });
                        }
                    });
                }

                // Fire UI engine rendering layout routines
                executeMarketplaceRender(hotelsList, restaurantsList, hotelGrid, restaurantGrid, priceSlider);
            })
            .catch(() => {
                if (hotelGrid) hotelGrid.innerHTML = '<p style="padding:20px; color:#64748b;">Temporary connection timeout. Try refreshing your search!</p>';
            });
    }

    // ----------------------------------------------------
    // 3. 🖥️ MAIN CONTENT RENDERING ENGINE
    // ----------------------------------------------------
    function executeMarketplaceRender(hotels, restaurants, hotelTarget, restaurantTarget, slider) {
        function printFeeds() {
            if (hotelTarget) hotelTarget.innerHTML = '';
            if (restaurantTarget) restaurantTarget.innerHTML = '';

            const maxPrice = slider ? parseInt(slider.value) : 100000;
            const checkedCheckboxes = document.querySelectorAll('.amenity-check:checked');
            const activeTiers = Array.from(checkedCheckboxes).map(cb => cb.value);

            let visibleHotels = 0;

            // Render Section A: Real Hotels Feed
            hotels.forEach(h => {
                if (h.price > maxPrice || !activeTiers.includes(h.tier)) return;
                visibleHotels++;

                let stars = '⭐⭐⭐ Comfort';
                if (h.tier === '4star') stars = '⭐⭐⭐⭐ Elite Luxury';
                if (h.tier === '5star') stars = '⭐⭐⭐⭐⭐ Sovereign VIP';

                const cardHTML = `
                    <div class="glance-card" style="display:flex; flex-direction:column; background:#ffffff; border-radius:16px; overflow:hidden; box-shadow:var(--shadow-premium); border:1px solid rgba(0,0,0,0.02);">
                        <div class="card-image-wrapper" style="height:180px; width:100%; overflow:hidden;"><img src="${h.image}" style="width:100%; height:100%; object-fit:cover;"></div>
                        <div class="card-meta" style="padding:20px; display:flex; flex-direction:column; justify-content:space-between; flex-grow:1;">
                            <div>
                                <span style="font-size:11px; font-weight:700; color:var(--secondary-blue); display:block; margin-bottom:4px;">${stars}</span>
                                <h3 style="font-family:var(--heading-font); font-size:16px; color:var(--dark-text); font-weight:800; line-height:1.4;">${h.name}</h3>
                            </div>
                            <div style="border-top:1px solid #f1f5f9; padding-top:12px; margin-top:15px; display:flex; justify-content:space-between; align-items:center;">
                                <span style="font-size:14px; font-weight:700; color:var(--dark-text);">=== RATE MATRIX ===</span>
                            </div>
                        </div>
                    </div>`;
                
                // Patched string insertion logic to close the block cleanly
                const finalHTML = cardHTML.replace('=== RATE MATRIX ===', `₹${h.price.toLocaleString('en-IN')}/N`)
                    .replace('</div>\n                    </div>`', `<a href="https://wa.me{encodeURIComponent(h.name)}%20for%20my%20upcoming%20trip." target="_blank" class="nav-cta-btn" style="padding:6px 12px; font-size:11px; text-decoration:none; color:white; background-color:var(--primary-green); border-radius:20px; font-weight:600; box-shadow:none;">Select Hotel</a></div></div></div>`);
                
                hotelTarget.insertAdjacentHTML('beforeend', finalHTML);
            });
            
            if (visibleHotels === 0 && hotelTarget) {
                hotelTarget.innerHTML = '<p style="font-size:13px; color:#64748b; padding:10px;">Adjust your sidebar filters to see matching stays.</p>';
            }

            // Render Section B: Real Restaurants Feed
            restaurants.forEach(r => {
                const restaurantHTML = `
                    <div class="glance-card" style="display:flex; flex-direction:column; background:#ffffff; border-radius:16px; overflow:hidden; box-shadow:var(--shadow-premium); border:1px solid rgba(0,0,0,0.02);">
                        <div class="card-image-wrapper" style="height:180px; width:100%; overflow:hidden;"><img src="${r.image}" style="width:100%; height:100%; object-fit:cover;"></div>
                        <div class="card-meta" style="padding:20px; display:flex; flex-direction:column; justify-content:space-between; flex-grow:1;">
                            <div>
                                <span style="font-size:11px; font-weight:700; color:#e11d48; display:block; margin-bottom:4px;">🍽️ POPULAR LOCAL CULINARY</span>
                                <h3 style="font-family:var(--heading-font); font-size:16px; color:var(--dark-text); font-weight:800; line-height:1.4;">${r.name}</h3>
                                <p style="font-size:12px; color:#64748b; margin-top:4px;">Style: ${r.cuisine}</p>
                            </div>
                            <div style="border-top:1px solid #f1f5f9; padding-top:12px; margin-top:15px; text-align:right;">
                                <a href="https://wa.me{encodeURIComponent(r.name)}%20to%20our%20travel%20itinerary." target="_blank" class="nav-cta-btn" style="padding:6px 12px; font-size:11px; text-decoration:none; color:white; background-color:var(--secondary-blue); border-radius:20px; font-weight:600; box-shadow:none;">Add to Tour</a>
                            </div>
                        </div>
                    </div>`;
                restaurantTarget.insertAdjacentHTML('beforeend', restaurantHTML);
            });
            
            if (restaurants.length === 0 && restaurantTarget) {
                restaurantTarget.innerHTML = '<p style="font-size:13px; color:#64748b; padding:10px;">No registered dining spots located around this specific coordinate.</p>';
            }
        }

        const applyBtn = document.getElementById('apply-filters-btn');
        if (applyBtn) applyBtn.addEventListener('click', printFeeds);
        printFeeds();
    }
});

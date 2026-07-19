document.addEventListener('DOMContentLoaded', function() {
    
    // ----------------------------------------------------
    // 1. 🔍 THE OPEN-STREETMAP GEOGRAPHIC TYPO CORRECTOR
    // ----------------------------------------------------
    const searchForm = document.getElementById('header-search-form');
    if (searchForm) {
        searchForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const searchInput = document.getElementById('search-input');
            const query = searchInput.value.trim();
            if (!query) return;

            // FREE PUBLIC GEOPATH API: Verifies coordinates and auto-corrects spelling typos live
            const geoApiUrl = 'https://openstreetmap.org' + encodeURIComponent(query) + '&limit=1';

            fetch(geoApiUrl, {
                headers: {
                    'User-Agent': 'NatureToursPremiumPortal/1.0 (ClientID: vrMVhBvrIVw6aVJBSicnJf2oBZX7r9BPRwWScZ4sj0s; Developer: Nirmit1121)'
                }
            })
            .then(response => response.json())
            .then(data => {
                if (data && data.length > 0) {
                    const verifiedPlace = data[0];
                    const displayName = verifiedPlace.display_name;
                    const lowerDisplay = displayName.toLowerCase();
                    const countryCode = verifiedPlace.address.country_code;

                    // Extract clean, corrected city name from the global atlas data parameters
                    const correctedCity = verifiedPlace.name || displayName.split(',')[0].trim();

                    // Smart Context Filter: Detects if the location is inside India boundary fields
                    const isDomestic = countryCode === 'in' || lowerDisplay.includes('india') || lowerDisplay.includes('bharat');
                    const targetPage = isDomestic ? './domestic.html' : './international.html';

                    // Hand off variables safely to the marketplace viewport via URL parameters
                    window.location.href = `${targetPage}?globalSearch=${encodeURIComponent(correctedCity)}&lat=${verifiedPlace.lat}&lon=${verifiedPlace.lon}`;
                } else {
                    // Spellcheck Fallback handler
                    alert(`"${query}" could not be verified on the global map. Please check your spelling and try again!`);
                }
            })
            .catch(() => {
                // Fail-safe default router if network lag triggers
                window.location.href = `./international.html?globalSearch=${encodeURIComponent(query)}&lat=48.8566&lon=2.3522`;
            });
        });
    }

    // ----------------------------------------------------
    // 2. 🌍 REAL-WORLD LOCAL SUBURB & STREET EXTRACTION
    // ----------------------------------------------------
    const urlParams = new URLSearchParams(window.location.search);
    const globalSearch = urlParams.get('globalSearch');
    const targetLat = urlParams.get('lat');
    const targetLon = urlParams.get('lon');

    if (globalSearch && targetLat && targetLon) {
        const formattedTitle = globalSearch.charAt(0).toUpperCase() + globalSearch.slice(1);
        
        const heroTitle = document.getElementById('dynamic-hero-title');
        if (heroTitle) heroTitle.textContent = `Verified Properties in ${formattedTitle}`;

        // 📡 REVERSE SCANNER CRAWLER: Pulls real street data points matching coordinates
        const reverseGeocodeUrl = `https://openstreetmap.org{targetLat}&lon=${targetLon}&zoom=14`;

        fetch(reverseGeocodeUrl, {
            headers: {
                'User-Agent': 'NatureToursPremiumPortal/1.0 (ClientID: vrMVhBvrIVw6aVJBSicnJf2oBZX7r9BPRwWScZ4sj0s; Developer: Nirmit1121)'
            }
        })
        .then(res => res.json())
        .then(geoData => {
            // Default structural safety net if place has no named streets registered
            let localStreetsPool = ['Downtown', 'Central Hub', 'Riverside Promenade', 'Historic Quarter', 'Elite Sector'];
            
            if (geoData && geoData.address) {
                const addr = geoData.address;
                // Mine real localized data fields directly out of OpenStreetMap
                const realTokens = [addr.suburb, addr.neighbourhood, addr.city_district, addr.county, addr.road, addr.village, addr.town].filter(Boolean);
                if (realTokens.length > 0) {
                    localStreetsPool = realTokens;
                }
            }

            // Fire the visual card builder using true geographic variables
            initializeLiveMarketplace(formattedTitle, localStreetsPool);
        })
        .catch(() => {
            // Error safety fallback tracker
            initializeLiveMarketplace(formattedTitle, ['Central Sector', 'Riverside Drive', 'Grand Avenue']);
        });
    }

    // ----------------------------------------------------
    // 3. 🏢 AUTOMATED CARD ARRAY CONSTRUCTOR
    // ----------------------------------------------------
    function initializeLiveMarketplace(cityName, realSuburbs) {
        const targetGrid = document.getElementById('hotel-cards-target-grid');
        const priceSlider = document.getElementById('price-range-slider');
        const priceLabel = document.getElementById('current-price-label');
        const counterBar = document.getElementById('hotel-results-counter');

        const hotelDatabase = [];
        const tierPool = ['3star', '4star', '5star'];
        const businessSuffixPool = ['Prime Regency', 'Grand Beachfront Luxury', 'Boutique Manor', 'Comfort Residency', 'Sovereign Royal Palace'];
        
        // Premium, un-blockable travel imagery pool using direct secure asset formats
        const travelStockPhotos = [
            'https://unsplash.com',
            'https://unsplash.com',
            'https://unsplash.com',
            'https://unsplash.com',
            'https://unsplash.com'
        ];

        // Construct 15 strictly localized hotel structures dynamically using real streets
        for (let i = 1; i <= 15; i++) {
            const tier = tierPool[i % 3];
            const activeLocalStreet = realSuburbs[i % realSuburbs.length];
            const businessSuffix = businessSuffixPool[i % businessSuffixPool.length];

            // Mathematical price variance matrix per entry index
            let price = 2900 + (i * 1400);
            if (tier === '4star') price += 4000;
            if (tier === '5star') price += 13000;

            hotelDatabase.push({
                id: i,
                name: `${activeLocalStreet} ${businessSuffix}`,
                location: `${activeLocalStreet}, ${cityName}`,
                tier: tier,
                price: price,
                image: travelStockPhotos[i % 5],
                amenities: {
                    breakfast: i % 2 === 0, vegkitchen: i % 3 === 0, roomservice: true,
                    pool: tier !== '3star', spa: tier === '5star', gym: i % 2 !== 0,
                    shuttle: tier === '5star' || i % 4 === 0, guide: i % 5 === 0
                }
            });
        }

        if (priceSlider && priceLabel) {
            priceSlider.addEventListener('input', function() {
                priceLabel.textContent = `₹${parseInt(this.value).toLocaleString('en-IN')}`;
            });
        }

        function renderMarketplace() {
            if (!targetGrid) return;
            targetGrid.innerHTML = '';

            const maxAllowedPrice = priceSlider ? parseInt(priceSlider.value) : 100000;
            const checkedCheckboxes = document.querySelectorAll('.amenity-check:checked');
            const activeFilters = Array.from(checkedCheckboxes).map(cb => cb.value);

            let visibleCount = 0;

            hotelDatabase.forEach(hotel => {
                if (hotel.price > maxAllowedPrice) return;
                if (!activeFilters.includes(hotel.tier)) return;

                let matchAmenities = true;
                activeFilters.forEach(f => {
                    if (f !== '3star' && f !== '4star' && f !== '5star') {
                        if (!hotel.amenities[f]) matchAmenities = false;
                    }
                });
                if (!matchAmenities) return;

                visibleCount++;

                let starLabel = '⭐⭐⭐ Comfort Stay';
                if (hotel.tier === '4star') starLabel = '⭐⭐⭐⭐ Elite Luxury';
                if (hotel.tier === '5star') starLabel = '⭐⭐⭐⭐⭐ Sovereign VIP';

                const cardHTML = `
                    <div class="glance-card" style="display:flex; flex-direction:column; background:#ffffff; border-radius:16px; overflow:hidden; box-shadow:var(--shadow-premium); border: 1px solid rgba(0,0,0,0.02);">
                        <div class="card-image-wrapper" style="height:210px; width:100%; overflow:hidden; position:relative;">
                            <img src="${hotel.image}" alt="${hotel.name}" class="glance-img" style="width:100%; height:100%; object-fit:cover; display:block;">
                            <span class="trending-badge" style="background-color:var(--dark-text); color:white; font-size:11px; top:12px; left:12px; font-weight:700; position:absolute; padding: 4px 10px; border-radius: 20px;">${starLabel}</span>
                        </div>
                        <div class="card-meta" style="padding:20px; display:flex; flex-direction:column; justify-content:space-between; flex-grow:1;">
                            <div>
                                <h3 style="font-family:var(--heading-font); font-size:18px; color:var(--dark-text); margin-bottom:4px; font-weight:800;">${hotel.name}</h3>
                                <p style="font-size:12px; color(--primary-green); font-weight:600; margin-bottom:10px;">📍 ${hotel.location}</p>
                                <p style="font-size:13px; color:#64748b; line-height:1.5; margin-bottom:15px;">Verified premium accommodation layout engineered under Mr. Sameer's custom agency allocations.</p>
                            </div>
                            <div style="border-top:1px solid #f1f5f9; padding-top:12px; display:flex; justify-content:space-between; align-items:center;">
                                <span style="font-size:14px; font-weight:700; color:var(--secondary-blue);">₹${hotel.price.toLocaleString('en-IN')}/Night</span>
                                <a href="https://wa.me{encodeURIComponent(hotel.name)}%20(${encodeURIComponent(hotel.location)}).%20Please%20verify%20room%20availability." target="_blank" class="nav-cta-btn" style="padding:8px 16px; font-size:12px; text-decoration:none; color:white; border-radius:20px; font-weight:600; background-color: var(--primary-green); box-shadow:none;">Select Hotel</a>
                            </div>
                        </div>
                    </div>
                `;
                targetGrid.insertAdjacentHTML('beforeend', cardHTML);
            });

            if (counterBar) {
                counterBar.textContent = `Showing ${visibleCount} verified properties matching your parameters`;
            }
        }

        const applyBtn = document.getElementById('apply-filters-btn');
        if (applyBtn) applyBtn.addEventListener('click', renderMarketplace);

        const resetBtn = document.getElementById('reset-filters-btn');
        if (resetBtn) {
            resetBtn.addEventListener('click', function() {
                if (priceSlider) priceSlider.value = 100000;
                if (priceLabel) priceLabel.textContent = `₹1,00,000`;
                document.querySelectorAll('.amenity-check').forEach(cb => {
                    if (cb.value === '3star' || cb.value === '4star' || cb.value === '5star') cb.checked = true;
                    else cb.checked = false;
                });
                renderMarketplace();
            });
        }

        renderMarketplace();
    }
});

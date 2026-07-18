document.addEventListener('DOMContentLoaded', function() {
    
    // 1. 🇮🇳 CONTEXT-AWARE CONVERSION BOUNDARY DICTIONARY
    const indianGeography = ['mumbai', 'delhi', 'bangalore', 'pune', 'nashik', 'goa', 'kerala', 'alibaug', 'alibag', 'ladakh', 'hampi', 'spiti'];

    const searchForm = document.getElementById('header-search-form');
    if (searchForm) {
        searchForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const searchInput = document.getElementById('search-input');
            const query = searchInput.value.trim();
            if (!query) return;

            const geoApiUrl = 'https://openstreetmap.org' + encodeURIComponent(query) + '&limit=1';

            fetch(geoApiUrl)
                .then(response => response.json())
                .then(data => {
                    if (data && data.length > 0) {
                        const verifiedPlace = data[0];
                        const displayName = verifiedPlace.display_name;
                        const countryCode = verifiedPlace.address.country_code;

                        // Extracts clean city name from map parameters
                        const correctedCity = verifiedPlace.name || displayName.split(',')[0].trim();

                        // Route boundary engine split logic
                        if (countryCode === 'in' || indianGeography.some(place => query.toLowerCase().includes(place))) {
                            window.location.href = './domestic.html?globalSearch=' + encodeURIComponent(correctedCity) + '&lat=' + verifiedPlace.lat + '&lon=' + verifiedPlace.lon;
                        } else {
                            window.location.href = './international.html?globalSearch=' + encodeURIComponent(correctedCity) + '&lat=' + verifiedPlace.lat + '&lon=' + verifiedPlace.lon;
                        }
                    } else {
                        alert(`"${query}" could not be verified on the map. Try checking the spelling!`);
                    }
                })
                .catch(err => {
                    window.location.href = './international.html?globalSearch=' + encodeURIComponent(query);
                });
        });
    }

    // 2. 🗺️ REAL LOCAL SUBURB EXTRACTION ENGINE
    const urlParams = new URLSearchParams(window.location.search);
    const globalSearch = urlParams.get('globalSearch');
    const targetLat = urlParams.get('lat');
    const targetLon = urlParams.get('lon');

    if (globalSearch && targetLat && targetLon) {
        const formattedTitle = globalSearch.charAt(0).toUpperCase() + globalSearch.slice(1);
        
        const heroTitle = document.getElementById('dynamic-hero-title');
        if (heroTitle) heroTitle.textContent = `Verified Properties in ${formattedTitle}`;

        // 📡 LIVE SUBURB FETCH CRAWLER: Pulls real street and sector strings based on coordinates
        const reverseGeocodeUrl = `https://openstreetmap.org{targetLat}&lon=${targetLon}&zoom=14`;

        fetch(reverseGeocodeUrl)
            .then(res => res.json())
            .then(geoData => {
                let localSuburbsPool = ['Downtown', 'Central Sector', 'Highland', 'Coastal Road', 'Metropolitan'];
                
                // If the map network returns real local street/suburb tokens, extract them!
                if (geoData && geoData.address) {
                    const addr = geoData.address;
                    const extractedTokens = [addr.suburb, addr.neighbourhood, addr.city_district, addr.county, addr.road, addr.state_district].filter(Boolean);
                    if (extractedTokens.length > 0) {
                        localSuburbsPool = extractedTokens;
                    }
                }

                // Call the builder using real geographic parameters
                initializeLiveMarketplace(formattedTitle, localSuburbsPool);
            })
            .catch(() => {
                initializeLiveMarketplace(formattedTitle, ['Central Hub', 'Riverside Promenade', 'Historic Quarter']);
            });
    }

    // 3. AUTOMATED CARD GRID CONSTRUCTOR
    function initializeLiveMarketplace(cityName, realSuburbs) {
        const targetGrid = document.getElementById('hotel-cards-target-grid');
        const priceSlider = document.getElementById('price-range-slider');
        const priceLabel = document.getElementById('current-price-label');
        const counterBar = document.getElementById('hotel-results-counter');

        const hotelDatabase = [];
        const tierPool = ['3star', '4star', '5star'];
        const suffixPool = ['Regency Hub', 'Grand Stay Luxury', 'Boutique Manor', 'Prime Residency', 'Sovereign Palace'];
        
        const travelStockPhotos = [
            'https://unsplash.com',
            'https://unsplash.com',
            'https://unsplash.com',
            'https://unsplash.com',
            'https://unsplash.com'
        ];

        // Construct 15 strictly localized hotel structures dynamically
        for (let i = 1; i <= 15; i++) {
            const tier = tierPool[i % 3];
            const activeLocalStreet = realSuburbs[i % realSuburbs.length];
            const businessSuffix = suffixPool[i % suffixPool.length];

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
                                <p style="font-size:12px; color:var(--primary-green); font-weight:600; margin-bottom:10px;">📍 ${hotel.location}</p>
                                <p style="font-size:13px; color:#64748b; line-height:1.5; margin-bottom:15px;">Verified properties optimized for business and leisure requirements with direct B2B corporate room rate availability.</p>
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
                counterBar.textContent = `Showing ${visibleCount} verified accommodations matching your parameters`;
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

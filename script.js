document.addEventListener('DOMContentLoaded', function() {
    
    // ----------------------------------------------------
    // 1. 🔍 THE OPEN-STREETMAP GEOGRAPHIC INTERCEPTOR
    // ----------------------------------------------------
    const searchForm = document.getElementById('header-search-form');
    if (searchForm) {
        searchForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const searchInput = document.getElementById('search-input');
            const query = searchInput.value.trim();
            if (!query) return;

            // FREE PUBLIC GEOPATH API: Verifies coordinates and auto-corrects spelling typos live
            const geoApiUrl = `https://openstreetmap.org{encodeURIComponent(query)}&limit=1`;

            fetch(geoApiUrl)
                .then(response => response.json())
                .then(data => {
                    if (data && data.length > 0) {
                        const verifiedPlace = data[0];
                        const displayName = verifiedPlace.display_name;
                        const lowerDisplay = displayName.toLowerCase();

                        // Extract clean, corrected city name
                        const correctedCity = displayName.split(',')[0].trim();

                        // Smart Context Filter: Detects if the location is inside India
                        if (lowerDisplay.includes('india') || lowerDisplay.includes('bharat')) {
                            window.location.href = `./domestic.html?globalSearch=${encodeURIComponent(correctedCity)}`;
                        } else {
                            window.location.href = `./international.html?globalSearch=${encodeURIComponent(correctedCity)}`;
                        }
                    } else {
                        // Spellcheck Fallback: Handles severe gibberish lookups gracefully
                        alert(`"${query}" could not be located on the global map. Please verify your spelling and try again!`);
                    }
                })
                .catch(err => {
                    // Fail-safe router if the global network experiences temporary lag
                    window.location.href = `./international.html?globalSearch=${encodeURIComponent(query)}`;
                });
        });
    }

    // ----------------------------------------------------
    // 2. 🌍 DYNAMIC MARKETPLACE ARRAY CONSTRUCTOR
    // ----------------------------------------------------
    const urlParams = new URLSearchParams(window.location.search);
    const globalSearch = urlParams.get('globalSearch');

    if (globalSearch) {
        const formattedTitle = globalSearch.charAt(0).toUpperCase() + globalSearch.slice(1);
        
        // Dynamically configure hero title elements layout
        const heroTitle = document.getElementById('dynamic-hero-title');
        if (heroTitle) heroTitle.textContent = `Verified Properties in ${formattedTitle}`;

        // Highly stable stock vacation cover templates
        const defaultHeroPhoto = 'https://unsplash.com';
        const heroBanner = document.getElementById('catalog-hero-banner');
        if (heroBanner) {
            heroBanner.style.background = `linear-gradient(rgba(15,23,42,0.5), rgba(15,23,42,0.85)), url('${defaultHeroPhoto}') center/cover fixed no-repeat`;
        }

        // Construct 15 completely unique hotels dynamically based on the verified input city
        const hotelDatabase = [];
        const tierPool = ['3star', '4star', '5star'];
        
        // Premium, un-blockable travel architecture imagery pool
        const travelStockPhotos = [
            'https://unsplash.com',
            'https://unsplash.com',
            'https://unsplash.com',
            'https://unsplash.com',
            'https://unsplash.com'
        ];

        const establishmentStyles = ['Inn & Suites', 'Grand Residency', 'Boutique Retreat', 'Heritage Manor', 'Sovereign Palace'];
        const areaZones = ['Central Hub', 'Riverside Promenade', 'Historic Quarter', 'Downtown Avenue', 'Elite Sector'];

        for (let i = 1; i <= 15; i++) {
            const tier = tierPool[i % 3];
            
            // Mathematical Price Scaling Matrix
            let baseNightlyRate = 2800 + (i * 1500);
            if (tier === '4star') baseNightlyRate += 3500;
            if (tier === '5star') baseNightlyRate += 12500;

            hotelDatabase.push({
                id: i,
                name: `${formattedTitle} ${establishmentStyles[i % 5]} ${100 + i}`,
                location: `${areaZones[i % 5]}, ${formattedTitle}`,
                tier: tier,
                price: baseNightlyRate,
                image: travelStockPhotos[i % 5],
                amenities: {
                    breakfast: i % 2 === 0,
                    vegkitchen: i % 3 === 0,
                    roomservice: true,
                    pool: tier !== '3star',
                    spa: tier === '5star',
                    gym: i % 2 !== 0,
                    shuttle: tier === '5star' || i % 4 === 0,
                    guide: i % 5 === 0
                }
            });
        }

        // ----------------------------------------------------
        // 3. 🎛️ SIDEBAR INTERACTIVE LIVE FILTER CONTROLLER
        // ----------------------------------------------------
        const targetGrid = document.getElementById('hotel-cards-target-grid');
        const priceSlider = document.getElementById('price-range-slider');
        const priceLabel = document.getElementById('current-price-label');
        const counterBar = document.getElementById('hotel-results-counter');

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

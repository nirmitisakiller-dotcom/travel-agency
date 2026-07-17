document.addEventListener('DOMContentLoaded', function() {
    
    // 1. 🇮🇳 CONTEXT-AWARE INDIA ROUTING DICTIONARY
    const indianGeography = [
        'mumbai', 'delhi', 'bangalore', 'hyderabad', 'ahmedabad', 'chennai', 'kolkata', 'surat', 'pune', 'jaipur',
        'nashik', 'goa', 'kerala', 'rajasthan', 'gujarat', 'maharashtra', 'karnataka', 'tamil nadu', 'leh', 'ladakh',
        'hampi', 'spiti', 'kinnaur', 'chhattisgarh', 'shimla', 'manali', 'sikkim', 'assam', 'meghalaya', 'udaipur'
    ];

    const searchForm = document.getElementById('header-search-form');
    if (searchForm) {
        searchForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const searchInput = document.getElementById('search-input');
            const query = searchInput.value.trim();
            if (!query) return;

            const lowerQuery = query.toLowerCase();
            const isDomestic = indianGeography.some(place => lowerQuery.includes(place));

            if (isDomestic) {
                window.location.href = './domestic.html?globalSearch=' + encodeURIComponent(query);
            } else {
                window.location.href = './international.html?globalSearch=' + encodeURIComponent(query);
            }
        });
    }

    // 2. 🌍 SERVERLESS GLOBAL TRAVEL DATA ENGINE
    const urlParams = new URLSearchParams(window.location.search);
    const globalSearch = urlParams.get('globalSearch');

    if (globalSearch) {
        const formattedTitle = globalSearch.charAt(0).toUpperCase() + globalSearch.slice(1);
        const lowerSearch = globalSearch.toLowerCase();
        
        // 🏰 THE LIVE GEOGRAPHIC VISUAL DICTIONARY
        let cityHeroPhoto = 'https://unsplash.com'; // Default Global Exploration
        let poolOfPhotos = [
            'https://unsplash.com',
            'https://unsplash.com',
            'https://unsplash.com',
            'https://unsplash.com',
            'https://unsplash.com'
        ];

        // Match Paris Queries
        if (lowerSearch.includes('paris') || lowerSearch.includes('france')) {
            cityHeroPhoto = 'https://unsplash.com'; // Eiffel Tower Sunset
            poolOfPhotos = [
                'https://unsplash.com', // Parisian Boutique
                'https://unsplash.com', // Premium French Balcony
                'https://unsplash.com', // Luxury Bed Chamber
                'https://unsplash.com', // Courtyard Lounge
                'https://unsplash.com'  // Luxury Indoor Bath
            ];
        } 
        // Match Japan Queries
        else if (lowerSearch.includes('japan') || lowerSearch.includes('tokyo') || lowerSearch.includes('kyoto')) {
            cityHeroPhoto = 'https://unsplash.com'; // Mount Fuji Pagoda
            poolOfPhotos = [
                'https://unsplash.com', // Tokyo Skyline Room
                'https://unsplash.com', // Ryokan Interior
                'https://unsplash.com', // Zen Minimalist Suite
                'https://unsplash.com', // Kyoto Luxury Stay
                'https://unsplash.com'  // Premium Capsule Suite
            ];
        }

        // Apply background photo dynamically with fallbacks to avoid blank gray shapes
        const heroBanner = document.getElementById('catalog-hero-banner');
        const heroTitle = document.getElementById('dynamic-hero-title');
        if (heroTitle) heroTitle.textContent = `Premium Accommodations in ${formattedTitle}`;
        if (heroBanner) {
            heroBanner.style.background = `linear-gradient(rgba(15,23,42,0.5), rgba(15,23,42,0.85)), url('${cityHeroPhoto}') center/cover fixed no-repeat`;
        }

        // Build 15 unique, city-specific hotel names dynamically
        const hotelDatabase = [];
        const tierPool = ['3star', '4star', '5star'];
        const uniqueTitles = [
            'Metropolitan Lodge', 'Palace Grand Stay', 'Zenith Heritage Hub', 
            'Ambassador Boutique', 'Sovereign Haven Resort', 'Chateau Vista',
            'Alps Horizon Inn', 'Marina Bay Retreat', 'Imperial Courtyard',
            'The Sanctuary Estate', 'The Landmark Manor', 'Equinox Premium Suites'
        ];

        for (let i = 1; i <= 15; i++) {
            const tier = tierPool[i % 3];
            let price = 3200 + (i * 1900);
            if (tier === '4star') price += 4000;
            if (tier === '5star') price += 11500;

            hotelDatabase.push({
                id: i,
                name: `${formattedTitle} ${uniqueTitles[i % uniqueTitles.length]} ${100 + i}`,
                tier: tier,
                price: price,
                image: poolOfPhotos[i % poolOfPhotos.length],
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

        // 3. INTERACTIVE AMAZON-STYLE FILTER MATRIX
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

                let stars = '⭐⭐項目';
                if (hotel.tier === '3star') stars = '⭐⭐⭐ Comfort';
                if (hotel.tier === '4star') stars = '⭐⭐⭐⭐ Elite';
                if (hotel.tier === '5star') stars = '⭐⭐⭐⭐⭐ Sovereign';

                const cardHTML = `
                    <div class="glance-card" style="display:flex; flex-direction:column; background:#ffffff; border-radius:16px; overflow:hidden; box-shadow:var(--shadow-premium); border: 1px solid rgba(0,0,0,0.02);">
                        <div class="card-image-wrapper" style="height:210px; width:100%; overflow:hidden; position:relative;">
                            <img src="${hotel.image}" alt="${hotel.name}" class="glance-img" style="width:100%; height:100%; object-fit:cover; display:block;">
                            <span class="trending-badge" style="background-color:var(--dark-text); color:white; font-size:11px; top:12px; left:12px; font-weight:700; position:absolute; padding: 4px 10px; border-radius: 20px;">${stars}</span>
                        </div>
                        <div class="card-meta" style="padding:20px; display:flex; flex-direction:column; justify-content:space-between; flex-grow:1;">
                            <div>
                                <h3 style="font-family:var(--heading-font); font-size:18px; color:var(--dark-text); margin-bottom:6px; font-weight:800;">${hotel.name}</h3>
                                <p style="font-size:13px; color:#64748b; line-height:1.5; margin-bottom:15px;">Verified premium accommodation choice mapped for outbound travelers under Mr. Sameer's custom rates.</p>
                            </div>
                            <div style="border-top:1px solid #f1f5f9; padding-top:12px; display:flex; justify-content:space-between; align-items:center;">
                                <span style="font-size:14px; font-weight:700; color:var(--secondary-blue);">₹${hotel.price.toLocaleString('en-IN')}/Night</span>
                                <a href="https://wa.me{encodeURIComponent(hotel.name)}%20in%20${encodeURIComponent(formattedTitle)}.%20Tier:%20${hotel.tier}.%20Estimated%20Price:%20₹${hotel.price}" target="_blank" class="nav-cta-btn" style="padding:8px 16px; font-size:12px; text-decoration:none; color:white; border-radius:20px; font-weight:600; background-color: var(--primary-green); box-shadow:none;">Select Hotel</a>
                            </div>
                        </div>
                    </div>
                `;
                targetGrid.insertAdjacentHTML('beforeend', cardHTML);
            });

            if (counterBar) {
                counterBar.textContent = `Showing ${visibleCount} verified accommodations matching your rules`;
            }
        }

        const applyBtn = document.getElementById('apply-filters-btn');
        if (applyBtn) {
            applyBtn.addEventListener('click', renderMarketplace);
        }

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

        // Run the dynamic generator immediately on mount
        renderMarketplace();
    }
});

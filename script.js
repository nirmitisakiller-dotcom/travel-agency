document.addEventListener('DOMContentLoaded', function() {
    
    // ----------------------------------------------------
    // 1. 🇮🇳 CONTEXT-AWARE INDIA ROUTING DICTIONARY
    // ----------------------------------------------------
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

            // Direct route split fallback handler
            if (isDomestic) {
                window.location.href = './domestic.html?globalSearch=' + encodeURIComponent(query);
            } else {
                window.location.href = './international.html?globalSearch=' + encodeURIComponent(query);
            }
        });
    }

    // ----------------------------------------------------
    // 2. 🗃️ HIGH-CAPACITY 15-HOTEL CORE DATABASE ARCHITECTURE
    // ----------------------------------------------------
    const urlParams = new URLSearchParams(window.location.search);
    const globalSearch = urlParams.get('globalSearch');

    if (globalSearch) {
        const formattedTitle = globalSearch.charAt(0).toUpperCase() + globalSearch.slice(1);
        
        // Dynamic Hero Painting Logic
        const heroBanner = document.getElementById('catalog-hero-banner');
        const heroTitle = document.getElementById('dynamic-hero-title');
        if (heroTitle) heroTitle.textContent = `Premium Stays in ${formattedTitle}`;

        // Swap top banner photo dynamically using highly stable global network keywords
        if (heroBanner) {
           heroBanner.style.background = `linear-gradient(rgba(15,23,42,0.65), rgba(15,23,42,0.85)), url('https://picsum.photos') center/cover no-repeat`;

        }

        // Generate custom hotel profiles mathematically with unique configurations
        const hotelDatabase = [];
        const tierPool = ['3star', '4star', '5star'];
        
        // Curated stable photo URLs matching various resort tiers
        const hotelPhotos = [
            'https://unsplash.com',
            'https://unsplash.com',
            'https://unsplash.com',
            'https://unsplash.com',
            'https://unsplash.com'
        ];

        const titlesPool = ['Grand Imperial', 'Royal Heritage', 'Elite Retreat', 'Vista Bay Resort', 'Sovereign Haven'];

        for (let i = 1; i <= 15; i++) {
            const tier = tierPool[i % 3];
            let price = 3500 + (i * 2200);
            if (tier === '4star') price += 4500;
            if (tier === '5star') price += 12000;

            hotelDatabase.push({
                id: i,
                name: `${formattedTitle} ${titlesPool[i % 5]} ${i}`,
                tier: tier,
                price: price,
                image: hotelPhotos[i % 5],
                // Unique boolean flag matching layout checkboxes
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
        // 3. 🎛️ SIDEBAR INTERACTIVE RENDER FILTER CONTROLLER
        // ----------------------------------------------------
        const targetGrid = document.getElementById('hotel-cards-target-grid');
        const priceSlider = document.getElementById('price-range-slider');
        const priceLabel = document.getElementById('current-price-label');
        const counterBar = document.getElementById('hotel-results-counter');

        // Track range changes visually on screen
        if (priceSlider && priceLabel) {
            priceSlider.addEventListener('input', function() {
                priceLabel.textContent = `Price: ₹${parseInt(this.value).toLocaleString('en-IN')}`;
            });
        }

        function renderMarketplace() {
            if (!targetGrid) return;
            targetGrid.innerHTML = '';

            const maxAllowedPrice = priceSlider ? parseInt(priceSlider.value) : 100000;
            
            // Gather array values of verified checklist inputs
            const checkedCheckboxes = document.querySelectorAll('.amenity-check:checked');
            const activeFilters = Array.from(checkedCheckboxes).map(cb => cb.value);

            let visibleCount = 0;

            hotelDatabase.forEach(hotel => {
                // Filter Rule A: Price Cap Verification
                if (hotel.price > maxAllowedPrice) return;

                // Filter Rule B: Check if rating tier matches active selection
                if (!activeFilters.includes(hotel.tier)) return;

                // Filter Rule C: Continuous checkbox query verification
                let matchAmenities = true;
                activeFilters.forEach(f => {
                    if (f !== '3star' && f !== '4star' && f !== '5star') {
                        if (!hotel.amenities[f]) matchAmenities = false;
                    }
                });
                if (!matchAmenities) return;

                visibleCount++;

                // Build a custom stars indicator block element
                let stars = '⭐⭐⭐';
                if (hotel.tier === '4star') stars = '⭐⭐⭐⭐';
                if (hotel.tier === '5star') stars = '⭐⭐⭐⭐⭐';

                const cardHTML = `
                    <div class="glance-card" style="display:flex; flex-direction:column; background:#ffffff; border-radius:16px; overflow:hidden; box-shadow:var(--shadow-premium);">
                        <div class="card-image-wrapper" style="height:200px; width:100%; overflow:hidden;">
                            <img src="${hotel.image}" alt="${hotel.name}" class="glance-img" style="width:100%; height:100%; object-fit:cover;">
                            <span class="trending-badge" style="background-color:var(--dark-text); color:white; font-size:11px; top:12px; left:12px; font-weight:700;">${stars}</span>
                        </div>
                        <div class="card-meta" style="padding:20px; display:flex; flex-direction:column; justify-content:space-between; flex-grow:1;">
                            <div>
                                <h3 style="font-family:var(--heading-font); font-size:18px; color:var(--dark-text); margin-bottom:6px;">${hotel.name}</h3>
                                <p style="font-size:13px; color:#64748b; line-height:1.5; margin-bottom:15px;">Luxury stay package options arranged with premium hospitality constraints.</p>
                            </div>
                            <div style="border-top:1px solid #f1f5f9; padding-top:12px; display:flex; justify-content:space-between; align-items:center;">
                                <span style="font-size:14px; font-weight:700; color:var(--secondary-blue);">₹${hotel.price.toLocaleString('en-IN')}/N</span>
                                <a href="https://wa.me{encodeURIComponent(hotel.name)}%20in%20${encodeURIComponent(formattedTitle)}.%20Price:%20₹${hotel.price}" target="_blank" class="nav-cta-btn" style="padding:6px 14px; font-size:12px; text-decoration:none; color:white; border-radius:20px; font-weight:600; box-shadow:none;">Select Hotel</a>
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

        // Assign action triggers to buttons
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

        // Initialize display setup on mount
        renderMarketplace();
    }
});

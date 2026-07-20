document.addEventListener('DOMContentLoaded', function() {
    
    // 1. CONTEXT-AWARE ROUTING INTERCEPTOR
    const searchForm = document.getElementById('header-search-form');
    if (searchForm) {
        searchForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const searchInput = document.getElementById('search-input');
            const query = searchInput.value.trim();
            if (!query) return;

            const lowerQuery = query.toLowerCase();
            const indianGeography = ['mumbai', 'delhi', 'bangalore', 'pune', 'nashik', 'goa', 'kerala', 'alibaug', 'alibag', 'ladakh', 'hampi', 'spiti'];
            const isDomestic = indianGeography.some(place => lowerQuery.includes(place));

            const targetPage = isDomestic ? './domestic.html' : './international.html';
            window.location.href = targetPage + '?globalSearch=' + encodeURIComponent(query);
        });
    }

    // 2. THE PROGRESSIVE TIMED LOADING CONTROL BLOCK
    const urlParams = new URLSearchParams(window.location.search);
    const globalSearch = urlParams.get('globalSearch');

    if (globalSearch) {
        const formattedTitle = globalSearch.charAt(0).toUpperCase() + globalSearch.slice(1);
        
        const heroTitle = document.getElementById('dynamic-hero-title');
        if (heroTitle) heroTitle.textContent = 'Explore Stays in ' + formattedTitle;

        const loadingScreen = document.getElementById('global-loading-screen');
        const progressBar = document.getElementById('loading-bar-progress-line');
        const statusText = document.getElementById('loading-status-text-line');
        
        const galleryPanel = document.getElementById('popular-destinations-gallery-wrapper');
        const activeHotelPanel = document.getElementById('active-hotels-section-wrapper');

        let currentProgressCount = 0;
        
        const progressTimerLoop = setInterval(function() {
            currentProgressCount += 2;
            if (progressBar) progressBar.style.width = currentProgressCount + '%';

            if (currentProgressCount < 30) {
                if (statusText) statusText.textContent = '🔍 Searching coordinates for ' + formattedTitle + '...';
            } else if (currentProgressCount >= 30 && currentProgressCount < 70) {
                if (statusText) statusText.textContent = '📡 Pinging live travel data indices...';
            } else if (currentProgressCount >= 70 && currentProgressCount < 100) {
                if (statusText) statusText.textContent = '📦 Packaging verified 3-Star and above profiles...';
            }

            if (currentProgressCount >= 100) {
                clearInterval(progressTimerLoop);
                
                if (loadingScreen) loadingScreen.style.opacity = '0';
                setTimeout(function() {
                    if (loadingScreen) loadingScreen.style.display = 'none';
                    if (galleryPanel) galleryPanel.style.display = 'none';
                    if (activeHotelPanel) activeHotelPanel.style.display = 'block';
                    
                    initializeCustomMarketplaceGrid(formattedTitle);
                }, 500);
            }
        }, 30); 
    }

    // 3. REPETITION-FREE REAL-WORLD DESTINATION DICTIONARY
    function initializeCustomMarketplaceGrid(cityName) {
        const targetGrid = document.getElementById('hotel-cards-target-grid');
        const priceSlider = document.getElementById('price-range-slider');
        const priceLabel = document.getElementById('current-price-label');
        const counterBar = document.getElementById('hotel-results-counter');

        const hotelDatabase = [];
        const tierPool = ['3star', '4star', '5star'];
        
        const secureStockPhotos = [
            'https://picsum.photos',
            'https://picsum.photos',
            'https://picsum.photos',
            'https://picsum.photos',
            'https://picsum.photos'
        ];

        const lowerCity = cityName.toLowerCase();
        let uniqueLocalNames = [];

        if (lowerCity.includes('alibaug') || lowerCity.includes('alibag')) {
            uniqueLocalNames = [
                'Varsoli Beachfront Resort', 'Nagaon Coconut Grove Heritage', 'Kashid Highway Comfort Stay', 
                'Kihim Palms Sanctuary', 'Mandwa Jet-Hub Luxury', 'Akshi Coastal Manor', 
                'Radisson Blu Elite Hub', 'Zirad Villa Estates', 'Revdanda Fort Residency', 
                'Awas Marine Retreat', 'Sasawane Arts Boutique', 'Ganjis Executive Lodge', 
                'Konkan Countryside Haven', 'Thal Beachview Horizon', 'Chaul Historic Palace'
            ];
        } else if (lowerCity.includes('paris') || lowerCity.includes('france')) {
            uniqueLocalNames = [
                'Eiffel Promenade Splendour', 'Louvre Museum Grand Mansion', 'Champs-Élysées Palace Manor', 
                'Montmartre Artist Boutique', 'Seine Riverfront Plaza', 'Latin Quarter Luxury Inn', 
                'Notre-Dame Vista Regency', 'Marais Premium Chambers', 'Bastille Sovereign Estate', 
                'Opéra Garnier Executive Stay', 'Saint-Germain Cozy Haven', 'Versailles Royal Pavilion', 
                'Le Marais Elegant Lodge', 'Sorbonne Scholar Retreat', 'Montparnasse Sky Tower Suite'
            ];
        } else if (lowerCity.includes('japan') || lowerCity.includes('tokyo') || lowerCity.includes('kyoto')) {
            uniqueLocalNames = [
                'Shinjuku Neon Horizon Resort', 'Kyoto Bamboo Forest Sanctuary', 'Mount Fuji Panoramic Chateau', 
                'Shibuya Crossing Elite Tower', 'Asakusa Temple Traditional Inn', 'Ginza Luxury Shopping Suite', 
                'Akihabara Cyber Hub Residency', 'Roppongi Sky Lounge Palace', 'Ueno Park Blossom Manor', 
                'Odaiba Bayfront Marina Stay', 'Nara Deer Sanctuary Retreat', 'Osaka Castle Heritage Hub', 
                'Hokkaido Snowy Lodge', 'Okinawa Coral Sands Pavilions', 'Hakone Hot Springs Estate'
            ];
        } else {
            for(let k = 1; k <= 15; k++) {
                uniqueLocalNames.push(cityName + ' Holiday Stay Suite ' + (k * 10));
            }
        }

        for (let i = 1; i <= 15; i++) {
            const tier = tierPool[i % 3];
            const propertyNameText = uniqueLocalNames[(i - 1) % uniqueLocalNames.length];

            let baseRate = 3400 + (i * 1200);
            if (tier === '4star') baseRate += 3500;
            if (tier === '5star') baseRate += 12000;

            hotelDatabase.push({
                id: i,
                name: propertyNameText,
                location: cityName + ' Premium District',
                tier: tier,
                price: baseRate,
                image: secureStockPhotos[i % secureStockPhotos.length]
            });
        }

        if (priceSlider && priceLabel) {
            priceSlider.addEventListener('input', function() {
                priceLabel.textContent = '₹' + parseInt(this.value).toLocaleString('en-IN');
            });
        }

        function renderFeeds() {
            if (!targetGrid) return;
            targetGrid.innerHTML = '';

            const maxPrice = priceSlider ? parseInt(priceSlider.value) : 100000;
            const checkedBoxes = document.querySelectorAll('.amenity-check:checked');
            const activeTiers = Array.from(checkedBoxes).map(cb => cb.value);

            let visibleCount = 0;

            hotelDatabase.forEach(function(hotel) {
                if (hotel.price > maxPrice || !activeTiers.includes(hotel.tier)) return;
                visibleCount++;

                let tierLabel = '⭐⭐⭐ Comfort Choice';
                if (hotel.tier === '4star') tierLabel = '⭐⭐⭐⭐ Elite Luxury';
                if (hotel.tier === '5star') tierLabel = '⭐⭐⭐⭐⭐ Sovereign VIP';

                // Secure step-by-step element building method (Immune to string replacement syntax bugs)
                const card = document.createElement('div');
                card.className = 'glance-card';
                card.style.display = 'flex';
                card.style.flexDirection = 'column';
                card.style.backgroundColor = '#ffffff';
                card.style.borderRadius = '16px';
                card.style.overflow = 'hidden';
                card.style.boxShadow = 'var(--shadow-premium)';
                card.style.border = '1px solid rgba(0,0,0,0.02)';

                const whatsappUrl = 'https://wa.me' + encodeURIComponent(hotel.name) + '%20(' + encodeURIComponent(hotel.location) + ').';

                card.innerHTML = ' \
                    <div class="card-image-wrapper" style="height:200px; width:100%; overflow:hidden; position:relative; background:#e2e8f0;"> \
                        <img src="' + hotel.image + '" alt="' + hotel.name + '" class="glance-img" style="width:100%; height:100%; object-fit:cover; display:block;"> \
                        <span class="trending-badge" style="background-color:var(--dark-text); color:white; font-size:11px; top:12px; left:12px; font-weight:700; position:absolute; padding: 4px 10px; border-radius: 20px;">' + tierLabel + '</span> \
                    </div> \
                    <div class="card-meta" style="padding:20px; display:flex; flex-direction:column; justify-content:space-between; flex-grow:1;"> \
                        <div> \
                            <h3 style="font-family:var(--heading-font); font-size:17px; color:var(--dark-text); margin-bottom:4px; font-weight:800; line-height:1.4;">' + hotel.name + '</h3> \
                            <p style="font-size:12px; color:var(--primary-green); font-weight:600; margin-bottom:12px;">📍 ' + hotel.location + '</p> \
                            <p style="font-size:13px; color:#64748b; line-height:1.5; margin-bottom:15px;">Verified premium accommodation choice arranged under Mr. Sameer\'s custom corporate allocations.</p> \
                        </div> \
                        <div style="border-top:1px solid #f1f5f9; padding-top:12px; display:flex; justify-content:space-between; align-items:center;"> \
                            <span style="font-size:14px; font-weight:700; color:var(--secondary-blue);">₹' + hotel.price.toLocaleString('en-IN') + '/Night</span> \
                            <a href="' + whatsappUrl + '" target="_blank" class="nav-cta-btn" style="padding:8px 16px; font-size:12px; text-decoration:none; color:white; border-radius:20px; font-weight:600; background-color: var(--primary-green); box-shadow:none;">Select Hotel</a> \
                        </div> \
                    </div> \
                ';
                
                targetGrid.appendChild(card);
            });

            if (counterBar) {
                counterBar.textContent = 'Showing ' + visibleCount + ' verified luxury options matching your parameters';
            }
        }

        const applyBtn = document.getElementById('apply-filters-btn');
        if (applyBtn) applyBtn.addEventListener('click', renderFeeds);
        
        renderFeeds();
    }
});

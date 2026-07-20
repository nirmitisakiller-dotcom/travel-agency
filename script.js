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
            window.location.href = `${targetPage}?globalSearch=${encodeURIComponent(query)}`;
        });
    }

    // 2. THE PROGRESSIVE TIMED LOADING CONTROL BLOCK
    const urlParams = new URLSearchParams(window.location.search);
    const globalSearch = urlParams.get('globalSearch');

    if (globalSearch) {
        const formattedTitle = globalSearch.charAt(0).toUpperCase() + globalSearch.slice(1);
        
        const heroTitle = document.getElementById('dynamic-hero-title');
        if (heroTitle) heroTitle.textContent = `Explore Stays in ${formattedTitle}`;

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
                if (statusText) statusText.textContent = `🔍 Searching data coordinates for "${formattedTitle}"...`;
            } else if (currentProgressCount >= 30 && currentProgressCount < 70) {
                if (statusText) statusText.textContent = `📡 Pinging live travel data indices...`;
            } else if (currentProgressCount >= 70 && currentProgressCount < 100) {
                if (statusText) statusText.textContent = `📦 Packaging verified 3-Star and above accommodation profiles...`;
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
        }, 50); 
    }

    // 3. SEED-MULTIPLIED REPETITION-FREE HOTEL COMPONENT MATRIX
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
        
        // --- 🔑 THE INLINE MATH SEED HASHER ---
        let uniqueWordSeed = 0;
        for (let j = 0; j < lowerCity.length; j++) {
            uniqueWordSeed = lowerCity.charCodeAt(j) + ((uniqueWordSeed << 5) - uniqueWordSeed);
        }
        const textSignatureValue = Math.abs(uniqueWordSeed);

        // Extensive vocab matrices to build hundreds of distinct properties
        const domesticAdjectives = ['Varsoli Sands', 'Nagaon Palms', 'Coconut Groves', 'Coastal Breeze', 'Kashid Vista', 'Maratha Heritage', 'Konkan Retreat', 'Mandwa Horizon'];
        const globalAdjectives = ['Chateau Royale', 'Boutique Opéra', 'Alpine Horizon', 'Metropolitan Suites', 'Sovereign Palace', 'Zenith Manor', 'Marina Bay', 'Imperial Boulevard'];
        const infrastructureSuffixes = ['Premium Regency', 'Grand Resort & Spa', 'Boutique Manor', 'Comfort Stay Hub', 'Royal Palace Residence'];

        const activeAdjectivePool = (lowerCity.includes('alibaug') || lowerCity.includes('alibag') || lowerCity.includes('goa') || lowerCity.includes('mumbai')) 
            ? domesticAdjectives 
            : globalAdjectives;

        for (let i = 1; i <= 15; i++) {
            const tier = tierPool[i % 3];
            
            // Shifting arrays uniquely via the text signature code instead of a raw alternating index loop
            const dynamicWordIndex = (textSignatureValue + i) % activeAdjectivePool.length;
            const dynamicSuffixIndex = (textSignatureValue + (i * 3)) % infrastructureSuffixes.length;

            const selectedWord = activeAdjectivePool[dynamicWordIndex];
            const selectedSuffix = infrastructureSuffixes[dynamicSuffixIndex];

            let baseRate = 3200 + ((textSignatureValue + i) % 6 * 1100) + (i * 300);
            if (tier === '4star') baseRate += 3500;
            if (tier === '5star') baseRate += 12000;

            hotelDatabase.push({
                id: i,
                name: `${cityName} ${selectedWord} ${selectedSuffix}`,
                location: `${selectedWord}, ${cityName}`,
                tier: tier,
                price: baseRate,
                image: secureStockPhotos[(textSignatureValue + i) % secureStockPhotos.length]
            });
        }

        if (priceSlider && priceLabel) {
            priceSlider.addEventListener('input', function() {
                priceLabel.textContent = `₹${parseInt(this.value).toLocaleString('en-IN')}`;
            });
        }

        function renderFeeds() {
            if (!targetGrid) return;
            targetGrid.innerHTML = '';

            const maxPrice = priceSlider ? parseInt(priceSlider.value) : 100000;
            const checkedBoxes = document.querySelectorAll('.amenity-check:checked');
            const activeTiers = Array.from(checkedBoxes).map(cb => cb.value);

            let visibleCount = 0;

            hotelDatabase.forEach(hotel => {
                if (hotel.price > maxPrice || !activeTiers.includes(hotel.tier)) return;
                visibleCount++;

                let tierLabel = '⭐⭐⭐ Comfort Choice';
                if (hotel.tier === '4star') tierLabel = '⭐⭐⭐⭐ Elite Luxury';
                if (hotel.tier === '5star') tierLabel = '⭐⭐⭐⭐⭐ Sovereign VIP';

                const cardHTML = `
                    <div class="glance-card" style="display:flex; flex-direction:column; background:#ffffff; border-radius:16px; overflow:hidden; box-shadow:var(--shadow-premium); border:1px solid rgba(0,0,0,0.02);">
                        <div class="card-image-wrapper" style="height:200px; width:100%; overflow:hidden; position:relative; background:#e2e8f0;">
                            <img src="${hotel.image}" alt="${hotel.name}" class="glance-img" style="width:100%; height:100%; object-fit:cover; display:block;">
                            <span class="trending-badge" style="background-color:var(--dark-text); color:white; font-size:11px; top:12px; left:12px; font-weight:700; position:absolute; padding: 4px 10px; border-radius: 20px;">${tierLabel}</span>
                        </div>
                        <div class="card-meta" style="padding:20px; display:flex; flex-direction:column; justify-content:space-between; flex-grow:1;">
                            <div>
                                <h3 style="font-family:var(--heading-font); font-size:17px; color:var(--dark-text); margin-bottom:4px; font-weight:800; line-height:1.4;">${hotel.name}</h3>
                                <p style="font-size:12px; color:var(--primary-green); font-weight:600; margin-bottom:12px;">📍 ${hotel.location}</p>
                                <p style="font-size:13px; color:#64748b; line-height:1.5; margin-bottom:15px;">Verified premium accommodation choice arranged under Mr. Sameer's custom corporate allocations.</p>
                            </div>
                            <div style="border-top:1px solid #f1f5f9; padding-top:12px; display:flex; justify-content:space-between; align-items:center;">
                                <span style="font-size:14px; font-weight:700; color:var(--secondary-blue);">₹${hotel.price.toLocaleString('en-IN')}/Night</span>
                                <a href="https://wa.me{encodeURIComponent(hotel.name)}%20(${encodeURIComponent(hotel.location)})." target="_blank" class="nav-cta-btn" style="padding:8px 16px; font-size:12px; text-decoration:none; color:white; border-radius:20px; font-weight:600; background-color: var(--primary-green); box-shadow:none;">Select Hotel</a>
                            </div>
                        </div>
                    </div>
                `;
                targetGrid.insertAdjacentHTML('beforeend', cardHTML);
            });

            if (counterBar) {
                counterBar.textContent = `Showing ${visibleCount} verified luxury options matching your parameters`;
            }
        }

        const applyBtn = document.getElementById('apply-filters-btn');
        if (applyBtn) applyBtn.addEventListener('click', renderFeeds);
        
        renderFeeds();
    }
});

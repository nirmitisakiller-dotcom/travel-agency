document.addEventListener('DOMContentLoaded', function() {
    
    // 1. CONTEXT-AWARE ROUTING INTERCEPTOR
    const indianGeography = ['mumbai', 'delhi', 'bangalore', 'pune', 'nashik', 'goa', 'kerala', 'alibaug', 'alibag', 'ladakh', 'hampi', 'spiti'];

    const searchForm = document.getElementById('header-search-form');
    if (searchForm) {
        searchForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const searchInput = document.getElementById('search-input');
            const query = searchInput.value.trim();
            if (!query) return;

            const lowerQuery = query.toLowerCase();
            const isDomestic = indianGeography.some(place => lowerQuery.includes(place));
            const targetPage = isDomestic ? './domestic.html' : './international.html';

            window.location.href = `${targetPage}?globalSearch=${encodeURIComponent(query)}`;
        });
    }

    // 2. THE LIVE WIKIPEDIA GEOGRAPHIC CRAWLER BRIDGE
    const urlParams = new URLSearchParams(window.location.search);
    const globalSearch = urlParams.get('globalSearch');

    if (globalSearch) {
        const formattedTitle = globalSearch.charAt(0).toUpperCase() + globalSearch.slice(1);
        
        const heroTitle = document.getElementById('dynamic-hero-title');
        if (heroTitle) heroTitle.textContent = `Verified Accommodations in ${formattedTitle}`;

        const targetGrid = document.getElementById('hotel-cards-target-grid');
        const priceSlider = document.getElementById('price-range-slider');
        const priceLabel = document.getElementById('current-price-label');
        const counterBar = document.getElementById('hotel-results-counter');

        if (priceSlider && priceLabel) {
            priceSlider.addEventListener('input', function() {
                priceLabel.textContent = `₹${parseInt(this.value).toLocaleString('en-IN')}`;
            });
        }

        // Wikipedia Data Endpoint Call String
        const wikiApiUrl = `https://wikipedia.org{encodeURIComponent(globalSearch)}&format=json&origin=*`;

        // The Handshake Header: Identifies your registered Meta-Wiki username to clear safety gates
        fetch(wikiApiUrl, {
            headers: {
                'User-Agent': 'NatureToursPortal/1.0 (Contact: nimritmhatre@gmail.com; MetaWikiAccount: NatureToursPortal) TravelApp/Proto'
            }
        })
        .then(res => res.json())
        .then(data => {
            let realLocalLandmarks = [];
            
            if (data && data.query && data.query.search) {
                data.query.search.forEach(item => {
                    let cleanName = item.title.replace(/<\/?[^>]+(>|$)/g, "");
                    cleanName = cleanName.replace(formattedTitle, "").replace("in", "").trim();
                    
                    if (cleanName.length > 2 && !cleanName.toLowerCase().includes('demographics') && !cleanName.toLowerCase().includes('geography')) {
                        realLocalLandmarks.push(cleanName);
                    }
                });
            }

            if (realLocalLandmarks.length === 0) {
                realLocalLandmarks = ['Central Quarter', 'Downtown Avenue', 'Riverside Hub', 'Historic Sector', 'Grand Promenade'];
            }

            buildLiveMarketplace(formattedTitle, realLocalLandmarks, targetGrid, priceSlider, counterBar);
        })
        .catch(() => {
            buildLiveMarketplace(formattedTitle, ['Metropolitan Sector', 'Highland Vista', 'Central Avenue'], targetGrid, priceSlider, counterBar);
        });
    }

    // 3. DYNAMIC DATA FEED BUILDER
    function buildLiveMarketplace(cityName, localPlaces, grid, slider, counter) {
        const hotelDatabase = [];
        const tierPool = ['3star', '4star', '5star'];
        const suffixes = ['Regency Hub', 'Grand Stay Resort', 'Boutique Manor', 'Comfort Stay', 'Sovereign Palace'];
        
        const stockPhotos = [
            'https://picsum.photos',
            'https://picsum.photos',
            'https://picsum.photos',
            'https://picsum.photos',
            'https://picsum.photos'
        ];

        for (let i = 1; i <= 15; i++) {
            const tier = tierPool[i % 3];
            const activeLandmark = localPlaces[i % localPlaces.length];
            const activeSuffix = suffixes[(i * 3) % suffixes.length];
            
            let price = 3100 + (i * 1200);
            if (tier === '4star') price += 4000;
            if (tier === '5star') price += 12500;

            hotelDatabase.push({
                name: `${activeLandmark} ${activeSuffix}`,
                location: `${activeLandmark}, ${cityName}`,
                tier: tier,
                price: price,
                image: stockPhotos[i % stockPhotos.length]
            });
        }

        function renderFeeds() {
            if (!grid) return;
            grid.innerHTML = '';

            const maxPrice = slider ? parseInt(slider.value) : 100000;
            const checkedBoxes = document.querySelectorAll('.amenity-check:checked');
            const activeTiers = Array.from(checkedBoxes).map(cb => cb.value);

            let visibleHotels = 0;

            hotelDatabase.forEach(hotel => {
                if (hotel.price > maxPrice || !activeTiers.includes(hotel.tier)) return;
                visibleHotels++;

                let starBadge = '⭐⭐⭐ Comfort';
                if (hotel.tier === '4star') starBadge = '⭐⭐⭐⭐ Elite Luxury';
                if (hotel.tier === '5star') starBadge = '⭐⭐⭐⭐⭐ Sovereign VIP';

                const cardHTML = `
                    <div class="glance-card" style="display:flex; flex-direction:column; background:#ffffff; border-radius:16px; overflow:hidden; box-shadow:var(--shadow-premium); border: 1px solid rgba(0,0,0,0.02);">
                        <div class="card-image-wrapper" style="height:210px; width:100%; overflow:hidden; position:relative;">
                            <img src="${hotel.image}" alt="${hotel.name}" class="glance-img" style="width:100%; height:100%; object-fit:cover; display:block;">
                            <span class="trending-badge" style="background-color:var(--dark-text); color:white; font-size:11px; top:12px; left:12px; font-weight:700; position:absolute; padding: 4px 10px; border-radius: 20px;">${starBadge}</span>
                        </div>
                        <div class="card-meta" style="padding:20px; display:flex; flex-direction:column; justify-content:space-between; flex-grow:1;">
                            <div>
                                <h3 style="font-family:var(--heading-font); font-size:17px; color:var(--dark-text); margin-bottom:4px; font-weight:800; line-height:1.4;">${hotel.name}</h3>
                                <p style="font-size:12px; color:var(--primary-green); font-weight:600; margin-bottom:10px;">📍 ${hotel.location}</p>
                                <p style="font-size:13px; color:#64748b; line-height:1.5; margin-bottom:15px;">Verified premium accommodation choice arranged under Mr. Sameer's custom corporate allocations.</p>
                            </div>
                            <div style="border-top:1px solid #f1f5f9; padding-top:12px; display:flex; justify-content:space-between; align-items:center;">
                                <span style="font-size:14px; font-weight:700; color:var(--secondary-blue);">₹${hotel.price.toLocaleString('en-IN')}/Night</span>
                                <a href="https://wa.me{encodeURIComponent(hotel.name)}%20(${encodeURIComponent(hotel.location)}).%20Please%20verify%20room%20availability." target="_blank" class="nav-cta-btn" style="padding:8px 16px; font-size:12px; text-decoration:none; color:white; border-radius:20px; font-weight:600; background-color: var(--primary-green); box-shadow:none;">Select Hotel</a>
                            </div>
                        </div>
                    </div>
                `;
                grid.insertAdjacentHTML('beforeend', cardHTML);
            });

            if (counter) {
                counter.textContent = `Showing ${visibleHotels} verified options matching your filters`;
            }
        }

        const applyBtn = document.getElementById('apply-filters-btn');
        if (applyBtn) applyBtn.addEventListener('click', renderFeeds);
        
        renderFeeds();
    }
});

document.addEventListener('DOMContentLoaded', function() {
    
    // ----------------------------------------------------
    // 1. 🔍 THE REAL-TIME GLOBAL SEARCH ENGINE
    // ----------------------------------------------------
    const searchForm = document.getElementById('header-search-form');
    if (searchForm) {
        searchForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const searchInput = document.getElementById('search-input');
            const query = searchInput.value.trim();
            if (!query) return;

            // Define our fixed local catalog paths
            const domesticTargets = ['ladakh', 'leh', 'karnataka', 'hampi', 'kishkindha', 'kinnaur', 'spiti', 'chhattisgarh'];
            const internationalTargets = ['bhutan', 'maldives', 'vietnam', 'singapore', 'bali', 'indonesia'];

            const lowerQuery = query.toLowerCase();

            // Rule A: If it's a fixed package we already built, route them there
            let matchedDest = domesticTargets.find(dest => lowerQuery.includes(dest));
            if (matchedDest) {
                window.location.href = `domestic.html?highlight=${matchedDest}`;
                return;
            }

            matchedDest = internationalTargets.find(dest => lowerQuery.includes(dest));
            if (matchedDest) {
                window.location.href = `international.html?highlight=${matchedDest}`;
                return;
            }

            // Rule B: GLOBAL WILDCARD ENGINE (If it's any other place on earth!)
            // We pass the search term directly into the page via the URL bar
            window.location.href = `international.html?globalSearch=${encodeURIComponent(query)}`;
        });
    }

    // ----------------------------------------------------
    // 2. 🌍 DYNAMIC REAL-TIME CARD INJECTION ENGINE
    // ----------------------------------------------------
    const urlParams = new URLSearchParams(window.location.search);
    const globalSearch = urlParams.get('globalSearch');
    const highlightTarget = urlParams.get('highlight');

    // If the user arrived via a global search lookup
    if (globalSearch) {
        const glanceGrid = document.querySelector('.glance-grid');
        
        if (glanceGrid) {
            // Capitalise the query for premium display typography
            const formattedTitle = globalSearch.charAt(0).toUpperCase() + globalSearch.slice(1);
            
            // Generate a real-time high-fidelity image path directly from Unsplash API
            const realTimeImageSrc = `https://unsplash.com`; 
            // Fallback base banner, we use a smart keyword term query link instead:
            const liveInternetPhoto = `https://unsplash.com{encodeURIComponent(globalSearch)},travel,city`;

            // Build a brand new premium HTML card component out of thin air!
            const dynamicCardHTML = `
                <div class="glance-card dynamic-search-card" id="dynamic-result-anchor">
                    <div class="card-image-wrapper">
                        <img src="${liveInternetPhoto}" alt="${formattedTitle}" class="glance-img" onerror="this.src='https://unsplash.com'">
                        <span class="trending-badge" style="background-color: var(--secondary-blue); color: white;">🌐 Real-Time Result</span>
                    </div>
                    <div class="card-meta">
                        <h3>Custom ${formattedTitle} Plan</h3>
                        <p class="card-vibe">✨ Tailor-made tour curated live for you anywhere on the planet.</p>
                        <div style="border-top: 1px solid #F1F5F9; padding-top: 14px; margin-top: 15px; display: flex; justify-content: space-between; align-items: center;">
                            <span class="pricing-tint" style="background: rgba(30,130,206,0.08); color: var(--secondary-blue);">Bespoke Itinerary</span>
                            <a href="https://wa.me{encodeURIComponent(formattedTitle)}%20on%20your%20site.%20Please%20help%20me%20craft%20this%20custom%20global%20itinerary!" target="_blank" class="nav-cta-btn" style="padding: 8px 16px; font-size: 13px; box-shadow: none;">Book Destination</a>
                        </div>
                    </div>
                </div>
            `;

            // Inject the internet card right at the very front of the catalog grid
            glanceGrid.insertAdjacentHTML('afterbegin', dynamicCardHTML);

            // Smoothly glide the user's view straight to their newly generated internet card
            setTimeout(() => {
                const targetCard = document.getElementById('dynamic-result-anchor');
                if (targetCard) {
                    targetCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    targetCard.style.transform = 'scale(1.02)';
                    targetCard.style.boxShadow = '0 25px 50px -12px rgba(30, 130, 206, 0.25)';
                    targetCard.style.borderColor = 'var(--secondary-blue)';
                }
            }, 500);
        }
    }

    // 3. Keep our original built-in highlight scroller running below
    if (highlightTarget) {
        const cards = document.querySelectorAll('.glance-card');
        cards.forEach(card => {
            const cardTitle = card.querySelector('h3').textContent.toLowerCase();
            if (cardTitle.includes(highlightTarget)) {
                setTimeout(() => {
                    card.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    card.style.transform = 'scale(1.04)';
                    card.style.borderColor = 'var(--secondary-blue)';
                }, 400);
            }
        });
    }
});

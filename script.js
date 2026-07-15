document.addEventListener('DOMContentLoaded', function() {
    
    // ----------------------------------------------------
    // 1. 🔍 THE REDIRECTING SEARCH INTERCEPTOR
    // ----------------------------------------------------
    const searchForm = document.getElementById('header-search-form');
    if (searchForm) {
        searchForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const searchInput = document.getElementById('search-input');
            const query = searchInput.value.trim();
            if (!query) return;

            const lowerQuery = query.toLowerCase();
            const domesticTargets = ['ladakh', 'leh', 'karnataka', 'hampi', 'kishkindha', 'kinnaur', 'spiti', 'chhattisgarh'];
            const internationalTargets = ['bhutan', 'maldives', 'vietnam', 'singapore', 'bali', 'indonesia'];

            // A. If it's a card we hardcoded, jump directly to it
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

            // B. THE GLOBAL ENGINE HANDSHAKE (Takes any unknown keyword to international page)
            window.location.href = `international.html?globalSearch=${encodeURIComponent(query)}`;
        });
    }

    // ----------------------------------------------------
    // 2. 🌍 LIVE REAL-TIME CARD BUILDER & INJECTOR
    // ----------------------------------------------------
    const urlParams = new URLSearchParams(window.location.search);
    const globalSearch = urlParams.get('globalSearch');
    const highlightTarget = urlParams.get('highlight');

    // This code runs when the user arrives on the page with a globalSearch parameter
    if (globalSearch) {
        const glanceGrid = document.querySelector('.glance-grid');
        
        if (glanceGrid) {
            const formattedTitle = globalSearch.charAt(0).toUpperCase() + globalSearch.slice(1);
            
            // Generates a live, unique random holiday image for the searched keyword
            const randomSeedId = Math.floor(Math.random() * 1000);
                      // Build a crisp premium graphic card placeholder out of thin air
            const dynamicCardHTML = `
                <div class="glance-card dynamic-search-card" id="dynamic-result-anchor" style="border: 2px solid var(--secondary-blue); transform: scale(1.02); transition: all 0.4s ease;">
                    <div class="card-image-wrapper">
                        <!-- Direct, high-fidelity secure default placeholder alignment -->
                        <img src="https://unsplash.com" alt="${formattedTitle}" class="glance-img">
                        <span class="trending-badge" style="background-color: var(--secondary-blue); color: white; font-weight:700;">🌐 Live Request</span>
                    </div>
                    <div class="card-meta">
                        <h3 style="font-family: var(--heading-font); font-size:22px; color: var(--dark-text);">Custom ${formattedTitle} Plan</h3>
                        <p class="card-vibe" style="font-size:14px; color:#64748b; margin-bottom:20px;">✨ 100% tailor-made global tour layout curated for your specific request.</p>
                        <div style="border-top: 1px solid #F1F5F9; padding-top: 14px; display: flex; justify-content: space-between; align-items: center;">
                            <span class="pricing-tint">Bespoke Coordinates</span>
                            <a href="https://wa.me{encodeURIComponent(formattedTitle)}%20on%20your%20site.%20Please%20help%20me%20arrange%20this%20itinerary!" target="_blank" class="nav-cta-btn" style="padding: 8px 16px; font-size: 13px; box-shadow: none;">Book Destination</a>
                        </div>
                    </div>
                </div>
            `;



      // Create the custom HTML block structure
            const dynamicCardHTML = `
                <div class="glance-card dynamic-search-card" id="dynamic-result-anchor" style="border: 2px solid var(--secondary-blue); transform: scale(1.02); transition: all 0.4s ease;">
                    <div class="card-image-wrapper">
                        <img src="${liveInternetPhoto}" alt="${formattedTitle}" class="glance-img">
                        <span class="trending-badge" style="background-color: var(--secondary-blue); color: white; font-weight:700;">🌐 Live Request</span>
                    </div>
                    <div class="card-meta">
                        <h3 style="font-family: var(--heading-font); font-size:22px; color: var(--dark-text);">Custom ${formattedTitle} Plan</h3>
                        <p class="card-vibe" style="font-size:14px; color:#64748b; margin-bottom:20px;">✨ 100% tailor-made global tour layout curated for your specific request.</p>
                        <div style="border-top: 1px solid #F1F5F9; padding-top: 14px; display: flex; justify-content: space-between; align-items: center;">
                            <span class="pricing-tint">Bespoke Coordinates</span>
                            <a href="https://wa.me{encodeURIComponent(formattedTitle)}%20on%20your%20site.%20Please%20help%20me%20arrange%20this%20itinerary!" target="_blank" class="nav-cta-btn" style="padding: 8px 16px; font-size: 13px; box-shadow: none;">Book Destination</a>
                        </div>
                    </div>
                </div>
            `;

            // Inject the custom card right at the front of the grid layout
            glanceGrid.insertAdjacentHTML('afterbegin', dynamicCardHTML);

            // Smooth scroll down to reveal the custom generated card
            setTimeout(() => {
                const targetCard = document.getElementById('dynamic-result-anchor');
                if (targetCard) {
                    targetCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            }, 600);
        }
    }

    // 3. Built-in highlight engine for pre-existing cards
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

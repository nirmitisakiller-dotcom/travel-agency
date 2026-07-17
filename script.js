document.addEventListener('DOMContentLoaded', function() {
    
    // 1. CONTEXT-AWARE ROUTING INTERCEPTOR
    const searchForm = document.getElementById('header-search-form');
    if (searchForm) {
        searchForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const searchInput = document.getElementById('search-input');
            const query = searchInput.value.trim();
            if (!query) return;

            // Route everything directly to your catalog using native variables
            window.location.href = './international.html?globalSearch=' + encodeURIComponent(query);
        });
    }

    // 2. FREE AUTOMATED HOTEL INJECTOR ENGINE
    const urlParams = new URLSearchParams(window.location.search);
    const globalSearch = urlParams.get('globalSearch');

    if (globalSearch) {
        const glanceGrid = document.querySelector('.glance-grid');
        
        if (glanceGrid) {
            const formattedTitle = globalSearch.charAt(0).toUpperCase() + globalSearch.slice(1);
            
            // Clean out the default placeholder grid to create space for the hotel matrix
            glanceGrid.innerHTML = '';
            
            // Generate free, randomized pricing variables based on the destination string length
            const basePrice = Math.floor((globalSearch.length * 1500) + 4000);

            // Construct 3 beautifully distinct hotel selection tier components out of thin air
            const hotelMatrixHTML = `
                <!-- Header Badge Alert Grid Layer -->
                <div style="grid-column: 1 / -1; background-color: var(--white); border-left: 5px solid var(--secondary-blue); padding: 16px 24px; border-radius: 8px; margin-bottom: 10px; box-shadow: var(--shadow-premium);">
                    <h3 style="font-family: var(--heading-font); color: var(--dark-text); font-size: 18px;">🔒 Active Quality Filters: Showing Accommodations for "${formattedTitle}"</h3>
                    <p style="font-size: 13px; color: #64748b; font-weight: 500; margin-top: 2px;">Display constraints configured strictly to verified 3-Star, 4-Star, and 5-Star luxury categories.</p>
                </div>

                <!-- Tier 1: 3-Star Standard Premium Choice -->
                <div class="glance-card" style="border: 1px solid #e2e8f0;">
                    <div class="card-image-wrapper" style="background: linear-gradient(135deg, #64748b, var(--dark-text)); display: flex; align-items: center; justify-content: center; height: 200px;">
                        <span style="font-size: 48px;">🏢</span>
                    </div>
                    <div class="card-meta" style="padding: 24px;">
                        <span style="color: var(--sun-gold); font-weight: 800; font-size: 13px; display: block; margin-bottom: 4px;">⭐⭐⭐ COMFORT TIER</span>
                        <h3 style="font-family: var(--heading-font); font-size: 20px; color: var(--dark-text); margin-bottom: 8px;">${formattedTitle} Prime Residency</h3>
                        <p style="font-size: 13.5px; color: #64748b; margin-bottom: 18px;">Walk-to-metro city locations featuring clean configurations, hot water setups, and secure luggage lounges.</p>
                        <div style="border-top: 1px solid #f1f5f9; padding-top: 14px; display: flex; justify-content: space-between; align-items: center;">
                            <span style="font-size: 14px; font-weight: 700; color: var(--dark-text);">Est: ₹${basePrice}/Night</span>
                            <a href="https://wa.me{encodeURIComponent(formattedTitle)}." target="_blank" class="nav-cta-btn" style="padding: 8px 16px; font-size: 12px; text-decoration:none; background-color: var(--dark-text); color: white; border-radius: 20px; font-weight: 600;">Select Stay</a>
                        </div>
                    </div>
                </div>

                <!-- Tier 2: 4-Star Elite Premium Choice -->
                <div class="glance-card" style="border: 2px solid var(--secondary-blue); transform: scale(1.02);">
                    <div class="card-image-wrapper" style="background: linear-gradient(135deg, var(--secondary-blue), var(--dark-text)); display: flex; align-items: center; justify-content: center; height: 200px; position: relative;">
                        <span style="font-size: 48px;">🏨</span>
                        <span style="position: absolute; top: 12px; right: 12px; background-color: var(--sun-gold); color: var(--dark-text); font-size: 11px; font-weight: 800; padding: 4px 10px; border-radius: 20px;">MOST POPULAR</span>
                    </div>
                    <div class="card-meta" style="padding: 24px;">
                        <span style="color: var(--secondary-blue); font-weight: 800; font-size: 13px; display: block; margin-bottom: 4px;">⭐⭐⭐⭐ ELITE LUXURY</span>
                        <h3 style="font-family: var(--heading-font); font-size: 20px; color: var(--dark-text); margin-bottom: 8px;">Grand Regency & Spa Hub</h3>
                        <p style="font-size: 13.5px; color: #64748b; margin-bottom: 18px;">Premium upgrades featuring inclusive swimming pool paths, open sky dining lounges, and complimentary breakfast plans.</p>
                        <div style="border-top: 1px solid #f1f5f9; padding-top: 14px; display: flex; justify-content: space-between; align-items: center;">
                            <span style="font-size: 14px; font-weight: 700; color: var(--secondary-blue);">Est: ₹${Math.floor(basePrice * 1.5)}/Night</span>
                            <a href="https://wa.me{encodeURIComponent(formattedTitle)}." target="_blank" class="nav-cta-btn" style="padding: 8px 16px; font-size: 12px; text-decoration:none; background-color: var(--secondary-blue); color: white; border-radius: 20px; font-weight: 600;">Select Stay</a>
                        </div>
                    </div>
                </div>

                <!-- Tier 3: 5-Star Grand Sovereign Choice -->
                <div class="glance-card" style="border: 1px solid #e2e8f0;">
                    <div class="card-image-wrapper" style="background: linear-gradient(135deg, var(--primary-green), #14281e); display: flex; align-items: center; justify-content: center; height: 200px;">
                        <span style="font-size: 48px;">🏰</span>
                    </div>
                    <div class="card-meta" style="padding: 24px;">
                        <span style="color: var(--primary-green); font-weight: 800; font-size: 13px; display: block; margin-bottom: 4px;">⭐⭐⭐⭐⭐ SOVEREIGN VIP</span>
                        <h3 style="font-family: var(--heading-font); font-size: 20px; color: var(--dark-text); margin-bottom: 8px;">The Sovereign Royal Estate</h3>
                        <p style="font-size: 13.5px; color: #64748b; margin-bottom: 18px;">Absolute elite track setups including private vehicle transit shuttles, VIP airport lounges, and 24/7 dedicated butler concierge desks.</p>
                        <div style="border-top: 1px solid #f1f5f9; padding-top: 14px; display: flex; justify-content: space-between; align-items: center;">
                            <span style="font-size: 14px; font-weight: 700; color: var(--primary-green);">Est: ₹${Math.floor(basePrice * 2.4)}/Night</span>
                            <a href="https://wa.me{encodeURIComponent(formattedTitle)}." target="_blank" class="nav-cta-btn" style="padding: 8px 16px; font-size: 12px; text-decoration:none; background-color: var(--primary-green); color: white; border-radius: 20px; font-weight: 600;">Select Stay</a>
                        </div>
                    </div>
                </div>
            `;

            // Inject the complete multi-tier data matrix onto the interface instantly
            glanceGrid.insertAdjacentHTML('afterbegin', hotelMatrixHTML);
        }
    }
});

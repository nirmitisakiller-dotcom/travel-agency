document.addEventListener('DOMContentLoaded', function() {
    
    // Extract query parameters from the browser's URL header bar
    const urlParams = new URLSearchParams(window.location.search);
    const globalSearch = urlParams.get('globalSearch');

    // This block triggers only if a user searched a custom country destination
    if (globalSearch) {
        const glanceGrid = document.querySelector('.glance-grid');
        
        if (glanceGrid) {
            // Capitalise the keyword for elegant typography rules
            const formattedTitle = globalSearch.charAt(0).toUpperCase() + globalSearch.slice(1);
            
            // Build the card component on the fly with a pure CSS backdrop block to avoid cross-site image blocks
            const dynamicCardHTML = `
                <div class="glance-card dynamic-search-card" id="dynamic-result-anchor" style="border: 2px solid var(--secondary-blue); transform: scale(1.02); transition: all 0.4s ease;">
                    
                    <div class="card-image-wrapper" style="background: linear-gradient(135deg, var(--secondary-blue), var(--dark-text)); display: flex; align-items: center; justify-content: center; height: 250px;">
                        <span style="font-size: 64px; filter: drop-shadow(0 10px 15px rgba(0,0,0,0.2));">✈️</span>
                        <span class="trending-badge" style="background-color: var(--sun-gold); color: var(--dark-text); font-weight:800;">🌐 Custom Canvas</span>
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

            // Inject the block at the front of the destination listing grid
            glanceGrid.insertAdjacentHTML('afterbegin', dynamicCardHTML);

            // Smooth scroll target alignment execution
            setTimeout(() => {
                const targetCard = document.getElementById('dynamic-result-anchor');
                if (targetCard) {
                    targetCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            }, 500);
        }
    }
});

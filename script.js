document.addEventListener('DOMContentLoaded', function() {
    
    // ----------------------------------------------------
    // 1. 🔍 THE 1-CLICK FIXED HEADER SEARCH HANDLER
    // ----------------------------------------------------
    const searchForm = document.getElementById('header-search-form');
    if (searchForm) {
        searchForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const searchInput = document.getElementById('search-input');
            const query = searchInput.value.toLowerCase().trim();
            
            // Client data routing rules
            const domesticTargets = ['ladakh', 'leh', 'karnataka', 'hampi', 'kishkindha', 'kinnaur', 'spiti', 'chhattisgarh'];
            const internationalTargets = ['bhutan', 'maldives', 'vietnam', 'singapore', 'bali', 'indonesia'];

            // Match and redirect algorithm
            let matchedDest = domesticTargets.find(dest => query.includes(dest));
            if (matchedDest) {
                window.location.href = `domestic.html?highlight=${matchedDest}`;
                return;
            }

            matchedDest = internationalTargets.find(dest => query.includes(dest));
            if (matchedDest) {
                window.location.href = `international.html?highlight=${matchedDest}`;
                return;
            }

            // Fallback for general queries: Route directly to global desk over WhatsApp
            alert(`Our Nature Tours desk crafts custom itineraries for "${searchInput.value}". Connecting you to our travel designer via WhatsApp now!`);
            window.open(`https://wa.me{encodeURIComponent(searchInput.value)}.`, '_blank');
        });
    }

    // ----------------------------------------------------
    // 2. ✨ TARGET SCROLL & VISUAL HIGHLIGHT ENGINE 
    // ----------------------------------------------------
    // Extracts search keywords from the URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const highlightTarget = urlParams.get('highlight');

    if (highlightTarget) {
        // Find cards matching the current target flag
        const cards = document.querySelectorAll('.glance-card');
        
        cards.forEach(card => {
            const cardTitle = card.querySelector('h3').textContent.toLowerCase();
            const cardDesc = card.querySelector('.card-vibe').textContent.toLowerCase();
            
            if (cardTitle.includes(highlightTarget) || cardDesc.includes(highlightTarget)) {
                // Smooth scroll right down to the target package card
                setTimeout(() => {
                    card.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    
                    // Flash a soft, premium visual halo effect to draw the eye
                    card.style.transition = 'all 0.4s ease';
                    card.style.transform = 'scale(1.05)';
                    card.style.boxShadow = '0 20px 40px rgba(30, 130, 206, 0.25)';
                    card.style.borderColor = 'var(--secondary-blue)';
                }, 400);
            }
        });
    }
});

document.addEventListener('DOMContentLoaded', function() {
    
    // ----------------------------------------------------
    // 1. 🇮🇳 THE MASTER INDIAN GEOGRAPHY DATASET (Honouring Home)
    // ----------------------------------------------------
    const indianStatesAndCities = [
        'mumbai', 'delhi', 'bangalore', 'hyderabad', 'ahmedabad', 'chennai', 'kolkata', 'surat', 'pune', 'jaipur',
        'lucknow', 'kanpur', 'nagpur', 'indore', 'thane', 'bhopal', 'visakhapatnam', 'patna', 'vadodara', 'ghaziabad',
        'ludhiana', 'agra', 'nashik', 'faridabad', 'meerut', 'rajkot', 'kalyan', 'vasai', 'varanasi', 'srinagar',
        'aurangabad', 'dhanbad', 'amritsar', 'navi mumbai', 'allahabad', 'ranchi', 'haora', 'coimbatore', 'jabalpur',
        'gwalior', 'vijayawada', 'jodhpur', 'madurai', 'raipur', 'kota', 'chandigarh', 'guwahati', 'sholapur', 
        'hubli', 'bareilly', 'moradabad', 'mysore', 'gurgaon', 'aligarh', 'jalandhar', 'tiruchirappalli', 'bhubaneswar',
        'salem', 'warangal', 'guntur', 'amravati', 'bikaner', 'noida', 'jamshedpur', 'bhilai', 'cuttack', 'kochi',
        'udaipur', 'dehradun', 'jammu', 'ajmer', 'mangalore', 'vellore', 'belgaum', 'jamnagar', 'tirupati', 'goa',
        'kerala', 'rajasthan', 'gujarat', 'maharashtra', 'karnataka', 'tamil nadu', 'andhra pradesh', 'telangana',
        'madhya pradesh', 'uttar pradesh', 'bihar', 'west bengal', 'odisha', 'punjab', 'haryana', 'himachal',
        'uttarakhand', 'jharkhand', 'chhattisgarh', 'assam', 'sikkim', 'meghalaya', 'arunachal', 'manipur', 
        'mizoram', 'nagaland', 'tripura', 'shimla', 'manali', 'leh', 'ladakh', 'hampi', 'spiti', 'kinnaur'
    ];

    // ----------------------------------------------------
    // 2. 🔍 CONTEXT-AWARE ROUTING INTERCEPTOR
    // ----------------------------------------------------
    const searchForm = document.getElementById('header-search-form');
    if (searchForm) {
        searchForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const searchInput = document.getElementById('search-input');
            const query = searchInput.value.trim();
            if (!query) return;

            const lowerQuery = query.toLowerCase();

            // Check if the searched term is part of India
            const isDomestic = indianStatesAndCities.some(place => lowerQuery.includes(place));

            if (isDomestic) {
                // Route directly to domestic catalog with query string
                window.location.href = `./domestic.html?globalSearch=${encodeURIComponent(query)}`;
            } else {
                // Route to international catalog with query string
                window.location.href = `./international.html?globalSearch=${encodeURIComponent(query)}`;
            }
        });
    }

    // ----------------------------------------------------
    // 3. 🖼️ REAL-TIME API IMAGE INJECTION ENGINE
    // ----------------------------------------------------
    const urlParams = new URLSearchParams(window.location.search);
    const globalSearch = urlParams.get('globalSearch');

    if (globalSearch) {
        const glanceGrid = document.querySelector('.glance-grid');
        
        if (glanceGrid) {
            const formattedTitle = globalSearch.charAt(0).toUpperCase() + globalSearch.slice(1);
            
            // PUBLIC ACCESS API: Using Unsplash Source integration with explicit keywords to avoid CORS blocks
            const dynamicApiImage = `https://unsplash.com`; 
            
            // Build the card layout with real-time text and structured WhatsApp handshake strings
            const dynamicCardHTML = `
                <div class="glance-card dynamic-search-card" id="dynamic-result-anchor" style="border: 2px solid var(--primary-green); transform: scale(1.02); transition: all 0.4s ease;">
                    <div class="card-image-wrapper" style="position: relative; height: 240px; overflow: hidden; background: #e2e8f0;">
                        <!-- Fallback background image that reads the query dynamically -->
                        <img src="https://unsplash.com" alt="${formattedTitle}" class="glance-img" style="width:100%; height:100%; object-fit:cover;">
                        <span class="trending-badge" style="background-color: var(--primary-green); color: white; font-weight:800; position:absolute; top:15px; left:15px; padding:5px 10px; border-radius:20px; font-size:12px;">🗺️ Verified Destination</span>
                    </div>
                    <div class="card-meta" style="padding: 24px;">
                        <h3 style="font-family: var(--heading-font); font-size:22px; color: var(--dark-text); margin-bottom:8px;">Custom ${formattedTitle} Plan</h3>
                        <p class="card-vibe" style="font-size:14px; color:#64748b; margin-bottom:20px;">✨ Click to explore luxury 3★ and above hotels in ${formattedTitle} tailored to your budget constraints.</p>
                        <div style="border-top: 1px solid #F1F5F9; padding-top: 14px; display: flex; justify-content: space-between; align-items: center;">
                            <span class="pricing-tint" style="color: var(--primary-green); background: rgba(42,158,65,0.08); padding:4px 10px; border-radius:5px; font-size:12px; font-weight:600;">Tailor-Made Route</span>
                            <a href="https://wa.me{encodeURIComponent(formattedTitle)}.%20Please%20suggest%20hotels%203-star%20and%20above." target="_blank" class="nav-cta-btn" style="padding: 8px 16px; font-size: 13px; box-shadow: none; background-color: var(--primary-green); text-decoration:none; color:white; border-radius:20px; font-weight:600;">Enquire Hotels</a>
                        </div>
                    </div>
                </div>
            `;

            // Inject the card instantly at the front of the grid row
            glanceGrid.insertAdjacentHTML('afterbegin', dynamicCardHTML);

            // Smooth scroll target tracking view adjustment
            setTimeout(() => {
                const targetCard = document.getElementById('dynamic-result-anchor');
                if (targetCard) {
                    targetCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            }, 500);
        }
    }
});

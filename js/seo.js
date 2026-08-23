// ==========================================
// Nature Tours SEO Metadata Enhancer
// ==========================================

"use strict";

(function () {
    const SITE = "https://nirmitisakiller-dotcom.github.io/travel-agency/";

    function setMeta(name, content) {
        if (!content) return;
        let tag = document.querySelector(`meta[name="${name}"]`);
        if (!tag) { tag = document.createElement("meta"); tag.setAttribute("name", name); document.head.appendChild(tag); }
        tag.setAttribute("content", content);
    }
    function setProperty(property, content) {
        if (!content) return;
        let tag = document.querySelector(`meta[property="${property}"]`);
        if (!tag) { tag = document.createElement("meta"); tag.setAttribute("property", property); document.head.appendChild(tag); }
        tag.setAttribute("content", content);
    }
    function setCanonical(url) {
        let tag = document.querySelector('link[rel="canonical"]');
        if (!tag) { tag = document.createElement("link"); tag.setAttribute("rel", "canonical"); document.head.appendChild(tag); }
        tag.setAttribute("href", url);
    }
    function setStructuredData(id, data) {
        let script = document.getElementById(id);
        if (!script) { script = document.createElement("script"); script.type = "application/ld+json"; script.id = id; document.head.appendChild(script); }
        script.textContent = JSON.stringify(data);
    }
    function addLegalNavigation() {
        const footer = document.querySelector(".master-footer");
        if (!footer || footer.querySelector(".legal-navigation")) return;
        const bar = document.createElement("div");
        bar.className = "legal-navigation";
        bar.style.cssText = "text-align:center;padding:12px 20px;font-size:13px;color:#64748b;border-top:1px solid rgba(100,116,139,.14);";
        bar.innerHTML = `<a href="about.html" style="color:inherit;text-decoration:none;margin:0 8px;">About</a><span aria-hidden="true">·</span><a href="contact.html" style="color:inherit;text-decoration:none;margin:0 8px;">Contact</a><span aria-hidden="true">·</span><a href="privacy.html" style="color:inherit;text-decoration:none;margin:0 8px;">Privacy</a><span aria-hidden="true">·</span><a href="terms.html" style="color:inherit;text-decoration:none;margin:0 8px;">Terms</a>`;
        footer.insertBefore(bar, footer.firstChild);
    }
    function apply(destination) {
        if (!destination) return;
        const name = destination.name || "Destination", country = destination.country || "";
        const description = destination.description || `Explore ${name}${country ? `, ${country}` : ""} with Nature Tours. Discover travel ideas, attractions, hotels and personalised trip planning.`;
        const title = `${name}${country ? `, ${country}` : ""} Travel Guide | Nature Tours`, id = destination.id || "";
        const canonical = id ? `${SITE}destination.html?id=${encodeURIComponent(id)}` : `${SITE}destination.html`;
        document.title = title; setMeta("description", description.slice(0,160)); setMeta("robots", "index,follow,max-image-preview:large"); setCanonical(canonical);
        setProperty("og:type","website"); setProperty("og:title",title); setProperty("og:description",description.slice(0,200)); setProperty("og:url",canonical); setProperty("og:site_name","Nature Tours"); setProperty("og:image",destination.image||`${SITE}logo.png`);
        setMeta("twitter:card","summary_large_image"); setMeta("twitter:title",title); setMeta("twitter:description",description.slice(0,200)); setMeta("twitter:image",destination.image||`${SITE}logo.png`);
        setStructuredData("nature-tours-destination-schema",{"@context":"https://schema.org","@type":"TouristDestination","name":name,"description":description,"url":canonical,...(destination.image?{image:destination.image}:{}),...(country?{containedInPlace:{"@type":"Country",name:country}}:{})});
    }
    function applyStatic() {
        const path = window.location.pathname.split("/").pop() || "index.html", query = new URLSearchParams(window.location.search), continent = query.get("continent");
        const values = {
            "index.html": {title:"Nature Tours | Custom Travel Experiences & Holiday Planning",description:"Nature Tours creates customised domestic and international trips, hotel enquiries, destination ideas and personalised travel planning."},
            "domestic.html": {title:"Domestic Tour Packages in India | Nature Tours",description:"Explore custom India travel itineraries including Ladakh, Spiti, Hampi and Chhattisgarh with Nature Tours."},
            "international.html": {title:"International Tour Packages & Destinations | Nature Tours",description:"Discover international travel ideas, destinations and hotel options with Nature Tours, including Paris, Bali, Maldives, Singapore and Tokyo."},
            "continent.html": {title:continent?`${continent} Travel Destinations | Nature Tours`:"Explore Travel Destinations by Continent | Nature Tours",description:continent?`Explore ${continent} travel destinations, attractions and holiday ideas with Nature Tours.`:"Browse Nature Tours destinations by continent and discover travel ideas around the world."}
        };
        const current=values[path]; if(!current)return;
        const canonical=path==="index.html"?SITE:path==="continent.html"&&continent?`${SITE}continent.html?continent=${encodeURIComponent(continent)}`:`${SITE}${path}`;
        document.title=current.title; setMeta("description",current.description); setMeta("robots","index,follow,max-image-preview:large"); setCanonical(canonical);
        setProperty("og:type","website"); setProperty("og:title",current.title); setProperty("og:description",current.description); setProperty("og:site_name","Nature Tours"); setProperty("og:url",canonical); setProperty("og:image",`${SITE}logo.png`);
        setMeta("twitter:card","summary_large_image"); setMeta("twitter:title",current.title); setMeta("twitter:description",current.description); setMeta("twitter:image",`${SITE}logo.png`);
        if(path==="index.html")setStructuredData("nature-tours-organization-schema",{"@context":"https://schema.org","@type":"TravelAgency","name":"Nature Tours","url":SITE,"logo":`${SITE}logo.png`,"telephone":"+91 9822339466","description":current.description});
    }
    document.addEventListener("DOMContentLoaded",()=>{
        applyStatic(); addLegalNavigation();
        const dynamic=document.getElementById("destination-page"); if(!dynamic)return;
        const tryDynamic=()=>{try{const saved=localStorage.getItem("natureToursDynamicDestination");if(!saved)return;const data=JSON.parse(saved);if(data&&data.dynamic)apply(data)}catch(_){}};
        tryDynamic(); setTimeout(tryDynamic,700); setTimeout(tryDynamic,1800);
    });
})();

(function loadGlobalPlanCart(){
    if(document.querySelector('script[src*="plan-cart.js"]'))return;
    const script=document.createElement("script");
    script.src="js/plan-cart.js?v=7";
    script.dataset.planCartLoader="true";
    script.onload=()=>{
        if(document.querySelector('script[src*="plan-cart-runtime-fix.js"]'))return;
        const fix=document.createElement("script");
        fix.src="js/plan-cart-runtime-fix.js?v=1";
        fix.dataset.planCartRuntimeFix="true";
        document.head.appendChild(fix);
    };
    document.head.appendChild(script);
})();

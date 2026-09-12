/* Nature Tours — destination network performance layer
 * Keeps real OSM/API data, but deduplicates and short-term caches identical
 * destination requests so mobile/repeat visits do less remote work.
 */
(function(){
  'use strict';
  if(window.__NatureToursDestinationPerformance) return;
  window.__NatureToursDestinationPerformance=true;

  const originalFetch=window.fetch.bind(window);
  const pending=new Map();
  const CACHE_PREFIX='nt-destination-net:';
  const TTL=30*60*1000;

  function isGet(input,init){
    return (!init||!init.method||String(init.method).toUpperCase()==='GET') &&
      (typeof input==='string' || input instanceof URL || (input&&input.url));
  }
  function urlOf(input){return typeof input==='string'||input instanceof URL?String(input):input.url;}
  function eligible(url){return /nominatim\.openstreetmap\.org\/search|overpass[^/]*\.api|overpass\.kumi\.systems|overpass\.private\.coffee/.test(url);}
  function key(url){return CACHE_PREFIX+btoa(unescape(encodeURIComponent(url))).replace(/[^a-zA-Z0-9]/g,'').slice(0,180);}

  window.fetch=function(input,init){
    if(!isGet(input,init)) return originalFetch(input,init);
    const url=urlOf(input);
    if(!eligible(url)) return originalFetch(input,init);

    if(pending.has(url)) return pending.get(url).then(r=>r.clone());

    try{
      const raw=sessionStorage.getItem(key(url));
      if(raw){
        const cached=JSON.parse(raw);
        if(cached&&Date.now()-cached.time<TTL){
          return Promise.resolve(new Response(cached.body,{status:200,headers:{'Content-Type':'application/json','X-NatureTours-Cache':'session'}}));
        }
        sessionStorage.removeItem(key(url));
      }
    }catch(_){ }

    const request=originalFetch(input,init).then(async response=>{
      if(response.ok){
        try{
          const body=await response.clone().text();
          sessionStorage.setItem(key(url),JSON.stringify({time:Date.now(),body}));
        }catch(_){ }
      }
      return response;
    }).finally(()=>pending.delete(url));
    pending.set(url,request);
    return request.then(r=>r.clone());
  };
})();

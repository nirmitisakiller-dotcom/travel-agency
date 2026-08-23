// Prevent recursive timeline refreshes when syncing the cart with its planner.
// The guard only suppresses a nested natureToursTripTimelineUpdated dispatch.
(function(){
    if(window.__naturePlanCartDispatchGuard)return;
    const originalDispatch=document.dispatchEvent.bind(document);
    let dispatchingTimeline=false;
    document.dispatchEvent=function(event){
        if(event && event.type==="natureToursTripTimelineUpdated"){
            if(dispatchingTimeline)return true;
            dispatchingTimeline=true;
            try{return originalDispatch(event)}finally{dispatchingTimeline=false}
        }
        return originalDispatch(event);
    };
    window.__naturePlanCartDispatchGuard=true;
})();

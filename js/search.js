// js/search.js

document.addEventListener("DOMContentLoaded", () => {

    const form = document.getElementById("header-search-form");
    const input = document.getElementById("search-input");

    if (!form || !input) return;

    // List of Indian states and major cities
    const indianPlaces = [
        "andhra pradesh","arunachal pradesh","assam","bihar","chhattisgarh",
        "goa","gujarat","haryana","himachal pradesh","jharkhand","karnataka",
        "kerala","madhya pradesh","maharashtra","manipur","meghalaya","mizoram",
        "nagaland","odisha","punjab","rajasthan","sikkim","tamil nadu",
        "telangana","tripura","uttar pradesh","uttarakhand","west bengal",
        "delhi","mumbai","pune","nashik","jalgaon","nagpur","surat","ahmedabad",
        "jaipur","udaipur","jodhpur","shimla","manali","leh","ladakh","srinagar",
        "amritsar","chandigarh","dehradun","rishikesh","haridwar","agra",
        "varanasi","lucknow","patna","kolkata","gangtok","darjeeling",
        "bhubaneswar","visakhapatnam","hyderabad","bengaluru","mysore","coorg",
        "ooty","madurai","chennai","kochi","munnar","alleppey","kovalam",
        "goa","hampi","spiti","chitkul"
    ];

    form.addEventListener("submit", function (e) {

        e.preventDefault();

        const destination = input.value.trim();

        if (destination === "") {
            alert("Please enter a destination.");
            return;
        }

        const query = destination.toLowerCase();

        if (indianPlaces.includes(query)) {

            window.location.href =
                "domestic.html?q=" +
                encodeURIComponent(destination);

        } else {

            window.location.href =
                "international.html?q=" +
                encodeURIComponent(destination);

        }

    });

});

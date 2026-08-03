 import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

serve(async (req) => {
  try {
    const url = new URL(req.url);
    const query = url.searchParams.get("q");

    if (!query) {
      return new Response(
        JSON.stringify({
          error: "Missing destination."
        }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json"
          }
        }
      );
    }

    // ----------------------------------
    // REST Countries
    // ----------------------------------

    const countryResponse = await fetch(
      `https://restcountries.com/v3.1/name/${encodeURIComponent(query)}?fullText=false`
    );

    if (!countryResponse.ok) {
      return new Response(
        JSON.stringify({
          error: "Destination not found."
        }),
        {
          status: 404,
          headers: {
            "Content-Type": "application/json"
          }
        }
      );
    }

    const countries = await countryResponse.json();

    const country = countries[0];

    // ----------------------------------
    // Wikipedia Summary
    // ----------------------------------

    let summary = "";

    try {

      const wikiResponse = await fetch(
        `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(country.name.common)}`
      );

      if (wikiResponse.ok) {

        const wiki = await wikiResponse.json();

        summary = wiki.extract || "";

      }

    } catch (_) {}

    // ----------------------------------
    // Build destination object
    // ----------------------------------

    const destination = {

      id: country.cca2.toLowerCase(),

      name: country.name.common,

      country: country.name.common,

      continent:
        country.continents?.[0] || "",

      region:
        country.region || "",

      description:
        summary,

      latitude:
        country.latlng?.[0] || null,

      longitude:
        country.latlng?.[1] || null,

      population:
        country.population || 0,

      currency:
        Object.keys(country.currencies || {})[0] || "",

      flag:
        country.flags?.png || "",

      image: "",

      raw: country

    };

    return new Response(

      JSON.stringify(destination),

      {

        headers: {

          "Content-Type":
            "application/json"

        }

      }

    );

  } catch (error) {

    return new Response(

      JSON.stringify({

        error: error.message

      }),

      {

        status: 500,

        headers: {

          "Content-Type":
            "application/json"

        }

      }

    );

  }

});

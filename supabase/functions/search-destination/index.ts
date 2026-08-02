import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

serve(async (req) => {
  try {
    const url = new URL(req.url);
    const query = url.searchParams.get("q");

    if (!query) {
      return new Response(
        JSON.stringify({
          error: "Missing search query."
        }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json"
          }
        }
      );
    }

    const response = await fetch(
      `https://restcountries.com/v3.1/name/${encodeURIComponent(query)}?fullText=false`
    );

    if (!response.ok) {
      return new Response(
        JSON.stringify({
          found: false
        }),
        {
          status: 404,
          headers: {
            "Content-Type": "application/json"
          }
        }
      );
    }

    const countries = await response.json();

    return new Response(
      JSON.stringify({
        found: true,
        results: countries
      }),
      {
        headers: {
          "Content-Type": "application/json"
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
          "Content-Type": "application/json"
        }
      }
    );

  }
});

// src/api/wiki.js

// Performs a full Wikipedia search → then fetches summary of top result
export async function getWikipediaSummary(query) {
  if (!query) return null;

  try {
    // 1. SEARCH WIKIPEDIA FOR BEST MATCH
    const searchURL =
      `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(
        query
      )}&format=json&origin=*`;

    const searchRes = await fetch(searchURL);
    if (!searchRes.ok) return null;

    const searchData = await searchRes.json();

    const first = searchData?.query?.search?.[0];
    if (!first) return null;

    const pageTitle = first.title;

    // 2. FETCH SUMMARY BY PAGE TITLE
    const summaryURL =
      `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(
        pageTitle
      )}`;

    const summaryRes = await fetch(summaryURL);
    if (!summaryRes.ok) return null;

    const summary = await summaryRes.json();

    return {
      title: summary.title,
      extract: summary.extract,
      thumbnail: summary.thumbnail?.source || null,
      url: summary.content_urls?.desktop?.page || null,
    };
  } catch (err) {
    console.error("Wikipedia search failed:", err);
    return null;
  }
}

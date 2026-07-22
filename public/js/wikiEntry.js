function getEntryIdFromUrl() {
    const params = new URLSearchParams(window.location.search);
    return parseInt(params.get("id"));
}
  
function renderWikiEntry() {
    const entryId = getEntryIdFromUrl();
    const entry = wikiEntries.find(e => e.id === entryId);
  
    if (!entry) {
      document.querySelector(".wiki-entry-container").innerHTML = "<p>Entry not found.</p>";
      return;
    }
  
    document.getElementById("entryType").textContent = entry.type;
    document.getElementById("entryName").textContent = entry.name;
    document.getElementById("entrySummary").textContent = entry.summary;
    document.getElementById("entryContent").textContent = entry.content;
}
  
renderWikiEntry();
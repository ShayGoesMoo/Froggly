function createWikiCard(entry) {
    const card = document.createElement("div");
    card.className = "wiki-card";
  
    card.innerHTML = `
      <p class="wiki-card-type">${entry.type}</p>
      <p class="wiki-card-name">${entry.name}</p>
      <p class="wiki-card-summary">${entry.summary}</p>
    `;
  
    card.addEventListener("click", () => {
      window.location.href = `viewWiki.html?id=${entry.id}`;
    });
  
    return card;
}
  
function renderWikiGrid(entries) {
    const gridEl = document.getElementById("wikiGrid");
    gridEl.innerHTML = "";
  
    entries.forEach(entry => {
      const card = createWikiCard(entry);
      gridEl.appendChild(card);
    });
}
  
renderWikiGrid(wikiEntries);
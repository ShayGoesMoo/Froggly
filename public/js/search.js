function filterPosts(query) {
    const lowerQuery = query.toLowerCase().trim();
  
    if (lowerQuery === "") {
      return posts;
    }
  
    return posts.filter(post => {
      const captionMatch = post.caption.toLowerCase().includes(lowerQuery);
      const uploaderMatch = post.uploader.toLowerCase().includes(lowerQuery);
      const tagMatch = post.tag.toLowerCase().includes(lowerQuery);
      const mediaTypeMatch = post.mediaType.toLowerCase().includes(lowerQuery);
      return captionMatch || uploaderMatch || tagMatch || mediaTypeMatch;
    });
}
  
function handleSearchInput(event) {
    const query = event.target.value;
    const filtered = filterPosts(query);
    renderTimeline(filtered);
}
  
const searchInput = document.getElementById("searchInput");
searchInput.addEventListener("input", handleSearchInput);

/* filterPosts takes a query string and returns matching posts, kept separate from the event handler so it can be reused later regardless of how search gets triggered */
/* .toLowerCase().trim() on the query normalizes casing and stray spaces, so "Sam" and "sam " match the same way */
/* empty query check returns all posts when the search bar is cleared, instead of returning zero results */
/* .includes() allows partial matching, so typing "sa" can still match "Sam" without needing the full word */
/* captionMatch || uploaderMatch means a post shows up if the query matches either field */
/* filterPosts always searches the full posts array, not whatever's currently rendered, so filtering stays accurate even after searching multiple times in a row */
/* addEventListener("input", ...) fires on every keystroke for live filtering; this is the part flagged to replace later with a submit or debounce-based search */
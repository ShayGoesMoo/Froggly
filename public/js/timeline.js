function createPostCard(post) {
    const card = document.createElement("div");
    card.className = "post-card";
    card.dataset.postId = post.id;

    const img = document.createElement("img");
    img.src = post.imageUrl;
    img.alt = post.caption;

    const info = document.createElement("div");
    info.className = "post-info";
    info.innerHTML = `
        <p class="post-caption"><b>${post.uploader}</b>: ${truncateCaption(post.caption)}</p>
        <p class="post-meta">${formatTimestamp(post.timestamp)} · ${post.tag} · [ ${post.mediaType} ]</p>
    `;

    card.appendChild(img);
    card.appendChild(info);

    card.addEventListener("click", () => openViewPost(post));
    
    return card;
}

function formatTimestamp(isoString) {
    const date = new Date(isoString);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function renderTimeline(postsToRender) {
    const timelineEl = document.getElementById("timeline");
    timelineEl.innerHTML = "";

    if (postsToRender.length === 0) {
        timelineEl.innerHTML = `<p class="empty-state">No posts yet.</p>`;
        return;
    }

    postsToRender.forEach(post => {
        const card = createPostCard(post);
        timelineEl.appendChild(card);
    });
}

function truncateCaption(caption) {
    const words = caption.trim().split(/\s+/);
  
    if (words.length > 8 || caption.length > 40) {
      const truncated = words.slice(0, 8).join(" ");
      return truncated.length > 40 
        ? truncated.slice(0, 40).trim() + "..." 
        : truncated + "...";
    }
  
    return caption;
}

renderTimeline(posts);

/* createPostCard builds one post's DOM element (image + info), returns it so renderFeed can insert it */
/* card.dataset.postId stores the post's id directly on the element, so later features (like delete/edit) can grab the right post without searching */
/* formatTimestamp converts the raw ISO string into a readable date, kept separate so this is the only place to change if display format changes later */
/* renderFeed takes posts as a parameter instead of using the global array directly, so search.js can pass in a filtered list and reuse this same function */
/* feedEl.innerHTML = "" clears old cards before re-rendering, otherwise posts would just keep stacking on top of each other on every re-render */
/* empty state check shows a message when postsToRender is empty, instead of just rendering nothing with no explanation */
/* renderFeed(posts) at the bottom is what actually draws the feed on page load, using the full array from data.js */
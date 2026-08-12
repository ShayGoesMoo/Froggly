async function loadTimeline() {
    const { data: posts, error } = await supabaseClient
        .from("posts")
        .select("id, media_url, media_type, thumbnail_url, title, caption, created_at, users!posts_user_id_fkey(username, avatar_url)")
        .order("created_at", { ascending: false });

    if (error) {
        console.error("Failed to load timeline:", error.message, error);
        return;
    }

    // fetch view counts for all these posts in one go
    const postIds = posts.map(p => p.id);
    const { data: viewRows, error: viewsError } = await supabaseClient
        .from("post_views")
        .select("post_id")
        .in("post_id", postIds);

    const viewCounts = {};
    if (!viewsError) {
        viewRows.forEach(row => {
            viewCounts[row.post_id] = (viewCounts[row.post_id] || 0) + 1;
        });
    }

    const timeline = document.querySelector(".timeline");
    timeline.innerHTML = "";

    posts.forEach((post) => {
        const item = document.createElement("a");
        item.href = `post.html?id=${post.id}`;
        item.className = "timeline-item";

        const mediaHTML = post.media_type === "video"
            ? `<img src="${post.thumbnail_url || post.media_url}" alt="">`
            : `<img src="${post.media_url}" alt="">`;

        const avatarSrc = post.users.avatar_url || "../assets/default profile picture.png";
        const viewsText = formatViews(viewCounts[post.id] || 0);
        const uploadedText = formatUploaded(post.created_at);

        item.innerHTML = `
            <div class="thumbnail">
                ${mediaHTML}
                <span class="media-type">${post.media_type}</span>
            </div>
            <div class="item-info">
                <div class="item-text">
                    <span class="item-title">${post.title || ""}</span>
                    <span class="item-caption">${post.caption}</span>
                    <span class="item-meta"><b>${post.users.username}</b> posted a/an <b>${post.media_type}</b> ${uploadedText}</span>
                </div>
            </div>
        `;

        item.addEventListener("click", () => {
            sessionStorage.setItem("timelineScroll", window.scrollY);
        });

        timeline.appendChild(item);
    });
}

function formatViews(count) {
    if (count >= 1_000_000) return (count / 1_000_000).toFixed(1).replace(/\.0$/, "") + "M views";
    if (count >= 1_000) return (count / 1_000).toFixed(1).replace(/\.0$/, "") + "K views";
    return count + " views";
}

function formatUploaded(dateStr) {
    const date = new Date(dateStr);
    const diffMs = Date.now() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    if (diffDays < 1) return "today";
    if (diffDays < 7) return `${diffDays} day${diffDays === 1 ? "" : "s"} ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} week${Math.floor(diffDays / 7) === 1 ? "" : "s"} ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} month${Math.floor(diffDays / 30) === 1 ? "" : "s"} ago`;
    return `${Math.floor(diffDays / 365)} year${Math.floor(diffDays / 365) === 1 ? "" : "s"} ago`;
}

loadTimeline();
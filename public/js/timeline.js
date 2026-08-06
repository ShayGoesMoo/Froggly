async function loadTimeline() {
    const { data: posts, error } = await supabaseClient
        .from("posts")
        .select("id, media_url, media_type, users(username)")
        .order("created_at", { ascending: false });

    if (error) {
        console.error("Failed to load timeline:", error);
        return;
    }

    const timeline = document.querySelector(".timeline");
    timeline.innerHTML = ""; // clear the static placeholder before appending real posts

    posts.forEach((post) => {
        const item = document.createElement("a");
        item.href = `post.html?id=${post.id}`;
        item.className = "timeline-item";

        const mediaHTML = post.media_type === "video"
    ? `<img src="${post.thumbnail_url || post.media_url}" alt="">`
    : `<img src="${post.media_url}" alt="">`;

        item.innerHTML = `
            <div class="thumbnail">
                ${mediaHTML}
                <span class="media-type">${post.media_type}</span>
            </div>
            <div class="item-info">
                <span class="username">${post.users.username}</span>
                <span class="type-label">${post.media_type}</span>
            </div>
        `;

        item.addEventListener("click", () => {
            sessionStorage.setItem("timelineScroll", window.scrollY);
        });

        timeline.appendChild(item);
    });
}

loadTimeline();

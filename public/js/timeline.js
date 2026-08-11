async function loadTimeline() {
    const { data: posts, error } = await supabaseClient
        .from("posts")
        .select("id, media_url, media_type, thumbnail_url, title, caption, users(username, avatar_url)")
        .order("created_at", { ascending: false });

    if (error) {
        console.error("Failed to load timeline:", error);
        return;
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

        item.innerHTML = `
            <div class="thumbnail">
                ${mediaHTML}
                <span class="media-type">${post.media_type}</span>
            </div>
            <div class="item-info">
                <img class="item-avatar" src="${avatarSrc}" alt="">
                <div class="item-text">
                    <span class="username">${post.users.username}</span>
                    <span class="caption">${post.title || post.caption || ""}</span>
                </div>
            </div>
        `;

        item.addEventListener("click", () => {
            sessionStorage.setItem("timelineScroll", window.scrollY);
        });

        timeline.appendChild(item);
    });
}

loadTimeline();
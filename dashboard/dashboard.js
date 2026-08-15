const params = new URLSearchParams(window.location.search);
const postId = params.get("id");

async function loadDashboard() {
    const timeline = document.querySelector(".timeline");

    // load state
    timeline.innerHTML = `
        <div class="loading-spinner">
            <div class="spinner"></div>
            Getting everything ready...
        </div>
    `;

    // using supabase
    const { data: { session } } = await supabaseClient.auth.getSession();
    const currentUserId = session?.user?.id || null;

    // fetch data
    const { data: posts, error } = await supabaseClient
        .from("posts")
        .select("id, user_id, media_url, thumbnail_url, title, caption, created_at, edited_at, visibility, users!posts_user_id_fkey(username, avatar_url)")
        .not("visibility", "in", "(archived,private)")
        .order("created_at", { ascending: false });

    if (error) {
        console.error("Failed to load dashboard:", error.message, error);
        timeline.innerHTML = `
            <div class="empty-state">
                <div class="empty-title">Something went wrong</div>
                <div class="empty-subtext">Try refreshing the page</div>
            </div>
        `;
        return;
    }

    // fallback if there are no posts
    if (posts.length === 0) {
        timeline.innerHTML = `
            <div class="empty-state">
                <svg viewBox="0 0 24 24" width="40" height="40" fill="none" stroke="currentColor" stroke-width="1.5">
                    <path d="M4 4h16v16H4z"/>
                    <path d="M4 15l4-4 4 4 6-6"/>
                </svg>
                <div class="empty-title">Posts? Nope. Nothing to see here.</div>
                <div class="empty-subtext">Be the first to share something!</div>
            </div>
        `;
        return;
    }

    // user dataset
    const postIds = posts.map(p => p.id);
    const { data: viewRows, error: viewsError } = await supabaseClient
        .from("post_views")
        .select("post_id")
        .in("post_id", postIds);

    // one view per user 
    const viewCounts = {};
    if (!viewsError) {
        viewRows.forEach(row => {
            viewCounts[row.post_id] = (viewCounts[row.post_id] || 0) + 1;
        });
    }

    timeline.innerHTML = "";

    posts.forEach((post) => {
        const item = document.createElement("div");
        item.className = "timeline-item"
        item.style.cursor = "pointer";
        let mediaHTML;
        mediaHTML = `<img src="${post.media_url}" alt="">`;
        
        const avatarSrc = post.users.avatar_url || "../assets/default profile picture.png";
        const viewsText = formatViews(viewCounts[post.id] || 0);
        const uploadedText = formatUploaded(post.created_at);
        const isOwner = currentUserId && currentUserId === post.user_id;
        const editedText = post.edited_at ? " (edited)" : "";
        mediaHTML = `<img src="${post.media_url}" alt="">`;

        item.innerHTML = `
            <div class="item-info">
                <div class="item-header">
                    <img class="item-avatar" src="${avatarSrc}" alt="">
                    <div class="item-header-text">
                        <span class="item-username">${post.users.username}</span>
                        <span class="item-date">Published this ${uploadedText}${editedText}</span>
                    </div>
                    ${!isOwner ? `<button type="button" class="item-follow" data-user-id="${post.user_id}">Follow</button>` : ""}
                    <button type="button" class="item-more" data-post-id="${post.id}">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">
                            <path fill="currentColor" d="M3 9.5a1.5 1.5 0 1 1 0-3a1.5 1.5 0 0 1 0 3m5 0a1.5 1.5 0 1 1 0-3a1.5 1.5 0 0 1 0 3m5 0a1.5 1.5 0 1 1 0-3a1.5 1.5 0 0 1 0 3"/>
                        </svg>
                    </button>
                </div>

                <div class="item-body">
                    <p class="item-caption">
                        ${post.caption || ""}
                    </p>
                </div>
                ${post.media_url ? `<img class="item-media" src="${post.media_url}" alt="">` : ""}

                <div class="item-actions" aria-label="Like">
                    <button class="interaction" id="like-btn" data-post-id="${post.id}">
                        <svg class="like-icon" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24">
                            <path fill="hidden" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2 9.5a5.5 5.5 0 0 1 9.591-3.676a.56.56 0 0 0 .818 0A5.49 5.49 0 0 1 22 9.5c0 2.29-1.5 4-3 5.5l-5.492 5.313a2 2 0 0 1-3 .019L5 15c-1.5-1.5-3-3.2-3-5.5"/>
                        </svg>
                        <span class="like-count">0</span>
                    </button>
                    <button class="interaction" id="comment-btn" aria-label="Comment" data-post-id="${post.id}">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24">
                            <path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 21a9 9 0 1 0-9-9c0 1.488.36 2.891 1 4.127L3 21l4.873-1c1.236.64 2.64 1 4.127 1"/>
                        </svg>
                        <span class="comment-count">0</span>
                    </button>
                    <button class="interaction" id="views-btn" aria-label="Views">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24">
                            <path fill="currentColor" d="M8.143 15.857H5.57V9.43h2.572v6.428zm5.143 0h-2.572V3h2.572zm5.142 0h-2.571v-9h2.571z"/>
                            <path fill="currentColor" fill-rule="evenodd" d="M21 20.714H3v-2h18z" clip-rule="evenodd"/>
                        </svg>
                        <span class="view-count">0</span>
                    </button>
                    <button class="interaction" id="share-btn" aria-label="Share" data-post-id="${post.id}">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24">
                            <path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 2v13m4-9l-4-4l-4 4m-4 6v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/>
                        </svg>
                    </button>
                </div>
            </div>
        `;

        timeline.appendChild(item);
        likeFormat(post.id, post.user_id, item);
    })
}

// like format
async function likeFormat(postId, postOwnerId, cardElement) {
    const likeBtn = cardElement.querySelector("#like-btn");
    const likeIcon = cardElement.querySelector(".like-icon");
    const likeCount = cardElement.querySelector(".like-count");

    if (!likeBtn || !postId) return;

    const { count } = await supabaseClient
        .from("post_likes")
        .select("*", { count: "exact", head: true })
        .eq("post_id", postId);
    likeCount.textContent = count ?? 0;

    const { data: { session } } = await supabaseClient.auth.getSession();

    if (!session) {
        likeBtn.addEventListener("click", () => {
            alert("You need to be logged in to like posts.");
        });
        return;
    }

    const { data: existingLike } = await supabaseClient
        .from("post_likes")
        .select("post_id")
        .eq("post_id", postId)
        .eq("user_id", session.user.id)
        .maybeSingle();

    let isLiked = !!existingLike;
    if (isLiked) likeBtn.classList.add("liked");

    likeBtn.addEventListener("click", async () => {
        likeBtn.disabled = true;

        if (isLiked) {
            const { error } = await supabaseClient
                .from("post_likes")
                .delete()
                .eq("post_id", postId)
                .eq("user_id", session.user.id);

            if (error) {
                alert("Failed to unlike: " + error.message);
                likeBtn.disabled = false;
                return;
            }

            // x - 1 = count
            isLiked = false;
            likeBtn.classList.remove("liked");
            likeCount.textContent = Math.max(0, parseInt(likeCount.textContent) - 1);
        } else {
            const { error } = await supabaseClient
                .from("post_likes")
                .insert([{ post_id: postId, user_id: session.user.id }]);

            if (error) {
                alert("Failed to like: " + error.message);
                likeBtn.disabled = false;
                return;
            }

            // x + 1 = count
            isLiked = true;
            likeBtn.classList.add("liked");
            likeCount.textContent = parseInt(likeCount.textContent) + 1;

            if (postOwnerId && postOwnerId !== session.user.id) {
                await supabaseClient.from("notifications").insert([
                    {
                        recipient_id: postOwnerId,
                        actor_id: session.user.id,
                        type: "like",
                        post_id: postId,
                    },
                ]);
            }
        }

        likeBtn.disabled = false;
    });
}

// views format
function formatViews(count) {
    if (count >= 1_000_000) return (count / 1_000_000).toFixed(1).replace(/\.0$/, "") + "M views";
    if (count >= 1_000) return (count / 1_000).toFixed(1).replace(/\.0$/, "") + "K views";
    return count + " views";
}

// date format
function formatUploaded(dateStr) {
    const date = new Date(dateStr);
    const diffMs = Date.now() - date.getTime();
    const diffSeconds = Math.floor(diffMs / 1000);
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffSeconds < 60) return "just now";
    if (diffMinutes < 60) return `${diffMinutes} minute${diffMinutes === 1 ? "" : "s"} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours === 1 ? "" : "s"} ago`;
    if (diffHours < 48) return "yesterday";
    if (diffDays < 7) return `${diffDays} day${diffDays === 1 ? "" : "s"} ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} week${Math.floor(diffDays / 7) === 1 ? "" : "s"} ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} month${Math.floor(diffDays / 30) === 1 ? "" : "s"} ago`;
    return `${Math.floor(diffDays / 365)} year${Math.floor(diffDays / 365) === 1 ? "" : "s"} ago`;
}

loadDashboard();
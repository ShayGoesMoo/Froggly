const params = new URLSearchParams(window.location.search);
const postId = params.get("id");

async function loadPost() {
    if (!postId) {
        console.error("No post id in URL");
        return;
    }

    const { data: post, error } = await supabaseClient
        .from("posts")
        .select("id, title, media_url, caption, media_type, thumbnail_url, created_at, users!posts_user_id_fkey(display_name, username, avatar_url)")
        .eq("id", postId)
        .single();

    if (error || !post) {
        console.error("Failed to load post:", error);
        return;
    }

    document.getElementById("post-view").style.visibility = "visible"; // reveal only once we know what to show

    if (post.media_type === "text") {
        loadTextPost(post);
        return;
    }

    if (post.media_type === "image" || post.media_type === "gif") {
        loadImagePost(post);
        return;
    }

    const mediaContainer = document.querySelector(".post-media");
    const existingImg = document.getElementById("post-image");
    const fullscreenBtn = document.getElementById("fullscreen-btn");

    if (post.media_type === "video") {
        document.querySelector(".post-view").classList.add("video-post-layout");

        existingImg.remove();

        const video = document.createElement("video");
        video.id = "post-image";
        video.src = post.media_url;
        video.playsInline = true;
        video.preload = "metadata";
        video.autoplay = true;

        mediaContainer.insertBefore(video, mediaContainer.firstChild);

        document.getElementById("video-title-overlay").style.display = "block";
        document.getElementById("video-title-overlay").textContent = post.title ?? "";
        document.getElementById("video-controls").style.display = "block";
        fullscreenBtn.style.display = "flex";

        setupCustomControls(video);

        const avatarSrc = post.users.avatar_url || "../assets/default profile picture.png";
        const uploadedText = formatUploaded(post.created_at);

        // fetch the view count before building the details HTML
        const { count: viewCount } = await supabaseClient
            .from("post_views")
            .select("*", { count: "exact", head: true })
            .eq("post_id", postId);

        document.querySelector(".post-details").innerHTML = `
            <div class="video-post-details">
                <div class="video-post-title">${post.title ?? ""}</div>
                <div class="video-post-header">
                    <img class="video-post-avatar" src="${avatarSrc}" alt="">
                    <div class="video-post-header-text">
                        <span class="video-post-username">${post.users.username}</span>
                        <span class="video-post-meta">${viewCount ?? 0} views &middot; ${uploadedText}</span>
                    </div>
                </div>
                ${post.caption ? `<div class="video-post-caption">${post.caption}</div>` : ""}
            </div>
        `;
    }

    recordView(postId);
    loadComments();
    loadRecommended();
}

async function recordView(postId) {
    const { data: { session } } = await supabaseClient.auth.getSession();
    if (!session) return;

    const { data: existing } = await supabaseClient
        .from("post_views")
        .select("post_id")
        .eq("post_id", postId)
        .eq("user_id", session.user.id)
        .maybeSingle();

    if (existing) return; // already viewed, nothing to do

    const { error } = await supabaseClient
        .from("post_views")
        .insert([{ post_id: postId, user_id: session.user.id }]);

    if (error) {
        console.error("Failed to record view:", error);
    }
}

async function loadViewCount(postId) {
    const { count, error } = await supabaseClient
        .from("post_views")
        .select("*", { count: "exact", head: true })
        .eq("post_id", postId);

    if (error) {
        console.error("Failed to load view count:", error);
        return;
    }

    const viewsEl = document.querySelector(".uploader-info .media-type"); // or wherever you want to display it
    // adjust the selector/target based on where you actually want views shown on post.html
}

loadPost();

async function loadComments() {
    const { data: comments, error } = await supabaseClient
        .from("comments")
        .select("id, comment_text, users!comments_user_id_fkey(username)")
        .eq("post_id", postId)
        .order("created_at", { ascending: true });

    if (error) {
        console.error("Failed to load comments:", error);
        return;
    }

    const commentList = document.getElementById("comment-list");
    commentList.innerHTML = "";

    // update the comment count wherever it's shown (tweet-card action bar, etc.)
    const countEl = document.getElementById("tweet-comment-count");
    if (countEl) countEl.textContent = comments.length;

    if (comments.length === 0) {
        commentList.innerHTML = `<p class="no-comments">It's kinda dry in here...</p>`;
        return;
    }

    comments.forEach((comment) => {
        const div = document.createElement("div");
        div.className = "comment";
        div.innerHTML = `
            <span class="comment-username">${comment.users.username}</span>
            <span class="comment-text">${comment.comment_text}</span>
        `;
        commentList.appendChild(div);
    });
}

async function loadRecommended() {
    const { data: posts, error } = await supabaseClient
        .from("posts")
        .select("id, title, media_url, caption, media_type, thumbnail_url, users!posts_user_id_fkey(username)")
        .eq("media_type", "video")
        .neq("id", postId)
        .order("created_at", { ascending: false })
        .limit(15);

    if (error) {
        console.error("Failed to load recommended posts:", error);
        return;
    }

    const panel = document.getElementById("recommended-panel");
    panel.innerHTML = "";

    posts.forEach((post) => {
        const item = document.createElement("a");
        item.href = `post.html?id=${post.id}`;
        item.className = "recommended-item";

        const thumbSrc = post.thumbnail_url || post.media_url;
        const title = truncateText(post.title ?? post.users.username, 60);
        const caption = truncateText(post.caption ?? "", 80);

        item.innerHTML = `
            <div class="recommended-thumb">
                <img src="${thumbSrc}" alt="">
            </div>
            <div class="recommended-info">
                <div class="rec-title">${title}</div>
                <div class="rec-caption">${caption}</div>
            </div>
        `;

        panel.appendChild(item);
    });
}

function loadTextPost(post) {
    const postView = document.querySelector(".post-view");
    postView.classList.add("text-post-layout");

    document.getElementById("post-media").style.display = "none";

    const recommendedPanel = document.getElementById("recommended-panel");
    if (recommendedPanel) recommendedPanel.style.display = "none";

    const avatarSrc = post.users.avatar_url || "../assets/default profile picture.png";
    const uploadedText = formatUploaded(post.created_at);

    const postDetails = document.querySelector(".post-details");
    postDetails.innerHTML = `
        <div class="tweet-card">
            <div class="tweet-header">
                <img class="tweet-avatar" src="${avatarSrc}" alt="">
                <div class="tweet-header-text">
                    <span class="tweet-username">${post.users.display_name}</span>
                    <span class="tweet-handle">@${post.users.username}</span>
                </div>
            </div>

            ${post.title ? `<div class="tweet-title">${post.title}</div>` : ""}
            <div class="tweet-content">${post.caption ?? ""}</div>

            <div class="tweet-meta">${uploadedText}</div>

            <div class="tweet-actions">
                <button type="button" class="tweet-action-btn" aria-label="Comment">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                    </svg>
                    <span id="tweet-comment-count">0</span>
                </button>

                <button type="button" class="tweet-action-btn" aria-label="Views">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                        <circle cx="12" cy="12" r="3"/>
                    </svg>
                    <span id="tweet-view-count">0</span>
                </button>
            </div>
        </div>
    `;

    recordView(postId);
    loadComments();
    loadTweetViewCount(postId);
}

async function loadTweetViewCount(postId) {
    const { count, error } = await supabaseClient
        .from("post_views")
        .select("*", { count: "exact", head: true })
        .eq("post_id", postId);

    if (!error) {
        const el = document.getElementById("tweet-view-count");
        if (el) el.textContent = count;
    }
}

function loadImagePost(post) {
    const postView = document.querySelector(".post-view");
    postView.classList.add("text-post-layout"); // reuse the same centered single-column layout

    document.getElementById("post-media").style.display = "none"; // hide the old dedicated media box — media now lives inside the card

    const recommendedPanel = document.getElementById("recommended-panel");
    if (recommendedPanel) recommendedPanel.style.display = "none";

    const avatarSrc = post.users.avatar_url || "../assets/default profile picture.png";
    const uploadedText = formatUploaded(post.created_at);

    const postDetails = document.querySelector(".post-details");
    postDetails.innerHTML = `
        <div class="tweet-card">
            <div class="tweet-header">
                <img class="tweet-avatar" src="${avatarSrc}" alt="">
                <div class="tweet-header-text">
                    <span class="tweet-username">${post.users.display_name}</span>
                    <span class="tweet-handle">@${post.users.username}</span>
                </div>
            </div>

            ${post.title ? `<div class="tweet-title">${post.title}</div>` : ""}
            ${post.caption ? `<div class="tweet-content">${post.caption}</div>` : ""}

            <div class="tweet-media">
                <img src="${post.media_url}" alt="">
            </div>

            <div class="tweet-meta">${uploadedText}</div>

            <div class="tweet-actions">
                <button type="button" class="tweet-action-btn" aria-label="Comment">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                    </svg>
                    <span id="tweet-comment-count">0</span>
                </button>

                <button type="button" class="tweet-action-btn" aria-label="Views">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                        <circle cx="12" cy="12" r="3"/>
                    </svg>
                    <span id="tweet-view-count">0</span>
                </button>
            </div>
        </div>
    `;

    recordView(postId);
    loadComments();
    loadTweetViewCount(postId);
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

function truncateText(text, maxLength) {
    if (!text) return "";
    return text.length > maxLength ? text.slice(0, maxLength).trim() + "…" : text;
}

document.getElementById("comment-form").addEventListener("submit", async (e) => {
    e.preventDefault();

    const input = e.target.querySelector("input[type='text']");
    const commentText = input.value.trim();

    if (!commentText) return;

    const { data: { session } } = await supabaseClient.auth.getSession();

    if (!session) {
        alert("You need to be logged in to comment.");
        return;
    }

    const { error } = await supabaseClient
        .from("comments")
        .insert([
            {
                post_id: postId,
                user_id: session.user.id,
                comment_text: commentText,
            },
        ]);

    if (error) {
        alert("Failed to post comment: " + error.message);
        return;
    }

    input.value = "";
    loadComments();
});

loadPost();
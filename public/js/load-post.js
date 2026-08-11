const params = new URLSearchParams(window.location.search);
const postId = params.get("id");

async function loadPost() {
    if (!postId) {
        console.error("No post id in URL");
        return;
    }

    const { data: post, error } = await supabaseClient
        .from("posts")
        .select("id, media_url, media_type, title, caption, thumbnail_url, users(username, avatar_url)")
        .eq("id", postId)
        .single();

    if (error || !post) {
        console.error("Failed to load post:", error);
        return;
    }

    // handle image vs video
    const mediaContainer = document.querySelector(".post-media");
    const existingImg = document.getElementById("post-image");

    if (post.media_type === "video") {
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

        setupCustomControls(video);
    } else {
        existingImg.src = post.media_url;
    }

    document.getElementById("post-title-display").textContent = post.title ?? "";
    document.querySelector(".uploader-info .username").textContent = post.users.username;
    document.querySelector(".uploader-info .media-type").textContent = "Published: " + post.media_type;
    document.querySelector(".post-caption p").textContent = post.caption ?? "";

    if (post.users.avatar_url) {
        document.querySelector(".uploader-avatar").src = post.users.avatar_url;
    }

    loadComments();
    loadRecommended();
}

async function loadComments() {
    const { data: comments, error } = await supabaseClient
        .from("comments")
        .select("id, comment_text, users(username)")
        .eq("post_id", postId)
        .order("created_at", { ascending: true });

    if (error) {
        console.error("Failed to load comments:", error);
        return;
    }

    const commentList = document.getElementById("comment-list");
    commentList.innerHTML = "";

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
        .select("id, title, media_url, caption, media_type, thumbnail_url, users(username)")
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

        item.innerHTML = `
            <div class="recommended-thumb">
                <img src="${thumbSrc}" alt="">
            </div>
            <div class="recommended-info">
                <span class="username">${post.title}</span>
                <span class="type-label">${post.caption || post.users.username}</span>
            </div>
        `;

        panel.appendChild(item);
    });
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
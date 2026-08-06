const params = new URLSearchParams(window.location.search);
const postId = params.get("id");

async function loadPost() {
    if (!postId) {
        console.error("No post id in URL");
        return;
    }

    const { data: post, error } = await supabaseClient
        .from("posts")
        .select("id, media_url, media_type, caption, users(username)")
        .eq("id", postId)
        .single();

    if (error || !post) {
        console.error("Failed to load post:", error);
        return;
    }

    const mediaContainer = document.querySelector(".post-media");
    const existingImg = document.getElementById("post-image");

    if (post.media_type === "video") {
        existingImg.remove();

        const video = document.createElement("video");
        video.id = "post-image";
        video.src = post.media_url;
        video.controls = true;
        video.playsInline = true; // prevents auto-fullscreen on mobile Safari
        video.preload = "metadata"; // loads just enough to show the first frame + duration, not the whole file

        mediaContainer.insertBefore(video, mediaContainer.firstChild);
    } else {
        existingImg.src = post.media_url;
    }
    
    document.querySelector(".uploader-info .username").textContent = post.users.username;
    document.querySelector(".uploader-info .media-type").textContent = post.media_type;
    document.querySelector(".post-caption p").textContent = post.caption ?? "";

    loadComments();
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

    const commentList = document.querySelector(".comment-list");
    commentList.innerHTML = "";

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

loadPost();

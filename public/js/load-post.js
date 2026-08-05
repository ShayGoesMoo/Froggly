// grab the id from the URL, e.g. post.html?id=abc123
const params = new URLSearchParams(window.location.search);
const postId = params.get("id");

async function loadPost() {
    if (!postId) {
        console.error("No post id in URL");
        return;
    }

    const { data: post, error } = await supabaseClient
        .from("posts")
        .select("*")
        .eq("id", postId)
        .single();

    if (error || !post) {
        console.error("Failed to load post:", error);
        return;
    }

    document.getElementById("post-image").src = post.media_url;
    document.querySelector(".uploader-info .username").textContent = post.username;
    document.querySelector(".uploader-info .media-type").textContent = post.media_type;
    document.querySelector(".post-caption p").textContent = post.caption;

    // then separately load comments for this post, similarly filtered by post_id
}

loadPost();

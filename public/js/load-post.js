const params = new URLSearchParams(window.location.search);
const postId = params.get("id");
const youtubeId = params.get("youtube");

async function loadPost() {
    if (youtubeId) {
        loadYouTubePost(youtubeId);
        return;
    }

    if (!postId) {
        console.error("No post id or youtube id in URL");
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

    const mediaContainer = document.querySelector(".post-media");
    const existingImg = document.getElementById("post-image");
    const youtubeContainer = document.getElementById("youtube-player-container");
    const fullscreenBtn = document.getElementById("fullscreen-btn");

    if (post.media_type === "youtube") {
        // Hide native image/video and custom controls entirely — YouTube requires
        // its own controls to remain visible and unmodified.
        existingImg.style.display = "none";
        document.getElementById("video-controls").style.display = "none";
        document.getElementById("video-title-overlay").style.display = "none";
        document.getElementById("replay-overlay").classList.remove("active");
        fullscreenBtn.style.display = "none"; // YouTube's player has its own fullscreen button

        youtubeContainer.style.display = "block";

        const videoId = extractYouTubeId(post.media_url);

        if (window.YT && window.YT.Player) {
            createYouTubePlayer(videoId);
        } else {
            // API script may not have loaded yet — wait for it
            window.onYouTubeIframeAPIReady = () => createYouTubePlayer(videoId);
        }
    } else if (post.media_type === "video") {
        existingImg.remove();
        youtubeContainer.style.display = "none";

        const video = document.createElement("video");
        video.id = "post-image";
        video.src = post.media_url;
        video.playsInline = true;
        video.preload = "metadata";
        video.autoplay = true;
        video.muted = true;

        mediaContainer.insertBefore(video, mediaContainer.firstChild);

        document.getElementById("video-title-overlay").style.display = "block";
        document.getElementById("video-title-overlay").textContent = post.title ?? "";
        document.getElementById("video-controls").style.display = "block";
        fullscreenBtn.style.display = "flex";

        setupCustomControls(video);
    } else {
        // image post
        youtubeContainer.style.display = "none";
        existingImg.style.display = "block";
        existingImg.src = post.media_url;
        fullscreenBtn.style.display = "flex";
    }

    document.getElementById("post-title-display").textContent = post.title ?? "";
    document.querySelector(".uploader-info .username").textContent = post.users.username;
    document.querySelector(".uploader-info .media-type").textContent = post.media_type;
    document.querySelector(".post-caption p").textContent = post.caption ?? "";

    if (post.users.avatar_url) {
        document.querySelector(".uploader-avatar").src = post.users.avatar_url;
    }

    loadComments();
    loadRecommended();
}

function loadYouTubePost(videoId) {
    const mediaContainer = document.querySelector(".post-media");
    const existingImg = document.getElementById("post-image");
    const youtubeContainer = document.getElementById("youtube-player-container");
    const fullscreenBtn = document.getElementById("fullscreen-btn");

    existingImg.style.display = "none";
    document.getElementById("video-controls").style.display = "none";
    document.getElementById("video-title-overlay").style.display = "none";
    document.getElementById("replay-overlay").classList.remove("active");
    fullscreenBtn.style.display = "none";

    youtubeContainer.style.display = "block";

    if (window.YT && window.YT.Player) {
        createYouTubePlayer(videoId);
    } else {
        window.onYouTubeIframeAPIReady = () => createYouTubePlayer(videoId);
    }

    // Try to restore stashed info from the search results page, if available
    const stashed = sessionStorage.getItem("watch:" + videoId);
    if (stashed) {
        try {
            const video = JSON.parse(stashed);
            document.getElementById("post-title-display").textContent = video.title || "";
            document.querySelector(".uploader-info .username").textContent = video.channel || "";
            document.querySelector(".uploader-info .media-type").textContent = "YouTube";
            document.querySelector(".post-caption p").textContent = "";
            if (video.channelAvatar) {
                document.querySelector(".uploader-avatar").src = video.channelAvatar;
            }
        } catch (e) {
            console.error("Failed to parse stashed video info:", e);
        }
    } else {
        document.getElementById("post-title-display").textContent = "";
        document.querySelector(".uploader-info .username").textContent = "";
        document.querySelector(".uploader-info .media-type").textContent = "YouTube";
    }

    // No comment section or recommended panel for YouTube videos — hide those areas
    document.querySelector(".comment-panel").style.display = "none";
    document.getElementById("recommended-panel").style.display = "none";
}

function createYouTubePlayer(videoId) {
    new YT.Player("youtube-player-container", {
        videoId: videoId,
        playerVars: {
            autoplay: 1,
            rel: 0,
            modestbranding: 1,
        },
        events: {
            onError: (event) => {
                console.error("YouTube player error, code:", event.data);
            },
        },
    });
}

loadPost();

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
/*
 * Uses YouTube's official IFrame Player API to embed a native player
 * (not just a plain <iframe src="...embed...">), so you get a JS-controllable
 * player object (onReady/onStateChange, play/pause/seek, etc.) if you want
 * to build custom controls later.
 *
 * Docs: https://developers.google.com/youtube/iframe_api_reference
 */

const params = new URLSearchParams(window.location.search);
const videoId = params.get("id");

const titleEl = document.getElementById("watch-title");
const viewsEl = document.getElementById("watch-views");
const uploadedEl = document.getElementById("watch-uploaded");
const channelAvatarEl = document.getElementById("watch-channel-avatar");
const channelNameEl = document.getElementById("watch-channel-name");

if (!videoId) {
    titleEl.textContent = "No video specified";
} else {
    // Try to restore the video info that was stashed on the results page
    // so we don't need an extra API call just to show the title/channel/views.
    const stashed = sessionStorage.getItem("watch:" + videoId);
    if (stashed) {
        try {
            const video = JSON.parse(stashed);
            titleEl.textContent = video.title;
            viewsEl.textContent = video.views || "";
            uploadedEl.textContent = video.uploaded || "";
            channelNameEl.textContent = video.channel || "";
            if (video.channelAvatar) channelAvatarEl.src = video.channelAvatar;
        } catch (e) {
            titleEl.textContent = "";
        }
    } else {
        // Direct link or page refresh with no stashed data — just show the player.
        titleEl.textContent = "";
        viewsEl.textContent = "";
        uploadedEl.textContent = "";
        channelNameEl.textContent = "";
    }
}

// Called automatically by the YouTube IFrame API script once it has loaded
function onYouTubeIframeAPIReady() {
    if (!videoId) return;

    new YT.Player("player", {
        videoId: videoId,
        playerVars: {
            autoplay: 1,
            rel: 0,          // don't show related videos from other channels at the end
            modestbranding: 1
        },
        events: {
            onReady: (event) => {
                // event.target is the player instance — use it for custom controls, e.g.:
                // event.target.pauseVideo(), event.target.seekTo(30), event.target.getCurrentTime()
            },
            onError: (event) => {
                console.error("YouTube player error, code:", event.data);
                titleEl.textContent = titleEl.textContent || "This video can't be played";
            }
        }
    });
}

const viewPostModal = document.getElementById("viewPostModal");
const closeviewPostBtn = document.getElementById("closeviewPostBtn");
const viewPostImage = document.getElementById("viewPostImage");
const viewPostCaption = document.getElementById("viewPostCaption");
const viewPostMeta = document.getElementById("viewPostMeta");

function openViewPost(post) {
    viewPostImage.src = post.imageUrl;
    viewPostImage.alt = post.caption;
    viewPostCaption.textContent = post.caption;
    viewPostMeta.textContent = `${post.uploader} · ${formatTimestamp(post.timestamp)}`;
    viewPostModal.classList.remove("hidden");
}

function closeViewPost() {
    viewPostModal.classList.add("hidden");
}

function closeModalOnOutsideClick(event) {
    if (viewPostModal.contains(event.target) && event.target !== closeViewPostBtn) {
      viewPostModal.classList.add("hidden");
    }
}

closeViewPostBtn.addEventListener("click", closeViewPost);
document.addEventListener("click", closeModalOnOutsideClick);

/* viewPostModal, closeviewPostBtn, viewPostImage, viewPostCaption, viewPostMeta grab the modal elements once, instead of querying the DOM every time they're needed */
/* openViewPost(post) fills the modal with that specific post's data and un-hides it; called from createPostCard's click listener in timeline.js, so every rendered card is automatically clickable */
/* closeViewPost just re-hides the modal; doesn't need to reset anything since openViewPost always overwrites the content fresh next time it's called */
/* formatTimestamp is reused from timeline.js rather than duplicated here, since it already exists as a shared function for exactly this purpose */
/* edit/delete buttons in the modal are placeholder only for now — no click behavior wired up, since "is this my post" can't be determined without accounts existing yet */
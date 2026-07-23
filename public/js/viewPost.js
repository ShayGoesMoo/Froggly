const viewPostModal = document.getElementById("viewPostModal");
const closeViewPostBtn = document.getElementById("closeViewPostBtn");
const viewPostImage = document.getElementById("viewPostImage");
const viewPostCaption = document.getElementById("viewPostCaption");
const viewPostUploader = document.getElementById("viewPostUploader");
const thumbnailStrip = document.getElementById("thumbnailStrip");
const prevPostBtn = document.getElementById("prevPostBtn");
const nextPostBtn = document.getElementById("nextPostBtn");

let currentPostIndex = 0;

function openViewPost(post) {
  currentPostIndex = posts.findIndex(p => p.id === post.id);
  renderCurrentPost();
  renderThumbnailStrip();
  viewPostModal.classList.remove("hidden");
}

function renderCurrentPost() {
  const post = posts[currentPostIndex];
  viewPostImage.src = post.imageUrl;
  viewPostImage.alt = post.caption;
  viewPostCaption.textContent = post.caption;
  viewPostUploader.textContent = post.uploader;
  highlightActiveThumbnail();
}

function renderThumbnailStrip() {
  thumbnailStrip.innerHTML = "";
  posts.forEach((post, index) => {
    const thumb = document.createElement("img");
    thumb.src = post.imageUrl;
    thumb.alt = post.caption;
    if (index === currentPostIndex) thumb.classList.add("active-thumb");
    thumb.addEventListener("click", () => {
      currentPostIndex = index;
      renderCurrentPost();
    });
    thumbnailStrip.appendChild(thumb);
  });
}

function highlightActiveThumbnail() {
  const thumbs = thumbnailStrip.querySelectorAll("img");
  thumbs.forEach((thumb, index) => {
    thumb.classList.toggle("active-thumb", index === currentPostIndex);
  });
}

function showPrevPost() {
  currentPostIndex = (currentPostIndex - 1 + posts.length) % posts.length;
  renderCurrentPost();
}

function showNextPost() {
  currentPostIndex = (currentPostIndex + 1) % posts.length;
  renderCurrentPost();
}

function closeViewPost() {
  viewPostModal.classList.add("hidden");
}

closeViewPostBtn.addEventListener("click", closeViewPost);
prevPostBtn.addEventListener("click", showPrevPost);
nextPostBtn.addEventListener("click", showNextPost);

const postOptionsBtn = document.getElementById("postOptionsBtn");
const postOptionsMenu = document.getElementById("postOptionsMenu");

function toggleOptionsMenu(event) {
  event.stopPropagation();
  postOptionsMenu.classList.toggle("hidden");
}

function closeOptionsMenuOnOutsideClick(event) {
  if (!postOptionsMenu.contains(event.target) && event.target !== postOptionsBtn) {
    postOptionsMenu.classList.add("hidden");
  }
}

postOptionsBtn.addEventListener("click", toggleOptionsMenu);
document.addEventListener("click", closeOptionsMenuOnOutsideClick);

/* postOptionsBtn/postOptionsMenu handle the three-dot dropdown holding edit/delete, reusing the same toggle + outside-click-closes pattern already used for the inbox dropdown in notifications.js */

/* viewPostModal and its child elements are grabbed once at the top, instead of querying the DOM repeatedly */
/* currentPostIndex tracks which post in the full posts array is currently being viewed, so prev/next/thumbnail clicks all update from one shared source of truth */
/* openViewPost(post) finds that post's index in the posts array (rather than just displaying the post object directly), specifically so prev/next navigation and the thumbnail strip can work relative to the full post list */
/* renderCurrentPost fills in the image, caption, and uploader for whatever post is at currentPostIndex, and re-highlights the matching thumbnail */
/* renderThumbnailStrip rebuilds the entire thumbnail row from the posts array each time the modal opens; each thumbnail's click just updates currentPostIndex and re-renders, reusing renderCurrentPost instead of duplicating logic */
/* showPrevPost/showNextPost use modulo (% posts.length) so navigation wraps around at both ends instead of erroring past the array bounds */
/* edit/delete buttons remain placeholder only, no click behavior wired up yet */
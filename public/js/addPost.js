const addPostModal = document.getElementById("addPostModal");
const addPostBtn = document.getElementById("addPostBtn");
const closeModalBtn = document.getElementById("closeModalBtn");
const addPostForm = document.getElementById("addPostForm");

function openModal() {
    addPostModal.classList.remove("hidden");
}

function closeModal() {
    addPostModal.classList.add("hidden");
    addPostForm.reset();
}

function handleAddPost(event) {
    event.preventDefault();

    const newPost = {
        id: posts.length + 1,
        imageUrl: document.getElementById("imageUrlInput").value,
        tag: document.getElementById("tagInput").value,
        caption: document.getElementById("captionInput").value,
        mediaType: document.getElementById("mediaTypeInput").value,
        uploader: document.getElementById("uploaderInput").value,
        timestamp: new Date().toISOString()
    };

    posts.unshift(newPost);
    renderTimeline(posts);
    closeModal();
}

function closeModalOnOutsideClick(event) {
    if (addPostModal.contains(event.target) && event.target !== closeModalBtn) {
      addPostModal.classList.add("hidden");
    }
}

addPostBtn.addEventListener("click", openModal);
closeModalBtn.addEventListener("click", closeModal);
addPostForm.addEventListener("submit", handleAddPost);
document.addEventListener("click", closeModalOnOutsideClick);

/* addPostModal, addPostBtn, closeModalBtn, addPostForm grab the modal elements once and store them, instead of querying the DOM every time they're needed */
/* openModal removes the "hidden" class to show the modal, closeModal adds it back and resets the form so old input doesn't linger next time it opens */
/* handleAddPost runs on form submit; event.preventDefault() stops the browser's default behavior of reloading the page, which would wipe the in-memory posts array */
/* newPost's id uses posts.length + 1 as a quick unique id for phase 1 — this breaks if a post is ever deleted, and gets replaced entirely once Supabase auto-generates ids in phase 1.5 */
/* posts.unshift(newPost) adds the new post to the front of the array so it shows up first, like a real feed; .push() would add it to the end instead */
/* renderFeed(posts) re-renders the whole feed right after adding, so the new post appears immediately without needing a page refresh */
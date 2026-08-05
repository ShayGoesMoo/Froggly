const fullscreenBtn = document.getElementById("fullscreen-btn");
const lightbox = document.getElementById("lightbox");
const lightboxImage = document.getElementById("lightbox-image");
const lightboxClose = document.getElementById("lightbox-close");
const postImage = document.getElementById("post-image");

fullscreenBtn.addEventListener("click", () => {
    lightboxImage.src = postImage.src;
    lightbox.classList.add("active");
});

lightboxClose.addEventListener("click", () => {
    lightbox.classList.remove("active");
});

// close when clicking the dark background (not the image itself)
lightbox.addEventListener("click", (e) => {
    if (e.target === lightbox) {
        lightbox.classList.remove("active");
    }
});

// close on Escape key
document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && lightbox.classList.contains("active")) {
        lightbox.classList.remove("active");
    }
});

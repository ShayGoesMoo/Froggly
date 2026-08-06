const uploadPanel = document.getElementById("upload-panel");
const mediaInput = document.getElementById("media-input");
const uploadPlaceholder = document.getElementById("upload-placeholder");
const previewWrapper = document.getElementById("preview-wrapper");
const previewImage = document.getElementById("preview-image");
const previewVideo = document.getElementById("preview-video");
const changeMediaBtn = document.getElementById("change-media-btn");
const mediaTypeDisplay = document.getElementById("media-type-display");

let selectedFile = null;
let detectedMediaType = null;

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB, adjust as you like

// clicking the panel opens the file picker (unless clicking "Change")
uploadPanel.addEventListener("click", (e) => {
    if (e.target === changeMediaBtn) return;
    mediaInput.click();
});

mediaInput.addEventListener("change", () => {
    const file = mediaInput.files[0];
    if (!file) return;

    if (file.size > MAX_FILE_SIZE) {
        alert(`File is too large (${(file.size / 1024 / 1024).toFixed(1)}MB). Max size is ${MAX_FILE_SIZE / 1024 / 1024}MB.`);
        mediaInput.value = ""; // reset the input
        return;
    }

    selectedFile = file;
    const fileURL = URL.createObjectURL(file);

    uploadPlaceholder.style.display = "none";
    previewWrapper.style.display = "block";

    if (file.type.startsWith("video/")) {
        detectedMediaType = "video";
        previewVideo.src = fileURL;
        previewVideo.style.display = "block";
        previewImage.style.display = "none";
    } else {
        detectedMediaType = file.type === "image/gif" ? "gif" : "image";
        previewImage.src = fileURL;
        previewImage.style.display = "block";
        previewVideo.style.display = "none";
    }

    mediaTypeDisplay.value = detectedMediaType;
});

document.getElementById("create-post-form").addEventListener("submit", async (e) => {
    e.preventDefault();

    if (!selectedFile) {
        alert("Please select a photo, video, or gif to upload.");
        return;
    }

    const { data: { session } } = await supabaseClient.auth.getSession();
    if (!session) {
        alert("You need to be logged in to post.");
        return;
    }

    const publishBtn = document.getElementById("publish-btn");
    publishBtn.disabled = true;
    publishBtn.textContent = "Publishing...";

    // 1. Upload the file to Supabase Storage
    const fileExt = selectedFile.name.split(".").pop();
    const filePath = `${session.user.id}/${crypto.randomUUID()}.${fileExt}`;

    // NEW
window.currentAccessToken = session.access_token; // needed by uploadWithProgress

const progressWrapper = document.getElementById("upload-progress");
const progressBar = document.getElementById("upload-progress-bar");
progressWrapper.style.display = "block";

try {
    await uploadWithProgress(filePath, selectedFile, (percent) => {
        progressBar.style.width = `${percent}%`;
        publishBtn.textContent = `Uploading... ${percent}%`;
    });
} catch (uploadError) {
    alert("Upload failed: " + uploadError.message);
    publishBtn.disabled = false;
    publishBtn.textContent = "Publish";
    progressWrapper.style.display = "none";
    return;
}

    // 2. Get the public URL for the uploaded file
    const { data: urlData } = supabaseClient.storage
        .from("post-media")
        .getPublicUrl(filePath);

    // 2.5. Generate + upload a thumbnail if it's a video
    let thumbnailUrl = null;

    if (detectedMediaType === "video") {
        const thumbBlob = await generateThumbnail(selectedFile);
        const thumbPath = `${session.user.id}/${crypto.randomUUID()}.jpg`;

        const { error: thumbUploadError } = await supabaseClient.storage
            .from("post-media")
            .upload(thumbPath, thumbBlob);

        if (!thumbUploadError) {
            const { data: thumbUrlData } = supabaseClient.storage
                .from("post-media")
                .getPublicUrl(thumbPath);
            thumbnailUrl = thumbUrlData.publicUrl;
        }
    }

    // 3. Insert the post record
    const caption = document.getElementById("caption").value.trim();

    const { data: newPost, error: insertError } = await supabaseClient
        .from("posts")
        .insert([
            {
                user_id: session.user.id,
                media_url: urlData.publicUrl,
                media_type: detectedMediaType,
                caption: caption,
                thumbnail_url: thumbnailUrl,
            },
        ])
        .select()
        .single();

    if (insertError) {
        alert("Failed to create post: " + insertError.message);
        publishBtn.disabled = false;
        publishBtn.textContent = "Publish";
        return;
    }

    // redirect to the new post
    window.location.href = `post.html?id=${newPost.id}`;
});

document.getElementById("cancel-btn").addEventListener("click", () => {
    window.location.href = "index.html";
});

async function generateThumbnail(videoFile) {
    return new Promise((resolve, reject) => {
        const video = document.createElement("video");
        video.preload = "metadata";
        video.muted = true;
        video.playsInline = true;
        video.src = URL.createObjectURL(videoFile);

        video.addEventListener("loadeddata", () => {
            video.currentTime = 0.1; // seek slightly in, frame 0 is sometimes black
        });

        video.addEventListener("seeked", () => {
            const canvas = document.createElement("canvas");
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            const ctx = canvas.getContext("2d");
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

            canvas.toBlob((blob) => {
                URL.revokeObjectURL(video.src);
                resolve(blob);
            }, "image/jpeg", 0.8);
        });

        video.addEventListener("error", reject);
    });
}

function uploadWithProgress(filePath, file, onProgress) {
    return new Promise((resolve, reject) => {
        const url = `${SUPABASE_URL}/storage/v1/object/post-media/${filePath}`;
        const xhr = new XMLHttpRequest();
        xhr.open("POST", url);
        xhr.setRequestHeader("Authorization", `Bearer ${window.currentAccessToken}`);
        xhr.setRequestHeader("x-upsert", "false");

        xhr.upload.addEventListener("progress", (e) => {
            if (e.lengthComputable) {
                const percent = Math.round((e.loaded / e.total) * 100);
                onProgress(percent);
            }
        });

        xhr.onload = () => {
            if (xhr.status >= 200 && xhr.status < 300) resolve();
            else reject(new Error(xhr.responseText));
        };
        xhr.onerror = () => reject(new Error("Upload failed"));
        xhr.send(file);
    });
}

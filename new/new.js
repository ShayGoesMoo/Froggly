const filePanel = document.getElementById("file-panel");
const fileInput = document.getElementById("file-input");
const filePlaceholder = document.getElementById("file-placeholder");
const previewWrapper = document.getElementById("preview-wrapper");
const previewFile = document.getElementById("preview-file");
const changeFileBtn = document.getElementById("change-file-btn");
const removeFileBtn = document.getElementById("remove-file-btn");
const postBtn = document.getElementById("post-btn");
const captionInput = document.getElementById("caption");
const createForm = document.getElementById("create-new");

let selectedFile = null;
let detectedMediaType = null;
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10mb max

function resetFilePanel() {
    selectedFile = null;
    detectedMediaType = null;
    fileInput.value = "";
    previewFile.src = "";
    previewWrapper.style.display = "none";
    filePlaceholder.style.display = "flex";
}

function setFile(file) {
    selectedFile = file;
    detectedMediaType = file.type === "image/gif" ? "gif" : "image";
    previewFile.src = URL.createObjectURL(file);
    filePlaceholder.style.display = "none";
    previewWrapper.style.display = "block";
}

// clicking the panel opens the file picker (but not when clicking change/remove)
filePanel.addEventListener("click", (e) => {
    if (!filePlaceholder.contains(e.target)) return;
    if (previewWrapper.style.display === "block") return; // already have a file, use Change instead
    fileInput.click();
});

fileInput.addEventListener("change", () => {
    const file = fileInput.files[0];
    if (!file) return;

    if (file.size > MAX_FILE_SIZE) {
        showToast("File is too big — max 10mb.", "error");
        fileInput.value = "";
        return;
    }

    setFile(file);
});

changeFileBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    fileInput.click();
});

removeFileBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    resetFilePanel();
});

createForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const { data: { session } } = await supabaseClient.auth.getSession();
    if (!session) {
        showToast("You need to be logged in to post.", "error");
        return;
    }

    const caption = captionInput.value.trim();

    if (!caption && !selectedFile) {
        showToast("Add a caption or a photo before posting.", "error");
        return;
    }

    postBtn.disabled = true;
    postBtn.textContent = "Posting...";

    let mediaUrl = null;
    let mediaType = "text";

    if (selectedFile) {
        const fileExt = selectedFile.name.split(".").pop();
        const filePath = `${session.user.id}/${crypto.randomUUID()}.${fileExt}`;

        const { error: uploadError } = await supabaseClient.storage
            .from("post-media")
            .upload(filePath, selectedFile);

        if (uploadError) {
            showToast("Failed to upload file: " + uploadError.message, "error");
            postBtn.disabled = false;
            postBtn.textContent = "Post";
            return;
        }

        const { data: urlData } = supabaseClient.storage
            .from("post-media")
            .getPublicUrl(filePath);

        mediaUrl = urlData.publicUrl;
        mediaType = detectedMediaType;
    }

    const { data: newPost, error: insertError } = await supabaseClient
        .from("posts")
        .insert([
            {
                user_id: session.user.id,
                media_url: mediaUrl,
                media_type: mediaType,
                caption: caption,
            },
        ])
        .select()
        .single();

    if (insertError) {
        showToast("Failed to create post: " + insertError.message, "error");
        postBtn.disabled = false;
        postBtn.textContent = "Post";
        return;
    }

    window.location.href = `/dashboard/post/?id=${newPost.id}`;});

document.getElementById("cancel-btn").addEventListener("click", () => {
    window.location.href = "../dashboard/";
});
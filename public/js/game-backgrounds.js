const backgroundImages = [
    "https://ylssaocxasryuyrjfpbb.supabase.co/storage/v1/object/public/game-backgrounds/IMG_1186.webp",
    "https://ylssaocxasryuyrjfpbb.supabase.co/storage/v1/object/public/game-backgrounds/IMG_1187.webp",
    "https://ylssaocxasryuyrjfpbb.supabase.co/storage/v1/object/public/game-backgrounds/IMG_1188.webp",
    "https://ylssaocxasryuyrjfpbb.supabase.co/storage/v1/object/public/game-backgrounds/IMG_1189.webp",
];

function setRandomGameBackgrounds() {
    const randomImage = backgroundImages[Math.floor(Math.random() * backgroundImages.length)];
    document.body.style.backgroundImage = `url('${randomImage}')`;
}

setRandomGameBackgrounds();
const RAWG_API_KEY = "YOUR_KEY_HERE";

async function setRandomGameBackground() {
    try {
        // pick a random page of popular games, then a random game from that page
        const randomPage = Math.floor(Math.random() * 50) + 1;
        const res = await fetch(
            `https://api.rawg.io/api/games?key=${RAWG_API_KEY}&page_size=20&page=${randomPage}&ordering=-rating`
        );

        if (!res.ok) throw new Error("RAWG API request failed");

        const data = await res.json();
        const games = data.results;

        if (!games || games.length === 0) return;

        const randomGame = games[Math.floor(Math.random() * games.length)];
        const imageUrl = randomGame.background_image;

        if (imageUrl) {
            document.body.style.backgroundImage = `url('${imageUrl}')`;
        }
    } catch (err) {
        console.error("Failed to load background image:", err);
        // fails silently — page just keeps its default background color
    }
}

setRandomGameBackground();
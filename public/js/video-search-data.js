/*
 * MOCK VIDEO DATA
 * ----------------
 * This file stands in for the YouTube Data API v3 while you don't have
 * a key wired up yet. Everything downstream (suggestions + results page)
 * calls the two functions at the bottom: getSuggestions() and searchVideos().
 *
 * When you're ready to go live, replace the bodies of those two functions
 * with real fetch() calls to:
 *   https://www.googleapis.com/youtube/v3/search?part=snippet&q={query}&key={API_KEY}
 * and map the response items into the same shape used below
 * ({ id, title, channel, channelAvatar, thumbnail, duration, views, uploaded }).
 * Nothing else in video-search.js or video-results.js needs to change.
 */

const MOCK_VIDEOS = [
    { id: "v1", title: "How Frogs Actually Jump (Slow Motion Breakdown)", channel: "Nature Lab", channelAvatar: "../assets/default profile picture.png", thumbnail: "https://placehold.co/480x270/1a1a1a/999999?text=Frog+Jump", duration: "12:04", views: "1.2M views", uploaded: "3 weeks ago" },
    { id: "v2", title: "Building a Froggly Clone in a Weekend", channel: "DevByDan", channelAvatar: "../assets/default profile picture.png", thumbnail: "https://placehold.co/480x270/1a1a1a/999999?text=Web+Dev", duration: "24:41", views: "88K views", uploaded: "2 days ago" },
    { id: "v3", title: "Top 10 Frog Species Around the World", channel: "Wild Explorers", channelAvatar: "../assets/default profile picture.png", thumbnail: "https://placehold.co/480x270/1a1a1a/999999?text=Frog+Species", duration: "18:22", views: "540K views", uploaded: "1 month ago" },
    { id: "v4", title: "JavaScript Search Bar with Live Suggestions Tutorial", channel: "CodeCraft", channelAvatar: "../assets/default profile picture.png", thumbnail: "https://placehold.co/480x270/1a1a1a/999999?text=JS+Tutorial", duration: "15:09", views: "210K views", uploaded: "6 days ago" },
    { id: "v5", title: "Frogs vs Toads: What's the Difference?", channel: "Nature Lab", channelAvatar: "../assets/default profile picture.png", thumbnail: "https://placehold.co/480x270/1a1a1a/999999?text=Frogs+vs+Toads", duration: "9:47", views: "760K views", uploaded: "5 months ago" },
    { id: "v6", title: "YouTube Data API v3 Crash Course", channel: "CodeCraft", channelAvatar: "../assets/default profile picture.png", thumbnail: "https://placehold.co/480x270/1a1a1a/999999?text=API+Crash+Course", duration: "31:15", views: "132K views", uploaded: "2 weeks ago" },
    { id: "v7", title: "Rainforest Sounds: Frogs Singing at Night (10 Hours)", channel: "Ambient Earth", channelAvatar: "../assets/default profile picture.png", thumbnail: "https://placehold.co/480x270/1a1a1a/999999?text=Rainforest+Sounds", duration: "10:00:00", views: "3.4M views", uploaded: "1 year ago" },
    { id: "v8", title: "How I Redesigned My Portfolio Website", channel: "DevByDan", channelAvatar: "../assets/default profile picture.png", thumbnail: "https://placehold.co/480x270/1a1a1a/999999?text=Portfolio+Redesign", duration: "20:33", views: "95K views", uploaded: "4 days ago" },
    { id: "v9", title: "Poison Dart Frogs: Nature's Warning Colors", channel: "Wild Explorers", channelAvatar: "../assets/default profile picture.png", thumbnail: "https://placehold.co/480x270/1a1a1a/999999?text=Poison+Dart+Frogs", duration: "13:58", views: "410K views", uploaded: "3 months ago" },
    { id: "v10", title: "CSS Grid vs Flexbox for Card Layouts", channel: "CodeCraft", channelAvatar: "../assets/default profile picture.png", thumbnail: "https://placehold.co/480x270/1a1a1a/999999?text=CSS+Grid", duration: "17:26", views: "180K views", uploaded: "1 week ago" },
    { id: "v11", title: "Frog Life Cycle Explained for Kids", channel: "Nature Lab", channelAvatar: "../assets/default profile picture.png", thumbnail: "https://placehold.co/480x270/1a1a1a/999999?text=Frog+Life+Cycle", duration: "6:12", views: "2.1M views", uploaded: "8 months ago" },
    { id: "v12", title: "Debugging Search UX: Lessons Learned", channel: "DevByDan", channelAvatar: "../assets/default profile picture.png", thumbnail: "https://placehold.co/480x270/1a1a1a/999999?text=Search+UX", duration: "22:05", views: "64K views", uploaded: "5 days ago" }
];

const TRENDING_QUERIES = ["frog species", "javascript tutorial", "css grid", "youtube api", "nature sounds"];

/**
 * Returns up to `limit` lightweight suggestions matching the query.
 * Swap this out for a real API call (e.g. YouTube's search-suggest endpoint,
 * or your own backend) when ready. Keep the return shape the same.
 */
function getSuggestions(query, limit = 6) {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return MOCK_VIDEOS
        .filter(v => v.title.toLowerCase().includes(q) || v.channel.toLowerCase().includes(q))
        .slice(0, limit)
        .map(v => ({ id: v.id, title: v.title, thumbnail: v.thumbnail }));
}

/**
 * Returns the full list of matching videos for the results page.
 * Swap this out for a real call to the YouTube Data API's /search endpoint.
 * Map each returned item into { id, title, channel, channelAvatar, thumbnail, duration, views, uploaded }.
 */
function searchVideos(query) {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return MOCK_VIDEOS.filter(v =>
        v.title.toLowerCase().includes(q) || v.channel.toLowerCase().includes(q)
    );
}

const inbox = [
    { id: 1, message: "Sam posted a new pic", timestamp: "2026-07-17T10:00:00" },
    { id: 2, message: "Alex commented on your post", timestamp: "2026-07-17T12:30:00" },
    { id: 3, message: "Jordan posted a new gif", timestamp: "2026-07-18T08:15:00" }
];
  
const inboxBtn = document.getElementById("inboxBtn");
const inboxModal = document.getElementById("inboxModal");
const inboxList = document.getElementById("inboxList");
  
function renderInbox() {
    inboxList.innerHTML = "";
  
    if (inbox.length === 0) {
      inboxList.innerHTML = `<li>No inbox yet.</li>`;
      return;
    }
  
    inbox.forEach(inbox => {
      const li = document.createElement("li");
      li.textContent = inbox.message;
      inboxList.appendChild(li);
    });
}
  
function toggleDropdown(event) {
    event.stopPropagation();
    inboxModal.classList.toggle("hidden");
}
  
function closeDropdownOnOutsideClick(event) {
    if (!inboxModal.contains(event.target) && event.target !== inboxBtn) {
      inboxModal.classList.add("hidden");
    }
}
  
inboxBtn.addEventListener("click", toggleDropdown);
document.addEventListener("click", closeDropdownOnOutsideClick);
  
renderInbox();

/* inbox array holds mock notification objects for phase 1; gets replaced with a getInbox() fetch from Supabase in phase 1.5, same pattern as posts/getPosts() */
/* inboxBtn, inboxModal, inboxList grab the relevant elements once, instead of querying the DOM every time they're needed */
/* renderInbox clears and rebuilds the list from the inbox array, showing a fallback message if there's nothing to show */
/* toggleDropdown uses event.stopPropagation() so clicking the bell doesn't also trigger the document-wide outside-click listener in the same click, which would open and instantly close the dropdown */
/* closeDropdownOnOutsideClick listens on the whole document and closes the dropdown if the click landed outside it and wasn't the bell button itself */
/* .contains(event.target) checks whether the click happened inside the dropdown (including child elements like list items), so clicking a notification itself doesn't count as an outside click */
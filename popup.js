const forceCheckbox = document.getElementById("forceAltSearch");
const disableTwitterDialogsCheckbox = document.getElementById("disableTwitterDialogs");
const disableFacebookDialogsCheckbox = document.getElementById("disableFacebookDialogs");

chrome.storage.sync.get("force", function(item) {
  if (item.force) {
    forceCheckbox.checked = true;
  }
});

chrome.storage.sync.get("disableTwitterDialogs", function(item) {
  if (item.disableTwitterDialogs) {
    disableTwitterDialogsCheckbox.checked = true;
  }
});

chrome.storage.sync.get("disableFacebookDialogs", function(item) {
  if (item.disableFacebookDialogs) {
    disableFacebookDialogsCheckbox.checked = true;
  }
});

forceCheckbox.addEventListener("click", function() {
  chrome.storage.sync.set({ force: !!this.checked });
});

disableTwitterDialogsCheckbox.addEventListener("click", function() {
  chrome.storage.sync.set({ disableTwitterDialogs: !!this.checked });
});

disableFacebookDialogsCheckbox.addEventListener("click", function() {
  chrome.storage.sync.set({ disableFacebookDialogs: !!this.checked });
});

function analyzeAll() {
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    chrome.tabs.sendMessage(tabs[0].id, {type: "searchAllByUrl", force: !!forceCheckbox.checked });
  });
}

document.getElementById('analyze-all').addEventListener('click', analyzeAll);
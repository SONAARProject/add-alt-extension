const forceCheckbox = document.getElementById("forceAltSearch");

chrome.storage.sync.get("force", function(item) {
  if (item.force) {
    forceCheckbox.checked = true;
  }
});


forceCheckbox.addEventListener("click", function() {
  chrome.storage.sync.set({ force: !!this.checked });
});

function analyzeAll() {
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    chrome.tabs.sendMessage(tabs[0].id, {type: "searchAllByUrl", force: !!forceCheckbox.checked });
  });
}

document.getElementById('analyze-all').addEventListener('click', analyzeAll);
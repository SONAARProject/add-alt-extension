const forceCheckbox = document.getElementById("forceAltSearch");
const forceCheckbox2 = document.getElementById("forceAltSearch2");
const disableTwitterDialogsCheckbox = document.getElementById("disableTwitterDialogs");
const disableFacebookDialogsCheckbox = document.getElementById("disableFacebookDialogs");
const disableTwitterDialogsCheckbox2 = document.getElementById("disableTwitterDialogs2");
const disableFacebookDialogsCheckbox2 = document.getElementById("disableFacebookDialogs2");
const langSelect = document.getElementById('lang');
const langSelect2 = document.getElementById('lang2');

chrome.storage.sync.get("lang", function(item) {
  if (item.lang) {
    langSelect.value = langSelect2.value = item.lang;
  } else {
    langSelect.value = langSelect2.value = navigator.language.split('-')[0] === 'pt' ? 'pt' : 'en';
    chrome.storage.sync.set({ lang: langSelect.value });
  }

  document.body.parentElement.setAttribute('lang', langSelect.value);

  if (langSelect.value === 'pt') {
    document.getElementById('en').style.visibility = 'hidden';
    document.getElementById('en').style.position = 'absolute';
  } else {
    document.getElementById('pt').style.visibility = 'hidden';
    document.getElementById('pt').style.position = 'absolute';
  }
});

chrome.storage.sync.get("force", function(item) {
  if (item.force) {
    forceCheckbox.checked = forceCheckbox2.value = true;
  }
});

chrome.storage.sync.get("disableTwitterDialogs", function(item) {
  if (item.disableTwitterDialogs) {
    disableTwitterDialogsCheckbox.checked = disableTwitterDialogsCheckbox2.checked = true;
  }
});

chrome.storage.sync.get("disableFacebookDialogs", function(item) {
  if (item.disableFacebookDialogs) {
    disableFacebookDialogsCheckbox.checked = disableFacebookDialogsCheckbox2.checked = true;
  }
});

forceCheckbox.addEventListener("click", function() {
  chrome.storage.sync.set({ force: !!this.checked });
  forceCheckbox2.checked = !!this.checked;
});

forceCheckbox2.addEventListener("click", function() {
  chrome.storage.sync.set({ force: !!this.checked });
  forceCheckbox.checked = !!this.checked;
});

langSelect.addEventListener('change', function() {
  chrome.storage.sync.set({ lang: this.value });

  langSelect2.value = this.value;
  
  document.getElementById(this.value).style.visibility = 'initial';
  document.getElementById(this.value).style.position = 'static';
  document.body.parentElement.setAttribute('lang', langSelect2.value);
  if (this.value === 'pt') {
    document.getElementById('en').style.visibility = 'hidden';
    document.getElementById('en').style.position = 'absolute';
  } else {
    document.getElementById('pt').style.visibility = 'hidden';
    document.getElementById('pt').style.position = 'absolute';
  }
});

langSelect2.addEventListener('change', function() {
  chrome.storage.sync.set({ lang: this.value });

  langSelect.value = this.value;
  
  document.getElementById(this.value).style.visibility = 'initial';
  document.getElementById(this.value).style.position = 'static';
  document.body.parentElement.setAttribute('lang', langSelect.value);
  if (this.value === 'pt') {
    document.getElementById('en').style.visibility = 'hidden';
    document.getElementById('en').style.position = 'absolute';
  } else {
    document.getElementById('pt').style.visibility = 'hidden';
    document.getElementById('pt').style.position = 'absolute';
  }
});

disableTwitterDialogsCheckbox.addEventListener("click", function() {
  chrome.storage.sync.set({ disableTwitterDialogs: !!this.checked });
  disableTwitterDialogsCheckbox2.checked = !!this.checked;
});

disableFacebookDialogsCheckbox.addEventListener("click", function() {
  chrome.storage.sync.set({ disableFacebookDialogs: !!this.checked });
  disableFacebookDialogsCheckbox2.checked = !!this.checked;
});

disableTwitterDialogsCheckbox2.addEventListener("click", function() {
  chrome.storage.sync.set({ disableTwitterDialogs: !!this.checked });
  disableTwitterDialogsCheckbox.checked = !!this.checked;
});

disableFacebookDialogsCheckbox2.addEventListener("click", function() {
  chrome.storage.sync.set({ disableFacebookDialogs: !!this.checked });
  disableFacebookDialogsCheckbox.checked = !!this.checked;
});

function analyzeAll() {
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    chrome.tabs.sendMessage(tabs[0].id, {type: "searchAllByUrl", force: !!forceCheckbox.checked });
  });
}

document.getElementById('analyze-all').addEventListener('click', analyzeAll);

const buttons = document.getElementsByClassName('report_problem');

for (const button of buttons) {
  button.addEventListener('click', function() {
    chrome.runtime.openOptionsPage();
  });
}
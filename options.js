chrome.storage.sync.get("lang", function(item) {

  let lang = '';

  if (item.lang) {
    lang = item.lang;
  } else {
    lang = navigator.language.split('-')[0] === 'pt' ? 'pt' : 'en';
    chrome.storage.sync.set({ lang: langSelect.value });
  }

  document.body.parentElement.setAttribute('lang', lang);

  if (lang === 'pt') {
    document.getElementById('en').style.visibility = 'hidden';
    document.getElementById('en').style.position = 'absolute';
  } else {
    document.getElementById('pt').style.visibility = 'hidden';
    document.getElementById('pt').style.position = 'absolute';
  }
});
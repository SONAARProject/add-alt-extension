function searchImage(img) {
  chrome.storage.local.get(img, function(data) {
    if(typeof data[img] === "undefined") {
      console.log('No data')
    } else { 
      const http = new XMLHttpRequest();
      http.open('POST', searchEndpoint, true);
      http.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
      http.onreadystatechange = function() {
        if(http.readyState === 4 && http.status === 200) {
          const response = JSON.parse(http.responseText);
          
          if (response.status !== 4) {
            chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
              chrome.tabs.sendMessage(tabs[0].id, { type: "checkAltText", img, alts: response?.alts, concepts: response?.concepts });
            });
          }
        }
      }
      
      http.send("imageBuffer=" + data[img]);
    }
  });
}

function submitImage(img, text) {
  chrome.storage.local.get(img, function(data) {
    if(typeof data[img] === "undefined") {
      console.log('No data')
    } else { 
      const http = new XMLHttpRequest();
      http.open('POST', insertEndpoint, true);
      http.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
      http.onreadystatechange = function() {
        if(http.readyState === 4 && http.status === 200) {
          //alert(http.responseText);
        }
      }

      http.send("imageBuffer=" + data[img] + "&altText=" + encodeURIComponent(text));
    }
  });
}

function searchByUrl(url, id) {
  const http = new XMLHttpRequest();
  http.open('GET', searchEndpoint + "/" + encodeURIComponent(url), true);
  http.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
  http.onreadystatechange = function() {
    if(http.readyState === 4 && http.status === 200) {
      const response = JSON.parse(http.responseText);
      
      chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, {type: "altForImage", id, alts: response?.alts });
      });
    }
  }

  http.send();
}

chrome.runtime.onMessage.addListener(
  function(message){      
    switch(message.type) {
      case "search":
        searchImage(message.img);
        break;
      case "searchUrl":
        searchByUrl(message.url, message.id);
        break;
      case "submit":
        submitImage(message.img, message.text);
        break;
      default:
        console.log("default message");
        break;
    }
  }
);

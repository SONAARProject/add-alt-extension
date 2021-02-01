function searchImage() {
  chrome.storage.local.get("imageBuffer", function(data) {
    if(typeof data.imageBuffer === "undefined") {
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
              chrome.tabs.sendMessage(tabs[0].id, {type: "checkAltText", alts: response?.alts });
            });
          }
        }
      }

      http.send("imageBuffer=" + data.imageBuffer);
    }
  });
}

function saveText(text) {
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    chrome.tabs.sendMessage(tabs[0].id, {type: "submitButton", text });
  });
}

function submitImage(text) {
  chrome.storage.local.get("imageBuffer", function(data) {
    if(typeof data.imageBuffer === "undefined") {
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

      http.send("imageBuffer=" + data.imageBuffer + "&altText=" + encodeURIComponent(text));
    }
  });
}

chrome.runtime.onMessage.addListener(
  function(message, sender, sendResponse){      
    switch(message.type) {
      case "search":
        searchImage();
        break;
      case "save":
        saveText(message.text);
        break;
      case "submit":
        submitImage(message.text);
        break;
      default:
        console.log("default message");
        break;
    }
  }
);
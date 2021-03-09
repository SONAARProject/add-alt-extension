/// <reference types="node" />

const MOCK = {
  "2888d9f39e3abf24729a6cbe0b525049": {
    concepts: JSON.stringify("coisa, coisa2, coisa3"),
  },
  abd28a911771a750f660eb4e8509e2c5: {
    alts: JSON.stringify([{ AltText: "gato" }]),
  },
  cd7e0b0476cca1beff4fa85adc3f8495: {
    alts: JSON.stringify([{ AltText: "pés" }]),
  },
};

function searchImage(img: string): void {
  chrome.storage.local.get(img, function (data: any) {
    if (typeof data[img] === "undefined") {
      console.log("No data");
    } else {
      /*const http = new XMLHttpRequest();
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
      
      http.send("imageBuffer=" + data[img]);*/
      setTimeout(() => {
        chrome.tabs.query(
          { active: true, currentWindow: true },
          function (tabs) {
            chrome.tabs.sendMessage(tabs[0].id, {
              type: "checkAltText",
              img,
              alts: MOCK[img]?.alts,
              concepts: MOCK[img]?.concepts,
            });
          }
        );
      }, 300 * 10);
    }
  });
}

function submitImage(img: string, text: string): void {
  chrome.storage.local.get(img, function (data: any) {
    if (typeof data[img] === "undefined") {
      console.log("No data");
    } else {
      const http = new XMLHttpRequest();
      http.open("POST", insertEndpoint, true);
      http.setRequestHeader(
        "Content-Type",
        "application/x-www-form-urlencoded"
      );
      http.onreadystatechange = function () {
        if (http.readyState === 4 && http.status === 200) {
          //alert(http.responseText);
        }
      };

      http.send(
        "imageBuffer=" + data[img] + "&altText=" + encodeURIComponent(text)
      );
    }
  });
}

function searchByUrl(url: string, id: string): void {
  const http = new XMLHttpRequest();
  http.open("GET", searchEndpoint + "/" + encodeURIComponent(url), true);
  http.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
  http.onreadystatechange = function () {
    if (http.readyState === 4 && http.status === 200) {
      const response = JSON.parse(http.responseText);

      chrome.tabs.query(
        { active: true, currentWindow: true },
        function (tabs: chrome) {
          chrome.tabs.sendMessage(tabs[0].id, {
            type: "altForImage",
            id,
            alts: response?.alts,
          });
        }
      );
    }
  };

  http.send();
}

chrome.runtime.onMessage.addListener(function (message: any): void {
  switch (message.type) {
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
});
function generateUniqueUserID() {
  const userId = localStorage.getItem("sonaarUserId");
  if (!userId) {
    const generatedUserId = md5(
      Math.random().toString().substr(2, 64) + new Date()
    );
    localStorage.setItem("sonaarUserId", generatedUserId);
  }
}

generateUniqueUserID();

function parseLang(lang) {
  if (lang !== undefined) {
    const tag = lang.split("-");
    return tag[0].toLowerCase().trim();
  }

  return "undefined";
}

function searchImage(img, lang, socialMedia) {
  chrome.storage.local.get(img, function (data) {
    if (typeof data[img] === "undefined") {
      console.log("No data");
    } else {
      const http = new XMLHttpRequest();
      http.open("POST", searchEndpoint, true);
      http.setRequestHeader(
        "Content-Type",
        "application/x-www-form-urlencoded"
      );
      http.onreadystatechange = function () {
        if (http.readyState === 4 && http.status === 200) {
          const response = JSON.parse(http.responseText);

          if (response.status !== 4) {
            chrome.tabs.query(
              { active: true, currentWindow: true },
              function (tabs) {
                chrome.tabs.sendMessage(tabs[0].id, {
                  type: "checkAltText",
                  img,
                  alts: response?.alts,
                  concepts: response?.concepts,
                  text: response?.text,
                });
              }
            );
          }
        }
      };

      http.send(
        "imageBuffer=" +
          data[img] +
          "&lang=" +
          parseLang(lang) +
          "&type=suggestion" +
          "&platform=extension" +
          "&socialMedia=" +
          socialMedia +
          "&userId=" +
          localStorage.getItem("sonaarUserId")
      );
    }
  });
}

function submitImage(img, lang, text, postText, socialMedia) {
  chrome.storage.local.get(img, function (data) {
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
        "imageBuffer=" +
          data[img] +
          "&lang=" +
          parseLang(lang) +
          "&altText=" +
          encodeURIComponent(text) +
          "&postText=" +
          encodeURIComponent(postText) +
          "&type=authoring" +
          "&platform=extension" +
          "&socialMedia=" +
          socialMedia +
          "&userId=" +
          localStorage.getItem("sonaarUserId")
      );
    }
  });
}

function searchByUrl(url, lang, id) {
  const http = new XMLHttpRequest();
  http.open("POST", searchEndpoint, true);
  http.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
  http.onreadystatechange = function () {
    if (http.readyState === 4 && http.status === 200) {
      const response = JSON.parse(http.responseText);

      chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        chrome.tabs.sendMessage(tabs[0].id, {
          type: "altForImage",
          id,
          alts: response?.alts,
          concepts: response?.concepts,
          text: response?.text,
        });
      });
    }
  };

  http.send(
    "imageUrl=" +
      encodeURIComponent(url) +
      "&lang=" +
      parseLang(lang) +
      "&type=consumption" +
      "&platform=extension" +
      "&userId=" +
      localStorage.getItem("sonaarUserId")
  );
}

chrome.runtime.onMessage.addListener(function (message) {
  switch (message.type) {
    case "search":
      searchImage(message.img, message.lang, message.socialMedia);
      break;
    case "searchUrl":
      searchByUrl(message.url, message.lang, message.id);
      break;
    case "submit":
      submitImage(
        message.img,
        message.lang,
        message.text,
        message.postText,
        message.socialMedia
      );
      break;
    default:
      console.log("default message");
      break;
  }
});

function grabTweetButton() {
  const tweetButton = document.querySelector('[class="css-901oao r-1awozwy r-jwli3a r-6koalj r-18u37iz r-16y2uox r-1qd0xha r-a023e6 r-b88u0q r-1777fci r-ad9z0x r-dnmrzs r-bcqeeo r-q4m81j r-qvutc0"]');
  if (tweetButton) {
    tweetButton.addEventListener('click', function() {
      setTimeout(function() {
        grabTwitterPostingInput();
      }, 1000);
    });
  }
}

function grabTwitterPostingInput() {
  const input = document.querySelector("[class='r-8akbif r-orgf3d r-1udh08x r-u8s1d r-xjis5s r-1wyyakw']");
  if (input) {
    input.addEventListener("change", function() {
      const reader = new FileReader();
      reader.onload = function() {
        setTimeout(function() {
          const addDescription = document.querySelector('[class="css-4rbku5 css-18t94o4 css-901oao r-k200y r-9ilb82 r-1loqt21 r-1qd0xha r-a023e6 r-16dba41 r-ad9z0x r-dnmrzs r-bcqeeo r-1udh08x r-1udbk01 r-3s2u2q r-qvutc0"]');
          addDescription.style["pointer-events"] = "none";
          const editButton = document.querySelector('[class="css-18t94o4 css-1dbjc4n r-loe9s5 r-42olwf r-sdzlij r-1phboty r-rs99b7 r-1w2pmg r-1vsu8ta r-aj3cln r-1ny4l3l r-1fneopy r-u8s1d r-inbvtb r-12pp1o0 r-o7ynqc r-6416eg r-lrvibr"]');
          editButton.style["visibility"] = "hidden";
        }, 500)

        const bytes = new Uint8Array(this.result);
        chrome.storage.local.set({ imageBuffer: JSON.stringify(bytes) });
        chrome.runtime.sendMessage({ type: "search", platform: "twitter" });
      }
      reader.readAsArrayBuffer(this.files[0]);
    });
  }
}

function grabFacebookPostingInput() {
  const input = document.querySelector('input[class="mkhogb32"]');
  if (input) {
    input.addEventListener("change", function() {
      const reader = new FileReader();
      reader.onload = function() {
        setTimeout(function() {
          const editButton = document.querySelector('[class="oajrlxb2 q2y6ezfg gcieejh5 bn081pho humdl8nn izx4hr6d rq0escxv nhd2j8a9 j83agx80 p7hjln8o kvgmc6g5 cxmmr5t8 oygrvhab hcukyx3x jb3vyjys d1544ag0 qt6c0cv9 tw6a2znq i1ao9s8h esuyzwwr f1sip0of lzcic4wl l9j0dhe7 abiwlrkh p8dawk7l beltcj47 p86d2i9g aot14ch1 kzx2olss cbu4d94t taijpn5t ni8dbmo4 stjgntxs k4urcfbm tv7at329"]');
          editButton.style["visibility"] = "hidden";
        }, 500)

        const bytes = new Uint8Array(this.result);
        chrome.storage.local.set({ imageBuffer: JSON.stringify(bytes) });
        chrome.runtime.sendMessage({ type: "search", platform: "facebook" });
      }
      reader.readAsArrayBuffer(this.files[0]);
    });
  }
}

function getImageUrl(image) {
  if (!image.src) {
    return null;
  }

  if (image.src.startsWith('http')) {
    return image.src;
  } else {
    return location.href + image.src;
  }
}

function analyzeAll(force = false) {
  const imgs = document.querySelectorAll('img');

  for (const img of imgs || []) {
    const alt = img.getAttribute('alt');
    if (alt !== "" && !img.hasAttribute("_add_alt_extension_id")) {
      if (alt === null || force) {
        img.setAttribute("_add_alt_extension_id", md5(img + new Date().toISOString()));
        const url = getImageUrl(img);
        chrome.runtime.sendMessage({type: "searchUrl", url, id: img.getAttribute("_add_alt_extension_id")});
      }
    }
  }
}

chrome.runtime.onMessage.addListener(
  function(message, sender, sendResponse) {
    if (message.type === "checkAltText" && message.platform === "twitter") {
      const alts = message.alts ? JSON.parse(message.alts) : undefined;
      const addDescription = document.querySelector('[class="css-4rbku5 css-18t94o4 css-901oao r-k200y r-9ilb82 r-1loqt21 r-1qd0xha r-a023e6 r-16dba41 r-ad9z0x r-dnmrzs r-bcqeeo r-1udh08x r-1udbk01 r-3s2u2q r-qvutc0"]');
      addDescription.style["pointer-events"] = "auto";
      addDescription.addEventListener("click", function() {
        setTimeout(function() {
          const textarea = document.querySelector('[class="r-30o5oe r-1niwhzg r-17gur6a r-1yadl64 r-deolkf r-homxoj r-poiln3 r-7cikom r-1ny4l3l r-t60dpp r-1dz5y72 r-1ttztb7 r-13qz1uu"]');
          textarea.textContent = !alts ? '' : alts.map(alt => {
            return alt.AltText.trim();
          }).join("\n");

          const save = document.querySelector('[class="css-18t94o4 css-1dbjc4n r-urgr8i r-42olwf r-sdzlij r-1phboty r-rs99b7 r-1w2pmg r-1n0xq6e r-1vsu8ta r-aj3cln r-1ny4l3l r-1fneopy r-o7ynqc r-6416eg r-lrvibr"]');
          save.addEventListener("click", function() {
            if (textarea.textContent.trim() !== "") {
              let alreadyExists = false;
              for (const alt of alts || []) {
                if (alt.AltText.trim() === textarea.textContent.trim()) {
                  alreadyExists = true;
                  break;
                }
              }
              if (!alreadyExists) {
                chrome.runtime.sendMessage({type: "save", text: textarea.textContent.trim() });
              } else {
                chrome.runtime.sendMessage({type: "save", text: undefined });
              }
            } else {
              chrome.runtime.sendMessage({type: "save", text: undefined });
            }            
          });
        }, 1000);
      });
      const editButton = document.querySelector('[class="css-18t94o4 css-1dbjc4n r-loe9s5 r-42olwf r-sdzlij r-1phboty r-rs99b7 r-1w2pmg r-1vsu8ta r-aj3cln r-1ny4l3l r-1fneopy r-u8s1d r-inbvtb r-12pp1o0 r-o7ynqc r-6416eg r-lrvibr"]');
      editButton.style["visibility"] = "initial";
      editButton.addEventListener("click", function () {
        setTimeout(function() {
          const altTab = document.querySelectorAll('[class="css-1dbjc4n r-16y2uox r-6b64d0 r-cpa5s6"]')[1];
          altTab.addEventListener("click", function () {
            setTimeout(function() {
              const textarea = document.querySelector('[class="r-30o5oe r-1niwhzg r-17gur6a r-1yadl64 r-deolkf r-homxoj r-poiln3 r-7cikom r-1ny4l3l r-t60dpp r-1dz5y72 r-1ttztb7 r-13qz1uu"]');
              textarea.textContent = !alts ? '' : alts.map(alt => {
                return alt.AltText.trim();
              }).join("\n");

              const save = document.querySelector('[class="css-18t94o4 css-1dbjc4n r-urgr8i r-42olwf r-sdzlij r-1phboty r-rs99b7 r-1w2pmg r-1n0xq6e r-1vsu8ta r-aj3cln r-1ny4l3l r-1fneopy r-o7ynqc r-6416eg r-lrvibr"]');
              save.addEventListener("click", function() {
                if (textarea.textContent.trim() !== "") {
                  let alreadyExists = false;
                  for (const alt of alts || []) {
                    if (alt.AltText.trim() === textarea.textContent.trim()) {
                      alreadyExists = true;
                      break;
                    }
                  }
                  if (!alreadyExists) {
                    chrome.runtime.sendMessage({type: "save", text: textarea.textContent.trim() });
                  } else {
                    chrome.runtime.sendMessage({type: "save", text: undefined });
                  }
                } else {
                  chrome.runtime.sendMessage({type: "save", text: undefined });
                }            
              });
            }, 1000);
          });
        }, 1000);
      });
    } else if (message.type === "submitButton") {
      setTimeout(function() {
        const submitButton = document.querySelector('[class="css-18t94o4 css-1dbjc4n r-urgr8i r-42olwf r-sdzlij r-1phboty r-rs99b7 r-1w2pmg r-1n0xq6e r-1vuscfd r-1dhvaqw r-1ny4l3l r-1fneopy r-o7ynqc r-6416eg r-lrvibr"]');
        submitButton.addEventListener("click", function() {
          const text = message.text;
          
          if (text) {
            chrome.runtime.sendMessage({type: "submit", text });
          }
        });
      }, 1000);
    } else if (message.type === "checkAltText" && message.platform === "facebook") {
      const alts = message.alts ? JSON.parse(message.alts) : undefined;
      console.log(alts);
      const editButton = document.querySelector('[class="oajrlxb2 q2y6ezfg gcieejh5 bn081pho humdl8nn izx4hr6d rq0escxv nhd2j8a9 j83agx80 p7hjln8o kvgmc6g5 cxmmr5t8 oygrvhab hcukyx3x jb3vyjys d1544ag0 qt6c0cv9 tw6a2znq i1ao9s8h esuyzwwr f1sip0of lzcic4wl l9j0dhe7 abiwlrkh p8dawk7l beltcj47 p86d2i9g aot14ch1 kzx2olss cbu4d94t taijpn5t ni8dbmo4 stjgntxs k4urcfbm tv7at329"]');
      editButton.style["visibility"] = "initial";
      editButton.addEventListener("click", function() {
        setTimeout(function() {
          const textAlternativeButton = document.querySelector('[class="hu5pjgll lzf7d6o1 sp_YSu7W135EnD sx_7f977b"]');
          textAlternativeButton.parentElement.parentElement.parentElement.parentElement.addEventListener('click', function() {
            setTimeout(function() {
              const radioButton = document.querySelector('input[type="radio"][class="oajrlxb2 rq0escxv f1sip0of hidtqoto nhd2j8a9 datstx6m kvgmc6g5 cxmmr5t8 oygrvhab hcukyx3x b5wmifdl lzcic4wl jb3vyjys rz4wbd8a qt6c0cv9 a8nywdso pmk7jnqg j9ispegn kr520xx4 k4urcfbm"]');
              radioButton.click();
              setTimeout(function() {
                const textarea = document.querySelector('[class="oajrlxb2 rq0escxv f1sip0of hidtqoto lzcic4wl g5ia77u1 gcieejh5 bn081pho humdl8nn izx4hr6d oo9gr5id j83agx80 jagab5yi knj5qynh fo6rh5oj oud54xpy l9qdfxac ni8dbmo4 stjgntxs hv4rvrfc dati1w0a ieid39z1 k4urcfbm"]');
                textarea.value = !alts ? '' : alts.map(alt => {
                  return alt.AltText.trim();
                }).join("\n");
              }, 500)
            }, 1000);
          });
        }, 3000);
      });
    } else if (message.type === "searchAllByUrl") {
      analyzeAll(message.force);
    } else if (message.type === "altForImage") {
      const img = document.querySelector(`[_add_alt_extension_id="${message.id}"]`);
      if (message.alts) {
        const alts = JSON.parse(message.alts);
        if (img.attributes["alt"] === undefined) {
          img.setAttribute("alt", alts.map(a => a.AltText).join("; "));
        } else {
          img.setAttribute("alt", img.getAttribute("alt") + "; " + alts.map(a => a.AltText).join("; "));
        }
        img.setAttribute("_add_alt_extension_message", "All alt's found in database were added.");
      } else {
        img.setAttribute("_add_alt_extension_message", "No alt found in database.");
      }
    }
  }
);

function initTwitterSupport() {
  grabTweetButton();
  grabTwitterPostingInput();
}

function initFacebookSupport() {
  grabFacebookPostingInput();
}

function activateShortcut() {
  document.addEventListener("keyup", function(event) {
    if (event.ctrlKey && event.altKey && event.key === "s") {
      chrome.storage.sync.get("force", function(item) {
        analyzeAll(item.force);
      });
    }
  });
}

function loadMainFunctions() {
  const host = location.host;
  if (host.includes("twitter.com")) {
    initTwitterSupport();
  } else if (host.includes("facebook.com")) {
    initFacebookSupport();
  }
  
  activateShortcut();
}

document.onreadystatechange = function () {
  if(document.readyState === "complete"){
    setTimeout(loadMainFunctions, 5000);
  }
}
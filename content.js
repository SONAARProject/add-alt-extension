let STEPS = new Array();
let CURRENT = undefined;
let RESULT = {};
let ORDER = new Array();
let COUNTER = 0;
let HIDE_TWEET_BUTTON = false;

function cleanOpenDialogs() {
  hideAddDescriptionDialog();
  hideAltFoundDialog();
  hidePasteDialog();
  hideSaveButtonDialog();
  descriptionTabClicked();
}

function cleanStepsProcess() {
  STEPS = new Array();
  CURRENT = undefined;
  RESULT = {};
  ORDER = new Array();
  HIDE_TWEET_BUTTON = false;
  COUNTER = 0;
  cleanOpenDialogs();
}

function delayCleanStepsProcess() {
  setTimeout(cleanStepsProcess, 500);
}

function createDescription(img) {
  chrome.storage.sync.get("lang", function (item) {
    if (item.lang === "pt") {
      const description =
        (RESULT[img].imageText &&
        RESULT[img].imageText.phrases &&
        RESULT[img].imageText.phrases[0] !== null
          ? pt.description.text + RESULT[img].imageText.phrases[0] + "\n\n"
          : "") +
        pt.description.concepts +
        RESULT[img].concepts;
      //+ '\n\n' + pt.description.watermark;

      RESULT[img].description = description;
    } else {
      console.log(RESULT[img].imageText);
      const description =
        (RESULT[img].imageText &&
        RESULT[img].imageText.phrases &&
        RESULT[img].imageText.phrases.length !== 0 &&
        RESULT[img].imageText.phrases[0] !== null
          ? en.description.text + RESULT[img].imageText.phrases[0] + "\n\n"
          : "") +
        en.description.concepts +
        RESULT[img].concepts;
      // + '\n\n' + en.description.watermark;

      RESULT[img].description = description;
    }
  });
}

function setCURRENT(next) {
  if (next) {
    CURRENT = ORDER[ORDER.indexOf(CURRENT) + 1];
    while (RESULT[CURRENT] && RESULT[CURRENT].removed) {
      CURRENT = ORDER[ORDER.indexOf(CURRENT) + 1];
    }
  } else {
    CURRENT = ORDER[ORDER.indexOf(CURRENT) - 1];
    while (RESULT[CURRENT] && RESULT[CURRENT].removed) {
      CURRENT = ORDER[ORDER.indexOf(CURRENT) - 1];
    }
  }
}

function copyToClipboard() {
  let description = RESULT[CURRENT]?.description;
  if (description) {
    chrome.storage.sync.get("lang", function (item) {
      if (item.lang === "pt") {
        description += "\n\n" + pt.description.watermark;
      } else {
        description += "\n\n" + en.description.watermark;
      }
      navigator.clipboard.writeText(description);
    });
  }
}

function cleanRespectiveImage() {
  const img = this.getAttribute("_remove_img_id");
  if (img && !RESULT[img]?.removed) {
    delete RESULT[img];
    const indexOf = ORDER.indexOf(img);
    if (indexOf !== -1) {
      ORDER.splice(indexOf, 1);
    }
    COUNTER = ORDER.length;
  }
}

function handleTwitterRemoveImageButtons(removeImageButtons) {
  let i = 0;
  for (const button of removeImageButtons) {
    button.removeEventListener("click", cleanStepsProcess, true);
    if (!button.hasAttribute("_remove_img_id")) {
      button.setAttribute("_remove_img_id", ORDER[i]);
      button.removeEventListener("click", cleanRespectiveImage, true);
      button.addEventListener("click", cleanRespectiveImage, true);
    } else {
      button.removeEventListener("click", cleanRespectiveImage, true);
      button.addEventListener("click", cleanRespectiveImage, true);
    }
    i++;
  }
}

function grabTweetButton() {
  return document.querySelector('[href="/compose/tweet"]');
}

function grabFacebookPublishButton() {
  return document.querySelector(
    '[class="oajrlxb2 gs1a9yip g5ia77u1 mtkw9kbi tlpljxtp qensuy8j ppp5ayq2 goun2846 ccm00jje s44p3ltw mk2mc5f4 rt8b4zig n8ej3o3l agehan2d sk4xxmp2 rq0escxv nhd2j8a9 a8c37x1j mg4g778l btwxx1t3 pfnyh3mw p7hjln8o kvgmc6g5 cxmmr5t8 oygrvhab hcukyx3x tgvbjcpo hpfvmrgz jb3vyjys rz4wbd8a qt6c0cv9 a8nywdso l9j0dhe7 i1ao9s8h esuyzwwr f1sip0of du4w35lb lzcic4wl abiwlrkh p8dawk7l ue3kfks5 pw54ja7n uo3d90p7 l82x9zwi"]'
  );
}

function publishButtonClicked() {
  setTimeout(cleanStepsProcess, 200);
}

function handleTweetButton(tweetButton) {
  tweetButton.removeEventListener("click", publishButtonClicked, true);
  tweetButton.addEventListener("click", publishButtonClicked, true);
}

function handleFacebookPublishButton(publishButton) {
  publishButton.removeEventListener("click", publishButtonClicked, true);
  publishButton.addEventListener("click", publishButtonClicked, true);
}

function grabTwitterMediaInputs() {
  return document.querySelectorAll(
    "input[class='r-8akbif r-orgf3d r-1udh08x r-u8s1d r-xjis5s r-1wyyakw']"
  );
}

function grabFacebookMediaInputs() {
  return document.querySelectorAll('input[class="mkhogb32"][accept^="image"]');
}

function handleImage() {
  let reset = true;
  for (const file of this.files || []) {
    if (file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = function () {
        HIDE_TWEET_BUTTON = false;

        const bytes = new Uint8Array(this.result);

        const img = md5(bytes);
        if (!RESULT[img]) {
          RESULT[img] = {};
        }

        if (ORDER.includes(img)) {
          const indexOf = ORDER.indexOf(img);
          if (indexOf !== -1) {
            ORDER.splice(indexOf, 1);
          }
        }

        ORDER.push(img);

        const data = {};
        data[img] = JSON.stringify(bytes);

        const socialMedia = location.host.includes("twitter.com")
          ? "twitter"
          : location.host.includes("facebook.com")
          ? "facebook"
          : null;

        chrome.storage.local.set(data);
        chrome.runtime.sendMessage({
          type: "search",
          lang: navigator.language,
          img,
          socialMedia,
        });

        if (COUNTER > 0 && reset) {
          STEPS = new Array();
          reset = false;
        }
      };
      reader.readAsArrayBuffer(file);
    }
  }
}

function handlePostDetection(mediaInputs) {
  for (const mi of mediaInputs) {
    mi.removeEventListener("change", handleImage, true);
    mi.addEventListener("change", handleImage, true);
  }
}

function grabTwitterRemoveImageButtons() {
  return document.querySelectorAll(
    '[class="css-18t94o4 css-1dbjc4n r-loe9s5 r-42olwf r-sdzlij r-1phboty r-rs99b7 r-1w2pmg r-ws9h79 r-15ysp7h r-4wgw6l r-1ny4l3l r-mk0yit r-u8s1d r-s5r7i3 r-o7ynqc r-6416eg r-lrvibr"]'
  );
}

function grabFacebookRemoveImageButton() {
  return document.querySelector(
    '[class="oajrlxb2 hn33210v qu0x051f esr5mh6w e9989ue4 r7d6kgcz rq0escxv nhd2j8a9 j83agx80 p7hjln8o kvgmc6g5 cxmmr5t8 oygrvhab hcukyx3x jb3vyjys rz4wbd8a qt6c0cv9 a8nywdso i1ao9s8h esuyzwwr f1sip0of lzcic4wl l9j0dhe7 abiwlrkh p8dawk7l bp9cbjyn s45kfl79 emlxlaya bkmhp75w spb7xbtv rt8b4zig n8ej3o3l agehan2d sk4xxmp2 taijpn5t tv7at329 thwo4zme m7msyxje m9osqain"]'
  );
}

function grabTwitterDiscardPostButton() {
  return document.querySelector('[data-testid="confirmationSheetCancel"]');
}

function grabFacebookDiscardPostButton() {
  return document.querySelector(
    '[class="oajrlxb2 tdjehn4e qu0x051f esr5mh6w e9989ue4 r7d6kgcz rq0escxv nhd2j8a9 j83agx80 p7hjln8o kvgmc6g5 cxmmr5t8 oygrvhab hcukyx3x jb3vyjys rz4wbd8a qt6c0cv9 a8nywdso i1ao9s8h esuyzwwr f1sip0of lzcic4wl l9j0dhe7 abiwlrkh p8dawk7l bp9cbjyn s45kfl79 emlxlaya bkmhp75w spb7xbtv rt8b4zig n8ej3o3l agehan2d sk4xxmp2 taijpn5t tv7at329 thwo4zme"]'
  );
}

function grabTwitterAddDescriptionInterface() {
  return document.querySelector('[href="/compose/tweet/media"]');
}

function grabTwitterEditButtonsInterface() {
  return document.querySelectorAll(
    '[class="css-18t94o4 css-1dbjc4n r-loe9s5 r-42olwf r-sdzlij r-1phboty r-rs99b7 r-1w2pmg r-15ysp7h r-gafmid r-1ny4l3l r-1fneopy r-u8s1d r-v2u3o6 r-s5r7i3 r-o7ynqc r-6416eg r-lrvibr"]'
  );
}

function grabFacebookEditButtonInterface() {
  return document.querySelector(
    'form[method="POST"] div[role="group"] div[role="button"][tabindex="0"][aria-label]'
  );
}

function hideTwitterAddDescription(element) {
  element.style["pointer-events"] = "none";
}

function showTwitterAddDescription(element) {
  element.style["pointer-events"] = "auto";
}

function hideTwitterEditButtons(elements) {
  for (const element of elements) {
    element.style["visibility"] = "hidden";
  }
}

function grabTwitterImagesThumbnail() {
  return document.querySelectorAll(
    'img[draggable="false"][class="css-9pa8cd"]'
  );
}

function preventClickTwitterImagesThumbnail(elements) {
  for (const element of elements) {
    element.parentNode.parentNode.style["pointer-events"] = "none";
  }
}

function changeCurrentImageBasedOnClickedEditButton() {
  const img = this.getAttribute("_edit_image_id");
  CURRENT = img;
}

function showTwitterEditButtons(elements) {
  let i = 0;
  for (const element of elements) {
    element.style["visibility"] = "initial";

    element.removeEventListener("click", hideAltFoundDialog, true);
    element.addEventListener("click", hideAltFoundDialog, true);

    element.setAttribute("_edit_image_id", ORDER[i]);

    element.removeEventListener(
      "click",
      changeCurrentImageBasedOnClickedEditButton,
      true
    );
    element.addEventListener(
      "click",
      changeCurrentImageBasedOnClickedEditButton,
      true
    );
    i++;
  }
}

function hideFacebookEditButton(element) {
  element.style["visibility"] = "hidden";
}

function showFacebookEditButton(element) {
  element.style["visibility"] = "initial";
}

function grabTwitterSubmitButton() {
  return document.querySelector('[data-testid^="tweetButton"]');
}

function grabFacebookDescriptionTab() {
  /*const dialog = document.querySelector(
    '[class="cjfnh4rs l9j0dhe7 du4w35lb j83agx80 cbu4d94t lzcic4wl ni8dbmo4 stjgntxs oqq733wu cwj9ozl2 io0zqebd m5lcvass fbipl8qg nwvqtn77 nwpbqux9 iy3k6uwz e9a99x49 g8p4j16d bv25afu3"]'
  );
  if (dialog) {
    const i = dialog.querySelector(
      `i[style='background-image: url("https://static.xx.fbcdn.net/rsrc.php/v3/ye/r/yRAV_o3RhfE.png"); background-position: 0px -75px; background-size: auto; width: 24px; height: 24px; background-repeat: no-repeat; display: inline-block;']`
    );
    return i?.parentElement?.parentElement?.parentElement?.parentElement;
  }*/
  const tabs = document.querySelectorAll(
    'div[data-visualcompletion="ignore-dynamic"][style="padding-left: 0px; padding-right: 0px;"]'
  );
  if (tabs) {
    return tabs[3];
  }
  return undefined;
  //return document.querySelector('[class="hu5pjgll lzf7d6o1 sp_YSu7W135EnD sx_7f977b"]')?.parentElement?.parentElement?.parentElement?.parentElement;
}

function grabFacebookSubmitButton() {
  /*return document.querySelector(
    '[class="oajrlxb2 s1i5eluu gcieejh5 bn081pho humdl8nn izx4hr6d rq0escxv nhd2j8a9 j83agx80 p7hjln8o kvgmc6g5 cxmmr5t8 oygrvhab hcukyx3x jb3vyjys d1544ag0 qt6c0cv9 tw6a2znq i1ao9s8h esuyzwwr f1sip0of lzcic4wl l9j0dhe7 abiwlrkh p8dawk7l kt9q3ron ak7q8e6j isp2s0ed ri5dt5u2 cbu4d94t taijpn5t ni8dbmo4 stjgntxs k4urcfbm tv7at329"]'
  );*/
  const buttons = document.querySelectorAll(
    'form[method="POST"] div[aria-label][tabindex="0"][role="button"]'
  );
  if (buttons) {
    return buttons[12];
  }
  return undefined;
}

function hideAddDescriptionDialog() {
  const addDescriptionDialog = document.getElementById(
    "add_description_dialog"
  );
  if (addDescriptionDialog) {
    addDescriptionDialog.remove();
  }
}

function showTwitterAlertMessage() {
  const submitButton = this;
  chrome.storage.sync.get("disableTwitterDialogs", function (item) {
    if (!item.disableTwitterDialogs) {
      if (
        (!HIDE_TWEET_BUTTON && !STEPS.includes("DESCRIPTION_SAVED")) ||
        (!HIDE_TWEET_BUTTON &&
          !(
            RESULT[CURRENT] &&
            RESULT[CURRENT].text &&
            RESULT[CURRENT].text.trim()
          ))
      ) {
        submitButton.style.display = "none";
        setTimeout(function () {
          submitButton.style.display = "flex";
        }, 3000);
        HIDE_TWEET_BUTTON = true;
        const addDescription = grabTwitterAddDescriptionInterface();
        const clientRect = addDescription.getBoundingClientRect();

        addDescription.removeEventListener(
          "click",
          hideAddDescriptionDialog,
          true
        );
        addDescription.addEventListener(
          "click",
          hideAddDescriptionDialog,
          true
        );

        const altFoundDialog = document.getElementById("alt_found_dialog");
        if (altFoundDialog) {
          altFoundDialog.remove();
        }

        const span = document.createElement("span");
        span.id = "add_description_dialog";
        chrome.storage.sync.get("lang", function (item) {
          if (item.lang === "pt") {
            span.innerHTML = pt.twitter.alert_message.replace(
              "{value}",
              addDescription.textContent
            );
          } else {
            span.innerHTML = en.twitter.alert_message.replace(
              "{value}",
              addDescription.textContent
            );
          }
        });
        span.style.backgroundColor = "white";
        span.style.color = "black";
        span.style.border = "thin solid black";
        span.style.fontSize = "1.5em";
        span.style.padding = "0.5em";
        span.style.position = "fixed";
        span.style.top = clientRect.top - 10 + "px";
        span.style.left = clientRect.left + clientRect.width + "px";
        span.style.zIndex = "100";
        span.style.cursor = "pointer";
        span.addEventListener("click", function () {
          span.remove();
        });
        document.body.appendChild(span);
      }
    }
  });
}

function handleTwitterAlertMessage(submitButton) {
  submitButton.removeEventListener("mouseenter", showTwitterAlertMessage, true);
  submitButton.addEventListener("mouseenter", showTwitterAlertMessage, true);
}

function showFacebookAlertMessage() {
  const submitButton = this;
  chrome.storage.sync.get("disableFacebookDialogs", function (item) {
    if (!item.disableFacebookDialogs) {
      if (
        (!HIDE_TWEET_BUTTON && !STEPS.includes("DESCRIPTION_SAVED")) ||
        (!HIDE_TWEET_BUTTON &&
          !(
            RESULT[CURRENT] &&
            RESULT[CURRENT].text &&
            RESULT[CURRENT].text.trim()
          ))
      ) {
        submitButton.style.display = "none";
        setTimeout(function () {
          submitButton.style.display = "flex";
        }, 3000);
        HIDE_TWEET_BUTTON = true;
        const editButton = grabFacebookEditButtonInterface();
        const clientRect = editButton.getBoundingClientRect();

        editButton.removeEventListener("click", hideAddDescriptionDialog, true);
        editButton.addEventListener("click", hideAddDescriptionDialog, true);

        const altFoundDialog = document.getElementById("alt_found_dialog");
        if (altFoundDialog) {
          altFoundDialog.remove();
        }

        const span = document.createElement("span");
        span.id = "add_description_dialog";
        chrome.storage.sync.get("lang", function (item) {
          if (item.lang === "pt") {
            span.innerHTML = pt.facebook.alert_message.replace(
              "{value}",
              editButton.textContent
            );
          } else {
            span.innerHTML = en.facebook.alert_message.replace(
              "{value}",
              editButton.textContent
            );
          }
        });
        span.style.backgroundColor = "white";
        span.style.color = "black";
        span.style.border = "thin solid black";
        span.style.fontSize = "1.5em";
        span.style.padding = "0.5em";
        span.style.position = "fixed";
        span.style.top = clientRect.top + "px";
        span.style.left = clientRect.left - 490 + "px";
        span.style.zIndex = "100";
        span.style.cursor = "pointer";
        span.addEventListener("click", function () {
          span.remove();
        });
        document.body.appendChild(span);
      }
    }
  });
}

function handleFacebookAlertMessage(submitButton) {
  submitButton.removeEventListener(
    "mouseenter",
    showFacebookAlertMessage,
    true
  );
  submitButton.addEventListener("mouseenter", showFacebookAlertMessage, true);
}

function grabTwitterTextarea() {
  return document.querySelector('[name="altTextInput"]');
}

function grabFacebookSaveButton() {
  /*const dialog = document.querySelector(
    '[class="cjfnh4rs l9j0dhe7 du4w35lb j83agx80 cbu4d94t lzcic4wl ni8dbmo4 stjgntxs oqq733wu cwj9ozl2 io0zqebd m5lcvass fbipl8qg nwvqtn77 nwpbqux9 iy3k6uwz e9a99x49 g8p4j16d bv25afu3"]'
  );
  if (dialog) {
    const buttons = dialog.querySelectorAll(
      '[class="oajrlxb2 g5ia77u1 qu0x051f esr5mh6w e9989ue4 r7d6kgcz rq0escxv nhd2j8a9 j83agx80 p7hjln8o kvgmc6g5 cxmmr5t8 oygrvhab hcukyx3x jb3vyjys rz4wbd8a qt6c0cv9 a8nywdso i1ao9s8h esuyzwwr f1sip0of lzcic4wl l9j0dhe7 abiwlrkh p8dawk7l cbu4d94t taijpn5t k4urcfbm"]'
    );
    if (buttons.length > 0) {
      return buttons[buttons.length - 2];
    }
  }
  return null;*/
  const div = document.querySelector(
    'form[method="POST"] div[style="min-width: 500px;"] div[class="l9j0dhe7 km676qkl pfnyh3mw kb5gq1qc"]'
  );
  if (div) {
    return div.firstChild.firstChild.firstChild.firstChild;
  }
  return undefined;
  //return document.querySelector('[class="oajrlxb2 g5ia77u1 qu0x051f esr5mh6w e9989ue4 r7d6kgcz rq0escxv nhd2j8a9 j83agx80 p7hjln8o kvgmc6g5 cxmmr5t8 oygrvhab hcukyx3x jb3vyjys rz4wbd8a qt6c0cv9 a8nywdso i1ao9s8h esuyzwwr f1sip0of lzcic4wl l9j0dhe7 abiwlrkh p8dawk7l cbu4d94t taijpn5t k4urcfbm"]');
}

function descriptionChanged() {
  RESULT[CURRENT].text = this.textContent;
}

function hidePreviousImageButtonDialog() {
  const cycleImageButtonDialog = document.getElementById("cycle_images_dialog");
  if (cycleImageButtonDialog) {
    cycleImageButtonDialog.remove();
  }
  setCURRENT(false);
}

function hideNextImageButtonDialog() {
  const cycleImageButtonDialog = document.getElementById("cycle_images_dialog");
  if (cycleImageButtonDialog) {
    cycleImageButtonDialog.remove();
  }
  setCURRENT(true);
}

function setPreviousImageButton(previousImageButton) {
  previousImageButton.removeEventListener(
    "click",
    hidePreviousImageButtonDialog,
    true
  );
  previousImageButton.addEventListener(
    "click",
    hidePreviousImageButtonDialog,
    true
  );
}

function setNextImageButton(nextImageButton) {
  nextImageButton.removeEventListener("click", hideNextImageButtonDialog, true);
  nextImageButton.addEventListener("click", hideNextImageButtonDialog, true);
}

function showTwitterCycleImageButtonDialog() {
  chrome.storage.sync.get("disableTwitterDialogs", function (item) {
    if (!item.disableTwitterDialogs) {
      const pasteDialog = document.getElementById("paste_dialog");
      const cycleDialog = document.getElementById("cycle_images_dialog");
      if (
        !pasteDialog &&
        !cycleDialog &&
        !doAllImagesHaveAltText() &&
        RESULT[CURRENT]?.text
      ) {
        const saveButton = grabTwitterSaveButton();
        const clientRect = saveButton.getBoundingClientRect();
        const span = document.createElement("span");
        span.id = "cycle_images_dialog";
        chrome.storage.sync.get("lang", function (item) {
          if (item.lang === "pt") {
            span.innerHTML = pt.twitter.cycle_arrows;
          } else {
            span.innerHTML = en.twitter.cycle_arrows;
          }
        });
        span.style.backgroundColor = "white";
        span.style.color = "black";
        span.style.border = "thin solid black";
        span.style.fontSize = "1.5em";
        span.style.position = "fixed";
        span.style.padding = "0.5em";
        span.style.top = clientRect.top - clientRect.height - 20 + "px";
        span.style.left = clientRect.left - clientRect.width - 200 + "px";
        span.style.zIndex = "100";
        span.style.cursor = "pointer";
        span.addEventListener("click", function () {
          span.remove();
        });
        document.body.appendChild(span);
      }
    }
  });
}

function hideSaveButtonDialog() {
  const saveButtonDialog = document.getElementById("save_dialog");
  if (saveButtonDialog) {
    saveButtonDialog.remove();
  }
  /*const host = location.host;
  if (host.includes("twitter.com")) {
    
  }*/
  saveButtonClicked();
}

function showTwitterSaveButtonDialog(saveButton) {
  saveButton.removeEventListener("click", hideSaveButtonDialog, true);
  saveButton.addEventListener("click", hideSaveButtonDialog, true);

  chrome.storage.sync.get("disableTwitterDialogs", function (item) {
    if (!item.disableTwitterDialogs) {
      const clientRect = saveButton.getBoundingClientRect();
      const span = document.createElement("span");
      span.id = "save_dialog";
      chrome.storage.sync.get("lang", function (item) {
        if (item.lang === "pt") {
          span.innerHTML = pt.twitter.save_button.replace(
            "{value}",
            saveButton.textContent
          );
        } else {
          span.innerHTML = en.twitter.save_button.replace(
            "{value}",
            saveButton.textContent
          );
        }
      });
      span.style.backgroundColor = "white";
      span.style.color = "black";
      span.style.border = "thin solid black";
      span.style.fontSize = "1.5em";
      span.style.position = "fixed";
      span.style.padding = "0.5em";
      span.style.top = clientRect.top - 10 + "px";
      span.style.left = clientRect.left + clientRect.width + "px";
      span.style.zIndex = "100";
      span.style.cursor = "pointer";
      span.addEventListener("click", function () {
        span.remove();
      });
      document.body.appendChild(span);
    }
  });
}

function showFacebookSaveButtonDialog(saveButton) {
  saveButton.removeEventListener("click", hideSaveButtonDialog, true);
  saveButton.addEventListener("click", hideSaveButtonDialog, true);

  chrome.storage.sync.get("disableFacebookDialogs", function (item) {
    if (!item.disableFacebookDialogs) {
      const clientRect = saveButton.getBoundingClientRect();
      const span = document.createElement("span");
      span.id = "save_dialog";
      chrome.storage.sync.get("lang", function (item) {
        if (item.lang === "pt") {
          span.innerHTML = pt.facebook.save_button.replace(
            "{value}",
            saveButton.textContent
          );
        } else {
          span.innerHTML = en.facebook.save_button.replace(
            "{value}",
            saveButton.textContent
          );
        }
      });
      span.style.backgroundColor = "white";
      span.style.color = "black";
      span.style.border = "thin solid black";
      span.style.fontSize = "1.5em";
      span.style.position = "fixed";
      span.style.padding = "0.5em";
      span.style.top = clientRect.top + clientRect.height + 10 + "px";
      span.style.left = clientRect.left + "px";
      span.style.zIndex = "100";
      span.style.cursor = "pointer";
      span.addEventListener("click", function () {
        span.remove();
      });
      document.body.appendChild(span);
    }
  });
}

function doAllImagesHaveAltText() {
  let yes = true;
  for (const img in RESULT) {
    if (!RESULT[img]?.text && !RESULT[img]?.removed) {
      yes = false;
      break;
    }
  }

  return yes;
}

function hidePasteDialog() {
  const pasteDialog = document.getElementById("paste_dialog");
  if (pasteDialog) {
    pasteDialog.remove();

    const host = location.host;
    if (host.includes("twitter.com")) {
      setTimeout(function () {
        if (doAllImagesHaveAltText()) {
          const saveButton = grabTwitterSaveButton();
          if (saveButton) {
            showTwitterSaveButtonDialog(saveButton);
          }
        } else {
          showTwitterCycleImageButtonDialog();
        }
      }, 200);
    } else if (host.includes("facebook.com")) {
      const saveButton = grabFacebookSaveButton();
      if (saveButton) {
        showFacebookSaveButtonDialog(saveButton);
      }
    }
  }
}

function insertTwitterDescription(textarea) {
  textarea = grabTwitterTextarea();
  if (textarea) {
    textarea.removeEventListener("keyup", descriptionChanged, true);
    textarea.addEventListener("keyup", descriptionChanged, true);

    if (RESULT[CURRENT] && RESULT[CURRENT].show_paste_dialog) {
      const clientRect = textarea.getBoundingClientRect();

      textarea.removeEventListener("paste", hidePasteDialog, true);
      textarea.addEventListener("paste", hidePasteDialog, true);

      chrome.storage.sync.get("disableTwitterDialogs", function (item) {
        if (!item.disableTwitterDialogs) {
          const span = document.createElement("span");
          span.id = "paste_dialog";
          span.style.backgroundColor = "white";
          span.style.color = "black";
          span.style.border = "thin solid black";
          span.style.fontSize = "1.5em";
          span.style.position = "fixed";
          span.style.padding = "0.5em";
          span.style.top = clientRect.top + "px";
          span.style.left = clientRect.left + clientRect.width + 15 + "px";
          span.style.zIndex = "100";

          if (!RESULT[CURRENT].alts) {
            chrome.storage.sync.get("lang", function (item) {
              if (item.lang === "pt") {
                span.innerHTML = pt.twitter.paste_message;
              } else {
                span.innerHTML = en.twitter.paste_message;
              }
            });
            span.style.cursor = "pointer";
            span.addEventListener("click", function () {
              span.remove();
            });
            copyToClipboard();
          } else {
            span.style.top = clientRect.top - 500 + "px";
            const p = document.createElement("p");
            chrome.storage.sync.get("lang", function (item) {
              if (item.lang === "pt") {
                p.innerHTML = pt.twitter.alts_list_message;
              } else {
                p.innerHTML = en.twitter.alts_list_message;
              }
            });
            span.appendChild(p);
            span.appendChild(document.createElement("hr"));

            const container = document.createElement("div");
            container.style.height = "400px";
            container.style.overflow = "scroll";

            const entry = document.createElement("div");
            const text = document.createElement("p");
            text.style.border = "thin solid black";
            text.style.padding = "0.2em";
            text.innerHTML = RESULT[CURRENT].description;
            entry.appendChild(text);

            const copy = document.createElement("button");
            copy.innerHTML = "Copy";
            copy.style.marginLeft = "1em";
            copy.addEventListener("click", function () {
              chrome.storage.sync.get("lang", function (item) {
                let description = RESULT[CURRENT].description;
                if (item.lang === "pt") {
                  description += "\n\n" + pt.description.watermark;
                } else {
                  description += "\n\n" + en.description.watermark;
                }
                navigator.clipboard.writeText(description);
              });
            });
            entry.appendChild(copy);

            container.appendChild(entry);
            container.appendChild(document.createElement("br"));

            for (const alt of RESULT[CURRENT].alts ?? []) {
              const entry = document.createElement("div");
              const text = document.createElement("p");
              text.style.border = "thin solid black";
              text.style.padding = "0.2em";
              text.innerHTML = alt.AltText;
              entry.appendChild(text);

              const copy = document.createElement("button");
              copy.innerHTML = "Copy";
              copy.style.marginLeft = "1em";
              copy.addEventListener("click", function () {
                chrome.storage.sync.get("lang", function (item) {
                  let description = alt.AltText;
                  if (item.lang === "pt") {
                    description += "\n\n" + pt.description.watermark;
                  } else {
                    description += "\n\n" + en.description.watermark;
                  }
                  navigator.clipboard.writeText(description);
                });
              });
              entry.appendChild(copy);

              container.appendChild(entry);
              container.appendChild(document.createElement("br"));
            }

            span.appendChild(container);
          }

          document.body.appendChild(span);
        }
      });
      RESULT[CURRENT].show_paste_dialog = false;
    } else {
      showTwitterCycleImageButtonDialog();
    }
  }
}

function insertFacebookDescription(textarea) {
  textarea.removeEventListener("keyup", descriptionChanged, true);
  textarea.addEventListener("keyup", descriptionChanged, true);

  if (RESULT[CURRENT] && RESULT[CURRENT].show_paste_dialog) {
    const radioButtons = document.querySelectorAll(
      '[class="oajrlxb2 rq0escxv f1sip0of hidtqoto nhd2j8a9 datstx6m kvgmc6g5 cxmmr5t8 oygrvhab hcukyx3x b5wmifdl lzcic4wl jb3vyjys rz4wbd8a qt6c0cv9 a8nywdso pmk7jnqg j9ispegn kr520xx4 k4urcfbm"]'
    );
    if (radioButtons.length > 0) {
      radioButtons[1].click();

      const clientRect = textarea.getBoundingClientRect();

      textarea.removeEventListener("paste", hidePasteDialog, true);
      textarea.addEventListener("paste", hidePasteDialog, true);
      textarea.focus();

      chrome.storage.sync.get("disableFacebookDialogs", function (item) {
        if (!item.disableFacebookDialogs) {
          const span = document.createElement("span");
          span.id = "paste_dialog";
          /*chrome.storage.sync.get("lang", function (item) {
            if (item.lang === "pt") {
              span.innerHTML = pt.facebook.paste_message;
            } else {
              span.innerHTML = en.facebook.paste_message;
            }
          });*/
          span.style.backgroundColor = "white";
          span.style.color = "black";
          span.style.border = "thin solid black";
          span.style.fontSize = "1.5em";
          span.style.position = "fixed";
          span.style.padding = "0.5em";
          span.style.top = clientRect.top + "px";
          span.style.left = clientRect.left + clientRect.width + 50 + "px";
          span.style.zIndex = "100";
          span.style.cursor = "pointer";
          /*span.addEventListener("click", function () {
            span.remove();
          });*/
          if (!RESULT[CURRENT].alts) {
            chrome.storage.sync.get("lang", function (item) {
              if (item.lang === "pt") {
                span.innerHTML = pt.facebook.paste_message;
              } else {
                span.innerHTML = en.facebook.paste_message;
              }
            });
            span.style.cursor = "pointer";
            span.addEventListener("click", function () {
              span.remove();
            });
            copyToClipboard();
          } else {
            span.style.top = clientRect.top - 500 + "px";
            const p = document.createElement("p");
            chrome.storage.sync.get("lang", function (item) {
              if (item.lang === "pt") {
                p.innerHTML = pt.twitter.alts_list_message;
              } else {
                p.innerHTML = en.twitter.alts_list_message;
              }
            });
            span.appendChild(p);
            span.appendChild(document.createElement("hr"));

            const container = document.createElement("div");
            container.style.height = "400px";
            container.style.overflow = "scroll";

            const entry = document.createElement("div");
            const text = document.createElement("p");
            text.style.border = "thin solid black";
            text.style.padding = "0.2em";
            text.innerHTML = RESULT[CURRENT].description;
            entry.appendChild(text);

            const copy = document.createElement("button");
            copy.innerHTML = "Copy";
            copy.style.marginLeft = "1em";
            copy.addEventListener("click", function () {
              chrome.storage.sync.get("lang", function (item) {
                let description = RESULT[CURRENT].description;
                if (item.lang === "pt") {
                  description += "\n\n" + pt.description.watermark;
                } else {
                  description += "\n\n" + en.description.watermark;
                }

                navigator.clipboard.writeText(description);
              });
            });
            entry.appendChild(copy);

            container.appendChild(entry);
            container.appendChild(document.createElement("br"));

            for (const alt of RESULT[CURRENT].alts ?? []) {
              const entry = document.createElement("div");
              const text = document.createElement("p");
              text.style.border = "thin solid black";
              text.style.padding = "0.2em";
              text.innerHTML = alt.AltText;
              entry.appendChild(text);

              const copy = document.createElement("button");
              copy.innerHTML = "Copy";
              copy.style.marginLeft = "1em";
              copy.addEventListener("click", function () {
                chrome.storage.sync.get("lang", function (item) {
                  let description = alt.AltText;
                  if (item.lang === "pt") {
                    description += "\n\n" + pt.description.watermark;
                  } else {
                    description += "\n\n" + en.description.watermark;
                  }

                  navigator.clipboard.writeText(description);
                });
              });
              entry.appendChild(copy);

              container.appendChild(entry);
              container.appendChild(document.createElement("br"));
            }

            span.appendChild(container);
          }

          document.body.appendChild(span);
        }
      });
      RESULT[CURRENT].show_paste_dialog = false;
    }
  }
}

function descriptionTabClicked() {
  const descriptionTabDialog = document.getElementById(
    "description_tab_dialog"
  );
  if (descriptionTabDialog) {
    descriptionTabDialog.remove();
  }
}

function showFacebookDescriptionTabDialog(descriptionTab) {
  chrome.storage.sync.get("disableFacebookDialogs", function (item) {
    if (!item.disableFacebookDialogs) {
      const clientRect = descriptionTab.getBoundingClientRect();
      const span = document.createElement("span");
      span.id = "description_tab_dialog";
      chrome.storage.sync.get("lang", function (item) {
        if (item.lang === "pt") {
          span.innerHTML = pt.facebook.description_tab.replace(
            "{value}",
            descriptionTab.textContent
          );
        } else {
          span.innerHTML = en.facebook.description_tab.replace(
            "{value}",
            descriptionTab.textContent
          );
        }
      });
      span.style.backgroundColor = "white";
      span.style.color = "black";
      span.style.border = "thin solid black";
      span.style.fontSize = "1.5em";
      span.style.position = "fixed";
      span.style.padding = "0.5em";
      span.style.top = clientRect.top + 10 + "px";
      span.style.left = clientRect.left + clientRect.width - 40 + "px";
      span.style.zIndex = "100";
      span.style.cursor = "pointer";
      span.addEventListener("click", function () {
        span.remove();
      });
      document.body.appendChild(span);
    }
  });
}

function handleFacebookDescriptionTab(descriptionTab) {
  showFacebookDescriptionTabDialog(descriptionTab);
  descriptionTab.removeEventListener("click", descriptionTabClicked, true);
  descriptionTab.addEventListener("click", descriptionTabClicked, true);
}

function grabFacebookTextarea() {
  const textareas = document.querySelectorAll(
    '[rows="1"][class="oajrlxb2 rq0escxv f1sip0of hidtqoto lzcic4wl g5ia77u1 gcieejh5 bn081pho humdl8nn izx4hr6d oo9gr5id j83agx80 jagab5yi knj5qynh fo6rh5oj oud54xpy l9qdfxac ni8dbmo4 stjgntxs hv4rvrfc dati1w0a ieid39z1 k4urcfbm"]'
  );
  for (const textarea of textareas) {
    const parent =
      textarea?.parentElement?.parentElement?.parentElement?.parentElement
        ?.parentElement?.parentElement?.parentElement;
    if (parent) {
      const radioButton = parent.querySelector('input[type="radio"]');
      if (radioButton) {
        return textarea;
      }
    }
  }
  return null;
}

function grabFacebookConcludeButton() {
  /*const dialog = document.querySelector(
    '[class="cjfnh4rs l9j0dhe7 du4w35lb j83agx80 cbu4d94t lzcic4wl ni8dbmo4 stjgntxs oqq733wu cwj9ozl2 io0zqebd m5lcvass fbipl8qg nwvqtn77 nwpbqux9 iy3k6uwz e9a99x49 g8p4j16d bv25afu3"]'
  );
  if (dialog) {
    return dialog.querySelector(
      '[class="oajrlxb2 s1i5eluu gcieejh5 bn081pho humdl8nn izx4hr6d rq0escxv nhd2j8a9 j83agx80 p7hjln8o kvgmc6g5 cxmmr5t8 oygrvhab hcukyx3x jb3vyjys tkv8g59h qt6c0cv9 fl8dtwsd i1ao9s8h esuyzwwr f1sip0of lzcic4wl l9j0dhe7 abiwlrkh p8dawk7l kt9q3ron ak7q8e6j isp2s0ed ri5dt5u2 cbu4d94t taijpn5t ni8dbmo4 stjgntxs k4urcfbm tv7at329"]'
    );
  }
  return null;*/
  const buttons = document.querySelectorAll(
    'div[style^="min-width"] div[aria-label][tabindex="0"][role="button"]'
  );
  if (buttons) {
    return buttons[buttons.length - 1];
  }
  return null;
}

function dismissFacebookConcludeDialog() {
  const spanExists = document.getElementById("conclude_button_dialog");
  if (spanExists) {
    spanExists.remove();
  }
}

function handleFacebookConcludeButton(button) {
  chrome.storage.sync.get("disableFacebookDialogs", function (item) {
    if (!item.disableFacebookDialogs) {
      button.removeEventListener("click", dismissFacebookConcludeDialog, true);
      button.addEventListener("click", dismissFacebookConcludeDialog, true);
      const spanExists = document.getElementById("conclude_button_dialog");
      if (!spanExists) {
        const clientRect = button.getBoundingClientRect();
        const span = document.createElement("span");
        span.id = "conclude_button_dialog";
        chrome.storage.sync.get("lang", function (item) {
          if (item.lang === "pt") {
            span.innerHTML = pt.facebook.conclude_button.replace(
              "{value}",
              button.textContent
            );
          } else {
            span.innerHTML = en.facebook.conclude_button.replace(
              "{value}",
              button.textContent
            );
          }
        });
        span.style.backgroundColor = "white";
        span.style.color = "black";
        span.style.border = "thin solid black";
        span.style.fontSize = "1.5em";
        span.style.position = "fixed";
        span.style.padding = "0.5em";
        span.style.top = clientRect.top + clientRect.height + 10 + "px";
        span.style.left = clientRect.left + "px";
        span.style.zIndex = "100";
        span.style.cursor = "pointer";
        span.addEventListener("click", function () {
          span.remove();
        });
        document.body.appendChild(span);
      }
    }
  });
}

function grabTwitterPreviousImageButton() {
  const div = document.querySelectorAll(
    '[class="css-1dbjc4n r-6koalj r-18u37iz"]'
  );
  if (div.length === 2) {
    const buttons = div[1].querySelectorAll('div[role="button"]');
    return buttons[0];
  }

  return null;
  //return document.querySelector('[class="css-18t94o4 css-1dbjc4n r-1niwhzg r-p1n3y5 r-sdzlij r-1phboty r-rs99b7 r-1w2pmg r-a5pmau r-15ysp7h r-4wgw6l r-1ny4l3l r-mk0yit r-o7ynqc r-6416eg r-lrvibr"]');
}

function grabTwitterNextImageButton() {
  const div = document.querySelectorAll(
    '[class="css-1dbjc4n r-6koalj r-18u37iz"]'
  );
  if (div.length === 2) {
    const buttons = div[1].querySelectorAll('div[role="button"]');
    return buttons[1];
  }

  return null;
  //return document.querySelector('[class="css-18t94o4 css-1dbjc4n r-1niwhzg r-p1n3y5 r-sdzlij r-1phboty r-rs99b7 r-1w2pmg r-15ysp7h r-4wgw6l r-1ny4l3l r-mk0yit r-o7ynqc r-6416eg r-lrvibr"]');
}

function grabTwitterSaveButton() {
  const div = document.querySelectorAll(
    '[class="css-1dbjc4n r-6koalj r-18u37iz"]'
  );
  if (div.length === 1) {
    return div[0]?.firstChild;
  } else if (div.length > 1) {
    return div[0]?.lastChild;
  } else {
    return null;
  }
}

function saveButtonClicked() {
  const host = location.host;
  if (host.includes("twitter.com")) {
    if (
      RESULT[CURRENT] &&
      RESULT[CURRENT].text &&
      RESULT[CURRENT].text.trim()
    ) {
      STEPS.push("DESCRIPTION_SAVED");
    }
  } else if (host.includes("facebook.com")) {
    if (doAllImagesHaveAltText()) {
      STEPS.push("DESCRIPTION_SAVED");
      setTimeout(() => {
        const button = grabFacebookConcludeButton();
        if (button) {
          handleFacebookConcludeButton(button);
        }
      }, 800);
    } else {
      setTimeout(() => {
        setCURRENT(true);
        const dtIndex = STEPS.indexOf("DESCRIPTION_TAB");
        if (dtIndex !== -1) {
          STEPS.splice(dtIndex, 1);
        }
        const daIndex = STEPS.indexOf("DESCRIPTION_ADDED");
        if (daIndex !== -1) {
          STEPS.splice(daIndex, 1);
        }
        /*const dialog = document.querySelector(
          '[class="cjfnh4rs l9j0dhe7 du4w35lb j83agx80 cbu4d94t lzcic4wl ni8dbmo4 stjgntxs oqq733wu cwj9ozl2 io0zqebd m5lcvass fbipl8qg nwvqtn77 nwpbqux9 iy3k6uwz e9a99x49 g8p4j16d bv25afu3"]'
        );
        if (dialog) {
          const images = dialog.querySelectorAll(
            '[class="k4urcfbm stjgntxs ni8dbmo4 taijpn5t datstx6m j83agx80 bp9cbjyn"]'
          );
          if (images.length > 0) {
            showFacebookClickEditButtonDialog(images[ORDER.indexOf(CURRENT)]);
          }
        }*/
        const images = document.querySelectorAll(
          'img[draggable="false"][referrerpolicy="origin-when-cross-origin"]'
        );
        if (images.length > 0) {
          showFacebookClickEditButtonDialog(images[ORDER.indexOf(CURRENT)]);
        }
      }, 500);
    }
  }
}

function handleTwitterSaveButton(saveButton) {
  saveButton.removeEventListener("click", saveButtonClicked, true);
  saveButton.addEventListener("click", saveButtonClicked, true);
}

function handleFacebookSaveButton(saveButton) {
  saveButton.removeEventListener("click", saveButtonClicked, true);
  saveButton.addEventListener("click", saveButtonClicked, true);
}

function handleFacebookEditButtonDialog() {
  setTimeout(() => {
    const spanExists = document.getElementById("click_edit_dialog");
    if (spanExists) {
      spanExists.remove();
    }
  }, 700);
}

function grabFacebookEditButton() {
  const buttons = document.querySelectorAll(
    'div[data-key] div[role="button"][tabindex="0"][aria-label]'
  );

  for (let i = 0; i < buttons.length; i++) {
    if ((i + 2) % 3 === 0) {
      const button = buttons[i];
      button.removeEventListener("click", handleFacebookEditButtonDialog, true);
      button.addEventListener("click", handleFacebookEditButtonDialog, true);
    }
  }

  /*const divs = document.querySelectorAll(
    '[class="ue3kfks5 pw54ja7n uo3d90p7 l82x9zwi ad9n1n66 sjgh65i0 ni8dbmo4 stjgntxs l9j0dhe7"]'
  );
  const div = divs[ORDER.indexOf(CURRENT)];
  if (div) {
    const button = div.querySelector(
      '[class="oajrlxb2 g5ia77u1 qu0x051f esr5mh6w e9989ue4 r7d6kgcz rq0escxv nhd2j8a9 j83agx80 p7hjln8o kvgmc6g5 cxmmr5t8 oygrvhab hcukyx3x jb3vyjys rz4wbd8a qt6c0cv9 a8nywdso i1ao9s8h esuyzwwr f1sip0of lzcic4wl l9j0dhe7 abiwlrkh p8dawk7l cbu4d94t taijpn5t k4urcfbm"]'
    );
    if (button) {
      button.removeEventListener("click", handleFacebookEditButtonDialog, true);
      button.addEventListener("click", handleFacebookEditButtonDialog, true);
    }
  }*/
}

function showFacebookClickEditButtonDialog(image) {
  chrome.storage.sync.get("disableFacebookDialogs", function (item) {
    if (!item.disableFacebookDialogs) {
      const spanExists = document.getElementById("click_edit_dialog");
      if (!spanExists) {
        const clientRect = image.getBoundingClientRect();
        const span = document.createElement("span");
        span.id = "click_edit_dialog";
        chrome.storage.sync.get("lang", function (item) {
          if (item.lang === "pt") {
            span.innerHTML = pt.facebook.hover_image;
          } else {
            span.innerHTML = en.facebook.hover_image;
          }
        });
        span.style.backgroundColor = "white";
        span.style.color = "black";
        span.style.border = "thin solid black";
        span.style.fontSize = "1.5em";
        span.style.position = "fixed";
        span.style.top = clientRect.top + "px";
        span.style.left = clientRect.left - 250 + "px";
        span.style.zIndex = "100";
        span.style.cursor = "pointer";
        span.addEventListener("click", function () {
          span.remove();
        });
        document.body.appendChild(span);
      }
    }
  });
}

function startFacebookMultipleImageWorkflow() {
  if (!STEPS.includes("FACEBOOK_WORKFLOW")) {
    setTimeout(() => {
      /*const dialog = document.querySelector(
        '[class="cjfnh4rs l9j0dhe7 du4w35lb j83agx80 cbu4d94t lzcic4wl ni8dbmo4 stjgntxs oqq733wu cwj9ozl2 io0zqebd m5lcvass fbipl8qg nwvqtn77 nwpbqux9 iy3k6uwz e9a99x49 g8p4j16d bv25afu3"]'
      );
      if (dialog) {
        const images = dialog.querySelectorAll(
          '[class="k4urcfbm stjgntxs ni8dbmo4 taijpn5t datstx6m j83agx80 bp9cbjyn"]'
        );
        if (images.length > 0) {
          showFacebookClickEditButtonDialog(images[ORDER.indexOf(CURRENT)]);
          STEPS.push("FACEBOOK_WORKFLOW");
        }
      }*/
      const images = document.querySelectorAll(
        'img[draggable="false"][referrerpolicy="origin-when-cross-origin"]'
      );
      if (images.length > 0) {
        showFacebookClickEditButtonDialog(images[ORDER.indexOf(CURRENT)]);
        STEPS.push("FACEBOOK_WORKFLOW");
      }
    }, 1000);
  }
}

function grabTwitterPostText() {
  const textbox = document.querySelector('[data-testid="tweetTextarea_0"]');
  return textbox?.textContent ?? "";
}

function submitImages() {
  const postText = grabTwitterPostText();
  for (const img in RESULT) {
    if (RESULT[img].text) {
      const socialMedia = location.host.includes("twitter.com")
        ? "twitter"
        : location.host.includes("facebook.com")
        ? "facebook"
        : null;
      chrome.runtime.sendMessage({
        type: "submit",
        img,
        lang: navigator.language,
        text: RESULT[img].text,
        postText,
        socialMedia,
      });
    }
  }
  cleanStepsProcess();
}

function handleSubmitProcess(submitButton) {
  submitButton.removeEventListener("click", submitImages, true);
  submitButton.addEventListener("click", submitImages, true);
}

function hideAltFoundDialog() {
  const altFoundDialog = document.getElementById("alt_found_dialog");
  if (altFoundDialog) {
    altFoundDialog.remove();
  }
}

function showTwitterAltMessage() {
  const addDescription = grabTwitterAddDescriptionInterface();
  const clientRect = addDescription.getBoundingClientRect();

  addDescription.removeEventListener("click", hideAltFoundDialog, true);
  addDescription.addEventListener("click", hideAltFoundDialog, true);

  chrome.storage.sync.get("disableTwitterDialogs", function (item) {
    if (!item.disableTwitterDialogs) {
      const span = document.createElement("span");
      span.id = "alt_found_dialog";
      chrome.storage.sync.get("lang", function (item2) {
        if (item2.lang === "pt") {
          if (COUNTER === 1) {
            span.innerHTML = pt.twitter.alt_found.s.replace(
              "{value}",
              addDescription.textContent
            );
          } else {
            span.innerHTML = pt.twitter.alt_found.p.replace(
              "{value}",
              addDescription.textContent
            );
          }
        } else {
          if (COUNTER === 1) {
            span.innerHTML = en.twitter.alt_found.s.replace(
              "{value}",
              addDescription.textContent
            );
          } else {
            span.innerHTML = en.twitter.alt_found.p.replace(
              "{value}",
              addDescription.textContent
            );
          }
        }
      });
      span.style.backgroundColor = "white";
      span.style.color = "black";
      span.style.border = "thin solid black";
      span.style.fontSize = "1.5em";
      span.style.position = "fixed";
      span.style.top = clientRect.top + "px";
      span.style.left = clientRect.left + clientRect.width + "px";
      span.style.zIndex = "100";
      span.style.cursor = "pointer";
      span.addEventListener("click", function () {
        span.remove();
      });
      document.body.appendChild(span);
    }
  });
}

function showFacebookAltMessage() {
  const editButton = grabFacebookEditButtonInterface();
  const clientRect = editButton.getBoundingClientRect();

  editButton.removeEventListener("click", hideAltFoundDialog, true);
  editButton.addEventListener("click", hideAltFoundDialog, true);

  chrome.storage.sync.get("disableFacebookDialogs", function (item) {
    if (!item.disableFacebookDialogs) {
      const span = document.createElement("span");
      span.id = "alt_found_dialog";
      chrome.storage.sync.get("lang", function (item) {
        if (item.lang === "pt") {
          if (COUNTER === 1) {
            span.innerHTML = pt.facebook.alt_found.s.replace(
              "{value}",
              editButton.textContent
            );
            span.style.top = clientRect.top - 20 + "px";
            span.style.left = clientRect.left - 380 + "px";
          } else {
            span.innerHTML = pt.facebook.alt_found.p.replace(
              "{value}",
              editButton.textContent
            );
            span.style.top = clientRect.top - 20 + "px";
            span.style.left = clientRect.left - 440 + "px";
          }
        } else {
          if (COUNTER === 1) {
            span.innerHTML = en.facebook.alt_found.s.replace(
              "{value}",
              editButton.textContent
            );
            span.style.top = clientRect.top - 20 + "px";
            span.style.left = clientRect.left - 380 + "px";
          } else {
            span.innerHTML = en.facebook.alt_found.p.replace(
              "{value}",
              editButton.textContent
            );
            span.style.top = clientRect.top - 20 + "px";
            span.style.left = clientRect.left - 440 + "px";
          }
        }
      });
      span.style.backgroundColor = "white";
      span.style.color = "black";
      span.style.border = "thin solid black";
      span.style.fontSize = "1.5em";
      span.style.position = "fixed";
      span.style.zIndex = "100";
      span.style.cursor = "pointer";
      span.addEventListener("click", function () {
        span.remove();
      });
      document.body.appendChild(span);
    }
  });
}

function getImageUrl(image) {
  if (!image.src) {
    return null;
  }

  if (image.src.startsWith("http")) {
    return image.src;
  } else {
    return location.href + image.src;
  }
}

function handlePostImagesData(img, _alts, _concepts, _imageText) {
  const alts = _alts ? JSON.parse(_alts) : undefined;
  const concepts = _concepts ? JSON.parse(_concepts) : undefined;
  const imageText = _imageText ? JSON.parse(_imageText) : undefined;
  RESULT[img] = { alts, concepts, imageText, show_paste_dialog: true };

  createDescription(img);

  COUNTER++;

  if (COUNTER === Object.keys(RESULT).length) {
    STEPS.push("IMAGE_RESULT");
    CURRENT = ORDER[0];
    const host = location.host;
    if (host.includes("twitter.com")) {
      showTwitterAltMessage();
    } else if (host.includes("facebook.com")) {
      showFacebookAltMessage();
    }
  }
}

let SEARCH_ALTS_COUNT = 0;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function analyzeAll(force = false) {
  let playSound = true;

  const imgs = document.querySelectorAll("img");

  for (const img of imgs || []) {
    const alt = img.getAttribute("alt");
    if (alt !== "" && !img.hasAttribute("_add_alt_extension_id")) {
      if (alt === null || force) {
        if (playSound) {
          const sound = new Audio(chrome.extension.getURL("beep.wav"));
          sound.play();
          playSound = false;
        }
        SEARCH_ALTS_COUNT++;
        const date = new Date().toISOString();
        const id = await md5(img + date);
        img.setAttribute("_add_alt_extension_id", id);
        const url = getImageUrl(img);
        chrome.runtime.sendMessage({
          type: "searchUrl",
          url,
          lang: navigator.language,
          id: img.getAttribute("_add_alt_extension_id"),
        });
        await sleep(100); // TODO: there must be an async call somewhere in the lopp that causes some images to end up with the same up... this is a fix but a proper solution is needed
      }
    }
  }
}

let activeElement = null;
let dialogElement = null;

function analyzeOne() {
  const img = document.activeElement;
  const alt_id = img.getAttribute("_add_alt_extension_id");
  if (alt_id) {
    activeElement = document.activeElement;

    const dialog = document.createElement("div");
    dialog.setAttribute("_alts_for_image", alt_id);
    dialog.setAttribute("role", "dialog");
    dialog.setAttribute("tabindex", 0);
    dialog.style.position = "fixed";
    dialog.style.zIndex = "100";
    dialog.style.backgroundColor = "white";
    dialog.style.color = "black";
    dialog.style.border = "thin solid black";
    dialog.style.fontSize = "1.5em";
    dialog.style.top = "100px";
    dialog.style.left = "100px";
    dialog.style.padding = "1em";
    chrome.storage.sync.get("lang", function (item) {
      const data = JSON.parse(sessionStorage.getItem(alt_id));

      if (data) {
        const alts = data.alts.split(";");

        if (item.lang === "pt") {
          dialog.innerText = pt.insert_alts_description;
        } else {
          dialog.innerText = en.insert_alts_description;
        }

        for (const alt of alts ?? []) {
          const p = document.createElement("p");
          p.innerText = alt;
          dialog.appendChild(p);
        }
      } else {
        if (item.lang === "pt") {
          dialog.innerText = pt.description.nothing;
        } else {
          dialog.innerText = en.description.nothing;
        }
      }
    });

    activeElement.parentElement.appendChild(dialog);
    dialog.focus();

    dialogElement = dialog;
  }
}

function addImageAlts(id, _alts, _concepts) {
  chrome.storage.sync.get("lang", function (item) {
    const img = document.querySelector(`[_add_alt_extension_id="${id}"]`);
    if (_alts) {
      const alts = JSON.parse(_alts);
      if (img.attributes["alt"] === undefined) {
        img.setAttribute("alt", alts[0].AltText.trim());
        img.setAttribute("tabindex", 0);

        const data = {
          alts: alts.map((a) => a.AltText.trim()).join("; "),
        };

        sessionStorage.setItem(id, JSON.stringify(data));
      } else {
        const data = {
          alts: alts.map((a) => a.AltText.trim()).join("; "),
        };

        sessionStorage.setItem(id, JSON.stringify(data));

        img.setAttribute(
          "alt",
          img.getAttribute("alt") + "; " + alts[0].AltText.trim()
        );
        img.setAttribute("tabindex", 0);
      }
      img.setAttribute(
        "_add_alt_extension_message",
        "An alt was found in database and it was added."
      );
    } else if (_concepts) {
      const concepts =
        (item.lang === "pt" ? pt.description.text : en.description.text) +
        _concepts.split(",").map((c, i) => (i === 0 ? c : " " + c));
      if (img.attributes["alt"] === undefined) {
        img.setAttribute("alt", concepts);
        img.setAttribute("tabindex", 0);
        img.setAttribute(
          "_add_alt_extension_message",
          "No alt was found in database. Added image concepts."
        );
      } else {
        const data = {
          alts: concepts,
        };
        sessionStorage.setItem(id, JSON.stringify(data));

        img.setAttribute("tabindex", 0);
        img.setAttribute(
          "_add_alt_extension_message",
          "No alt was found in database. Keeping original alt and adding concepts for consultation."
        );
      }
    } else {
      img.setAttribute(
        "_add_alt_extension_message",
        "No alt was found in the database."
      );
    }
    SEARCH_ALTS_COUNT--;
    if (SEARCH_ALTS_COUNT <= 0) {
      SEARCH_ALTS_COUNT = 0;
      const sound = new Audio(chrome.extension.getURL("beep.wav"));
      sound.play();
    }
  });
}

chrome.runtime.onMessage.addListener(function (message) {
  if (message.type === "checkAltText") {
    handlePostImagesData(
      message.img,
      message.alts,
      message.concepts,
      message.text
    );
  } else if (message.type === "searchAllByUrl") {
    analyzeAll(message.force);
  } else if (message.type === "altForImage") {
    addImageAlts(message.id, message.alts, message.concepts);
  }
});

function initTwitterSupport() {
  const observer = new MutationObserver(function (mutations) {
    mutations.forEach(function () {
      const discardPostButton = grabTwitterDiscardPostButton();
      if (discardPostButton) {
        discardPostButton.removeEventListener("click", cleanStepsProcess, true);
        discardPostButton.addEventListener("click", cleanStepsProcess, true);
      }

      const removeImageButtons = grabTwitterRemoveImageButtons();
      if (
        removeImageButtons.length > 0 &&
        !STEPS.includes("REMOVE_IMAGE_BUTTON_HANDLED")
      ) {
        if (removeImageButtons.length === 1) {
          removeImageButtons[0].removeEventListener(
            "click",
            cleanRespectiveImage,
            true
          );
          removeImageButtons[0].removeEventListener(
            "click",
            cleanStepsProcess,
            true
          );
          removeImageButtons[0].addEventListener(
            "click",
            cleanStepsProcess,
            true
          );
        } else {
          handleTwitterRemoveImageButtons(removeImageButtons);
        }
      }

      const mediaInputs = grabTwitterMediaInputs();
      if (mediaInputs && mediaInputs.length > 0) {
        STEPS.push("PROCESSING_MEDIA");
        handlePostDetection(mediaInputs);
      }

      const tweetButton = grabTweetButton();
      if (tweetButton && STEPS.length < 2) {
        handleTweetButton(tweetButton);
      }

      const addDescription = grabTwitterAddDescriptionInterface();
      if (
        addDescription &&
        STEPS.includes("PROCESSING_MEDIA") &&
        !STEPS.includes("ADD_DESCRIPTION_HIDDEN")
      ) {
        hideTwitterAddDescription(addDescription);
        STEPS.push("ADD_DESCRIPTION_HIDDEN");
      }

      const editButtons = grabTwitterEditButtonsInterface();
      if (
        editButtons.length > 0 &&
        STEPS.includes("PROCESSING_MEDIA") &&
        !STEPS.includes("EDIT_BUTTON_HIDDEN")
      ) {
        hideTwitterEditButtons(editButtons);
        if (editButtons.length === ORDER.length) {
          STEPS.push("EDIT_BUTTON_HIDDEN");
        }
      }

      const thumbnails = grabTwitterImagesThumbnail();
      if (
        thumbnails.length > 0 &&
        STEPS.includes("PROCESSING_MEDIA") &&
        !STEPS.includes("THUMBNAILS_HIDDEN")
      ) {
        preventClickTwitterImagesThumbnail(thumbnails);
        if (thumbnails.length === ORDER.length) {
          STEPS.push("THUMBNAILS_HIDDEN");
        }
      }

      const submitButton = grabTwitterSubmitButton();
      if (
        submitButton &&
        STEPS.includes("IMAGE_RESULT") &&
        !STEPS.includes("DESCRIPTION_SAVED")
      ) {
        handleTwitterAlertMessage(submitButton);
      }

      if (
        addDescription &&
        STEPS.includes("IMAGE_RESULT") &&
        !STEPS.includes("SHOW_ADD_DESCRIPTION")
      ) {
        showTwitterAddDescription(addDescription);
        STEPS.push("SHOW_ADD_DESCRIPTION");
      }

      if (
        editButtons.length > 0 &&
        STEPS.includes("IMAGE_RESULT") &&
        !STEPS.includes("SHOW_EDIT_BUTTON")
      ) {
        showTwitterEditButtons(editButtons);
        STEPS.push("SHOW_EDIT_BUTTON");
      }

      const previousImageButton = grabTwitterPreviousImageButton();
      if (previousImageButton) {
        setPreviousImageButton(previousImageButton);
      }

      const nextImageButton = grabTwitterNextImageButton();
      if (nextImageButton) {
        setNextImageButton(nextImageButton);
      }

      const textarea = grabTwitterTextarea();
      if (
        textarea &&
        STEPS.includes("IMAGE_RESULT") &&
        !STEPS.includes("DESCRIPTION_SAVED")
      ) {
        setTimeout(() => {
          insertTwitterDescription(textarea);
          if (
            !STEPS.includes("DESCRIPTION_ADDED") &&
            doAllImagesHaveAltText()
          ) {
            STEPS.push("DESCRIPTION_ADDED");
          }
        }, 200);
      }

      const saveButton = grabTwitterSaveButton();
      if (saveButton && STEPS.includes("DESCRIPTION_ADDED")) {
        handleTwitterSaveButton(saveButton);
      }

      if (submitButton && STEPS.includes("IMAGE_RESULT")) {
        handleSubmitProcess(submitButton);
      }
    });
  });
  observer.observe(document, {
    attributes: true,
    characterData: true,
    childList: true,
    subtree: true,
  });
}

function initFacebookSupport() {
  const observer = new MutationObserver(function (mutations) {
    mutations.forEach(function () {
      const discardPostButton = grabFacebookDiscardPostButton();
      if (discardPostButton) {
        discardPostButton.removeEventListener(
          "click",
          delayCleanStepsProcess,
          true
        );
        discardPostButton.addEventListener(
          "click",
          delayCleanStepsProcess,
          true
        );
      }

      const removeImageButton = grabFacebookRemoveImageButton();
      if (removeImageButton) {
        removeImageButton.removeEventListener("click", cleanStepsProcess, true);
        removeImageButton.addEventListener("click", cleanStepsProcess, true);
      }

      const mediaInputs = grabFacebookMediaInputs();
      if (
        mediaInputs &&
        mediaInputs.length > 0 &&
        STEPS.length < 2 &&
        !STEPS.includes("PROCESSING_MEDIA")
      ) {
        STEPS.push("PROCESSING_MEDIA");
        handlePostDetection(mediaInputs);
      }

      const publishButton = grabFacebookPublishButton();
      if (publishButton && STEPS.length < 2) {
        handleFacebookPublishButton(publishButton);
      }

      const editButton = grabFacebookEditButtonInterface();
      if (
        editButton &&
        STEPS.includes("PROCESSING_MEDIA") &&
        !STEPS.includes("EDIT_BUTTON_HIDDEN")
      ) {
        hideFacebookEditButton(editButton);
        STEPS.push("EDIT_BUTTON_HIDDEN");
      }

      if (
        editButton &&
        STEPS.includes("IMAGE_RESULT") &&
        !STEPS.includes("SHOW_EDIT_BUTTON")
      ) {
        showFacebookEditButton(editButton);
        STEPS.push("SHOW_EDIT_BUTTON");
      }

      const descriptionTab = grabFacebookDescriptionTab();
      if (
        descriptionTab &&
        STEPS.includes("IMAGE_RESULT") &&
        !STEPS.includes("DESCRIPTION_TAB")
      ) {
        STEPS.push("DESCRIPTION_TAB");
        setTimeout(() => {
          handleFacebookDescriptionTab(descriptionTab);
        }, 500);
      }

      const textarea = grabFacebookTextarea();
      if (
        textarea &&
        STEPS.includes("IMAGE_RESULT") &&
        !STEPS.includes("DESCRIPTION_SAVED")
      ) {
        setTimeout(() => {
          insertFacebookDescription(textarea);
          if (!STEPS.includes("DESCRIPTION_ADDED")) {
            STEPS.push("DESCRIPTION_ADDED");
          }
        }, 500);
      }

      startFacebookMultipleImageWorkflow();
      grabFacebookEditButton();

      const submitButton = grabFacebookSubmitButton();
      if (
        submitButton &&
        STEPS.includes("IMAGE_RESULT") &&
        !STEPS.includes("DESCRIPTION_SAVED")
      ) {
        handleFacebookAlertMessage(submitButton);
      }

      if (submitButton && STEPS.includes("IMAGE_RESULT")) {
        handleSubmitProcess(submitButton);
      }
    });
  });
  observer.observe(document, {
    attributes: true,
    characterData: true,
    childList: true,
    subtree: true,
  });
}

function activateShortcut() {
  document.addEventListener("keyup", function (event) {
    if (event.ctrlKey && event.shiftKey && event.key === "S") {
      chrome.storage.sync.get("force", function (item) {
        analyzeAll(item.force);
      });
    } else if (event.ctrlKey && event.shiftKey && event.key === "D") {
      analyzeOne();
    } else if (event.key === "Escape") {
      const active = document.activeElement;
      if (active.hasAttribute("_alts_for_image")) {
        active.remove();
        activeElement.focus();
        activeElement = null;
        dialogElement = null;
      }
    } else if (event.key === "Tab" || event.shiftKey) {
      if (dialogElement) {
        dialogElement.focus();
        event.preventDefault();
      }
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
  if (document.readyState === "complete") {
    loadMainFunctions();
  }
};

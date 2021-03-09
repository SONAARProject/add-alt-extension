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
  const description = !RESULT[img].alts ? "The image may contain these concepts: " + RESULT[img].concepts : RESULT[img].alts.map(alt => {
    return alt.AltText.trim();
  }).join("\n");

  RESULT[img].description = description;
}

function setCURRENT(next) {
  if (next) {
    CURRENT = ORDER[ORDER.indexOf(CURRENT) + 1];
    while (RESULT[CURRENT].removed) {
      CURRENT = ORDER[ORDER.indexOf(CURRENT) + 1];
    }
  } else {
    CURRENT = ORDER[ORDER.indexOf(CURRENT) - 1];
    while (RESULT[CURRENT].removed) {
      CURRENT = ORDER[ORDER.indexOf(CURRENT) - 1];
    }
  }
}

function copyToClipboard() {
  const description = RESULT[CURRENT]?.description;
  if (description) {
    navigator.clipboard.writeText(description);
  }
}

function cleanRespectiveImage() {
  const img = this.getAttribute('_remove_img_id');
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
    button.removeEventListener('click', cleanStepsProcess, true);
    if (!button.hasAttribute('_remove_img_id')) {
      button.setAttribute('_remove_img_id', ORDER[i]);
      button.removeEventListener('click', cleanRespectiveImage, true);
      button.addEventListener('click', cleanRespectiveImage, true);
    } else {
      button.removeEventListener('click', cleanRespectiveImage, true);
      button.addEventListener('click', cleanRespectiveImage, true);
    }
    i++;
  }
}

function grabTweetButton() {
  return document.querySelector('[href="/compose/tweet"]');
}

function grabFacebookPublishButton() {
  return document.querySelector('[class="oajrlxb2 gs1a9yip g5ia77u1 mtkw9kbi tlpljxtp qensuy8j ppp5ayq2 goun2846 ccm00jje s44p3ltw mk2mc5f4 rt8b4zig n8ej3o3l agehan2d sk4xxmp2 rq0escxv nhd2j8a9 a8c37x1j mg4g778l btwxx1t3 pfnyh3mw p7hjln8o kvgmc6g5 cxmmr5t8 oygrvhab hcukyx3x tgvbjcpo hpfvmrgz jb3vyjys rz4wbd8a qt6c0cv9 a8nywdso l9j0dhe7 i1ao9s8h esuyzwwr f1sip0of du4w35lb lzcic4wl abiwlrkh p8dawk7l ue3kfks5 pw54ja7n uo3d90p7 l82x9zwi"]');
}

function publishButtonClicked() {
  setTimeout(cleanStepsProcess, 200);
}

function handleTweetButton(tweetButton) {
  tweetButton.removeEventListener('click', publishButtonClicked, true);
  tweetButton.addEventListener('click', publishButtonClicked, true);
}

function handleFacebookPublishButton(publishButton) {
  publishButton.removeEventListener('click', publishButtonClicked, true);
  publishButton.addEventListener('click', publishButtonClicked, true);
}

function grabTwitterMediaInputs() {
  return document.querySelectorAll("input[class='r-8akbif r-orgf3d r-1udh08x r-u8s1d r-xjis5s r-1wyyakw']");
}

function grabFacebookMediaInputs() {
  return document.querySelectorAll('input[class="mkhogb32"]');
}

function handleImage() {
  let reset = true;
  for (const file of this.files || []) {
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = function() {
        HIDE_TWEET_BUTTON = false;
        
        const bytes = new Uint8Array(this.result);

        const img = md5(bytes);
        if (!RESULT[img]) {
          RESULT[img] = {};
        }
        
        if (ORDER.includes(img)) {
          const indexOf = ORDER.indexOf(img);
          if (indexOf !== -1) {
            ORDER.splice(indexOf, 1)
          }
        }

        ORDER.push(img);

        const data = {};
        data[img] = JSON.stringify(bytes);
        
        chrome.storage.local.set(data);
        chrome.runtime.sendMessage({ type: "search", img });
        
        if (COUNTER > 0 && reset) {
          STEPS = new Array();
          reset = false;
        }
      }
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
  return document.querySelectorAll('[class="css-18t94o4 css-1dbjc4n r-loe9s5 r-42olwf r-sdzlij r-1phboty r-rs99b7 r-1w2pmg r-ws9h79 r-15ysp7h r-4wgw6l r-1ny4l3l r-mk0yit r-u8s1d r-s5r7i3 r-o7ynqc r-6416eg r-lrvibr"]');
}

function grabFacebookRemoveImageButton() {
  return document.querySelector('[class="oajrlxb2 hn33210v qu0x051f esr5mh6w e9989ue4 r7d6kgcz rq0escxv nhd2j8a9 j83agx80 p7hjln8o kvgmc6g5 cxmmr5t8 oygrvhab hcukyx3x jb3vyjys rz4wbd8a qt6c0cv9 a8nywdso i1ao9s8h esuyzwwr f1sip0of lzcic4wl l9j0dhe7 abiwlrkh p8dawk7l bp9cbjyn s45kfl79 emlxlaya bkmhp75w spb7xbtv rt8b4zig n8ej3o3l agehan2d sk4xxmp2 taijpn5t tv7at329 thwo4zme m7msyxje m9osqain"]');
}

function grabTwitterDiscardPostButton() {
  return document.querySelector('[data-testid="confirmationSheetCancel"]');
}

function grabFacebookDiscardPostButton() {
  return document.querySelector('[class="oajrlxb2 tdjehn4e qu0x051f esr5mh6w e9989ue4 r7d6kgcz rq0escxv nhd2j8a9 j83agx80 p7hjln8o kvgmc6g5 cxmmr5t8 oygrvhab hcukyx3x jb3vyjys rz4wbd8a qt6c0cv9 a8nywdso i1ao9s8h esuyzwwr f1sip0of lzcic4wl l9j0dhe7 abiwlrkh p8dawk7l bp9cbjyn s45kfl79 emlxlaya bkmhp75w spb7xbtv rt8b4zig n8ej3o3l agehan2d sk4xxmp2 taijpn5t tv7at329 thwo4zme"]');
}

function grabTwitterAddDescriptionInterface() {
  return document.querySelector('[href="/compose/tweet/media"]');
}

function grabTwitterEditButtonsInterface() {
  return document.querySelectorAll('[class="css-18t94o4 css-1dbjc4n r-loe9s5 r-42olwf r-sdzlij r-1phboty r-rs99b7 r-1w2pmg r-15ysp7h r-gafmid r-1ny4l3l r-1fneopy r-u8s1d r-v2u3o6 r-s5r7i3 r-o7ynqc r-6416eg r-lrvibr"]');
}

function grabFacebookEditButtonInterface() {
  return document.querySelector('[class="oajrlxb2 q2y6ezfg gcieejh5 bn081pho humdl8nn izx4hr6d rq0escxv nhd2j8a9 j83agx80 p7hjln8o kvgmc6g5 cxmmr5t8 oygrvhab hcukyx3x jb3vyjys d1544ag0 qt6c0cv9 tw6a2znq i1ao9s8h esuyzwwr f1sip0of lzcic4wl l9j0dhe7 abiwlrkh p8dawk7l beltcj47 p86d2i9g aot14ch1 kzx2olss cbu4d94t taijpn5t ni8dbmo4 stjgntxs k4urcfbm tv7at329"]');
}

function hideTwitterAddDescription(element) {
  element.style["pointer-events"] = "none";
}

function showTwitterAddDescription(element) {
  element.style["pointer-events"] = "auto";
}

function hideTwitterEditButtons(elements) {
  for (const element of elements) {
    console.log(element);
    element.style["visibility"] = "hidden";
  }
}

function changeCurrentImageBasedOnClickedEditButton() {
  const img = this.getAttribute('_edit_image_id');
  CURRENT = img;
}

function showTwitterEditButtons(elements) {
  let i = 0;
  for (const element of elements) {
    element.style["visibility"] = "initial";

    element.removeEventListener("click", hideAltFoundDialog, true);
    element.addEventListener("click", hideAltFoundDialog, true);

    element.setAttribute('_edit_image_id', ORDER[i]);

    element.removeEventListener("click", changeCurrentImageBasedOnClickedEditButton, true);
    element.addEventListener("click", changeCurrentImageBasedOnClickedEditButton, true);
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
  return document.querySelector('[class="hu5pjgll lzf7d6o1 sp_YSu7W135EnD sx_7f977b"]')?.parentElement?.parentElement?.parentElement?.parentElement;
}

function grabFacebookSubmitButton() {
  return document.querySelector('[class="oajrlxb2 s1i5eluu gcieejh5 bn081pho humdl8nn izx4hr6d rq0escxv nhd2j8a9 j83agx80 p7hjln8o kvgmc6g5 cxmmr5t8 oygrvhab hcukyx3x jb3vyjys d1544ag0 qt6c0cv9 tw6a2znq i1ao9s8h esuyzwwr f1sip0of lzcic4wl l9j0dhe7 abiwlrkh p8dawk7l beltcj47 p86d2i9g aot14ch1 kzx2olss cbu4d94t taijpn5t ni8dbmo4 stjgntxs k4urcfbm tv7at329"]');
}

function hideAddDescriptionDialog() {
  const addDescriptionDialog = document.getElementById('add_description_dialog');
  if (addDescriptionDialog) {
    addDescriptionDialog.remove();
  }
}

function showTwitterAlertMessage() {
  const submitButton = this;
  chrome.storage.sync.get("disableTwitterDialogs", function(item) {
    if (!item.disableTwitterDialogs) {
      if ((!HIDE_TWEET_BUTTON && !STEPS.includes('DESCRIPTION_SAVED')) || (!HIDE_TWEET_BUTTON && !(RESULT[CURRENT] && RESULT[CURRENT].text && RESULT[CURRENT].text.trim()))) {
        submitButton.style.display = "none";
        setTimeout(function () {
          submitButton.style.display = "flex";
        }, 3000);
        HIDE_TWEET_BUTTON = true;
        const addDescription = grabTwitterAddDescriptionInterface();
        const clientRect = addDescription.getBoundingClientRect();

        addDescription.removeEventListener('click', hideAddDescriptionDialog, true);
        addDescription.addEventListener('click', hideAddDescriptionDialog, true);

        const altFoundDialog = document.getElementById('alt_found_dialog');
        if (altFoundDialog) {
          altFoundDialog.remove();
        }
        
        const span = document.createElement('span');
        span.id = "add_description_dialog";
        span.innerHTML = `<== Try to add a description<br> by clicking the "${addDescription.textContent}" button.`;
        span.style.backgroundColor = "white";
        span.style.color = "black";
        span.style.border = "thin solid black";
        span.style.fontSize = "1.5em";
        span.style.padding = "0.5em";
        span.style.position = "fixed";
        span.style.top = (clientRect.top - 10) + "px";
        span.style.left = (clientRect.left + clientRect.width) + "px";
        span.style.zIndex = "100";
        span.style.cursor = "pointer";
        span.addEventListener("click", function() {
          span.remove();
        });
        document.body.appendChild(span);
      }
    }
  });
}

function handleTwitterAlertMessage(submitButton) {
  submitButton.removeEventListener('mouseenter', showTwitterAlertMessage, true);
  submitButton.addEventListener('mouseenter', showTwitterAlertMessage, true);
}

function showFacebookAlertMessage() {
  const submitButton = this;
  chrome.storage.sync.get("disableFacebookDialogs", function(item) {
    if (!item.disableFacebookDialogs) {
      if ((!HIDE_TWEET_BUTTON && !STEPS.includes('DESCRIPTION_SAVED')) || (!HIDE_TWEET_BUTTON && !(RESULT[CURRENT] && RESULT[CURRENT].text && RESULT[CURRENT].text.trim()))) {
        submitButton.style.display = "none";
        setTimeout(function () {
          submitButton.style.display = "flex";
        }, 3000);
        HIDE_TWEET_BUTTON = true;
        const editButton = grabFacebookEditButtonInterface();
        const clientRect = editButton.getBoundingClientRect();

        editButton.removeEventListener('click', hideAddDescriptionDialog, true);
        editButton.addEventListener('click', hideAddDescriptionDialog, true);
    
        const span = document.createElement('span');
        span.id = "add_description_dialog";
        span.innerHTML = `Try to add a description by clicking the "${editButton.textContent}" button. ==>`;
        span.style.backgroundColor = "white";
        span.style.color = "black";
        span.style.border = "thin solid black";
        span.style.fontSize = "1.5em";
        span.style.padding = "0.5em";
        span.style.position = "fixed";
        span.style.top = (clientRect.top) + "px";
        span.style.left = (clientRect.left - 490) + "px";
        span.style.zIndex = "100";
        span.style.cursor = "pointer";
        span.addEventListener("click", function() {
          span.remove();
        });
        document.body.appendChild(span);
      }
    }
  });
}

function handleFacebookAlertMessage(submitButton) {
  submitButton.removeEventListener('mouseenter', showFacebookAlertMessage, true);
  submitButton.addEventListener('mouseenter', showFacebookAlertMessage, true);
}

function grabTwitterTextarea() {
  return document.querySelector('[name="altTextInput"]');
}

function grabFacebookSaveButton() {
  return document.querySelector('[class="oajrlxb2 s1i5eluu gcieejh5 bn081pho humdl8nn izx4hr6d rq0escxv nhd2j8a9 j83agx80 p7hjln8o kvgmc6g5 cxmmr5t8 oygrvhab hcukyx3x jb3vyjys d1544ag0 qt6c0cv9 tw6a2znq i1ao9s8h esuyzwwr f1sip0of lzcic4wl l9j0dhe7 abiwlrkh p8dawk7l beltcj47 p86d2i9g aot14ch1 kzx2olss cbu4d94t taijpn5t ni8dbmo4 stjgntxs k4urcfbm qypqp5cg"]');
}

function descriptionChanged() {
  RESULT[CURRENT].text = this.textContent;
}

function hidePreviousImageButtonDialog() {
  const cycleImageButtonDialog = document.getElementById('cycle_images_dialog');
  if(cycleImageButtonDialog) {
    cycleImageButtonDialog.remove();
  }
  setCURRENT(false);
}

function hideNextImageButtonDialog() {
  const cycleImageButtonDialog = document.getElementById('cycle_images_dialog');
  if(cycleImageButtonDialog) {
    cycleImageButtonDialog.remove();
  }
  setCURRENT(true);
}

function setPreviousImageButton(previousImageButton) {
  previousImageButton.removeEventListener("click", hidePreviousImageButtonDialog, true);
  previousImageButton.addEventListener("click", hidePreviousImageButtonDialog, true);
}


function setNextImageButton(nextImageButton) {
  nextImageButton.removeEventListener("click", hideNextImageButtonDialog, true);
  nextImageButton.addEventListener("click", hideNextImageButtonDialog, true);
}

function showTwitterCycleImageButtonDialog() {
  chrome.storage.sync.get("disableTwitterDialogs", function(item) {
    if (!item.disableTwitterDialogs) {
      const pasteDialog = document.getElementById('paste_dialog');
      const cycleDialog = document.getElementById('cycle_images_dialog');
      if (!pasteDialog && !cycleDialog && !doAllImagesHaveAltText() && RESULT[CURRENT]?.text) {
        const saveButton = grabTwitterSaveButton();
        const clientRect = saveButton.getBoundingClientRect();
        const span = document.createElement("span");
        span.id = "cycle_images_dialog";
        span.innerHTML = `Click the arrows buttons below to add the descriptions to the other images.`;
        span.style.backgroundColor = "white";
        span.style.color = "black";
        span.style.border = "thin solid black";
        span.style.fontSize = "1.5em";
        span.style.position = "fixed";
        span.style.padding = "0.5em";
        span.style.top = (clientRect.top - clientRect.height - 20) + "px";
        span.style.left = (clientRect.left - clientRect.width - 200) + "px";
        span.style.zIndex = "100";
        span.style.cursor = "pointer";
        span.addEventListener("click", function() {
          span.remove();
        });
        document.body.appendChild(span);
      }
    }
  });
}

function hideSaveButtonDialog() {
  const saveButtonDialog = document.getElementById('save_dialog');
  if(saveButtonDialog) {
    saveButtonDialog.remove();
  }
  saveButtonClicked();
}

function showTwitterSaveButtonDialog(saveButton) {
  saveButton.removeEventListener("click", hideSaveButtonDialog, true);
  saveButton.addEventListener("click", hideSaveButtonDialog, true);

  chrome.storage.sync.get("disableTwitterDialogs", function(item) {
    if (!item.disableTwitterDialogs) {
      const clientRect = saveButton.getBoundingClientRect();
      const span = document.createElement("span");
      span.id = "save_dialog";
      span.innerHTML = `<== Don't forget to apply the changes by clicking the "${saveButton.textContent}" button.`;
      span.style.backgroundColor = "white";
      span.style.color = "black";
      span.style.border = "thin solid black";
      span.style.fontSize = "1.5em";
      span.style.position = "fixed";
      span.style.padding = "0.5em";
      span.style.top = (clientRect.top - 10) + "px";
      span.style.left = (clientRect.left + clientRect.width) + "px";
      span.style.zIndex = "100";
      span.style.cursor = "pointer";
      span.addEventListener("click", function() {
        span.remove();
      });
      document.body.appendChild(span);
    }
  });
}

function showFacebookSaveButtonDialog(saveButton) {
  saveButton.removeEventListener("click", hideSaveButtonDialog, true);
  saveButton.addEventListener("click", hideSaveButtonDialog, true);

  chrome.storage.sync.get("disableFacebookDialogs", function(item) {
    if (!item.disableFacebookDialogs) {
      const clientRect = saveButton.getBoundingClientRect();
      const span = document.createElement("span");
      span.id = "save_dialog";
      span.innerHTML = `Don't forget to apply the changes by clicking the "${saveButton.textContent}" button above.`;
      span.style.backgroundColor = "white";
      span.style.color = "black";
      span.style.border = "thin solid black";
      span.style.fontSize = "1.5em";
      span.style.position = "fixed";
      span.style.padding = "0.5em";
      span.style.top = (clientRect.top + clientRect.height + 10) + "px";
      span.style.left = (clientRect.left) + "px";
      span.style.zIndex = "100";
      span.style.cursor = "pointer";
      span.addEventListener("click", function() {
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
  const pasteDialog = document.getElementById('paste_dialog');
  if (pasteDialog) {
    pasteDialog.remove();

    const host = location.host;
    if (host.includes("twitter.com")) {
      setTimeout(function() {
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
    copyToClipboard();

    textarea.removeEventListener("keyup", descriptionChanged, true);
    textarea.addEventListener("keyup", descriptionChanged, true);

    if (RESULT[CURRENT].show_paste_dialog) {
      const clientRect = textarea.getBoundingClientRect();
      
      textarea.removeEventListener("paste", hidePasteDialog, true);
      textarea.addEventListener("paste", hidePasteDialog, true);
      
      chrome.storage.sync.get("disableTwitterDialogs", function(item) {
        if (!item.disableTwitterDialogs) {
          const span = document.createElement('span');
          span.id = "paste_dialog";
          span.innerHTML = `<== Paste here the description<br> and then edit it to be as correct as possible.`;
          span.style.backgroundColor = "white";
          span.style.color = "black";
          span.style.border = "thin solid black";
          span.style.fontSize = "1.5em";
          span.style.position = "fixed";
          span.style.padding = "0.5em";
          span.style.top = clientRect.top + "px";
          span.style.left = (clientRect.left + clientRect.width + 15) + "px";
          span.style.zIndex = "100";
          span.style.cursor = "pointer";
          span.addEventListener("click", function() {
            span.remove();
          });
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
  copyToClipboard();

  textarea.removeEventListener("keyup", descriptionChanged, true);
  textarea.addEventListener("keyup", descriptionChanged, true);

  if (RESULT[CURRENT].show_paste_dialog) {
    const radioButton = document.querySelector('[class="oajrlxb2 rq0escxv f1sip0of hidtqoto nhd2j8a9 datstx6m kvgmc6g5 cxmmr5t8 oygrvhab hcukyx3x b5wmifdl lzcic4wl jb3vyjys rz4wbd8a qt6c0cv9 a8nywdso pmk7jnqg j9ispegn kr520xx4 k4urcfbm"]');
    if (radioButton) {
      radioButton.click();
    }

    const clientRect = textarea.getBoundingClientRect();

    textarea.removeEventListener("paste", hidePasteDialog, true);
    textarea.addEventListener("paste", hidePasteDialog, true);
    textarea.focus();

    chrome.storage.sync.get("disableFacebookDialogs", function(item) {
      if (!item.disableFacebookDialogs) {
        const span = document.createElement('span');
        span.id = "paste_dialog";
        span.innerHTML = `<== Paste here the description<br> and then edit it to be as correct as possible.`;
        span.style.backgroundColor = "white";
        span.style.color = "black";
        span.style.border = "thin solid black";
        span.style.fontSize = "1.5em";
        span.style.position = "fixed";
        span.style.padding = "0.5em";
        span.style.top = clientRect.top + "px";
        span.style.left = (clientRect.left + clientRect.width + 15) + "px";
        span.style.zIndex = "100";
        span.style.cursor = "pointer";
        span.addEventListener("click", function() {
          span.remove();
        });
        document.body.appendChild(span);
      }
    });
    RESULT[CURRENT].show_paste_dialog = false;
  }
}

function descriptionTabClicked() {
  const descriptionTabDialog = document.getElementById("description_tab_dialog");
  if (descriptionTabDialog) {
    descriptionTabDialog.remove();
  }
}

function showFacebookDescriptionTabDialog(descriptionTab) {
  chrome.storage.sync.get("disableFacebookDialogs", function(item) {
    if (!item.disableFacebookDialogs) {
      const clientRect = descriptionTab.getBoundingClientRect();
      const span = document.createElement('span');
      span.id = "description_tab_dialog";
      span.innerHTML = `<== Click the "${descriptionTab.textContent}" button to add a description.`;
      span.style.backgroundColor = "white";
      span.style.color = "black";
      span.style.border = "thin solid black";
      span.style.fontSize = "1.5em";
      span.style.position = "fixed";
      span.style.padding = "0.5em";
      span.style.top = (clientRect.top + 10) + "px";
      span.style.left = (clientRect.left + clientRect.width - 40) + "px";
      span.style.zIndex = "100";
      span.style.cursor = "pointer";
      span.addEventListener("click", function() {
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
  return document.querySelector('[class="oajrlxb2 rq0escxv f1sip0of hidtqoto lzcic4wl g5ia77u1 gcieejh5 bn081pho humdl8nn izx4hr6d oo9gr5id j83agx80 jagab5yi knj5qynh fo6rh5oj oud54xpy l9qdfxac ni8dbmo4 stjgntxs hv4rvrfc dati1w0a ieid39z1 k4urcfbm"]');
}

function grabTwitterPreviousImageButton() {
  return document.querySelector('[class="css-18t94o4 css-1dbjc4n r-1niwhzg r-p1n3y5 r-sdzlij r-1phboty r-rs99b7 r-1w2pmg r-a5pmau r-15ysp7h r-4wgw6l r-1ny4l3l r-mk0yit r-o7ynqc r-6416eg r-lrvibr"]');
}

function grabTwitterNextImageButton() {
  return document.querySelector('[class="css-18t94o4 css-1dbjc4n r-1niwhzg r-p1n3y5 r-sdzlij r-1phboty r-rs99b7 r-1w2pmg r-15ysp7h r-4wgw6l r-1ny4l3l r-mk0yit r-o7ynqc r-6416eg r-lrvibr"]');
}

function grabTwitterSaveButton() {
  const div = document.querySelectorAll('[class="css-1dbjc4n r-6koalj r-18u37iz"]');
  if (div.length === 1) {
    return div[0]?.firstChild;
  } else if (div.length > 1) {
    return div[0]?.lastChild;
  } else {
    return null;
  }
}

function saveButtonClicked() {
  if (RESULT[CURRENT] && RESULT[CURRENT].text && RESULT[CURRENT].text.trim()) {
    STEPS.push('DESCRIPTION_SAVED');
  }
}

function handleTwitterSaveButton(saveButton) {
  saveButton.removeEventListener('click', saveButtonClicked, true);
  saveButton.addEventListener('click', saveButtonClicked, true);
}

function handleFacebookSaveButton(saveButton) {
  saveButton.removeEventListener('click', saveButtonClicked, true);
  saveButton.addEventListener('click', saveButtonClicked, true);
}

function submitImages() {
  for (const img in RESULT) {
    if (RESULT[img].text) {
      let alreadyExists = false;
      for (const alt of RESULT[img].alts || []) {
        if (alt.AltText.trim() === RESULT[img].text.trim()) {
          alreadyExists = true;
          break;
        }
      }
      if (!alreadyExists) {
        chrome.runtime.sendMessage({type: "submit", img, text: RESULT[img].text });
      }
    }
  }
  cleanStepsProcess();
}

function handleSubmitProcess(submitButton) {
  submitButton.removeEventListener('click', submitImages, true);
  submitButton.addEventListener('click', submitImages, true);
}

function hideAltFoundDialog() {
  const altFoundDialog = document.getElementById('alt_found_dialog');
  if (altFoundDialog) {
    altFoundDialog.remove();
  }
}

function showTwitterAltMessage() {
  const addDescription = grabTwitterAddDescriptionInterface();
  const clientRect = addDescription.getBoundingClientRect();

  addDescription.removeEventListener('click', hideAltFoundDialog, true);
  addDescription.addEventListener('click', hideAltFoundDialog, true);
  
  chrome.storage.sync.get("disableTwitterDialogs", function(item) {
    if (!item.disableTwitterDialogs) {
      const span = document.createElement('span');
      span.id = "alt_found_dialog";
      if (COUNTER === 1) {
        span.innerHTML = `<== We found a possible description for this image and copied it to the clipboard.<br> Please click the "${addDescription.textContent}" button to add it.`;
      } else {
        span.innerHTML = `<== We found possible descriptions for these images<br> Please click the "${addDescription.textContent}" button to add them.`;
      }
      span.style.backgroundColor = "white";
      span.style.color = "black";
      span.style.border = "thin solid black";
      span.style.fontSize = "1.5em";
      span.style.position = "fixed";
      span.style.top = clientRect.top + "px";
      span.style.left = (clientRect.left + clientRect.width) + "px";
      span.style.zIndex = "100";
      span.style.cursor = "pointer";
      span.addEventListener("click", function() {
        span.remove();
      });
      document.body.appendChild(span);
    }
  });
}

function showFacebookAltMessage() {
  const editButton = grabFacebookEditButtonInterface();
  const clientRect = editButton.getBoundingClientRect();

  editButton.removeEventListener('click', hideAltFoundDialog, true);
  editButton.addEventListener('click', hideAltFoundDialog, true);
  
  chrome.storage.sync.get("disableFacebookDialogs", function(item) {
    if (!item.disableFacebookDialogs) {
      const span = document.createElement('span');
      span.id = "alt_found_dialog";
      span.innerHTML = `
        We found a possible description for this image<br> and copied it to the clipboard. <br> Please click the "${editButton.textContent}" button to add it. ==>
      `;
      span.style.backgroundColor = "white";
      span.style.color = "black";
      span.style.border = "thin solid black";
      span.style.fontSize = "1.5em";
      span.style.position = "fixed";
      span.style.top = (clientRect.top - 40) + "px";
      span.style.left = (clientRect.left - 380) + "px";
      span.style.zIndex = "100";
      span.style.cursor = "pointer";
      span.addEventListener("click", function() {
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

  if (image.src.startsWith('http')) {
    return image.src;
  } else {
    return location.href + image.src;
  }
}

function handlePostImagesData(img, _alts, _concepts) {
  const alts = _alts ? JSON.parse(_alts) : undefined;
  const concepts = _concepts ? JSON.parse(_concepts) : undefined;
  RESULT[img] = { alts, concepts, show_paste_dialog: true };

  createDescription(img);

  COUNTER++;
  
  if (COUNTER === Object.keys(RESULT).length) {
    STEPS.push('IMAGE_RESULT');
    CURRENT = ORDER[0];
    const host = location.host;
    if (host.includes("twitter.com")) {
      showTwitterAltMessage();
    } else if (host.includes("facebook.com")) {
      showFacebookAltMessage();
    }
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

function addImageAlts(id, alts) {
  const img = document.querySelector(`[_add_alt_extension_id="${message.id}"]`);
  if (alts) {
    const alts = JSON.parse(alts);
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

chrome.runtime.onMessage.addListener(
  function(message) {
    if (message.type === "checkAltText") {
      handlePostImagesData(message.img, message.alts, message.concepts);
    } else if (message.type === "searchAllByUrl") {
      analyzeAll(message.force);
    } else if (message.type === "altForImage") {
      addImageAlts(message.id, message.alts);
    }
  }
);

function initTwitterSupport() {
  const observer = new MutationObserver(function(mutations) {
    mutations.forEach(function() {
      const discardPostButton = grabTwitterDiscardPostButton();
      if (discardPostButton) {
        discardPostButton.removeEventListener('click', cleanStepsProcess, true);
        discardPostButton.addEventListener('click', cleanStepsProcess, true);
      }

      const removeImageButtons = grabTwitterRemoveImageButtons();
      if (removeImageButtons.length > 0 && !STEPS.includes('REMOVE_IMAGE_BUTTON_HANDLED')) {
        if (removeImageButtons.length === 1) {
          removeImageButtons[0].removeEventListener('click', cleanRespectiveImage, true);
          removeImageButtons[0].removeEventListener('click', cleanStepsProcess, true);
          removeImageButtons[0].addEventListener('click', cleanStepsProcess, true);
        } else {
          handleTwitterRemoveImageButtons(removeImageButtons);
        }
      }

      const mediaInputs = grabTwitterMediaInputs();
      if (mediaInputs && mediaInputs.length > 0) {
        STEPS.push('PROCESSING_MEDIA');
        handlePostDetection(mediaInputs);
      }

      const tweetButton = grabTweetButton();
      if (tweetButton && STEPS.length < 2) {
        handleTweetButton(tweetButton);
      }

      const addDescription = grabTwitterAddDescriptionInterface();
      if (addDescription && STEPS.includes('PROCESSING_MEDIA') && !STEPS.includes('ADD_DESCRIPTION_HIDDEN')) {
        hideTwitterAddDescription(addDescription);
        STEPS.push('ADD_DESCRIPTION_HIDDEN');
      }

      const editButtons = grabTwitterEditButtonsInterface();
      if (editButtons.length > 0 && STEPS.includes('PROCESSING_MEDIA') && !STEPS.includes('EDIT_BUTTON_HIDDEN')) {
        hideTwitterEditButtons(editButtons);
        if (editButtons.length === ORDER.length) {
          STEPS.push('EDIT_BUTTON_HIDDEN');
        }
      }

      const submitButton = grabTwitterSubmitButton();
      if (submitButton && STEPS.includes('IMAGE_RESULT') && !STEPS.includes('DESCRIPTION_SAVED')) {
        handleTwitterAlertMessage(submitButton);
      }

      if (addDescription && STEPS.includes('IMAGE_RESULT') && !STEPS.includes('SHOW_ADD_DESCRIPTION')) {
        showTwitterAddDescription(addDescription);
        STEPS.push('SHOW_ADD_DESCRIPTION');
      }

      if (editButtons.length > 0 && STEPS.includes('IMAGE_RESULT') && !STEPS.includes('SHOW_EDIT_BUTTON')) {
        showTwitterEditButtons(editButtons);
        STEPS.push('SHOW_EDIT_BUTTON');
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
      if (textarea && STEPS.includes('IMAGE_RESULT') && !STEPS.includes('DESCRIPTION_SAVED')) {
        setTimeout(() => {
          insertTwitterDescription(textarea);
          if (!STEPS.includes('DESCRIPTION_ADDED') && doAllImagesHaveAltText()) {
            STEPS.push('DESCRIPTION_ADDED');
          }
        }, 200);
      }

      const saveButton = grabTwitterSaveButton();
      if (saveButton && STEPS.includes('DESCRIPTION_ADDED')) {
        handleTwitterSaveButton(saveButton);
      }

      if (submitButton && STEPS.includes('IMAGE_RESULT')) {
        handleSubmitProcess(submitButton);
      }
    });
  });
  observer.observe(document, { attributes: true, characterData: true, childList: true, subtree: true });
}

function initFacebookSupport() {
  const observer = new MutationObserver(function(mutations) {
    mutations.forEach(function() {
      const discardPostButton = grabFacebookDiscardPostButton();
      if (discardPostButton) {
        discardPostButton.removeEventListener('click', delayCleanStepsProcess, true);
        discardPostButton.addEventListener('click', delayCleanStepsProcess, true);
      }

      const removeImageButton = grabFacebookRemoveImageButton();
      if (removeImageButton) {
        removeImageButton.removeEventListener('click', cleanStepsProcess, true);
        removeImageButton.addEventListener('click', cleanStepsProcess, true);
      }

      const mediaInputs = grabFacebookMediaInputs();
      if (mediaInputs && mediaInputs.length > 0 && STEPS.length < 2 && !STEPS.includes('PROCESSING_MEDIA')) {
        STEPS.push('PROCESSING_MEDIA');
        handlePostDetection(mediaInputs);
      }

      const publishButton = grabFacebookPublishButton();
      if (publishButton && STEPS.length < 2) {
        handleFacebookPublishButton(publishButton);
      }

      const editButton = grabFacebookEditButtonInterface();
      if (editButton && STEPS.includes('PROCESSING_MEDIA') && !STEPS.includes('EDIT_BUTTON_HIDDEN')) {
        hideFacebookEditButton(editButton);
        STEPS.push('EDIT_BUTTON_HIDDEN');
      }

      if (editButton && STEPS.includes('IMAGE_RESULT') && !STEPS.includes('SHOW_EDIT_BUTTON')) {
        showFacebookEditButton(editButton);
        STEPS.push('SHOW_EDIT_BUTTON');
      }

      const descriptionTab = grabFacebookDescriptionTab();
      if (descriptionTab && STEPS.includes('IMAGE_RESULT') && !STEPS.includes('DESCRIPTION_TAB')) {
        STEPS.push('DESCRIPTION_TAB');
        setTimeout(() => {
          handleFacebookDescriptionTab(descriptionTab);
        }, 500);
      }

      const textarea = grabFacebookTextarea();
      if (textarea && STEPS.includes('IMAGE_RESULT') && !STEPS.includes('DESCRIPTION_SAVED')) {
        insertFacebookDescription(textarea);
        if (!STEPS.includes('DESCRIPTION_ADDED')) {
          STEPS.push('DESCRIPTION_ADDED');
        }
      }

      const saveButton = grabFacebookSaveButton();
      if (saveButton && STEPS.includes('DESCRIPTION_ADDED')) {
        handleFacebookSaveButton(saveButton);
      }

      const submitButton = grabFacebookSubmitButton();
      if (submitButton && STEPS.includes('IMAGE_RESULT') && !STEPS.includes('DESCRIPTION_SAVED')) {
        handleFacebookAlertMessage(submitButton);
      }

      if (submitButton && STEPS.includes('IMAGE_RESULT')) {
        handleSubmitProcess(submitButton);
      }
    });
  });
  observer.observe(document, { attributes: true, characterData: true, childList: true, subtree: true });
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
    loadMainFunctions();
  }
}
function grabPostingInput() {
  const inputs = document.querySelectorAll("input[type=file]");
  
  for (const input of inputs || []) {
    input.addEventListener("change", function() {
      const reader = new FileReader();
      reader.onload = function() {
        setTimeout(function() {
          const addDescription = document.querySelector('a[href="/compose/tweet/media"]');
          addDescription.style["pointer-events"] = "none";
        }, 500)

        const bytes = new Uint8Array(this.result);
        chrome.storage.local.set({ imageBuffer: JSON.stringify(bytes) });
        chrome.runtime.sendMessage({type: "search"});
      }
      reader.readAsArrayBuffer(this.files[0]);
    });
  }
}

chrome.runtime.onMessage.addListener(
  function(message, sender, sendResponse) {
    if (message.type === "checkAltText") {
      const alts = message.alts ? JSON.parse(message.alts) : undefined;
      const addDescription = document.querySelector('a[href="/compose/tweet/media"]');
      addDescription.style["pointer-events"] = "auto";
      addDescription.addEventListener("click", function() {
        setTimeout(function() {
          const textarea = document.querySelector('textarea[name="altTextInput"]');
          textarea.textContent = !alts ? '' : alts.map(alt => {
            return alt.AltText.trim();
          }).join("\n");

          const save = document.querySelectorAll('div[role=button][data-focusable=true]')[1];
          save.addEventListener("click", function() {
            if (alts && textarea.textContent.trim() !== "") {
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
    } else if (message.type === "submitButton") {
      setTimeout(function() {
        const submitButton = document.querySelector("div[role=button][data-testid=tweetButtonInline]");
        submitButton.addEventListener("click", function() {
          const text = message.text;
          
          if (text) {
            chrome.runtime.sendMessage({type: "submit", text });
          }
        });
      }, 1000);
    }
  }
);

setTimeout(grabPostingInput, 2000);
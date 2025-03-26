function forceUpdate(action) {
  // We'll pass an action parameter to determine if we're hiding or showing
  try {
    console.log(`Forcing page refresh for action: ${action}`);
    // make the page re-interpret the CSS settings
    if (action === 'hide') {
      document.body.classList.remove('force-update');
    } else {
      document.body.classList.add('force-update');
    }
  } catch (error) {
    console.error("Error in forceUpdate:", error);
  }
}

function show_hide_tabs() {
  console.log("show_hide_tabs() called");
  chrome.storage.sync.get(['startHour', 'endHour', 'disable', 'disableDAY'], (result) => {
    console.log("Retrieved settings:", result);
    const startHour = result.startHour || 9;
    const endHour = result.endHour || 17;
    const disable = result.disable || false;
    const disableDAY = result.disableDAY || false;
    const currentHour = new Date().getHours();
    console.log(`Current hour: ${currentHour}, Start: ${startHour}, End: ${endHour}`);

    chrome.tabs.query({ url: "https://mail.google.com/*" }, (tabs) => {
      console.log("Found Gmail tabs:", tabs);
      if (tabs.length === 0) {
        console.log("No Gmail tabs were found.");
      }
      else{
        if (currentHour > endHour){ disableDAY = false; 
          //Store the value of disableDAY
          chrome.storage.sync.set({ disableDAY: false }, () => {
            console.log("DisableDAY turned off");
          }
          );}
        if (currentHour >= startHour && currentHour < endHour  && !disable && !disableDAY) {
          hide_tabs(tabs);
        }
        else {
          unhide_tabs(tabs);
        }
        if (disable || disableDAY) {
          console.log("Disable is on");
          unhide_tabs(tabs);
          if (disable){
            setTimeout(() => {
              chrome.storage.sync.set({ disable: false }, () => {
                console.log("Disable turned off after 30 seconds");
                hide_tabs(tabs);
              });
            }, 30000);
          }
        }
      }
    });
  });
}

function unhide_tabs(tabs) {
  console.log("Attempting to unhide the tabs");
  chrome.tabs.query({ url: "https://mail.google.com/*" }, (tabs) => {
    tabs.forEach((tab) => {
      console.log(`Attempting to show element in tab: ${tab.id}`);
      chrome.scripting.removeCSS({
        target: { tabId: tab.id },
        css: 'div[aria-label^="Promotions"] { display: none !important; }'
      });
      chrome.scripting.removeCSS({
        target: { tabId: tab.id },
        css: 'div[aria-label^="Social"] { display: none !important; }'
      });
      chrome.scripting.removeCSS({
        target: { tabId: tab.id },
        css: 'div[aria-label^="Updates"] { display: none !important; }'
      });
      chrome.scripting.removeCSS({
        target: { tabId: tab.id },
        css: 'div[aria-label^="Forums"] { display: none !important; }'
      });
      // Force a visual update by adding and removing a class
      chrome.scripting.executeScript({
        target: { tabId: tab.id, allFrames: true },
        func: forceUpdate,
        args: ['show']
      });
    });
  });
}

function hide_tabs(tabs) {
  console.log("Attempting to hide the tabs");
  tabs.forEach((tab) => {
    console.log(`Attempting to hide element in tab: ${tab.id}`);
    chrome.scripting.insertCSS({
      target: { tabId: tab.id },
      css: 'div[aria-label^="Promotions"] { display: none !important; }'
    });
    chrome.scripting.insertCSS({
      target: { tabId: tab.id },
      css: 'div[aria-label^="Social"] { display: none !important; }'
    });
    chrome.scripting.insertCSS({
      target: { tabId: tab.id },
      css: 'div[aria-label^="Updates"] { display: none !important; }'
    });
    chrome.scripting.insertCSS({
      target: { tabId: tab.id },
      css: 'div[aria-label^="Forums"] { display: none !important; }'
    });
  // Force a visual update by adding and removing a class
    chrome.scripting.executeScript({
      target: { tabId: tab.id, allFrames: true },
      func: forceUpdate,
      args: ['hide']
    });
  });
}

function checkTimeAndHide() {
  console.log("checkTimeAndHide() called");
  show_hide_tabs();
  setTimeout(checkTimeAndHide, 60000); // Check every minute
}

chrome.runtime.onInstalled.addListener(() => {
  console.log("Extension installed");
  chrome.storage.sync.get(['startHour', 'endHour'], (result) => {
    const defaults = {};
    if (result.startHour === undefined) defaults.startHour = 9;
    if (result.endHour === undefined) defaults.endHour = 17;
    if (Object.keys(defaults).length > 0) {
      chrome.storage.sync.set(defaults, () => {
        console.log("Default time settings initialized:", defaults);
      });
    }
  });
  show_hide_tabs();  
});

chrome.runtime.onStartup.addListener(() => {
  console.log("Extension started");
  checkTimeAndHide();
});

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.action === "hideTabsNow") {
      console.log("Received message to hide tabs now");
      show_hide_tabs();
    }
  });

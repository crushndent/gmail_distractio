// background.js
function hidePromotionsTab() {
  console.log("hidePromotionsTab() called");
  chrome.storage.sync.get(['startHour', 'endHour', 'disable'], (result) => {
    console.log("Retrieved settings:", result);
    const startHour = result.startHour || 9;
    const endHour = result.endHour || 17;
    const disable = result.disable || false;
    const currentHour = new Date().getHours();
    console.log(`Current hour: ${currentHour}, Start: ${startHour}, End: ${endHour}`);

    if (currentHour >= startHour && currentHour < endHour && !disable) {
      console.log("Attempting to hide the Promotions tab...");
      chrome.tabs.query({ url: "https://mail.google.com/*" }, (tabs) => {
        console.log("Found Gmail tabs:", tabs);
        if (tabs.length === 0) {
          console.log("No Gmail tabs were found.");
        }
        tabs.forEach((tab) => {
          console.log(`Attempting to hide element in tab: ${tab.id}`);
          chrome.scripting.insertCSS({
            target: { tabId: tab.id },
            css: 'div[aria-label^="Promotions"] { display: none !important; }'
          });
          chrome.scripting.insertCSS({
            target: { tabId: tab.id },
            css: 'div[aria-label^="Updates"] { display: none !important; }'
          });
          // Force a visual update by adding and removing a class
          chrome.scripting.executeScript({
            target: { tabId: tab.id },
            func: forceUpdate
          });
        });
      });
    } else {
      console.log("Attempting to unhide the Promotions tab...");
      chrome.tabs.query({ url: "https://mail.google.com/*" }, (tabs) => {
        console.log("Found Gmail tabs:", tabs);
        tabs.forEach((tab) => {
          console.log(`Attempting to show element in tab: ${tab.id}`);
          chrome.scripting.removeCSS({
            target: { tabId: tab.id },
            css: 'div[aria-label^="Promotions"] { display: none !important; }'
          });
          chrome.scripting.removeCSS({
            target: { tabId: tab.id },
            css: 'div[aria-label^="Updates"] { display: none !important; }'
          });
          // Force a visual update by adding and removing a class
          chrome.scripting.executeScript({
            target: { tabId: tab.id },
            func: forceUpdate
          });
        });
      });
      if (disable) {
        console.log("Not hiding tabs, disabled.");
      } else {
        console.log("Not hiding tabs, outside of specified hours.");
      }
      if (disable) {
        console.log("Disable is on, setting timer for 60 seconds");
        setTimeout(() => {
          chrome.storage.sync.set({ disable: false }, () => {
            console.log("Disable turned off after 60 seconds");
            hidePromotionsTab();
          });
        }, 15000);
      }
    }
  });
}

function checkTimeAndHide() {
  console.log("checkTimeAndHide() called");
  hidePromotionsTab();
  setTimeout(checkTimeAndHide, 10000); // Check every minute
}

chrome.runtime.onInstalled.addListener(() => {
  console.log("Extension installed");
  chrome.storage.sync.set({ startHour: 9, endHour: 17 });
  checkTimeAndHide();
});

chrome.runtime.onStartup.addListener(() => {
  console.log("Extension started");
  checkTimeAndHide();
});

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.action === "hideTabsNow") {
      hidePromotionsTab();
    }
  });

// popup.js
document.getElementById('saveButton').addEventListener('click', () => {
    const startHour = parseInt(document.getElementById('startHour').value);
    const endHour = parseInt(document.getElementById('endHour').value);  
    const disable = document.getElementById('disable').checked;

    chrome.storage.sync.set({ startHour, endHour, disable }, () => {
      chrome.runtime.sendMessage({ action: "hideTabsNow" });
      window.close();
    });
  });
  
  chrome.storage.sync.get(['startHour', 'endHour', 'disable'], (result) => {
    document.getElementById('startHour').value = result.startHour || 9;
    document.getElementById('endHour').value = result.endHour || 17;
    document.getElementById('disable').checked = result.disable || false;
  });

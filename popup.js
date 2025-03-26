document.getElementById('saveButton').addEventListener('click', () => {
    save_close();
});
  
chrome.storage.sync.get(['startHour', 'endHour', 'disable', 'disableDAY'], (result) => {
    document.getElementById('startHour').value = result.startHour || 9;
    document.getElementById('endHour').value = result.endHour || 17;
    document.getElementById('disable').checked = result.disable || false;
    document.getElementById('disableDAY').checked = result.disableDAY || false;
  });

  // Add event listener for Enter key press
document.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
        // Trigger the same action as clicking the save button
        save_close();
    }
});


function save_close() {
    const startHour = parseInt(document.getElementById('startHour').value);
    const endHour = parseInt(document.getElementById('endHour').value);
    const disable = document.getElementById('disable').checked;
    const disableDAY = document.getElementById('disableDAY').checked;

    chrome.storage.sync.set({ startHour, endHour, disable, disableDAY}, () => {
        chrome.runtime.sendMessage({ action: "hideTabsNow" });
        window.close();
    });
}

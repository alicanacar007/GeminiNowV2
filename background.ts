// Background service worker for GemiNow
// Opens the side panel when the extension icon is clicked

chrome.action.onClicked.addListener((tab) => {
  // Open the side panel
  chrome.sidePanel
    .open({ windowId: tab.windowId })
    .then(() => {
      console.log("Side panel opened")
    })
    .catch((error) => {
      console.error("Failed to open side panel:", error)
    })
})


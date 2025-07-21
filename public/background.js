// background.js

// Initialize storage on install
chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.get("folders", (result) => {
    if (!result.folders) {
      chrome.storage.local.set({ folders: [] });
    }
  });
});

// Listen to messages from popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "GET_FOLDERS") {
    chrome.storage.local.get("folders", (result) => {
      sendResponse({ folders: result.folders || [] });
    });
    return true; // keep channel open for async response
  }

  if (message.type === "ADD_FOLDER") {
    chrome.storage.local.get("folders", (result) => {
      const folders = result.folders || [];
      if (folders.some((f) => f.name === message.name)) {
        sendResponse({ success: false, error: "Folder exists" });
        return;
      }
      const updatedFolders = [...folders, { name: message.name, bookmarks: [] }];
      chrome.storage.local.set({ folders: updatedFolders }, () => {
        chrome.runtime.sendMessage({ type: "FOLDERS_UPDATED", folders: updatedFolders });
        sendResponse({ success: true });
      });
    });
    return true;
  }

  if (message.type === "ADD_BOOKMARK") {
    chrome.storage.local.get("folders", (result) => {
      const folders = result.folders || [];
      const { folderName, bookmark } = message;

      const updatedFolders = folders.map((folder) => {
        if (folder.name === folderName) {
          if (!folder.bookmarks.some(bm => bm.url === bookmark.url)) {
            return { ...folder, bookmarks: [...folder.bookmarks, bookmark] };
          }
        }
        return folder;
      });

      chrome.storage.local.set({ folders: updatedFolders }, () => {
        chrome.runtime.sendMessage({ type: "FOLDERS_UPDATED", folders: updatedFolders });
        sendResponse({ success: true });
      });
    });
    return true;
  }
});

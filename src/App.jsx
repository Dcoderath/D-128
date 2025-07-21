import { useEffect, useState } from "react";
import Hero from "./components/Hero";

function App() {
  const [folders, setFolders] = useState([]);
  const [newFolder, setNewFolder] = useState("");
  const [selectedFolder, setSelectedFolder] = useState("");

  useEffect(() => {
    // Safety check for chrome.runtime availability
    if (!chrome?.runtime?.sendMessage) {
      console.warn("chrome.runtime.sendMessage is not available");
      return;
    }

    // Request folders from background script
    chrome.runtime.sendMessage({ type: "GET_FOLDERS" }, (response) => {
      if (response?.folders) setFolders(response.folders);
    });

    // Listen for folder updates from background
    const handleFoldersUpdate = (message) => {
      if (message.type === "FOLDERS_UPDATED") {
        setFolders(message.folders);
      }
    };

    chrome.runtime.onMessage.addListener(handleFoldersUpdate);

    return () => {
      chrome.runtime.onMessage.removeListener(handleFoldersUpdate);
    };
  }, []);

  const saveFolders = (updated) => {
    // Tell background to update folders
    if (!chrome?.runtime?.sendMessage) return;
    chrome.runtime.sendMessage({ type: "SET_FOLDERS", folders: updated });
  };

  const handleAddFolder = () => {
    if (!newFolder.trim()) return;

    if (folders.some((f) => f.name === newFolder.trim())) {
      alert("Folder with this name already exists!");
      return;
    }
    const updated = [...folders, { name: newFolder.trim(), bookmarks: [] }];
    saveFolders(updated);
    setNewFolder("");
  };

  const handleSaveBookmark = () => {
    if (!selectedFolder) return;

    if (!chrome?.tabs) return;

    chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
      if (!tab) return;

      const updated = folders.map((f) => {
        if (f.name === selectedFolder) {
          const exists = f.bookmarks.some((bm) => bm.url === tab.url);
          if (exists) {
            alert("Bookmark already saved in this folder!");
            return f;
          }
          return {
            ...f,
            bookmarks: [...f.bookmarks, { title: tab.title, url: tab.url }],
          };
        }
        return f;
      });

      saveFolders(updated);
    });
  };

  return (
    <div style={{ padding: 10, width: 320, fontFamily: "Arial, sans-serif" }}>
      <h2>Bookmark Saver</h2>

      <input
        value={newFolder}
        onChange={(e) => setNewFolder(e.target.value)}
        placeholder="New folder name"
        style={{ width: "70%", padding: "6px", marginRight: 8 }}
      />
      <button onClick={handleAddFolder} style={{ padding: "6px 12px" }}>
        Add Folder
      </button>

      <br />
      <br />

      <select
        onChange={(e) => setSelectedFolder(e.target.value)}
        value={selectedFolder}
        style={{ width: "100%", padding: "6px" }}
      >
        <option value="">Select Folder</option>
        {folders.map((f, i) => (
          <option key={i} value={f.name}>
            {f.name}
          </option>
        ))}
      </select>

      <button
        disabled={!selectedFolder}
        onClick={handleSaveBookmark}
        style={{ marginTop: 8, padding: "6px 12px", width: "100%" }}
      >
        Save Current Tab
      </button>

      <hr />

      <Hero folders={folders} />
    </div>
  );
}

export default App;

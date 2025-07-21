import React from "react";

const Hero = ({ folders }) => {
  if (!folders || folders.length === 0) {
    return <p>No folders yet.</p>;
  }

  return (
    <div>
      <h2>Saved Bookmarks</h2>

      {folders.map((folder, idx) => (
        <div
          key={idx}
          style={{
            marginBottom: "1em",
            padding: "0.5em",
            border: "1px solid #ccc",
            borderRadius: "8px",
          }}
        >
          <h3 style={{ margin: "0 0 0.5em" }}>{folder.name}</h3>

          {folder.bookmarks.length === 0 ? (
            <p>No bookmarks in this folder.</p>
          ) : (
            <ul style={{ paddingLeft: "1.2em" }}>
              {folder.bookmarks.map((bookmark, bIdx) => (
                <li key={bIdx}>
                  <a href={bookmark.url} target="_blank" rel="noreferrer">
                    {bookmark.title}
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>
      ))}
    </div>
  );
};

export default Hero;

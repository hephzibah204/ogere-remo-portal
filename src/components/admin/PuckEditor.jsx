import React from "react";
import { Puck } from "@measured/puck";
import "@measured/puck/dist/index.css";
import { config } from "../../puck.config";

export default function PuckEditor({ data, onSave, onPublish }) {
  // Ensure data has the correct structure for Puck
  const initialData = data && typeof data === 'object' && data.content ? data : { content: [], root: {} };

  return (
    <div className="puck-editor-container" style={{ height: "calc(100vh - 44px)", position: "relative" }}>
      <Puck
        config={config}
        data={initialData}
        onPublish={(newData) => {
          if (onPublish) onPublish(newData);
          else if (onSave) onSave(newData);
        }}
      />
    </div>
  );
}

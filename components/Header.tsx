import React from "react";
import { Layout, Eye, Edit2, Save } from "lucide-react";

interface HeaderProps {
  isPreviewMode: boolean;
  togglePreviewMode: () => void;
  onSave: () => void;
}

export default function Header({
  isPreviewMode,
  togglePreviewMode,
  onSave,
}: HeaderProps) {
  return (
    <header className="bg-white border-b border-border h-16 px-4 flex items-center justify-between shadow-sm">
      <div className="flex items-center gap-2">
        <div className="h-8 w-8 rounded bg-primary flex items-center justify-center text-white">
          <Layout size={18} />
        </div>
        <h1 className="text-xl font-semibold text-foreground">
          Retool Simplified
        </h1>
      </div>

      <div className="flex items-center gap-2">
        <h3 className="hidden sm:block">Mohamed Yasser</h3>
        <div className="h-8 border-l border-border mx-2"></div>
        <button
          onClick={togglePreviewMode}
          className={`px-4 py-2 rounded-md transition-all flex items-center gap-2 font-medium ${
            isPreviewMode
              ? "bg-primary text-white hover:bg-primary-dark shadow-sm"
              : "bg-surface text-foreground hover:bg-surface-hover border border-border"
          }`}
        >
          {isPreviewMode ? (
            <>
              <Edit2 size={16} />
              <span className="hidden sm:inline">Edit Mode</span>
            </>
          ) : (
            <>
              <Eye size={16} />
              <span className="hidden sm:inline">Preview</span>
            </>
          )}
        </button>
        <button
          onClick={onSave}
          className="ml-2 px-4 py-2 rounded-md transition-colors flex items-center gap-2 bg-secondary text-white hover:bg-secondary-dark shadow-sm font-medium"
        >
          <Save size={16} />
          <span className="hidden sm:inline">Save</span>
        </button>
      </div>
    </header>
  );
}

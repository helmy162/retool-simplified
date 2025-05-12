import React, { useState } from "react";
import {
  Trash2,
  Type,
  Image,
  ToggleLeft,
  ToggleRight,
  Info,
  Sliders,
  Settings,
  ChevronRight,
  ChevronLeft,
  X,
} from "lucide-react";
import { IComponent } from "@/types";

interface ComponentSettingsProps {
  component: IComponent | null;
  updateComponent: (id: string, updates: Partial<any>) => void;
  removeComponent: (id: string) => void;
}

export default function ComponentSettings({
  component,
  updateComponent,
  removeComponent,
}: ComponentSettingsProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (component) {
      updateComponent(component.id, { content: e.target.value });
    }
  };

  const handleMarkdownToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (component) {
      updateComponent(component.id, { useMarkdown: e.target.checked });
    }
  };

  const handleSizeChange = (dimension: "w" | "h", newValue: number) => {
    if (!component) return;

    const limitedValue =
      dimension === "w"
        ? Math.min(Math.max(newValue, 1), 12)
        : Math.min(Math.max(newValue, 1), 40);

    updateComponent(component.id, {
      position: {
        ...component.position,
        [dimension]: limitedValue,
      },
    });
  };

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  const renderNoSelectionState = () => (
    <div className="p-6 flex flex-col items-center text-center">
      <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
        <Settings size={24} className="text-primary" />
      </div>
      <h3 className="text-lg font-medium mb-2 text-foreground">
        No Component Selected
      </h3>
      <p className="text-sm text-foreground-alt mb-6">
        Select a component from the canvas to edit its properties or add a new
        component.
      </p>

      <div className="w-full mt-8 pt-6 border-t border-border">
        <h4 className="text-sm font-medium mb-3 text-foreground flex items-center gap-2">
          <Info size={14} className="text-primary" />
          <span>Tips</span>
        </h4>
        <ul className="text-sm text-foreground-alt space-y-2  text-left">
          <li className="flex items-start">
            <span className="mr-2 text-primary">•</span>
            <span>Click on any component to select it</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2 text-primary">•</span>
            <span>Double-click on components to edit content</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2 text-primary">•</span>
            <span>Drag from edges to resize components</span>
          </li>
        </ul>
      </div>
    </div>
  );

  const renderComponentSettings = () => (
    <>
      <div className="p-4 border-b border-border sticky top-0 bg-white z-10">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-md font-medium flex items-center gap-2">
            {component?.type === "text" ? (
              <Type size={16} className="text-primary" />
            ) : (
              <Image size={16} className="text-primary" />
            )}
            <span>
              {component?.type === "text" ? "Text" : "Image"} Properties
            </span>
          </h3>

          <button
            onClick={() => component && removeComponent(component.id)}
            className="text-xs px-2 py-1 rounded bg-error/10 text-error hover:bg-error/20 transition-colors flex items-center gap-1"
            title="Delete component"
          >
            <Trash2 size={14} />
            <span>Delete</span>
          </button>
        </div>
        <div className="text-xs text-muted">
          Configure and customize this component
        </div>
      </div>

      <div className="p-4 space-y-5 flex-1 overflow-auto">
        {/* Size settings */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground flex items-center gap-1.5">
            <Sliders size={14} className="text-primary" />
            <span>Size</span>
          </label>
          <div className="bg-surface rounded-md p-3 flex gap-3 flex-wrap [&>*]:flex-1">
            <div>
              <label className="block text-xs text-foreground-alt mb-1.5">
                Width (columns)
              </label>
              <div className="flex items-center">
                <button
                  className="w-8 h-8 flex items-center justify-center rounded-l-md border border-border bg-white hover:bg-surface-hover disabled:opacity-50 transition-colors"
                  onClick={() =>
                    component &&
                    handleSizeChange("w", Math.max(1, component.position.w - 1))
                  }
                  disabled={!component || component.position.w <= 1}
                >
                  -
                </button>
                <div className="h-8 w-12 flex items-center justify-center border-t border-b border-border bg-white">
                  {component?.position.w || "-"}
                </div>
                <button
                  className="w-8 h-8 flex items-center justify-center rounded-r-md border border-border bg-white hover:bg-surface-hover disabled:opacity-50 transition-colors"
                  onClick={() =>
                    component &&
                    handleSizeChange(
                      "w",
                      Math.min(12, component.position.w + 1)
                    )
                  }
                  disabled={!component || component.position.w >= 12}
                >
                  +
                </button>
              </div>
            </div>
            <div>
              <label className="block text-xs text-foreground-alt mb-1.5">
                Height (rows) ~ 1 row = 60px
              </label>
              <div className="flex items-center">
                <button
                  className="w-8 h-8 flex items-center justify-center rounded-l-md border border-border bg-white hover:bg-surface-hover disabled:opacity-50 transition-colors"
                  onClick={() =>
                    component &&
                    handleSizeChange("h", Math.max(1, component.position.h - 1))
                  }
                  disabled={!component || component.position.h <= 1}
                >
                  -
                </button>
                <div className="h-8 w-12 flex items-center justify-center border-t border-b border-border bg-white">
                  {component?.position.h || "-"}
                </div>
                <button
                  className="w-8 h-8 flex items-center justify-center rounded-r-md border border-border bg-white hover:bg-surface-hover disabled:opacity-50 transition-colors"
                  onClick={() =>
                    component &&
                    handleSizeChange(
                      "h",
                      Math.min(40, component.position.h + 1)
                    )
                  }
                  disabled={!component || component.position.h >= 40}
                >
                  +
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Content settings */}
        <div className="space-y-2">
          <label
            htmlFor="component-content"
            className="text-sm font-medium text-foreground flex items-center gap-1.5"
          >
            {component?.type === "text" ? (
              <Type size={14} className="text-primary" />
            ) : (
              <Image size={14} className="text-primary" />
            )}
            <span>
              {component?.type === "text" ? "Text Content" : "Image URL"}
            </span>
          </label>
          <textarea
            id="component-content"
            value={component?.content || ""}
            onChange={handleContentChange}
            rows={component?.type === "text" ? 6 : 3}
            className="w-full p-3 text-sm border border-border rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-primary-light focus:border-primary-light"
            placeholder={
              component?.type === "text"
                ? "Enter text content..."
                : "Enter image URL..."
            }
            disabled={!component}
          />
        </div>

        {/* Markdown toggle for text components */}
        {component?.type === "text" && (
          <div className="space-y-2">
            <label className="block text-sm font-medium text-foreground">
              Options
            </label>
            <div className="flex items-center justify-between bg-surface p-3 rounded-md">
              <div className="flex items-center gap-2">
                <span className="text-sm">Enable Markdown</span>
                {component.useMarkdown !== false ? (
                  <ToggleRight className="text-primary" size={16} />
                ) : (
                  <ToggleLeft className="text-muted" size={16} />
                )}
              </div>
              <div>
                <input
                  id="markdown-toggle"
                  type="checkbox"
                  checked={component.useMarkdown !== false}
                  onChange={handleMarkdownToggle}
                  className="sr-only"
                />
                <label
                  htmlFor="markdown-toggle"
                  className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 cursor-pointer ${
                    component.useMarkdown !== false ? "bg-primary" : "bg-muted"
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      component.useMarkdown !== false
                        ? "translate-x-4"
                        : "translate-x-1"
                    }`}
                  />
                </label>
              </div>
            </div>
          </div>
        )}

        {/* Help information */}
        <div className="space-y-2">
          {component?.type === "text" && component.useMarkdown !== false && (
            <div className="bg-surface rounded-md p-3 text-sm text-foreground-alt">
              <p className="font-medium mb-2 text-foreground">Markdown Tips:</p>
              <div className="space-y-1 text-muted">
                <div className="flex items-center gap-2">
                  <code className="px-1 py-0.5 bg-background rounded text-xs">
                    # Header 1
                  </code>
                  <span className="text-xs">Main Title</span>
                </div>
                <div className="flex items-center gap-2">
                  <code className="px-1 py-0.5 bg-background rounded text-xs">
                    ## Header 2
                  </code>
                  <span className="text-xs">Subtitle</span>
                </div>
                <div className="flex items-center gap-2">
                  <code className="px-1 py-0.5 bg-background rounded text-xs">
                    **Bold Text**
                  </code>
                  <span className="text-xs">
                    Makes text <strong>bold</strong>
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <code className="px-1 py-0.5 bg-background rounded text-xs">
                    *Italic Text*
                  </code>
                  <span className="text-xs">
                    Makes text <em>italic</em>
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <code className="px-1 py-0.5 bg-background rounded text-xs">
                    [Link](url)
                  </code>
                  <span className="text-xs">Creates hyperlink</span>
                </div>
              </div>
            </div>
          )}

          {component?.type === "image" && (
            <div className="bg-surface rounded-md p-3 text-sm text-foreground-alt">
              <p className="font-medium mb-2 text-foreground">
                Example Image URLs:
              </p>
              <div className="space-y-1.5 text-xs">
                <div className="p-1.5 bg-background rounded">
                  <code className="break-all text-primary-dark">
                    https://placehold.co/600x400
                  </code>
                </div>
                <div className="p-1.5 bg-background rounded">
                  <code className="break-all text-primary-dark">
                    https://picsum.photos/800/600
                  </code>
                </div>
                <div className="p-1.5 bg-background rounded">
                  <code className="break-all text-primary-dark">
                    https://source.unsplash.com/random/800x600
                  </code>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );

  // If the panel is collapsed, show just a slim sidebar with a toggle button
  if (isCollapsed) {
    return (
      <div className="w-12 bg-background-alt border-l border-border flex flex-col items-center py-4">
        <button
          onClick={toggleCollapse}
          className="w-8 h-8 rounded-full bg-white border border-border flex items-center justify-center hover:bg-surface hover:border-primary transition-all mb-6"
          title="Expand panel"
        >
          <ChevronLeft size={16} className="text-primary" />
        </button>
      </div>
    );
  }

  // Render the full panel with either selected component settings or the empty state
  return (
    <div className="w-72 bg-white border-l border-border overflow-hidden flex flex-col shadow-sm">
      {/* Header with tabs */}
      <div className="bg-white border-b border-border p-2 flex items-center justify-between">
        <button
          onClick={toggleCollapse}
          className="w-6 h-6 rounded hover:bg-surface flex items-center justify-center"
          title="Collapse panel"
        >
          <ChevronRight size={16} className="text-foreground-alt" />
        </button>
      </div>

      {/* Panel content */}
      <div className="flex-1 overflow-auto">
        {component ? renderComponentSettings() : renderNoSelectionState()}
      </div>
    </div>
  );
}

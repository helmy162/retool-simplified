import { ComponentType } from "@/types";
import { Type, Image, Plus, List, Layers } from "lucide-react";

export default function ComponentSidebar({
  onAddComponent,
}: {
  onAddComponent: (type: ComponentType) => void;
}) {
  const handleDragStart = (e: React.DragEvent, type: ComponentType) => {
    e.dataTransfer.setData("component-type", type);
    e.dataTransfer.effectAllowed = "copy";
  };

  return (
    <div className="w-64 bg-background-alt border-r border-border overflow-y-auto flex flex-col">
      <div className="p-4 border-b border-border">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Layers size={18} className="text-primary" />
          <span>Components</span>
        </h2>

        <div className="grid grid-cols-2 gap-3">
          <div
            draggable
            onDragStart={(e) => handleDragStart(e, "text")}
            className="flex flex-col items-center justify-center bg-white p-4 rounded-lg border border-border hover:border-primary hover:shadow-sm transition-all cursor-move"
          >
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-2">
              <Type size={18} />
            </div>
            <span className="text-sm font-medium">Text</span>
          </div>

          <div
            draggable
            onDragStart={(e) => handleDragStart(e, "image")}
            className="flex flex-col items-center justify-center bg-white p-4 rounded-lg border border-border hover:border-primary hover:shadow-sm transition-all cursor-move"
          >
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-2">
              <Image size={18} />
            </div>
            <span className="text-sm font-medium">Image</span>
          </div>
        </div>
      </div>

      <div className="p-4 border-b border-border">
        <div className="text-sm font-medium mb-3 flex items-center gap-2">
          <Plus size={16} className="text-primary" />
          <span>Quick Add</span>
        </div>
        <div className="space-y-2">
          <button
            onClick={() => onAddComponent("text")}
            className="w-full p-2 rounded-md bg-white hover:bg-surface text-foreground flex items-center border border-border hover:border-primary-light transition-all"
          >
            <Type size={16} className="mr-2 text-primary" />
            <span className="text-sm">Add Text Component</span>
          </button>
          <button
            onClick={() => onAddComponent("image")}
            className="w-full p-2 rounded-md bg-white hover:bg-surface text-foreground flex items-center border border-border hover:border-primary-light transition-all"
          >
            <Image size={16} className="mr-2 text-primary" />
            <span className="text-sm">Add Image Component</span>
          </button>
        </div>
      </div>

      <div className="mt-auto p-4 border-t border-border bg-surface">
        <h3 className="text-sm font-medium mb-3 text-foreground-alt flex items-center gap-2">
          <List size={16} className="text-foreground-alt" />
          <span>Instructions</span>
        </h3>
        <ul className="space-y-2 text-sm text-foreground-alt">
          <li className="flex items-start">
            <span className="mr-2 text-primary">•</span>
            <span>Drag components to the canvas</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2 text-primary">•</span>
            <span>Click to select and edit</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2 text-primary">•</span>
            <span>Toggle preview mode to see results</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2 text-primary">•</span>
            <span>Resize components by dragging edges</span>
          </li>
        </ul>
      </div>
    </div>
  );
}

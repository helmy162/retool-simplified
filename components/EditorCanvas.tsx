import React, { useState, useRef, useEffect } from "react";
import { Responsive, WidthProvider, Layout } from "react-grid-layout";
import TextComponent from "./TextComponent";
import ImageComponent from "./ImageComponent";
import ComponentSettings from "./ComponentSettings";
import { MousePointer, Grid, Move } from "lucide-react";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";
import { ComponentType, IComponent } from "@/types";

// Use WidthProvider to automatically set width
const ResponsiveGridLayout = WidthProvider(Responsive);

interface EditorCanvasProps {
  components: IComponent[];
  updateComponent: (id: string, updates: Partial<IComponent>) => void;
  removeComponent: (id: string) => void;
  addComponent: (
    type: ComponentType,
    position?: { x: number; y: number }
  ) => IComponent;
}

const COLUMNS_COUNT = 12; // Default number of columns

export default function EditorCanvas({
  components,
  updateComponent,
  removeComponent,
  addComponent,
}: EditorCanvasProps) {
  const [selectedComponentId, setSelectedComponentId] = useState<string | null>(
    null
  );
  const canvasRef = useRef<HTMLDivElement>(null);
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [showGrid, setShowGrid] = useState(false);

  // Calculate column width
  useEffect(() => {
    if (canvasRef.current) {
      const updateSize = () => {
        setCanvasSize({
          width: canvasRef.current?.offsetWidth || 0,
          height: canvasRef.current?.offsetHeight || 0,
        });
      };

      updateSize();
      window.addEventListener("resize", updateSize);
      return () => window.removeEventListener("resize", updateSize);
    }
  }, []);

  const columnWidth = canvasSize.width
    ? Math.floor((canvasSize.width - 20) / COLUMNS_COUNT)
    : 0;

  // Handle dropping component from sidebar
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(false);

    // Get the dropped component type
    const componentType = e.dataTransfer.getData(
      "component-type"
    ) as ComponentType;

    if (componentType && canvasRef.current) {
      // Calculate position in grid coordinates
      const canvasRect = canvasRef.current.getBoundingClientRect();
      const dropX = e.clientX - canvasRect.left;
      const dropY = e.clientY - canvasRect.top;

      // Convert pixel coordinates to grid coordinates
      const gridX = Math.floor(dropX / (columnWidth + 10)); // account for margin
      const gridY = Math.floor(dropY / 70); // row height + margin

      // Add component at the calculated position
      const newComponent = addComponent(componentType, { x: gridX, y: gridY });

      handleComponentSelect(newComponent.id);
    }
  };

  // Handle dragover to enable drop
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";
    if (!isDraggingOver) {
      setIsDraggingOver(true);
    }
  };

  const handleDragLeave = () => {
    setIsDraggingOver(false);
  };

  // Convert components to layout format for react-grid-layout
  const layouts = {
    lg: components.map((component) => ({
      i: component.id,
      x: component.position.x,
      y: component.position.y,
      w: component.position.w,
      h: component.position.h,
      minW: 1,
      minH: 1,
    })),
  };

  // Handle grid layout changes
  const handleLayoutChange = (layout: Layout[]) => {
    layout.forEach((item) => {
      const component = components.find((c) => c.id === item.i);
      if (component) {
        if (
          component.position.x !== item.x ||
          component.position.y !== item.y ||
          component.position.w !== item.w ||
          component.position.h !== item.h
        ) {
          updateComponent(item.i, {
            position: {
              x: item.x,
              y: item.y,
              w: item.w,
              h: item.h,
            },
          });
        }
      }
    });
  };

  // Handle component selection
  const handleComponentSelect = (id: string) => {
    setSelectedComponentId(id);
  };

  // Render component based on type
  const renderComponent = (component: IComponent) => {
    const isSelected = selectedComponentId === component.id;

    switch (component.type) {
      case "text":
        return (
          <TextComponent
            id={component.id}
            content={component.content}
            isSelected={isSelected}
            useMarkdown={component.useMarkdown !== false}
            onSelect={handleComponentSelect}
            updateContent={(content) =>
              updateComponent(component.id, { content })
            }
          />
        );
      case "image":
        return (
          <ImageComponent
            id={component.id}
            content={component.content}
            isSelected={isSelected}
            onSelect={handleComponentSelect}
            updateContent={(content) =>
              updateComponent(component.id, { content })
            }
          />
        );
      default:
        return null;
    }
  };

  // Get selected component
  const selectedComponent =
    components.find((c) => c.id === selectedComponentId) || null;

  // When clicking canvas (not a component), deselect component
  const handleCanvasClick = (e: React.MouseEvent) => {
    if (
      e.target === e.currentTarget ||
      e.target === canvasContainerRef.current ||
      e.target === canvasContainerRef.current?.firstChild
    ) {
      setSelectedComponentId(null);
    }
  };

  return (
    <div className="flex h-full">
      <div className="flex flex-col flex-1">
        <div className="bg-background-alt border-b border-border p-2 flex items-center justify-between">
          <div className="text-xs text-foreground-alt">
            {selectedComponentId ? (
              <span className="flex items-center gap-1 text-primary">
                <MousePointer size={12} />
                <span>Component selected</span>
              </span>
            ) : (
              <span className="flex items-center gap-1">
                <Move size={12} />
                <span>Drag components from sidebar to canvas</span>
              </span>
            )}
          </div>
          <div>
            <button
              className={`text-xs px-2 py-1 rounded border flex items-center gap-1 ${
                showGrid
                  ? "bg-primary/10 text-primary border-primary/30"
                  : "bg-white text-foreground-alt border-border hover:border-primary-light"
              }`}
              onClick={() => setShowGrid(!showGrid)}
            >
              <Grid size={12} />
              <span>{showGrid ? "Hide Grid" : "Show Grid"}</span>
            </button>
          </div>
        </div>

        <div
          ref={canvasRef}
          className={`flex-1 overflow-auto  pb-20 relative ${
            isDraggingOver ? "bg-primary/5" : ""
          }`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={handleCanvasClick}
        >
          {/* Grid overlay */}
          {showGrid && (
            <div
              className="absolute inset-0 pointer-events-none z-0"
              style={{
                backgroundImage:
                  "linear-gradient(to right, rgba(59, 130, 246, 0.25) 1px, transparent 1px), linear-gradient(to bottom, rgba(59, 130, 246, 0.25) 1px, transparent 1px)",
                backgroundSize: `${columnWidth + 2}px 70px`,
              }}
            />
          )}

          <div ref={canvasContainerRef} className="p-4 h-full relative">
            {components.length === 0 ? (
              <div className="h-full flex items-center justify-center text-foreground-alt border-2 border-dashed border-border rounded-lg overflow-hidden">
                <div className="text-center p-8 max-w-md">
                  <div className="flex justify-center mb-4">
                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-2 empty-canvas-pulse">
                      <Move size={24} className="text-primary" />
                    </div>
                  </div>
                  <h3 className="text-lg font-medium mb-2 text-foreground">
                    Your canvas is empty
                  </h3>
                  <p className="text-sm text-foreground-alt mb-4">
                    Drag and drop components from the sidebar to start building
                    your interface
                  </p>
                  <div className="flex justify-center gap-2">
                    <button
                      onClick={() => addComponent("text")}
                      className="px-3 py-2 bg-primary text-white rounded-md text-sm hover:bg-primary-dark transition-colors"
                    >
                      Add Text
                    </button>
                    <button
                      onClick={() => addComponent("image")}
                      className="px-3 py-2 bg-surface hover:bg-surface-hover text-foreground rounded-md text-sm border border-border transition-colors"
                    >
                      Add Image
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <ResponsiveGridLayout
                className="layout"
                layouts={layouts}
                breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
                cols={{ lg: 12, md: 12, sm: 12, xs: 12, xxs: 12 }}
                rowHeight={30}
                onLayoutChange={handleLayoutChange}
                isDraggable={true}
                isResizable={true}
                margin={[10, 0]}
                containerPadding={[10, 10]}
                compactType={null} // This disables automatic compaction
                preventCollision={true} // Prevents components from overlapping
                resizeHandles={["se", "sw", "ne", "nw", "e", "w", "s", "n"]}
              >
                {components.map((component) => (
                  <div key={component.id} className="component-wrapper">
                    {renderComponent(component)}
                  </div>
                ))}
              </ResponsiveGridLayout>
            )}
          </div>
        </div>
      </div>

      <ComponentSettings
        component={selectedComponent}
        updateComponent={updateComponent}
        removeComponent={removeComponent}
      />
    </div>
  );
}

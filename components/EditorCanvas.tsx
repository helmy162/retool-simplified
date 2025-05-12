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
  const [gridOpacity, setGridOpacity] = useState(0.7);

  const containerPadding = [10, 10] as [number, number];
  const margin = [10, 0] as [number, number];
  const rowHeight = 30;

  // Calculate column width and grid dimensions
  useEffect(() => {
    const updateSize = () => {
      if (canvasRef.current) {
        setCanvasSize({
          width: canvasRef.current.offsetWidth || 0,
          height: canvasRef.current.offsetHeight || 0,
        });
      }
    };

    updateSize();

    // Create a ResizeObserver to detect container size changes
    const resizeObserver = new ResizeObserver(updateSize);
    if (canvasRef.current) {
      resizeObserver.observe(canvasRef.current);
    }

    window.addEventListener("resize", updateSize);

    return () => {
      window.removeEventListener("resize", updateSize);
      resizeObserver.disconnect();
    };
  }, []);

  // Get the effective column width and row height
  const getColumnWidth = () => {
    if (!canvasSize.width) return 0;

    // Account for container padding and margin between items
    const availableWidth = canvasSize.width - 2 * containerPadding[0];

    // Account for margins between columns
    const totalMarginWidth = margin[0] * (COLUMNS_COUNT - 1);

    // Calculate column width
    return (availableWidth - totalMarginWidth) / COLUMNS_COUNT;
  };

  const columnWidth = getColumnWidth();

  // Calculate the number of rows needed to fill the canvas height
  const calculateTotalRows = () => {
    if (!canvasSize.height) return 100; // Default to a large number if height not available

    // Account for container padding
    const availableHeight = canvasSize.height - 2 * containerPadding[1];

    // Calculate number of rows (plus extra to ensure we cover scrollable area)
    // Add 10 extra rows to ensure coverage when scrolling
    let rowCount = Math.ceil(availableHeight / (rowHeight + margin[1])) + 10;

    // Get the maximum Y position + height from components
    if (components.length > 0) {
      const maxYPosition = Math.max(
        ...components.map((c) => c.position.y + c.position.h)
      );
      // Ensure we have enough rows to display all components plus some extra space
      rowCount = Math.max(rowCount, maxYPosition + 10);
    }

    return rowCount;
  };

  // Track mouse position for grid highlights

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

      // Convert pixel coordinates to grid coordinates - account for container padding
      const gridX = Math.floor(
        (dropX - containerPadding[0]) / (columnWidth + margin[0])
      );
      const gridY = Math.floor(
        (dropY - containerPadding[1]) / (rowHeight + margin[1])
      );

      // Add component at the calculated position
      const newComponent = addComponent(componentType, {
        x: Math.min(Math.max(0, gridX), COLUMNS_COUNT - 1),
        y: Math.max(0, gridY),
      });

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

  // Calculate grid lines
  const renderGridLines = () => {
    if (!showGrid || !canvasSize.width) return null;

    const rowsCount = calculateTotalRows();

    // Function to calculate actual pixel position for a grid line
    const getColumnPosition = (colIndex: number) => {
      return containerPadding[0] + colIndex * (columnWidth + margin[0]);
    };

    const getRowPosition = (rowIndex: number) => {
      return containerPadding[1] + rowIndex * (rowHeight + margin[1]);
    };

    // Create column lines
    const columnLines = Array.from({ length: COLUMNS_COUNT }).map((_, i) => {
      const position = getColumnPosition(i);
      return (
        <div
          key={`col-${i}`}
          className="absolute bg-gradient-to-b from-primary/20 to-primary/40"
          style={{
            left: `${position}px`,
            top: 0,
            width: "1px",
            height: `${rowsCount * (rowHeight + margin[1])}px`,
            zIndex: 0,
            opacity: i % 3 === 0 ? 0.8 : 0.4, // Make every 3rd line more prominent
          }}
        />
      );
    });

    // Create row lines
    const rowLines = Array.from({ length: rowsCount + 1 }).map((_, i) => {
      const position = getRowPosition(i);
      return (
        <div
          key={`row-${i}`}
          className="absolute bg-gradient-to-r from-primary/20 to-primary/40"
          style={{
            left: 0,
            top: `${position + 16}px`,
            height: "1px",
            width: `${canvasSize.width - containerPadding[0]}px`,
            zIndex: 0,
            opacity: i % 3 === 0 ? 0.8 : 0.4, // Make every 3rd line more prominent
          }}
        />
      );
    });

    // Create grid cells (optional - for more visual appeal)
    const gridCells = [];
    for (let rowIdx = 0; rowIdx < rowsCount; rowIdx++) {
      for (let colIdx = 0; colIdx < COLUMNS_COUNT; colIdx++) {
        // Create cells only at certain positions for a dotted pattern effect
        if ((rowIdx + colIdx) % 3 === 0) {
          gridCells.push(
            <div
              key={`cell-${rowIdx}-${colIdx}`}
              className="absolute rounded-full grid-cell-highlight"
              style={{
                left: `${getColumnPosition(colIdx) + columnWidth / 2}px`,
                top: `${getRowPosition(rowIdx) + rowHeight / 2}px`,
                width: "4px",
                height: "4px",
                transform: "translate(-50%, -50%)",
                backgroundColor: "var(--primary)",
                zIndex: 0,
              }}
            />
          );
        }
      }
    }

    // Column coordinates (labels)
    const columnCoordinates = Array.from({ length: COLUMNS_COUNT }).map(
      (_, i) => (
        <div
          key={`col-label-${i}`}
          className="absolute text-[10px] font-medium bg-white dark:bg-foreground/10 px-1 py-0.5 rounded-sm shadow-sm"
          style={{
            left: `${getColumnPosition(i)}px`,
            top: "2px",
            transform: "translateX(-50%)",
            zIndex: 1,
            color: "var(--primary)",
            border: "1px solid var(--primary-light)",
          }}
        >
          {i}
        </div>
      )
    );

    // Row coordinates (every 5th row)
    const rowCoordinates = Array.from({
      length: Math.ceil(rowsCount / 5) - 1,
    }).map((_, i) => {
      const rowIdx = (i + 1) * 5;
      return (
        <div
          key={`row-label-${rowIdx}`}
          className="absolute text-[10px] font-medium bg-white dark:bg-foreground/10 px-1 py-0.5 rounded-sm shadow-sm"
          style={{
            left: "2px",
            top: `${getRowPosition(rowIdx)}px`,
            transform: "translateY(0%)",
            zIndex: 1,
            color: "var(--primary)",
            border: "1px solid var(--primary-light)",
          }}
        >
          {rowIdx}
        </div>
      );
    });

    return (
      <div
        className="absolute inset-0 pointer-events-none z-0"
        style={{ opacity: gridOpacity }}
      >
        {columnLines}
        {rowLines}
        {gridCells}
        {columnCoordinates}
        {rowCoordinates}
      </div>
    );
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
          <div className="flex items-center gap-2">
            <div className="flex items-center">
              <input
                type="range"
                min="0.2"
                max="1"
                step="0.1"
                value={gridOpacity}
                onChange={(e) => setGridOpacity(parseFloat(e.target.value))}
                className="w-20 h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer range-sm mr-2"
                style={{ display: showGrid ? "block" : "none" }}
              />
            </div>
            <button
              className={`text-xs px-3 py-1.5 rounded-md border flex items-center gap-1.5 transition-all ${
                showGrid
                  ? "bg-primary text-white border-primary/30 shadow-sm"
                  : "bg-white text-foreground-alt border-border hover:border-primary-light hover:bg-surface"
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
          className={`flex-1 overflow-auto pb-20 relative ${
            isDraggingOver ? "bg-primary/5" : ""
          }`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={handleCanvasClick}
        >
          {/* Grid overlay */}
          {renderGridLines()}

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
                rowHeight={rowHeight}
                onLayoutChange={handleLayoutChange}
                isDraggable={true}
                isResizable={true}
                margin={margin}
                containerPadding={containerPadding}
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

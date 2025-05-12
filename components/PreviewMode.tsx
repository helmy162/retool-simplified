import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import { Responsive, WidthProvider } from "react-grid-layout";
import { Eye, AlertCircle, Smartphone, Monitor, Tablet } from "lucide-react";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";
import { DeviceType, IComponent } from "@/types";

// Use WidthProvider to automatically set width
const ResponsiveGridLayout = WidthProvider(Responsive);

export default function PreviewMode({
  components,
}: {
  components: IComponent[];
}) {
  const [deviceType, setDeviceType] = useState<DeviceType>("desktop");

  // Convert components to layout format for react-grid-layout
  const layouts = {
    lg: components.map((component) => ({
      i: component.id,
      x: component.position.x,
      y: component.position.y,
      w: component.position.w,
      h: component.position.h,
    })),
    md: components.map((component) => ({
      i: component.id,
      x: component.position.x,
      y: component.position.y,
      w: Math.min(component.position.w, 6), // Limit width for tablet
      h: component.position.h,
    })),
    sm: components.map((component) => ({
      i: component.id,
      x: 0, // Force single column layout for mobile
      y: component.position.y,
      w: 4, // Full width in mobile view
      h: component.position.h,
    })),
  };

  const getBreakpoint = () => {
    const width = window.innerWidth;
    if (deviceType == "mobile" || (width && width < 768)) return "sm"; // Mobile breakpoint
    if (deviceType == "tablet" || (width && width < 1200)) return "md"; // Tablet breakpoint
    return "lg"; // Desktop breakpoint
  };

  const getContainerWidth = () => {
    switch (deviceType) {
      case "mobile":
        return 375; // phone width
      case "tablet":
        return 768; // tablet width
      default:
        return "100%";
    }
  };

  const renderComponent = (component: IComponent) => {
    switch (component.type) {
      case "text":
        return (
          <div className="w-full h-full overflow-auto">
            {component.useMarkdown !== false ? (
              <div className="prose prose-sm max-w-none">
                <ReactMarkdown>{component.content}</ReactMarkdown>
              </div>
            ) : (
              <div className="whitespace-pre-wrap text-foreground">
                {component.content}
              </div>
            )}
          </div>
        );
      case "image":
        return (
          <div className="w-full h-full">
            <img
              src={component.content}
              alt="Preview"
              className="w-full h-full max-w-full max-h-full object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src =
                  "https://placehold.co/600x400/f3f4f6/94a3b8?text=Image+Not+Found";
              }}
            />
          </div>
        );
      default:
        return null;
    }
  };

  const getDeviceFrame = () => {
    if (deviceType === "desktop") return null;

    const frameClasses = {
      mobile: "rounded-3xl border-8 border-foreground shadow-xl",
      tablet: "rounded-2xl border-[12px] border-foreground shadow-xl",
    };

    return (
      <div
        className={`mx-auto overflow-hidden bg-white ${frameClasses[deviceType]}`}
        style={{
          width: getContainerWidth() as number,
          maxHeight: deviceType === "mobile" ? "80vh" : "85vh",
          height: deviceType === "mobile" ? "667px" : "1024px",
        }}
      >
        {/* Notch for mobile */}
        {deviceType === "mobile" && (
          <div className="relative">
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-1/2 h-5 bg-foreground rounded-b-lg z-10"></div>
          </div>
        )}
        <div className="h-full overflow-auto">
          <div className="preview-content-container" style={{ width: "100%" }}>
            {renderPreviewContent()}
          </div>
        </div>

        {/* Home indicator for mobile */}
        {deviceType === "mobile" && (
          <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 w-1/3 h-1 bg-foreground rounded-full"></div>
        )}
      </div>
    );
  };

  const renderPreviewContent = () => {
    if (components.length === 0) {
      return (
        <div className="text-center p-12 border-2 border-dashed border-border rounded-lg">
          <div className="inline-flex justify-center items-center w-12 h-12 rounded-full bg-surface mb-4">
            <AlertCircle size={24} className="text-muted" />
          </div>
          <h3 className="text-lg font-medium mb-2">No components added yet</h3>
          <p className="text-foreground-alt">
            Switch back to Edit Mode to start building your layout
          </p>
        </div>
      );
    }

    return (
      <div className={`w-full min-h-[400px]`}>
        <ResponsiveGridLayout
          className="layout"
          layouts={layouts}
          breakpoints={{ lg: 1200, md: 768, sm: 375, xs: 375, xxs: 0 }}
          cols={{ lg: 12, md: 4, sm: 4, xs: 4, xxs: 2 }}
          rowHeight={30}
          isDraggable={false}
          isResizable={false}
          margin={[10, 0]}
          containerPadding={[10, 10]}
          compactType={null}
          preventCollision={true}
          breakpoint={getBreakpoint()}
          width={
            deviceType === "desktop"
              ? undefined
              : (getContainerWidth() as number)
          }
        >
          {components.map((component) => (
            <div key={component.id} className="component-wrapper">
              {renderComponent(component)}
            </div>
          ))}
        </ResponsiveGridLayout>
      </div>
    );
  };

  return (
    <div className="bg-background">
      <div className={`max-w-[90rem] mx-auto pt-4 `}>
        <div className="flex items-center justify-between mb-6 p-3 bg-surface border border-border rounded-md">
          <div className="flex items-center gap-2 text-sm text-foreground-alt">
            <Eye size={16} className="text-primary" />
            <span>
              Preview Mode -{" "}
              {deviceType.charAt(0).toUpperCase() + deviceType.slice(1)} View
            </span>
          </div>

          {/* Device switcher */}
          <div className="flex items-center gap-2">
            <div className="bg-background-alt rounded-md border border-border p-1 flex">
              <button
                onClick={() => setDeviceType("desktop")}
                className={`p-1.5 rounded-md ${
                  deviceType === "desktop"
                    ? "bg-primary text-white"
                    : "text-foreground hover:bg-surface"
                }`}
                title="Desktop view"
              >
                <Monitor size={18} />
              </button>
              <button
                onClick={() => setDeviceType("tablet")}
                className={`p-1.5 rounded-md ${
                  deviceType === "tablet"
                    ? "bg-primary text-white"
                    : "text-foreground hover:bg-surface"
                }`}
                title="Tablet view"
              >
                <Tablet size={18} />
              </button>
              <button
                onClick={() => setDeviceType("mobile")}
                className={`p-1.5 rounded-md ${
                  deviceType === "mobile"
                    ? "bg-primary text-white"
                    : "text-foreground hover:bg-surface"
                }`}
                title="Mobile view"
              >
                <Smartphone size={18} />
              </button>
            </div>
          </div>
        </div>

        {/* Preview content */}
        {deviceType !== "desktop" ? (
          <div className="flex justify-center mb-16">{getDeviceFrame()}</div>
        ) : (
          renderPreviewContent()
        )}
      </div>
    </div>
  );
}

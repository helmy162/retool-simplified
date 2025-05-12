"use client";

import React, { useState, useCallback, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import Header from "@/components/Header";
import ComponentSidebar from "@/components/ComponentSidebar";
import EditorCanvas from "@/components/EditorCanvas";
import PreviewMode from "@/components/PreviewMode";
import { toast } from "react-toastify";
import { DESIGN_COMPONENTS } from "@/lib/sample_design";
import { ComponentType, IComponent } from "@/types";

const LOCAL_STORAGE_KEY = "retool-components";

export default function Home() {
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [components, setComponents] = useState<IComponent[]>(DESIGN_COMPONENTS);

  // Load components from localStorage on initial load
  useEffect(() => {
    const savedComponents = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (savedComponents) {
      try {
        setComponents(JSON.parse(savedComponents));
      } catch (e) {
        console.error("Failed to load saved components:", e);
      }
    }
  }, []);

  const saveComponents = useCallback(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(components));
      toast.success("Layout saved successfully!");
    } catch (e) {
      console.error("Failed to save components:", e);
      toast.error("Failed to save layout. Please try again.");
    }
  }, [components]);

  const togglePreviewMode = useCallback(() => {
    setIsPreviewMode(!isPreviewMode);
  }, [isPreviewMode]);

  const addComponent = useCallback(
    (type: ComponentType, position?: { x: number; y: number }) => {
      const newId = uuidv4();

      // Default content based on component type
      const defaultContent =
        type === "text"
          ? "# Hello World\n\nThis is editable text. You can use **markdown** formatting."
          : "https://placehold.co/600x400/f8fafc/334155?text=Image";

      // Use provided position or default to top-left or the first available space
      const x = position?.x ?? 0;
      const y = position?.y ?? 0;

      // Create the new component
      const newComponent: IComponent = {
        id: newId,
        type,
        content: defaultContent,
        position: {
          x: x, // Use specified position or default
          y: y, // Use specified position or default
          w: 6, // Default width
          h: 12, // Default height
        },
        useMarkdown: type === "text" ? true : undefined,
      };

      setComponents([...components, newComponent]);
      toast.success(`New ${type} component added successfully`);

      return newComponent;
    },
    [components]
  );

  const updateComponent = useCallback(
    (id: string, updates: Partial<IComponent>) => {
      setComponents(
        components.map((component) =>
          component.id === id ? { ...component, ...updates } : component
        )
      );
    },
    [components]
  );

  const removeComponent = useCallback(
    (id: string) => {
      setComponents(components.filter((component) => component.id !== id));
      toast.success("Component removed successfully!");
    },
    [components]
  );

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Save with Ctrl+S or Cmd+S
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        saveComponents();
      }

      // Toggle preview mode with Ctrl+P or Cmd+P
      if ((e.ctrlKey || e.metaKey) && e.key === "p") {
        e.preventDefault();
        togglePreviewMode();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [saveComponents, togglePreviewMode]);

  return (
    <div className="flex flex-col h-screen">
      <Header
        isPreviewMode={isPreviewMode}
        togglePreviewMode={togglePreviewMode}
        onSave={saveComponents}
      />

      <div className="flex flex-1 overflow-hidden">
        {!isPreviewMode && <ComponentSidebar onAddComponent={addComponent} />}

        <div className="flex-1 overflow-auto relative">
          {isPreviewMode ? (
            <PreviewMode components={components} />
          ) : (
            <EditorCanvas
              components={components}
              updateComponent={updateComponent}
              removeComponent={removeComponent}
              addComponent={addComponent}
            />
          )}
        </div>
      </div>
    </div>
  );
}

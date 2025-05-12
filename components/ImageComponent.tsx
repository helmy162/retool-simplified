import React, { useEffect, useState } from "react";
import { Image, Edit, Check, X, Link as LinkIcon } from "lucide-react";

interface ImageComponentProps {
  id: string;
  content: string;
  isSelected: boolean;
  onSelect: (id: string) => void;
  updateContent: (content: string) => void;
}

export default function ImageComponent({
  id,
  content,
  isSelected,
  onSelect,
  updateContent,
}: ImageComponentProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [inputValue, setInputValue] = useState(content);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setError(null);
  }, [content]);

  // Double-click to edit inline
  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditing(true);
    setInputValue(content);
  };

  const handleSaveEdit = () => {
    updateContent(inputValue);
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setInputValue(content);
    setIsEditing(false);
    setError(null);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    setError(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      handleSaveEdit();
    } else if (e.key === "Escape") {
      handleCancelEdit();
    }
  };

  const handleImageError = () => {
    setError("Unable to load image. Please check the URL.");
    setIsLoading(false);
  };

  const handleImageLoad = () => {
    setIsLoading(false);
  };

  const handleMouseDown = () => {
    onSelect(id);
  };

  return (
    <div
      className={`h-full w-full rounded-md overflow-hidden component-card ${
        isSelected ? "selected" : ""
      }`}
      onDoubleClick={handleDoubleClick}
      onMouseDown={handleMouseDown}
    >
      <div className="component-header draggable-header">
        <div className="flex items-center gap-2">
          <Image size={14} className="text-primary" />
          <span className="text-xs font-medium text-foreground-alt">Image</span>
        </div>

        {isEditing && (
          <div className="flex items-center gap-1">
            <button
              onClick={handleSaveEdit}
              className="p-1 text-xs rounded-full hover:bg-primary/10 text-primary"
              title="Save"
            >
              <Check size={14} />
            </button>
            <button
              onClick={handleCancelEdit}
              className="p-1 text-xs rounded-full hover:bg-error/10 text-error"
              title="Cancel"
            >
              <X size={14} />
            </button>
          </div>
        )}

        {!isEditing && isSelected && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsEditing(true);
            }}
            className="p-1 text-xs rounded-full hover:bg-primary/10 text-primary"
            title="Edit URL"
          >
            <Edit size={14} />
          </button>
        )}
      </div>

      <div className="p-0 h-[calc(100%-34px)] overflow-hidden bg-white">
        {isEditing ? (
          <div className="p-3 flex items-center h-full">
            <div className="relative w-full">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <LinkIcon size={14} className="text-muted" />
              </div>
              <input
                className="w-full p-2 pl-9 border rounded focus:outline-none focus:ring-2 focus:ring-primary-light focus:border-primary-light text-foreground"
                value={inputValue}
                onChange={handleChange}
                onBlur={handleSaveEdit}
                onKeyDown={handleKeyDown}
                placeholder="Enter image URL"
                autoFocus
                onClick={(e) => e.stopPropagation()} // Prevent dragging the input
              />
            </div>
          </div>
        ) : (
          <div className="w-full h-full flex items-center justify-center overflow-hidden bg-background-alt relative">
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
              </div>
            )}

            {error ? (
              <div className="text-error text-sm p-4 text-center">
                <div className="flex justify-center mb-2">
                  <X size={20} className="text-error" />
                </div>
                {error}
                <div className="mt-3">
                  <button
                    className="text-xs text-primary underline"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsEditing(true);
                    }}
                  >
                    Edit URL
                  </button>
                </div>
              </div>
            ) : (
              <>
                <img
                  src={content}
                  alt="Component image"
                  className="w-full h-full max-w-full max-h-full object-cover"
                  onError={handleImageError}
                  onLoad={handleImageLoad}
                  style={{
                    opacity: isLoading ? 0 : 1,
                    transition: "opacity 0.3s ease",
                  }}
                />
                {!isLoading && content && (
                  <div className="absolute bottom-0 left-0 p-1 text-xs bg-foreground bg-opacity-50 text-white rounded-tl-md">
                    <span className="opacity-80 line-clamp-1">
                      URL: {content}
                    </span>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

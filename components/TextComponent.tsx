import React, { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import { Type, Edit, Check, X } from "lucide-react";

interface TextComponentProps {
  id: string;
  content: string;
  isSelected: boolean;
  useMarkdown: boolean;
  onSelect: (id: string) => void;
  updateContent: (content: string) => void;
}

export default function TextComponent({
  id,
  content,
  isSelected,
  useMarkdown,
  onSelect,
  updateContent,
}: TextComponentProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [localContent, setLocalContent] = useState(content);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Keep local content in sync with props
  useEffect(() => {
    setLocalContent(content);
  }, [content]);

  // Focus textarea when edit mode is activated
  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [isEditing]);

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setLocalContent(content); // Revert to original content
    setIsEditing(false);
  };

  const handleSaveEdit = () => {
    updateContent(localContent);
    setIsEditing(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setLocalContent(e.target.value);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Save on Ctrl+Enter or Cmd+Enter
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      handleSaveEdit();
    } else if (e.key === "Escape") {
      handleCancelEdit();
    }
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
          <Type size={14} className="text-primary" />
          <span className="text-xs font-medium text-foreground-alt">Text</span>
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
            title="Edit"
          >
            <Edit size={14} />
          </button>
        )}
      </div>

      <div className="p-0 h-[calc(100%-34px)] overflow-auto bg-white">
        {isEditing ? (
          <textarea
            ref={textareaRef}
            className="w-full h-full p-3 border-none resize-none focus:outline-none focus:ring-0 bg-white text-foreground"
            value={localContent}
            onChange={handleChange}
            onBlur={handleSaveEdit}
            onKeyDown={handleKeyDown}
            placeholder="Enter text content..."
            onMouseDown={(e) => e.stopPropagation()} // Prevent closing when clicking inside textarea
          />
        ) : (
          <div className="w-full h-full p-3 overflow-auto">
            {useMarkdown ? (
              <div className="prose prose-sm max-w-none">
                <ReactMarkdown>{content}</ReactMarkdown>
              </div>
            ) : (
              <div className="whitespace-pre-wrap text-foreground">
                {content}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

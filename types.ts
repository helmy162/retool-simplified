export interface IComponent {
  id: string;
  type: ComponentType;
  content: string;
  position: {
    x: number;
    y: number;
    w: number;
    h: number;
  };
  useMarkdown?: boolean;
}

export type DeviceType = "desktop" | "tablet" | "mobile";

export type ComponentType = "text" | "image";
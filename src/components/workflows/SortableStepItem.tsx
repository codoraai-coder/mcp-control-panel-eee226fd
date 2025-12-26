import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export interface ConfigField {
  name: string;
  label: string;
  type: "text" | "textarea" | "select" | "number" | "checkbox";
  required?: boolean;
  placeholder?: string;
  options?: string[];
  default?: unknown;
}

export interface ToolDefinition {
  value: string;
  label: string;
  configFields: ConfigField[];
}

interface SortableStepItemProps {
  id: string;
  stepNumber: number;
  selectedTool: string;
  config: Record<string, unknown>;
  tools: ToolDefinition[];
  onToolChange: (tool: string) => void;
  onConfigChange: (key: string, value: unknown) => void;
  onRemove: () => void;
  canRemove: boolean;
}

export function SortableStepItem({
  id,
  stepNumber,
  selectedTool,
  config,
  tools,
  onToolChange,
  onConfigChange,
  onRemove,
  canRemove,
}: SortableStepItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const selectedToolDef = tools.find((t) => t.value === selectedTool);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`rounded-lg border bg-card p-4 space-y-3 ${
        isDragging ? "opacity-50 shadow-lg" : ""
      }`}
    >
      <div className="flex items-center gap-3">
        <button
          type="button"
          className="cursor-grab touch-none text-muted-foreground hover:text-foreground"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="h-5 w-5" />
        </button>

        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-medium text-primary-foreground">
          {stepNumber}
        </span>

        <div className="flex-1">
          <Select value={selectedTool} onValueChange={onToolChange}>
            <SelectTrigger>
              <SelectValue placeholder="Select a tool" />
            </SelectTrigger>
            <SelectContent>
              {tools.map((tool) => (
                <SelectItem key={tool.value} value={tool.value}>
                  {tool.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={onRemove}
          disabled={!canRemove}
          className="h-8 w-8 text-muted-foreground hover:text-destructive"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      {selectedToolDef && selectedToolDef.configFields.length > 0 && (
        <div className="ml-8 space-y-3 border-l-2 border-muted pl-4">
          {selectedToolDef.configFields.map((field) => (
            <div key={field.name} className="space-y-1.5">
              <Label htmlFor={`${id}-${field.name}`} className="text-sm">
                {field.label}
                {field.required && <span className="text-destructive ml-1">*</span>}
              </Label>

              {field.type === "text" && (
                <Input
                  id={`${id}-${field.name}`}
                  placeholder={field.placeholder}
                  value={(config[field.name] as string) || ""}
                  onChange={(e) => onConfigChange(field.name, e.target.value)}
                />
              )}

              {field.type === "textarea" && (
                <Textarea
                  id={`${id}-${field.name}`}
                  placeholder={field.placeholder}
                  value={(config[field.name] as string) || ""}
                  onChange={(e) => onConfigChange(field.name, e.target.value)}
                  className="resize-none"
                  rows={3}
                />
              )}

              {field.type === "number" && (
                <Input
                  id={`${id}-${field.name}`}
                  type="number"
                  placeholder={field.placeholder}
                  value={String((config[field.name] as number) ?? field.default ?? "")}
                  onChange={(e) => onConfigChange(field.name, parseInt(e.target.value) || 0)}
                />
              )}

              {field.type === "select" && field.options && (
                <Select
                  value={(config[field.name] as string) || ""}
                  onValueChange={(value) => onConfigChange(field.name, value)}
                >
                  <SelectTrigger id={`${id}-${field.name}`}>
                    <SelectValue placeholder={`Select ${field.label.toLowerCase()}`} />
                  </SelectTrigger>
                  <SelectContent>
                    {field.options.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option.charAt(0).toUpperCase() + option.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}

              {field.type === "checkbox" && (
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id={`${id}-${field.name}`}
                    checked={(config[field.name] as boolean) || false}
                    onCheckedChange={(checked) => onConfigChange(field.name, checked)}
                  />
                  <Label htmlFor={`${id}-${field.name}`} className="text-sm font-normal">
                    {field.placeholder || "Enable"}
                  </Label>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

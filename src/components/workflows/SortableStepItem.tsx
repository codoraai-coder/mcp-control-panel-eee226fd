import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Trash2, Link2, ChevronDown } from "lucide-react";
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
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useState } from "react";
import { cn } from "@/lib/utils";

export interface ConfigField {
  name: string;
  label: string;
  type: "text" | "textarea" | "select" | "number" | "checkbox";
  required?: boolean;
  placeholder?: string;
  options?: string[];
  default?: unknown;
  canUseReference?: boolean;
  referenceTypes?: string[];
}

export interface ToolDefinition {
  value: string;
  label: string;
  configFields: ConfigField[];
  produces: string[];
  consumes: string[];
  requiresContentFromPreviousStep?: boolean;
}

export interface PreviousStepInfo {
  index: number;
  tool: string;
  label: string;
  produces: string[];
}

export interface StepReferenceValue {
  type: 'manual' | 'step_reference';
  step_index?: number;
  field?: string;
  manual_value?: string | number | boolean;
}

interface SortableStepItemProps {
  id: string;
  stepNumber: number;
  selectedTool: string;
  config: Record<string, unknown>;
  tools: ToolDefinition[];
  previousSteps: PreviousStepInfo[];
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
  previousSteps,
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

  const [expandedRefs, setExpandedRefs] = useState<Record<string, boolean>>({});

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const selectedToolDef = tools.find((t) => t.value === selectedTool);

  const getCompatibleSteps = (referenceTypes: string[] | undefined): PreviousStepInfo[] => {
    if (!referenceTypes || referenceTypes.length === 0) return [];
    return previousSteps.filter((step) =>
      step.produces.some((output) => referenceTypes.includes(output))
    );
  };

  const getRefValue = (fieldName: string): StepReferenceValue | null => {
    const refKey = `${fieldName}_source`;
    return config[refKey] as StepReferenceValue | null;
  };

  const setRefValue = (fieldName: string, ref: StepReferenceValue) => {
    onConfigChange(`${fieldName}_source`, ref);
    if (ref.type === 'manual') {
      onConfigChange(fieldName, ref.manual_value ?? '');
    }
  };

  const isUsingReference = (fieldName: string): boolean => {
    const ref = getRefValue(fieldName);
    return ref?.type === 'step_reference';
  };

  const getReferencedStepLabel = (fieldName: string): string | null => {
    const ref = getRefValue(fieldName);
    if (ref?.type !== 'step_reference' || ref.step_index === undefined) return null;
    const step = previousSteps.find((s) => s.index === ref.step_index);
    if (!step) return null;
    return `Step ${step.index + 1}: ${step.label} → ${ref.field}`;
  };

  const toggleRefMode = (fieldName: string, useReference: boolean, referenceTypes?: string[]) => {
    if (useReference) {
      const compatibleSteps = getCompatibleSteps(referenceTypes);
      if (compatibleSteps.length > 0) {
        const firstStep = compatibleSteps[0];
        const matchingOutput = firstStep.produces.find((p) => referenceTypes?.includes(p));
        setRefValue(fieldName, {
          type: 'step_reference',
          step_index: firstStep.index,
          field: matchingOutput || firstStep.produces[0],
        });
      }
    } else {
      setRefValue(fieldName, {
        type: 'manual',
        manual_value: config[fieldName] as string ?? '',
      });
    }
  };

  const renderReferenceSelector = (field: ConfigField) => {
    const compatibleSteps = getCompatibleSteps(field.referenceTypes);
    const ref = getRefValue(field.name);
    const isRef = ref?.type === 'step_reference';

    if (compatibleSteps.length === 0) {
      return null;
    }

    return (
      <Collapsible
        open={expandedRefs[field.name]}
        onOpenChange={(open) => setExpandedRefs((prev) => ({ ...prev, [field.name]: open }))}
      >
        <div className="flex items-center gap-2 mb-2">
          <Button
            type="button"
            variant={isRef ? "default" : "outline"}
            size="sm"
            className={cn(
              "h-7 text-xs gap-1.5",
              isRef && "bg-primary/90 hover:bg-primary"
            )}
            onClick={() => toggleRefMode(field.name, !isRef, field.referenceTypes)}
          >
            <Link2 className="h-3.5 w-3.5" />
            {isRef ? "Using Previous Step" : "Use Previous Step"}
          </Button>
          {isRef && (
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm" className="h-7 text-xs gap-1">
                <span className="text-muted-foreground truncate max-w-[180px]">
                  {getReferencedStepLabel(field.name)}
                </span>
                <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", expandedRefs[field.name] && "rotate-180")} />
              </Button>
            </CollapsibleTrigger>
          )}
        </div>
        {isRef && (
          <CollapsibleContent>
            <div className="flex gap-2 p-2 rounded-md bg-muted/50 border border-border/50">
              <Select
                value={`${ref?.step_index}-${ref?.field}`}
                onValueChange={(value) => {
                  const [stepIdx, ...fieldParts] = value.split('-');
                  const fieldName = fieldParts.join('-');
                  setRefValue(field.name, {
                    type: 'step_reference',
                    step_index: parseInt(stepIdx),
                    field: fieldName,
                  });
                }}
              >
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue placeholder="Select source" />
                </SelectTrigger>
                <SelectContent>
                  {compatibleSteps.map((step) =>
                    step.produces
                      .filter((output) => field.referenceTypes?.includes(output))
                      .map((output) => (
                        <SelectItem key={`${step.index}-${output}`} value={`${step.index}-${output}`}>
                          Step {step.index + 1}: {step.label} → {output}
                        </SelectItem>
                      ))
                  )}
                </SelectContent>
              </Select>
            </div>
          </CollapsibleContent>
        )}
      </Collapsible>
    );
  };

  const renderField = (field: ConfigField) => {
    const isRef = isUsingReference(field.name);
    const compatibleSteps = getCompatibleSteps(field.referenceTypes);
    const showRefOption = field.canUseReference && compatibleSteps.length > 0;

    return (
      <div key={field.name} className="space-y-1.5">
        <Label htmlFor={`${id}-${field.name}`} className="text-sm">
          {field.label}
          {field.required && <span className="text-destructive ml-1">*</span>}
        </Label>

        {showRefOption && renderReferenceSelector(field)}

        {(!isRef || !showRefOption) && (
          <>
            {field.type === "text" && (
              <Input
                id={`${id}-${field.name}`}
                placeholder={field.placeholder}
                value={(config[field.name] as string) || ""}
                onChange={(e) => {
                  onConfigChange(field.name, e.target.value);
                  if (showRefOption) {
                    setRefValue(field.name, { type: 'manual', manual_value: e.target.value });
                  }
                }}
              />
            )}

            {field.type === "textarea" && (
              <Textarea
                id={`${id}-${field.name}`}
                placeholder={field.placeholder}
                value={(config[field.name] as string) || ""}
                onChange={(e) => {
                  onConfigChange(field.name, e.target.value);
                  if (showRefOption) {
                    setRefValue(field.name, { type: 'manual', manual_value: e.target.value });
                  }
                }}
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
          </>
        )}
      </div>
    );
  };

  // Determine if this step has connections to previous steps
  const hasConnections = selectedToolDef?.configFields.some((field) => {
    const ref = getRefValue(field.name);
    return ref?.type === 'step_reference';
  });

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "rounded-lg border bg-card p-4 space-y-3 relative",
        isDragging && "opacity-50 shadow-lg",
        hasConnections && "border-l-4 border-l-primary"
      )}
    >
      {/* Visual connection indicator */}
      {hasConnections && (
        <div className="absolute -left-[18px] top-1/2 -translate-y-1/2 flex items-center">
          <div className="w-3 h-px bg-primary" />
          <div className="w-2 h-2 rounded-full bg-primary" />
        </div>
      )}

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
          {selectedToolDef.configFields.map(renderField)}
        </div>
      )}
    </div>
  );
}

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Plus } from "lucide-react";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useWorkflows } from "@/hooks/use-workflows";
import { toast } from "sonner";
import { SortableStepItem, ToolDefinition, PreviousStepInfo, StepReferenceValue } from "./SortableStepItem";
import { generateId } from "@/lib/utils";

const AVAILABLE_TOOLS: ToolDefinition[] = [
  {
    value: "blog_generator",
    label: "Blog Generator",
    produces: ["topic", "blog_content", "cover_image", "docx_url", "id"],
    consumes: [],
    configFields: [
      { name: "topic", label: "Topic", type: "text", required: true, placeholder: "e.g., AI trends in 2025" },
      { name: "style", label: "Style", type: "select", options: ["informative", "storytelling", "tutorial", "opinion"] },
    ],
  },
  {
    value: "image_generator",
    label: "Image Generator",
    produces: ["topic", "quote_text", "image_url", "id"],
    consumes: ["topic"],
    configFields: [
      { name: "topic", label: "Topic", type: "text", required: true, placeholder: "e.g., Motivation for success", canUseReference: true, referenceTypes: ["topic"] },
    ],
  },
  {
    value: "caption_generator",
    label: "Caption Generator",
    produces: ["topic", "caption", "id"],
    consumes: ["topic", "blog_content"],
    configFields: [
      { name: "topic", label: "Topic", type: "text", required: true, placeholder: "e.g., Product launch announcement", canUseReference: true, referenceTypes: ["topic", "blog_content"] },
      { name: "tone", label: "Tone", type: "select", options: ["professional", "casual", "humorous", "inspirational"] },
      { name: "include_emojis", label: "Include Emojis", type: "checkbox", placeholder: "Add emojis to caption" },
      { name: "include_hashtags", label: "Include Hashtags", type: "checkbox", placeholder: "Add hashtags to caption" },
    ],
  },
  {
    value: "hashtag_generator",
    label: "Hashtag Generator",
    produces: ["topic", "hashtags", "id"],
    consumes: ["topic", "caption"],
    configFields: [
      { name: "topic", label: "Topic", type: "text", required: true, placeholder: "e.g., Digital marketing", canUseReference: true, referenceTypes: ["topic", "caption"] },
      { name: "count", label: "Number of Hashtags", type: "number", default: 10 },
    ],
  },
  {
    value: "content_optimizer",
    label: "Content Optimizer",
    produces: ["optimized_content", "id"],
    consumes: ["blog_content", "caption"],
    configFields: [
      { name: "content", label: "Content to Optimize", type: "textarea", required: true, placeholder: "Paste your content here...", canUseReference: true, referenceTypes: ["blog_content", "caption", "optimized_content"] },
      { name: "goal", label: "Optimization Goal", type: "select", options: ["engagement", "clarity", "seo", "brevity"] },
    ],
  },
  {
    value: "post_to_x",
    label: "Post to X (Twitter)",
    produces: [],
    consumes: ["caption", "optimized_content", "hashtags", "image_url", "id"],
    requiresContentFromPreviousStep: true,
    configFields: [
      { name: "custom_text", label: "Custom Post Text (Optional)", type: "textarea", placeholder: "Override with custom text...", canUseReference: true, referenceTypes: ["caption", "optimized_content"] },
    ],
  },
];

interface WorkflowStepState {
  id: string;
  tool: string;
  config: Record<string, unknown>;
}

const createWorkflowSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name must be less than 100 characters"),
  description: z.string().max(500, "Description must be less than 500 characters").optional(),
  target_platform: z.enum(["linkedin", "twitter", "instagram", "facebook"]).optional(),
});

type CreateWorkflowForm = z.infer<typeof createWorkflowSchema>;

interface CreateWorkflowDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateWorkflowDialog({ open, onOpenChange }: CreateWorkflowDialogProps) {
  const { createWorkflow, isCreating } = useWorkflows();
  const { workspaceId } = useWorkspace();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [steps, setSteps] = useState<WorkflowStepState[]>([
    { id: generateId(), tool: "", config: {} },
  ]);
  const [stepsError, setStepsError] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const form = useForm<CreateWorkflowForm>({
    resolver: zodResolver(createWorkflowSchema),
    defaultValues: {
      name: "",
      description: "",
      target_platform: undefined,
    },
  });

  const addStep = () => {
    setSteps((prev) => [...prev, { id: generateId(), tool: "", config: {} }]);
    setStepsError(null);
  };

  const removeStep = (id: string) => {
    if (steps.length > 1) {
      setSteps((prev) => prev.filter((step) => step.id !== id));
    }
  };

  const updateStepTool = (id: string, tool: string) => {
    setSteps((prev) =>
      prev.map((step) =>
        step.id === id ? { ...step, tool, config: {} } : step
      )
    );
    setStepsError(null);
  };

  const updateStepConfig = (id: string, key: string, value: unknown) => {
    setSteps((prev) =>
      prev.map((step) =>
        step.id === id
          ? { ...step, config: { ...step.config, [key]: value } }
          : step
      )
    );
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setSteps((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const validateSteps = (): boolean => {
    // Check if all steps have a tool selected
    const hasEmptyTool = steps.some((step) => !step.tool);
    if (hasEmptyTool) {
      setStepsError("Please select a tool for all steps");
      return false;
    }

    // Check if required config fields are filled
    for (const step of steps) {
      const toolDef = AVAILABLE_TOOLS.find((t) => t.value === step.tool);
      if (toolDef) {
        for (const field of toolDef.configFields) {
          if (field.required) {
            const directValue = step.config[field.name];
            const sourceRef = step.config[`${field.name}_source`] as StepReferenceValue | undefined;
            
            // Field is valid if it has a direct value OR it's using a step reference
            const hasDirectValue = directValue !== undefined && directValue !== '';
            const hasStepReference = sourceRef?.type === 'step_reference' && 
                                     sourceRef.step_index !== undefined && 
                                     sourceRef.field;
            
            if (!hasDirectValue && !hasStepReference) {
              setStepsError(`Please fill in the "${field.label}" field for ${toolDef.label}`);
              return false;
            }
          }
        }
      }
    }

    setStepsError(null);
    return true;
  };

  // Hardcoded default workspace ID as fallback
  const DEFAULT_WORKSPACE_ID = '4ebdc9fe-1c7e-4138-a7fb-0186db2c4212';

  // Transform step config to auto-inject workspace_id and content_id reference for post_to_x
  const transformStepConfig = (step: WorkflowStepState, index: number): Record<string, unknown> => {
    const config = { ...step.config };
    
    // Auto-inject workspace_id and content_id reference for post_to_x
    if (step.tool === 'post_to_x') {
      // Always ensure workspace_id is set with hardcoded fallback
      config.workspace_id = workspaceId || DEFAULT_WORKSPACE_ID;
      
      // Auto-reference id from previous step if not manually set (database column is 'id', not 'content_id')
      if (!config.content_id && !config.content_id_source && index > 0) {
        config.content_id_source = {
          type: 'step_reference',
          step_index: index - 1,
          field: 'id'
        };
      }
    }
    
    return config;
  };

  const onSubmit = async (data: CreateWorkflowForm) => {
    if (!validateSteps()) {
      return;
    }

    setIsSubmitting(true);
    try {
      await createWorkflow({
        name: data.name,
        description: data.description || undefined,
        target_platform: data.target_platform,
        steps: steps.map((step, index) => ({
          order: index + 1,
          name: AVAILABLE_TOOLS.find((t) => t.value === step.tool)?.label || step.tool,
          tool_name: step.tool,
          config: transformStepConfig(step, index),
        })),
      });
      toast.success("Workflow created successfully");
      form.reset();
      setSteps([{ id: generateId(), tool: "", config: {} }]);
      onOpenChange(false);
    } catch (error) {
      toast.error("Failed to create workflow", {
        description: error instanceof Error ? error.message : "Unknown error",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      form.reset();
      setSteps([{ id: generateId(), tool: "", config: {} }]);
      setStepsError(null);
    }
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Workflow</DialogTitle>
          <DialogDescription>
            Create a multi-step workflow to automate your content generation.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="My Content Pipeline" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe what this workflow does..."
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="target_platform"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Target Platform (optional)</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a platform" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="linkedin">LinkedIn</SelectItem>
                      <SelectItem value="twitter">Twitter</SelectItem>
                      <SelectItem value="instagram">Instagram</SelectItem>
                      <SelectItem value="facebook">Facebook</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <FormLabel className="text-base">Workflow Steps</FormLabel>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addStep}
                  className="h-8"
                >
                  <Plus className="mr-1 h-4 w-4" />
                  Add Step
                </Button>
              </div>

              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={steps.map((s) => s.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="space-y-3">
                    {steps.map((step, index) => {
                      // Build previousSteps info for context-aware references
                      const previousSteps: PreviousStepInfo[] = steps
                        .slice(0, index)
                        .map((prevStep, prevIndex) => {
                          const toolDef = AVAILABLE_TOOLS.find((t) => t.value === prevStep.tool);
                          return {
                            index: prevIndex,
                            tool: prevStep.tool,
                            label: toolDef?.label || prevStep.tool,
                            produces: toolDef?.produces || [],
                          };
                        })
                        .filter((s) => s.tool); // Only include steps with a tool selected

                      return (
                        <SortableStepItem
                          key={step.id}
                          id={step.id}
                          stepNumber={index + 1}
                          selectedTool={step.tool}
                          config={step.config}
                          tools={AVAILABLE_TOOLS}
                          previousSteps={previousSteps}
                          onToolChange={(tool) => updateStepTool(step.id, tool)}
                          onConfigChange={(key, value) =>
                            updateStepConfig(step.id, key, value)
                          }
                          onRemove={() => removeStep(step.id)}
                          canRemove={steps.length > 1}
                        />
                      );
                    })}
                  </div>
                </SortableContext>
              </DndContext>

              {stepsError && (
                <p className="text-sm text-destructive">{stepsError}</p>
              )}
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => handleOpenChange(false)}
                disabled={isSubmitting || isCreating}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="gradient-primary text-primary-foreground"
                disabled={isSubmitting || isCreating}
              >
                {(isSubmitting || isCreating) && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Create Workflow
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

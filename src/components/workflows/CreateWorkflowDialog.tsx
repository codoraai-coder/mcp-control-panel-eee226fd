import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Plus } from "lucide-react";
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
import { SortableStepItem, ToolDefinition } from "./SortableStepItem";
import { generateId } from "@/lib/utils";

const AVAILABLE_TOOLS: ToolDefinition[] = [
  {
    value: "blog_generator",
    label: "Blog Generator",
    configFields: [
      { name: "topic", label: "Topic", type: "text", required: true, placeholder: "e.g., AI trends in 2025" },
      { name: "style", label: "Style", type: "select", options: ["informative", "storytelling", "tutorial", "opinion"] },
    ],
  },
  {
    value: "image_generator",
    label: "Image Generator",
    configFields: [
      { name: "topic", label: "Topic", type: "text", required: true, placeholder: "e.g., Motivation for success" },
    ],
  },
  {
    value: "caption_generator",
    label: "Caption Generator",
    configFields: [
      { name: "topic", label: "Topic", type: "text", required: true, placeholder: "e.g., Product launch announcement" },
      { name: "tone", label: "Tone", type: "select", options: ["professional", "casual", "humorous", "inspirational"] },
      { name: "include_emojis", label: "Include Emojis", type: "checkbox", placeholder: "Add emojis to caption" },
      { name: "include_hashtags", label: "Include Hashtags", type: "checkbox", placeholder: "Add hashtags to caption" },
    ],
  },
  {
    value: "hashtag_generator",
    label: "Hashtag Generator",
    configFields: [
      { name: "topic", label: "Topic", type: "text", required: true, placeholder: "e.g., Digital marketing" },
      { name: "count", label: "Number of Hashtags", type: "number", default: 10 },
    ],
  },
  {
    value: "content_optimizer",
    label: "Content Optimizer",
    configFields: [
      { name: "content", label: "Content to Optimize", type: "textarea", required: true, placeholder: "Paste your content here..." },
      { name: "goal", label: "Optimization Goal", type: "select", options: ["engagement", "clarity", "seo", "brevity"] },
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
          if (field.required && !step.config[field.name]) {
            setStepsError(`Please fill in the "${field.label}" field for ${toolDef.label}`);
            return false;
          }
        }
      }
    }

    setStepsError(null);
    return true;
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
          config: step.config,
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
                    {steps.map((step, index) => (
                      <SortableStepItem
                        key={step.id}
                        id={step.id}
                        stepNumber={index + 1}
                        selectedTool={step.tool}
                        config={step.config}
                        tools={AVAILABLE_TOOLS}
                        onToolChange={(tool) => updateStepTool(step.id, tool)}
                        onConfigChange={(key, value) =>
                          updateStepConfig(step.id, key, value)
                        }
                        onRemove={() => removeStep(step.id)}
                        canRemove={steps.length > 1}
                      />
                    ))}
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

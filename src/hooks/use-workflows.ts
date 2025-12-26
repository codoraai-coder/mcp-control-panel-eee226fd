import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import type { CreateWorkflowDto, UpdateWorkflowDto } from "@/types/mcp";
import { toast } from "sonner";

export function useWorkflows() {
  const queryClient = useQueryClient();
  const { workspaceId } = useWorkspace();

  // List workflows for current workspace
  const workflowsQuery = useQuery({
    queryKey: ["workflows", workspaceId],
    queryFn: () => api.workflows.list(workspaceId!),
    enabled: !!workspaceId,
  });

  // Create workflow mutation
  const createMutation = useMutation({
    mutationFn: (data: Omit<CreateWorkflowDto, "workspace_id">) =>
      api.workflows.create({ ...data, workspace_id: workspaceId! }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workflows", workspaceId] });
      toast.success("Workflow created successfully");
    },
    onError: (error: Error) => {
      toast.error(`Failed to create workflow: ${error.message}`);
    },
  });

  // Delete workflow mutation
  const deleteMutation = useMutation({
    mutationFn: api.workflows.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workflows", workspaceId] });
      toast.success("Workflow deleted successfully");
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete workflow: ${error.message}`);
    },
  });

  // Run workflow mutation
  const runMutation = useMutation({
    mutationFn: api.workflows.run,
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ["workflows", workspaceId] });
      toast.success("Workflow started", {
        description: `Job ${response.job_id} is running`,
      });
      return response;
    },
    onError: (error: Error) => {
      toast.error(`Failed to run workflow: ${error.message}`);
    },
  });

  return {
    workflows: workflowsQuery.data ?? [],
    isLoading: workflowsQuery.isLoading,
    isFetching: workflowsQuery.isFetching,
    error: workflowsQuery.error,
    refetch: workflowsQuery.refetch,
    createWorkflow: createMutation.mutateAsync,
    deleteWorkflow: deleteMutation.mutate,
    runWorkflow: runMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isDeleting: deleteMutation.isPending,
    isRunning: runMutation.isPending,
  };
}

export function useWorkflow(workflowId: string | undefined) {
  const queryClient = useQueryClient();

  // Get single workflow details
  const workflowQuery = useQuery({
    queryKey: ["workflow", workflowId],
    queryFn: () => api.workflows.get(workflowId!),
    enabled: !!workflowId,
  });

  // Update workflow mutation
  const updateMutation = useMutation({
    mutationFn: (data: UpdateWorkflowDto) =>
      api.workflows.update(workflowId!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workflow", workflowId] });
      queryClient.invalidateQueries({ queryKey: ["workflows"] });
      toast.success("Workflow updated successfully");
    },
    onError: (error: Error) => {
      toast.error(`Failed to update workflow: ${error.message}`);
    },
  });

  // Run workflow mutation
  const runMutation = useMutation({
    mutationFn: () => api.workflows.run(workflowId!),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ["workflow", workflowId] });
      toast.success("Workflow started", {
        description: `Job ${response.job_id} is running`,
      });
      return response;
    },
    onError: (error: Error) => {
      toast.error(`Failed to run workflow: ${error.message}`);
    },
  });

  return {
    workflow: workflowQuery.data,
    isLoading: workflowQuery.isLoading,
    error: workflowQuery.error,
    refetch: workflowQuery.refetch,
    updateWorkflow: updateMutation.mutateAsync,
    runWorkflow: runMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
    isRunning: runMutation.isPending,
  };
}

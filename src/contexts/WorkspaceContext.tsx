import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { api } from '@/lib/api';
import { Workspace } from '@/types/mcp';

interface WorkspaceContextType {
  workspace: Workspace | null;
  workspaceId: string | null;
  isLoading: boolean;
  error: string | null;
  setWorkspaceId: (id: string) => void;
  createWorkspace: (name: string, ownerId: string) => Promise<Workspace>;
  refreshWorkspace: () => Promise<void>;
}

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined);

const WORKSPACE_STORAGE_KEY = 'mcp_workspace_id';

interface WorkspaceProviderProps {
  children: ReactNode;
}

export function WorkspaceProvider({ children }: WorkspaceProviderProps) {
  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [workspaceId, setWorkspaceIdState] = useState<string | null>(() => {
    // Initialize from localStorage
    if (typeof window !== 'undefined') {
      return localStorage.getItem(WORKSPACE_STORAGE_KEY);
    }
    return null;
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const setWorkspaceId = useCallback((id: string) => {
    setWorkspaceIdState(id);
    localStorage.setItem(WORKSPACE_STORAGE_KEY, id);
  }, []);

  const fetchWorkspace = useCallback(async (id: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await api.workspaces.get(id);
      setWorkspace(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch workspace';
      setError(message);
      setWorkspace(null);
      // Clear invalid workspace ID
      localStorage.removeItem(WORKSPACE_STORAGE_KEY);
      setWorkspaceIdState(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createWorkspace = useCallback(async (name: string, ownerId: string): Promise<Workspace> => {
    setIsLoading(true);
    setError(null);
    try {
      const newWorkspace = await api.workspaces.create({
        owner_user_id: ownerId,
        name,
      });
      setWorkspace(newWorkspace);
      setWorkspaceId(newWorkspace.id);
      return newWorkspace;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create workspace';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [setWorkspaceId]);

  const refreshWorkspace = useCallback(async () => {
    if (workspaceId) {
      await fetchWorkspace(workspaceId);
    }
  }, [workspaceId, fetchWorkspace]);

  // Fetch workspace when ID changes
  useEffect(() => {
    if (workspaceId) {
      fetchWorkspace(workspaceId);
    } else {
      setWorkspace(null);
    }
  }, [workspaceId, fetchWorkspace]);

  const value: WorkspaceContextType = {
    workspace,
    workspaceId,
    isLoading,
    error,
    setWorkspaceId,
    createWorkspace,
    refreshWorkspace,
  };

  return (
    <WorkspaceContext.Provider value={value}>
      {children}
    </WorkspaceContext.Provider>
  );
}

export function useWorkspace(): WorkspaceContextType {
  const context = useContext(WorkspaceContext);
  if (context === undefined) {
    throw new Error('useWorkspace must be used within a WorkspaceProvider');
  }
  return context;
}

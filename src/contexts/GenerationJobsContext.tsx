import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
import { api, MotivationalPostResponse, BlogPostResponse } from '@/lib/api';
import { toast } from '@/hooks/use-toast';
import { Content, ContentType } from '@/types/mcp';

export interface GenerationJob {
  id: string;
  type: ContentType;
  topic: string;
  status: 'pending' | 'generating' | 'completed' | 'failed';
  startedAt: Date;
  result?: Content;
  error?: string;
}

interface GenerationJobsContextType {
  jobs: GenerationJob[];
  activeJobs: GenerationJob[];
  completedJobs: GenerationJob[];
  startBlogGeneration: (topic: string) => string;
  startImageGeneration: (topic: string) => string;
  cancelJob: (jobId: string) => void;
  clearCompletedJob: (jobId: string) => void;
  clearAllCompleted: () => void;
}

const GenerationJobsContext = createContext<GenerationJobsContextType | null>(null);

export function useGenerationJobs() {
  const context = useContext(GenerationJobsContext);
  if (!context) {
    throw new Error('useGenerationJobs must be used within a GenerationJobsProvider');
  }
  return context;
}

export function GenerationJobsProvider({ children }: { children: React.ReactNode }) {
  const [jobs, setJobs] = useState<GenerationJob[]>([]);
  const abortControllers = useRef<Map<string, AbortController>>(new Map());

  const activeJobs = jobs.filter(j => j.status === 'pending' || j.status === 'generating');
  const completedJobs = jobs.filter(j => j.status === 'completed' || j.status === 'failed');

  const updateJob = useCallback((jobId: string, updates: Partial<GenerationJob>) => {
    setJobs(prev => prev.map(job => 
      job.id === jobId ? { ...job, ...updates } : job
    ));
  }, []);

  const startBlogGeneration = useCallback((topic: string): string => {
    const jobId = `blog-${Date.now()}`;
    const controller = new AbortController();
    abortControllers.current.set(jobId, controller);

    const newJob: GenerationJob = {
      id: jobId,
      type: 'blog',
      topic,
      status: 'generating',
      startedAt: new Date(),
    };

    setJobs(prev => [...prev, newJob]);

    toast({
      title: "Blog generation started",
      description: `Generating blog about "${topic}". This may take 5-10 minutes.`,
    });

    // Run generation in background
    api.generateBlogPost(topic)
      .then((response: BlogPostResponse) => {
        const content: Content = {
          id: `content-${Date.now()}`,
          type: 'blog',
          title: topic,
          description: `Generated blog post about ${topic}`,
          status: 'draft',
          docxUrl: response.docx_url,
          coverUrl: response.cover_url,
          thumbnailUrl: response.cover_url,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        updateJob(jobId, { status: 'completed', result: content });
        
        toast({
          title: "Blog ready!",
          description: `Your blog about "${topic}" has been generated.`,
        });
      })
      .catch((error) => {
        if (error.name === 'AbortError') return;
        
        updateJob(jobId, { 
          status: 'failed', 
          error: error.message || 'Generation failed' 
        });
        
        toast({
          title: "Generation failed",
          description: error.message || 'Failed to generate blog post',
          variant: "destructive",
        });
      })
      .finally(() => {
        abortControllers.current.delete(jobId);
      });

    return jobId;
  }, [updateJob]);

  const startImageGeneration = useCallback((topic: string): string => {
    const jobId = `image-${Date.now()}`;
    const controller = new AbortController();
    abortControllers.current.set(jobId, controller);

    const newJob: GenerationJob = {
      id: jobId,
      type: 'image',
      topic,
      status: 'generating',
      startedAt: new Date(),
    };

    setJobs(prev => [...prev, newJob]);

    toast({
      title: "Image generation started",
      description: `Generating motivational image about "${topic}".`,
    });

    api.generateMotivationalPost(topic)
      .then((response: MotivationalPostResponse) => {
        const content: Content = {
          id: `content-${Date.now()}`,
          type: 'image',
          title: topic,
          description: response.quote_text,
          status: 'draft',
          imageUrl: response.image_url,
          thumbnailUrl: response.image_url,
          quoteText: response.quote_text,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        updateJob(jobId, { status: 'completed', result: content });
        
        toast({
          title: "Image ready!",
          description: `Your motivational image about "${topic}" has been generated.`,
        });
      })
      .catch((error) => {
        if (error.name === 'AbortError') return;
        
        updateJob(jobId, { 
          status: 'failed', 
          error: error.message || 'Generation failed' 
        });
        
        toast({
          title: "Generation failed",
          description: error.message || 'Failed to generate image',
          variant: "destructive",
        });
      })
      .finally(() => {
        abortControllers.current.delete(jobId);
      });

    return jobId;
  }, [updateJob]);

  const cancelJob = useCallback((jobId: string) => {
    const controller = abortControllers.current.get(jobId);
    if (controller) {
      controller.abort();
      abortControllers.current.delete(jobId);
    }
    setJobs(prev => prev.filter(job => job.id !== jobId));
    
    toast({
      title: "Generation cancelled",
      description: "The generation job has been cancelled.",
    });
  }, []);

  const clearCompletedJob = useCallback((jobId: string) => {
    setJobs(prev => prev.filter(job => job.id !== jobId));
  }, []);

  const clearAllCompleted = useCallback(() => {
    setJobs(prev => prev.filter(job => job.status === 'pending' || job.status === 'generating'));
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      abortControllers.current.forEach(controller => controller.abort());
    };
  }, []);

  return (
    <GenerationJobsContext.Provider value={{
      jobs,
      activeJobs,
      completedJobs,
      startBlogGeneration,
      startImageGeneration,
      cancelJob,
      clearCompletedJob,
      clearAllCompleted,
    }}>
      {children}
    </GenerationJobsContext.Provider>
  );
}

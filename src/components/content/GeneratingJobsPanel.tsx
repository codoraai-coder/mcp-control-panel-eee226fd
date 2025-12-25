import { Loader2 } from 'lucide-react';
import { GenerationJob, useGenerationJobs } from '@/contexts/GenerationJobsContext';
import { GenerationJobCard } from './GenerationJobCard';
import { Button } from '@/components/ui/button';
import { Content } from '@/types/mcp';

interface GeneratingJobsPanelProps {
  onContentGenerated: (content: Content) => void;
}

export function GeneratingJobsPanel({ onContentGenerated }: GeneratingJobsPanelProps) {
  const { jobs, activeJobs, completedJobs, cancelJob, clearCompletedJob, clearAllCompleted } = useGenerationJobs();

  const handleAddContent = (job: GenerationJob) => {
    if (job.result) {
      onContentGenerated(job.result);
      clearCompletedJob(job.id);
    }
  };

  if (jobs.length === 0) return null;

  return (
    <div className="mb-6 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {activeJobs.length > 0 && (
            <Loader2 className="h-4 w-4 animate-spin text-primary" />
          )}
          <h3 className="font-semibold">
            {activeJobs.length > 0 
              ? `Generating (${activeJobs.length} job${activeJobs.length > 1 ? 's' : ''})` 
              : 'Recent Jobs'}
          </h3>
        </div>
        
        {completedJobs.length > 0 && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={clearAllCompleted}
            className="text-xs"
          >
            Clear completed
          </Button>
        )}
      </div>

      {/* Job Cards */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {/* Show active jobs first */}
        {activeJobs.map(job => (
          <GenerationJobCard 
            key={job.id} 
            job={job} 
            onCancel={cancelJob}
            onClear={clearCompletedJob}
            onAddContent={handleAddContent}
          />
        ))}
        
        {/* Then completed/failed jobs */}
        {completedJobs.map(job => (
          <GenerationJobCard 
            key={job.id} 
            job={job} 
            onCancel={cancelJob}
            onClear={clearCompletedJob}
            onAddContent={handleAddContent}
          />
        ))}
      </div>
    </div>
  );
}

import React from 'react';
import { Input } from '@/components/core/fields/Input';
import { Select } from '@/components/core/fields/Select';
import { Button } from '@/components/core/Button';
import { Plus, Trash2 } from 'lucide-react';
import { cn } from '@/lib/ui/utils/formatters';
import { semanticColors } from '@/lib/tokens/colors';

// Interface for metrics following the example pattern
interface MetricType {
  name: string;
  type: 'IPG' | 'L&R' | 'Project' | 'Other';
  ratings: { score: number; description: string }[];
}

interface MetricsBuilderProps {
  metrics: MetricType[];
  onMetricsChange: (metrics: MetricType[]) => void;
}

export const MetricsBuilder: React.FC<MetricsBuilderProps> = ({
  metrics,
  onMetricsChange
}) => {
  // Initialize with three default metrics if empty
  React.useEffect(() => {
    if (metrics.length === 0) {
      const defaultMetrics: MetricType[] = [
        {
          name: 'Teacher Metric (IPG?)',
          type: 'IPG',
          ratings: [
            { score: 4, description: '' },
            { score: 3, description: '' },
            { score: 2, description: '' },
            { score: 1, description: '' }
          ]
        },
        {
          name: 'Student Metric (L&R?)',
          type: 'L&R',
          ratings: [
            { score: 4, description: '' },
            { score: 3, description: '' },
            { score: 2, description: '' },
            { score: 1, description: '' }
          ]
        },
        {
          name: 'Other Metric (Project?)',
          type: 'Project',
          ratings: [
            { score: 4, description: '' },
            { score: 3, description: '' },
            { score: 2, description: '' },
            { score: 1, description: '' }
          ]
        }
      ];
      onMetricsChange(defaultMetrics);
    }
  }, [metrics, onMetricsChange]);

  const addMetric = () => {
    const newMetric: MetricType = {
      name: '',
      type: 'Other',
      ratings: [
        { score: 4, description: '' },
        { score: 3, description: '' },
        { score: 2, description: '' },
        { score: 1, description: '' }
      ]
    };
    onMetricsChange([...metrics, newMetric]);
  };

  const removeMetric = (index: number) => {
    // Enforce minimum of 3 metrics
    if (metrics.length > 3) {
      onMetricsChange(metrics.filter((_, i) => i !== index));
    }
  };

  const updateMetric = (index: number, updates: Partial<MetricType>) => {
    const updated = [...metrics];
    updated[index] = { ...updated[index], ...updates };
    onMetricsChange(updated);
  };

  const updateRating = (metricIndex: number, ratingIndex: number, description: string) => {
    const updated = [...metrics];
    updated[metricIndex].ratings[ratingIndex].description = description;
    onMetricsChange(updated);
  };

  // Color schemes for different metric types
  const getMetricColorScheme = (type: MetricType['type']) => {
    switch (type) {
      case 'IPG':
        return {
          border: semanticColors.border.primary,
          bg: semanticColors.bg.primary,
          header: semanticColors.bg.primary,
          text: semanticColors.text.primary
        };
      case 'L&R':
        return {
          border: semanticColors.border.secondary,
          bg: semanticColors.bg.secondary,
          header: semanticColors.bg.secondary,
          text: semanticColors.text.secondary
        };
      case 'Project':
        return {
          border: semanticColors.border.success,
          bg: semanticColors.bg.success,
          header: semanticColors.bg.success,
          text: semanticColors.text.success
        };
      default:
        return {
          border: semanticColors.border.muted,
          bg: semanticColors.bg.muted,
          header: semanticColors.bg.muted,
          text: semanticColors.text.muted
        };
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold text-lg">Metrics</h3>
        <Button
          intent="secondary"
          appearance="outline"
          textSize="sm"
          padding="sm"
          onClick={addMetric}
          className="flex items-center gap-2"
        >
          <Plus size={16} />
          Add Metric
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {metrics.map((metric, index) => {
          const colorScheme = getMetricColorScheme(metric.type);
          
          return (
            <div key={index} className={cn(
              'border-2 rounded-lg overflow-hidden',
              colorScheme.border,
              colorScheme.bg
            )}>
              <div className={cn('p-3', colorScheme.header)}>
                <div className="flex justify-between items-start mb-3">
                  <Input
                    label="Metric Name"
                    value={metric.name}
                    onChange={(e) => updateMetric(index, { name: e.target.value })}
                    placeholder="e.g., Teacher Metric (IPG)"
                    className="flex-1 mr-2"
                    textSize="sm"
                    padding="sm"
                  />
                  {metrics.length > 3 && (
                    <Button
                      intent="secondary"
                      appearance="outline"
                      textSize="sm"
                      padding="sm"
                      onClick={() => removeMetric(index)}
                      className="mt-6"
                    >
                      <Trash2 size={16} />
                    </Button>
                  )}
                </div>
                
                <Select
                  label="Type"
                  value={metric.type}
                  onChange={(value) => updateMetric(index, { type: value as MetricType['type'] })}
                  options={[
                    { value: 'IPG', label: 'IPG' },
                    { value: 'L&R', label: 'L&R' },
                    { value: 'Project', label: 'Project' },
                    { value: 'Other', label: 'Other' }
                  ]}
                  textSize="sm"
                  padding="sm"
                />
              </div>
              
              <div className="p-3 space-y-3">
                <h4 className={cn('font-medium', colorScheme.text)}>Ratings</h4>
                {metric.ratings.map((rating, ratingIndex) => (
                  <div key={ratingIndex}>
                    <label className="block text-sm font-medium mb-1">
                      Score {rating.score}
                    </label>
                    <Input
                      value={rating.description}
                      onChange={(e) => updateRating(index, ratingIndex, e.target.value)}
                      placeholder={`What does a ${rating.score} look like?`}
                      textSize="sm"
                      padding="sm"
                    />
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}; 
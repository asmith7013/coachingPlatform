

// "use client";

// import React, { useState } from 'react';
// import { Button } from '@/components/core/Button';
// import { Input } from '@/components/core/fields/Input';
// import { Textarea } from '@/components/core/fields/Textarea';
// import { Select } from '@/components/core/fields/Select';
// import { Card } from '@/components/composed/cards/Card';
// import { Heading } from '@/components/core/typography/Heading';
// import { Text } from '@/components/core/typography/Text';
// import { 
//   PlusIcon, 
//   TrashIcon, 
//   ChevronDownIcon, 
//   ChevronRightIcon 
// } from '@heroicons/react/24/outline';
// import type { Outcome, Metric } from '@zod-schema/cap/coaching-action-plan';
// import { getMetricCollectionMethodLabel } from '@/lib/ui/forms/fieldConfig/coaching/coaching-action-plan-config';
// import type { Evidence } from '@zod-schema/cap/coaching-action-plan';

// interface OutcomeManagerProps {
//   label: string;
//   outcomes: Outcome[];
//   onChange: (outcomes: Outcome[]) => void;
//   outcomeType: 'teacher' | 'student';
//   className?: string;
// }

// const metricCollectionMethods = [
//   'observation',
//   'student_work_analysis',
//   'assessment_data',
//   'interview',
//   'survey',
//   'documentation_review',
//   'self_reflection',
//   'other'
// ];

// export function OutcomeManager({
//   label,
//   outcomes,
//   onChange,
//   outcomeType,
//   className = ''
// }: OutcomeManagerProps) {
//   const [expandedOutcomes, setExpandedOutcomes] = useState<number[]>([]);

//   const toggleOutcome = (index: number) => {
//     setExpandedOutcomes(prev =>
//       prev.includes(index)
//         ? prev.filter(i => i !== index)
//         : [...prev, index]
//     );
//   };

//   const addOutcome = () => {
//     const newOutcome: Outcome = {
//       type: outcomeType,
//       description: '',
//       metrics: [],
//       evidence: [] as Evidence[]
//     };
//     onChange([...outcomes, newOutcome]);
//     // Auto-expand the new outcome
//     setExpandedOutcomes(prev => [...prev, outcomes.length]);
//   };

//   const updateOutcome = (index: number, field: keyof Outcome, value: string | Metric[]) => {
//     const updated = [...outcomes];
//     updated[index] = { ...updated[index], [field]: value };
//     onChange(updated);
//   };

//   const removeOutcome = (index: number) => {
//     onChange(outcomes.filter((_, i) => i !== index));
//     setExpandedOutcomes(prev => prev.filter(i => i !== index).map(i => i > index ? i - 1 : i));
//   };

//   const addMetric = (outcomeIndex: number) => {
//     const newMetric: Metric = {
//       type: 'numeric',
//       name: '',
//       description: '',
//       collectionMethod: 'observation',
//       targetValue: '',
//       currentValue: '',
//       notes: ''
//     };
    
//     const updated = [...outcomes];
//     updated[outcomeIndex] = {
//       ...updated[outcomeIndex],
//       metrics: [...updated[outcomeIndex].metrics, newMetric]
//     };
//     onChange(updated);
//   };

//   const updateMetric = (outcomeIndex: number, metricIndex: number, field: keyof Metric, value: string) => {
//     const updated = [...outcomes];
//     const metrics = [...updated[outcomeIndex].metrics];
//     metrics[metricIndex] = { ...metrics[metricIndex], [field]: value };
//     updated[outcomeIndex] = { ...updated[outcomeIndex], metrics };
//     onChange(updated);
//   };

//   const removeMetric = (outcomeIndex: number, metricIndex: number) => {
//     const updated = [...outcomes];
//     updated[outcomeIndex] = {
//       ...updated[outcomeIndex],
//       metrics: updated[outcomeIndex].metrics.filter((_, i) => i !== metricIndex)
//     };
//     onChange(updated);
//   };

//   const getOutcomeTitle = (outcome: Outcome, index: number) => {
//     if (outcome.description.trim()) {
//       const preview = outcome.description.slice(0, 50);
//       return preview.length < outcome.description.length ? `${preview}...` : preview;
//     }
//     return `${outcomeType === 'teacher' ? 'Teacher' : 'Student'} Outcome ${index + 1}`;
//   };

//   return (
//     <div className={`space-y-4 ${className}`}>
//       {/* Header */}
//       <div className="flex justify-between items-center">
//         <Heading level="h4" color="default" className="font-medium">
//           {label}
//         </Heading>
//         <Button
//           intent="primary"
//           appearance="outline"
//           textSize="sm"
//           padding="sm"
//           onClick={addOutcome}
//           className="flex items-center gap-2"
//         >
//           <PlusIcon className="h-4 w-4" />
//           Add {outcomeType === 'teacher' ? 'Teacher' : 'Student'} Outcome
//         </Button>
//       </div>

//       {/* Outcomes List */}
//       {outcomes.length === 0 ? (
//         <Card padding="md" className="text-center">
//           <Text textSize="sm" color="muted" className="italic">
//             No {outcomeType} outcomes defined yet. Add an outcome to get started.
//           </Text>
//         </Card>
//       ) : (
//         <div className="space-y-3">
//           {outcomes.map((outcome, outcomeIndex) => {
//             const isExpanded = expandedOutcomes.includes(outcomeIndex);
            
//             return (
//               <Card key={outcomeIndex} padding="md" className="border">
//                 {/* Outcome Header */}
//                 <div className="flex justify-between items-start mb-3">
//                   <button
//                     type="button"
//                     onClick={() => toggleOutcome(outcomeIndex)}
//                     className="flex items-center gap-2 text-left flex-1 hover:text-blue-600"
//                   >
//                     {isExpanded ? (
//                       <ChevronDownIcon className="h-4 w-4 flex-shrink-0" />
//                     ) : (
//                       <ChevronRightIcon className="h-4 w-4 flex-shrink-0" />
//                     )}
//                     <Text textSize="sm" color="default" className="font-medium">
//                       {getOutcomeTitle(outcome, outcomeIndex)}
//                     </Text>
//                   </button>
                  
//                   <Button
//                     intent="danger"
//                     appearance="outline"
//                     textSize="sm"
//                     padding="sm"
//                     onClick={() => removeOutcome(outcomeIndex)}
//                     className="flex-shrink-0"
//                   >
//                     <TrashIcon className="h-4 w-4" />
//                   </Button>
//                 </div>

//                 {/* Expanded Outcome Details */}
//                 {isExpanded && (
//                   <div className="space-y-4">
//                     {/* Outcome Description */}
//                     <Textarea
//                       label="Outcome Description"
//                       value={outcome.description}
//                       onChange={(e) => updateOutcome(outcomeIndex, 'description', e.target.value)}
//                       placeholder={`Describe the expected ${outcomeType} outcome...`}
//                       rows={3}
//                       required
//                     />

//                     {/* Evidence */}
//                     <Textarea
//                       label="Supporting Evidence"
//                       value={outcome.evidence?.map(e => JSON.stringify(e)).join('\n') || ''}
//                       onChange={(e) => updateOutcome(outcomeIndex, 'evidence', e.target.value)}
//                       placeholder="Evidence that will support the achievement of this outcome..."
//                       rows={2}
//                     />

//                     {/* Metrics Section */}
//                     <div className="border-t pt-4">
//                       <div className="flex justify-between items-center mb-3">
//                         <Text textSize="sm" color="default" className="font-medium">
//                           Metrics ({outcome.metrics.length})
//                         </Text>
//                         <Button
//                           intent="secondary"
//                           appearance="outline"
//                           textSize="sm"
//                           padding="sm"
//                           onClick={() => addMetric(outcomeIndex)}
//                           className="flex items-center gap-1"
//                         >
//                           <PlusIcon className="h-3 w-3" />
//                           Add Metric
//                         </Button>
//                       </div>

//                       {outcome.metrics.length === 0 ? (
//                         <Text textSize="sm" color="muted" className="italic text-center py-2">
//                           No metrics defined for this outcome yet.
//                         </Text>
//                       ) : (
//                         <div className="space-y-3">
//                           {outcome.metrics.map((metric, metricIndex) => (
//                             <div key={metricIndex} className="bg-gray-50 rounded-md p-3">
//                               <div className="flex justify-between items-start mb-3">
//                                 <Text textSize="sm" color="default" className="font-medium">
//                                   Metric {metricIndex + 1}
//                                 </Text>
//                                 <Button
//                                   intent="danger"
//                                   appearance="outline"
//                                   textSize="sm"
//                                   padding="sm"
//                                   onClick={() => removeMetric(outcomeIndex, metricIndex)}
//                                   className="h-6 w-6 p-0"
//                                 >
//                                   <TrashIcon className="h-3 w-3" />
//                                 </Button>
//                               </div>

//                               <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
//                                 <div className="md:col-span-2">
//                                   <Textarea
//                                     label="What will be measured?"
//                                     value={metric.description}
//                                     onChange={(e) => updateMetric(outcomeIndex, metricIndex, 'description', e.target.value)}
//                                     placeholder="Describe what will be measured..."
//                                     rows={2}
//                                     required
//                                   />
//                                 </div>
                                
//                                 <Select
//                                   label="Collection Method"
//                                   value={metric.collectionMethod}
//                                   onChange={(value) => updateMetric(outcomeIndex, metricIndex, 'collectionMethod', value)}
//                                   options={metricCollectionMethods.map(method => ({
//                                     value: method,
//                                     label: getMetricCollectionMethodLabel(method)
//                                   }))}
//                                 />
                                
//                                 <Input
//                                   label="Target Goal"
//                                   value={metric.targetValue}
//                                   onChange={(e) => updateMetric(outcomeIndex, metricIndex, 'targetValue', e.target.value)}
//                                   placeholder="Target value or goal"
//                                   required
//                                 />
                                
//                                 <Input
//                                   label="Current Value"
//                                   value={metric.currentValue || ''}
//                                   onChange={(e) => updateMetric(outcomeIndex, metricIndex, 'currentValue', e.target.value)}
//                                   placeholder="Current measured value (optional)"
//                                 />
                                
//                                 <div className="md:col-span-1">
//                                   <Textarea
//                                     label="Notes"
//                                     value={metric.notes || ''}
//                                     onChange={(e) => updateMetric(outcomeIndex, metricIndex, 'notes', e.target.value)}
//                                     placeholder="Additional notes..."
//                                     rows={2}
//                                   />
//                                 </div>
//                               </div>
//                             </div>
//                           ))}
//                         </div>
//                       )}
//                     </div>
//                   </div>
//                 )}
//               </Card>
//             );
//           })}
//         </div>
//       )}
//     </div>
//   );
// } 
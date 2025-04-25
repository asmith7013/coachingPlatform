'use client'

import React, { useState } from 'react';
import { tv } from 'tailwind-variants';
import { Button } from '@/components/core/Button';
import { Card } from '@/components/composed/cards';
import { Input } from '@/components/core/fields/Input';
import { Textarea } from '@/components/core/fields/Textarea';
// import { Select } from '@/components/core/fields/Select';
import { Checkbox } from '@/components/core/fields/Checkbox';

// Type definitions for form data
interface TimeData {
  startTime: string;
  endTime: string;
  stopwatchTime: string;
  startedWhen: string;
}

interface ActivitySection {
  launch: string;
  workTime: string;
  synthesis: string;
}

interface ProgressMonitoring {
  teacherDebriefing: boolean;
  intentionalCallOuts: boolean;
  studentExplaining: boolean;
  activeListening: boolean;
  engagementMoves: boolean;
  visibleThinking: boolean;
  followUpQuestions: boolean;
}

interface Transcripts {
  warmUpLaunch: string;
  activity1Launch: string;
  activity2Launch: string;
  synthesisLaunch: string;
}

interface FormData {
  cycle: string;
  session: string;
  date: string;
  teacher: string;
  lesson: string;
  otherContext: string;
  
  learningTargets: string;
  coolDown: string;
  
  glow: string;
  wonder: string;
  grow: string;
  nextSteps: string;
  
  // Activity sections
  warmUp: ActivitySection;
  activity1: ActivitySection;
  activity2: ActivitySection;
  lessonSynthesis: ActivitySection;
  
  // Progress monitoring
  progressMonitoring: ProgressMonitoring;
  
  // Transcripts
  transcripts: Transcripts;
}

// Styling variants using the token system
const sectionTitle = tv({
  base: "text-lg font-semibold border-b pb-2 mb-3"
});

const fieldLabel = tv({
  base: "text-sm font-medium text-gray-700 mb-1"
});

const subsectionTitle = tv({
  base: "text-base font-medium mt-4 mb-2"
});

const activitySection = tv({
  base: "border rounded-md p-3 mt-3 bg-gray-50"
});

const CoachingNotesTemplate = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [timeData, setTimeData] = useState<TimeData>({
    startTime: '',
    endTime: '',
    stopwatchTime: '00:00:00',
    startedWhen: '',
  });
  
  // Form data state - simplified for the mockup
  const [formData, setFormData] = useState<FormData>({
    cycle: '',
    session: '',
    date: new Date().toISOString().split('T')[0],
    teacher: '',
    lesson: '',
    otherContext: '',
    
    learningTargets: '',
    coolDown: '',
    
    glow: '',
    wonder: '',
    grow: '',
    nextSteps: '',
    
    // Activity sections
    warmUp: {
      launch: '',
      workTime: '',
      synthesis: '',
    },
    activity1: {
      launch: '',
      workTime: '',
      synthesis: '',
    },
    activity2: {
      launch: '',
      workTime: '',
      synthesis: '',
    },
    lessonSynthesis: {
      launch: '',
      workTime: '',
      synthesis: '',
    },
    
    // Progress monitoring
    progressMonitoring: {
      teacherDebriefing: false,
      intentionalCallOuts: false,
      studentExplaining: false,
      activeListening: false,
      engagementMoves: false,
      visibleThinking: false,
      followUpQuestions: false,
    },
    
    // Transcripts
    transcripts: {
      warmUpLaunch: '',
      activity1Launch: '',
      activity2Launch: '',
      synthesisLaunch: '',
    }
  });
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // Handle nested fields
    if (name.includes('.')) {
      const [section, field] = name.split('.');
      
      if (section === 'warmUp' || section === 'activity1' || section === 'activity2' || section === 'lessonSynthesis') {
        setFormData({
          ...formData,
          [section]: {
            ...formData[section as keyof typeof formData] as ActivitySection,
            [field]: value
          }
        });
      } else if (section === 'transcripts') {
        setFormData({
          ...formData,
          transcripts: {
            ...formData.transcripts,
            [field]: value
          }
        });
      }
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };
  
  const handleCheckboxChange = (name: string) => {
    // For progress monitoring checkboxes
    const [section, field] = name.split('.');
    
    if (section === 'progressMonitoring') {
      setFormData({
        ...formData,
        progressMonitoring: {
          ...formData.progressMonitoring,
          [field as keyof ProgressMonitoring]: !formData.progressMonitoring[field as keyof ProgressMonitoring]
        }
      });
    }
  };
  
  const startStopwatch = () => {
    // Stopwatch logic would be implemented here
    console.log("Starting stopwatch");
  };
  
  const pauseStopwatch = () => {
    // Pause stopwatch logic
    console.log("Pausing stopwatch");
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // Save to database logic would go here
      console.log("Submitting form data:", formData);
      
      // Mock successful submission
      setTimeout(() => {
        setIsLoading(false);
        // Navigate to visit summary or teacher profile
        // router.push(`/teachers/${formData.teacher}/visits`);
      }, 1000);
    } catch (error) {
      console.error("Error submitting form:", error);
      setIsLoading(false);
    }
  };

  // Custom Card components for compatibility
  const CardHeader: React.FC<{ children: React.ReactNode, className?: string }> = ({ children, className }) => (
    <div className={className}>{children}</div>
  );
  
  const CardBody: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <div>{children}</div>
  );
  
  const CardFooter: React.FC<{ children: React.ReactNode, className?: string }> = ({ children, className }) => (
    <div className={className}>{children}</div>
  );

  // Composite Card component
  const CompositeCard = Object.assign(Card, {
    Header: CardHeader,
    Body: CardBody,
    Footer: CardFooter
  });
  
  return (
    <div className="container mx-auto px-4 py-6 max-w-5xl">
      <form onSubmit={handleSubmit}>
        <CompositeCard className="mb-6">
          <CompositeCard.Header>
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold">Classroom Observation Notes</h1>
              <div className="flex space-x-3">
                <Button 
                  type="button" 
                  appearance="outline" 
                  onClick={startStopwatch}
                >
                  Start Timer
                </Button>
                <Button 
                  type="button"
                  appearance="outline"
                  onClick={pauseStopwatch}
                >
                  Pause Timer
                </Button>
              </div>
            </div>
          </CompositeCard.Header>
          
          <CompositeCard.Body>
            {/* Header Information */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div>
                <label className={fieldLabel()}>Cycle</label>
                <Input
                  name="cycle"
                  value={formData.cycle}
                  onChange={handleInputChange}
                  placeholder="Cycle #"
                />
              </div>
              <div>
                <label className={fieldLabel()}>Session</label>
                <Input
                  name="session"
                  value={formData.session}
                  onChange={handleInputChange}
                  placeholder="Session #"
                />
              </div>
              <div>
                <label className={fieldLabel()}>Date</label>
                <Input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <label className={fieldLabel()}>Teacher</label>
                <select
                  name="teacher"
                  value={formData.teacher}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="">Select Teacher</option>
                  <option value="teacher1">Ms. Johnson</option>
                  <option value="teacher2">Mr. Smith</option>
                  <option value="teacher3">Ms. Garcia</option>
                </select>
              </div>
            </div>
            
            <div className="mb-6">
              <label className={fieldLabel()}>Lesson & Other Context</label>
              <Input
                name="lesson"
                value={formData.lesson}
                onChange={handleInputChange}
                placeholder="Lesson title or topic"
              />
            </div>
            
            <div className="mb-6">
              <label className={fieldLabel()}>Other Context</label>
              <Textarea
                name="otherContext"
                value={formData.otherContext}
                onChange={handleInputChange}
                placeholder="Additional context about the classroom, students, etc."
                rows={2}
              />
            </div>
            
            {/* Feedback Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <h3 className={sectionTitle()}>Feedback</h3>
                <div className="space-y-4">
                  <div>
                    <label className={fieldLabel()}>Glow</label>
                    <Textarea
                      name="glow"
                      value={formData.glow}
                      onChange={handleInputChange}
                      placeholder="What went well?"
                      rows={3}
                    />
                  </div>
                  <div>
                    <label className={fieldLabel()}>Wonder</label>
                    <Textarea
                      name="wonder"
                      value={formData.wonder}
                      onChange={handleInputChange}
                      placeholder="What questions do you have?"
                      rows={3}
                    />
                  </div>
                  <div>
                    <label className={fieldLabel()}>Grow</label>
                    <Textarea
                      name="grow"
                      value={formData.grow}
                      onChange={handleInputChange}
                      placeholder="Areas for improvement"
                      rows={3}
                    />
                  </div>
                  <div>
                    <label className={fieldLabel()}>Next Steps</label>
                    <Textarea
                      name="nextSteps"
                      value={formData.nextSteps}
                      onChange={handleInputChange}
                      placeholder="Recommended next actions"
                      rows={3}
                    />
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className={sectionTitle()}>Learning Targets & Cool Down</h3>
                <div className="space-y-4">
                  <div>
                    <label className={fieldLabel()}>Learning Goals (Teacher-Facing)</label>
                    <Textarea
                      name="learningTargets"
                      value={formData.learningTargets}
                      onChange={handleInputChange}
                      placeholder="Learning targets or goals for the lesson"
                      rows={4}
                    />
                  </div>
                  <div>
                    <label className={fieldLabel()}>Cool Down</label>
                    <Textarea
                      name="coolDown"
                      value={formData.coolDown}
                      onChange={handleInputChange}
                      placeholder="Cool down activity notes"
                      rows={4}
                    />
                  </div>
                </div>
              </div>
            </div>
            
            {/* Lesson Flow Section */}
            <h3 className={sectionTitle()}>Lesson Flow</h3>
            
            <div className={activitySection()}>
              <h4 className={subsectionTitle()}>Warm Up</h4>
              <div className="space-y-3">
                <div>
                  <label className={fieldLabel()}>Launch</label>
                  <Textarea
                    name="warmUp.launch"
                    value={formData.warmUp.launch}
                    onChange={handleInputChange}
                    placeholder="Warm up launch notes"
                    rows={2}
                  />
                </div>
                <div>
                  <label className={fieldLabel()}>Work Time</label>
                  <Textarea
                    name="warmUp.workTime"
                    value={formData.warmUp.workTime}
                    onChange={handleInputChange}
                    placeholder="Warm up work time notes"
                    rows={2}
                  />
                </div>
                <div>
                  <label className={fieldLabel()}>Synthesis</label>
                  <Textarea
                    name="warmUp.synthesis"
                    value={formData.warmUp.synthesis}
                    onChange={handleInputChange}
                    placeholder="Warm up synthesis notes"
                    rows={2}
                  />
                </div>
              </div>
            </div>
            
            <div className={activitySection()}>
              <h4 className={subsectionTitle()}>Activity 1</h4>
              <div className="space-y-3">
                <div>
                  <label className={fieldLabel()}>Launch</label>
                  <Textarea
                    name="activity1.launch"
                    value={formData.activity1.launch}
                    onChange={handleInputChange}
                    placeholder="Activity 1 launch notes"
                    rows={2}
                  />
                </div>
                <div>
                  <label className={fieldLabel()}>Work Time</label>
                  <Textarea
                    name="activity1.workTime"
                    value={formData.activity1.workTime}
                    onChange={handleInputChange}
                    placeholder="Activity 1 work time notes"
                    rows={2}
                  />
                </div>
                <div>
                  <label className={fieldLabel()}>Synthesis</label>
                  <Textarea
                    name="activity1.synthesis"
                    value={formData.activity1.synthesis}
                    onChange={handleInputChange}
                    placeholder="Activity 1 synthesis notes"
                    rows={2}
                  />
                </div>
              </div>
            </div>
            
            <div className={activitySection()}>
              <h4 className={subsectionTitle()}>Activity 2</h4>
              <div className="space-y-3">
                <div>
                  <label className={fieldLabel()}>Launch</label>
                  <Textarea
                    name="activity2.launch"
                    value={formData.activity2.launch}
                    onChange={handleInputChange}
                    placeholder="Activity 2 launch notes"
                    rows={2}
                  />
                </div>
                <div>
                  <label className={fieldLabel()}>Work Time</label>
                  <Textarea
                    name="activity2.workTime"
                    value={formData.activity2.workTime}
                    onChange={handleInputChange}
                    placeholder="Activity 2 work time notes"
                    rows={2}
                  />
                </div>
                <div>
                  <label className={fieldLabel()}>Synthesis</label>
                  <Textarea
                    name="activity2.synthesis"
                    value={formData.activity2.synthesis}
                    onChange={handleInputChange}
                    placeholder="Activity 2 synthesis notes"
                    rows={2}
                  />
                </div>
              </div>
            </div>
            
            <div className={activitySection()}>
              <h4 className={subsectionTitle()}>Lesson Synthesis</h4>
              <div className="space-y-3">
                <div>
                  <label className={fieldLabel()}>Launch</label>
                  <Textarea
                    name="lessonSynthesis.launch"
                    value={formData.lessonSynthesis.launch}
                    onChange={handleInputChange}
                    placeholder="Lesson synthesis launch notes"
                    rows={2}
                  />
                </div>
                <div>
                  <label className={fieldLabel()}>Work Time</label>
                  <Textarea
                    name="lessonSynthesis.workTime"
                    value={formData.lessonSynthesis.workTime}
                    onChange={handleInputChange}
                    placeholder="Lesson synthesis work time notes"
                    rows={2}
                  />
                </div>
                <div>
                  <label className={fieldLabel()}>Synthesis</label>
                  <Textarea
                    name="lessonSynthesis.synthesis"
                    value={formData.lessonSynthesis.synthesis}
                    onChange={handleInputChange}
                    placeholder="Lesson synthesis notes"
                    rows={2}
                  />
                </div>
              </div>
            </div>
            
            {/* Progress Monitoring */}
            <div className="mt-6">
              <h3 className={sectionTitle()}>Progress Monitoring</h3>
              <div className="space-y-2">
                <div className="flex items-start gap-2">
                  <Checkbox 
                    id="progress.teacherDebriefing"
                    checked={formData.progressMonitoring.teacherDebriefing}
                    onChange={() => handleCheckboxChange("progressMonitoring.teacherDebriefing")}
                  />
                  <label htmlFor="progress.teacherDebriefing" className="text-sm">
                    Teacher debriefs a portion of the activity to use for the synthesis
                  </label>
                </div>
                
                <div className="flex items-start gap-2">
                  <Checkbox 
                    id="progress.intentionalCallOuts" 
                    checked={formData.progressMonitoring.intentionalCallOuts}
                    onChange={() => handleCheckboxChange("progressMonitoring.intentionalCallOuts")}
                  />
                  <label htmlFor="progress.intentionalCallOuts" className="text-sm">
                    Synthesis begins with the teacher intentionally calling on specific students and displaying student work
                  </label>
                </div>
                
                <div className="flex items-start gap-2">
                  <Checkbox 
                    id="progress.studentExplaining" 
                    checked={formData.progressMonitoring.studentExplaining}
                    onChange={() => handleCheckboxChange("progressMonitoring.studentExplaining")}
                  />
                  <label htmlFor="progress.studentExplaining" className="text-sm">
                    Students who are sharing explain their reasoning
                  </label>
                </div>
                
                <div className="flex items-start gap-2">
                  <Checkbox 
                    id="progress.activeListening" 
                    checked={formData.progressMonitoring.activeListening}
                    onChange={() => handleCheckboxChange("progressMonitoring.activeListening")}
                  />
                  <label htmlFor="progress.activeListening" className="text-sm">
                    Students actively listen and engage with peers&apos; contributions
                  </label>
                </div>
                
                <div className="flex items-start gap-2">
                  <Checkbox 
                    id="progress.engagementMoves" 
                    checked={formData.progressMonitoring.engagementMoves}
                    onChange={() => handleCheckboxChange("progressMonitoring.engagementMoves")}
                  />
                  <label htmlFor="progress.engagementMoves" className="text-sm">
                    The teacher uses a variety of engagement moves (turn and talk, cold call, etc.)
                  </label>
                </div>
                
                <div className="flex items-start gap-2">
                  <Checkbox 
                    id="progress.visibleThinking" 
                    checked={formData.progressMonitoring.visibleThinking}
                    onChange={() => handleCheckboxChange("progressMonitoring.visibleThinking")}
                  />
                  <label htmlFor="progress.visibleThinking" className="text-sm">
                    The teacher makes student thinking visible
                  </label>
                </div>
                
                <div className="flex items-start gap-2">
                  <Checkbox 
                    id="progress.followUpQuestions" 
                    checked={formData.progressMonitoring.followUpQuestions}
                    onChange={() => handleCheckboxChange("progressMonitoring.followUpQuestions")}
                  />
                  <label htmlFor="progress.followUpQuestions" className="text-sm">
                    The teacher asks follow-up questions to clarify and deepen student thinking
                  </label>
                </div>
              </div>
            </div>
            
            {/* Time Tracking */}
            <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className={fieldLabel()}>Stopwatch</label>
                <Input 
                  value={timeData.stopwatchTime} 
                  readOnly 
                />
              </div>
              <div>
                <label className={fieldLabel()}>Started When (min into class)</label>
                <Input 
                  name="startedWhen"
                  value={timeData.startedWhen}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTimeData({...timeData, startedWhen: e.target.value})}
                />
              </div>
              <div>
                <label className={fieldLabel()}>Class Start</label>
                <Input 
                  type="time"
                  name="startTime"
                  value={timeData.startTime}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTimeData({...timeData, startTime: e.target.value})}
                />
              </div>
              <div>
                <label className={fieldLabel()}>Class End</label>
                <Input 
                  type="time"
                  name="endTime"
                  value={timeData.endTime}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTimeData({...timeData, endTime: e.target.value})}
                />
              </div>
            </div>
            
            {/* Transcripts */}
            <div className="mt-6">
              <h3 className={sectionTitle()}>Transcripts</h3>
              
              {/* Create simplified tabs implementation */}
              <div className="tabs-container">
                <div className="tabs-list mb-2">
                  <button type="button" className="tab-trigger active" data-tab="warmUp">Warm Up</button>
                  <button type="button" className="tab-trigger" data-tab="activity1">Activity 1</button>
                  <button type="button" className="tab-trigger" data-tab="activity2">Activity 2</button>
                  <button type="button" className="tab-trigger" data-tab="synthesis">Synthesis</button>
                </div>
                
                <div className="tab-content" data-content="warmUp">
                  <Textarea
                    name="transcripts.warmUpLaunch"
                    value={formData.transcripts.warmUpLaunch}
                    onChange={handleInputChange}
                    placeholder="Transcript of warm up launch"
                    rows={5}
                  />
                </div>
                
                <div className="tab-content hidden" data-content="activity1">
                  <Textarea
                    name="transcripts.activity1Launch"
                    value={formData.transcripts.activity1Launch}
                    onChange={handleInputChange}
                    placeholder="Transcript of activity 1 launch"
                    rows={5}
                  />
                </div>
                
                <div className="tab-content hidden" data-content="activity2">
                  <Textarea
                    name="transcripts.activity2Launch"
                    value={formData.transcripts.activity2Launch}
                    onChange={handleInputChange}
                    placeholder="Transcript of activity 2 launch"
                    rows={5}
                  />
                </div>
                
                <div className="tab-content hidden" data-content="synthesis">
                  <Textarea
                    name="transcripts.synthesisLaunch"
                    value={formData.transcripts.synthesisLaunch}
                    onChange={handleInputChange}
                    placeholder="Transcript of synthesis launch"
                    rows={5}
                  />
                </div>
              </div>
            </div>
            
            {/* Pre-exit Checklist */}
            <div className="mt-6">
              <h3 className={sectionTitle()}>Before Leaving</h3>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Checkbox id="checklist-cooldowns" />
                  <label htmlFor="checklist-cooldowns" className="text-sm">Ask for Cool Downs</label>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox id="checklist-summary" />
                  <label htmlFor="checklist-summary" className="text-sm">Fill out Visit Summary</label>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox id="checklist-stopwatch" />
                  <label htmlFor="checklist-stopwatch" className="text-sm">Pause stopwatch</label>
                </div>
              </div>
            </div>
          </CompositeCard.Body>
          
          <CompositeCard.Footer className="flex justify-end space-x-3">
            <Button appearance="outline" type="button">Cancel</Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Saving...' : 'Save Observation Notes'}
            </Button>
          </CompositeCard.Footer>
        </CompositeCard>
      </form>
    </div>
  );
};

export default CoachingNotesTemplate;
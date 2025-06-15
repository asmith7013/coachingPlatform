

```
Independent Entities          Coaching Context (Primary Aggregate)
================             ===================================
Schools ←──────────────────→ CoachingActionPlan
Teachers ←─────────────────→      │
Coaches ←──────────────────→      ├─ Visits (Secondary Aggregates)
                                 │   ├─ Notes  
                                 │   ├─ NextSteps
                                 │   ├─ Schedules
                                 │   ├─ Evidence
                                 │   ├─ Metrics
                                 │   └─ Observations
                                 │
                                 └─ Outcomes (Plan-level only)
```

## **Schedule Schema - Visit-Centric**

```typescript
// Schedule is created FOR a specific visit
export const ScheduleZodSchema = z.object({
  _id: z.string(),
  
  // Primary context
  coachingActionPlanId: z.string(),
  
  // Visit context (schedules are visit-specific)
  visitId: z.string(),              // Required - schedule is FOR this visit
  
  // Inherited from visit
  schoolId: z.string(),
  teacherId: z.string(), 
  coachId: z.string(),
  
  // Schedule specifics
  scheduledDate: z.string(),
  scheduledTime: z.string(),
  duration: z.number(),
  purpose: z.string(),
  location: z.string().optional(),
  
  // Schedule status
  status: z.enum(["scheduled", "confirmed", "rescheduled", "cancelled"]),
  
  // Logistics
  meetingType: z.enum(["observation", "debrief", "planning", "co-teaching"]),
  preparationNotes: z.string().optional(),
  equipmentNeeded: z.array(z.string()).optional(),
});
```

## **Updated Categorization**

### **Visit-Generated (created FOR/DURING visits)**
```typescript
- Schedules (planning the visit)
- Notes (observations during visit)
- NextSteps (outcomes from visit) 
- Evidence (collected during visit)
- Metrics (measured during visit)
- Observations (real-time data)
```

### **Plan-Generated (created at plan level)**
```typescript
- WeeklyPlans (overall planning)
- Goals & Outcomes (plan objectives)
- EndOfCycleAnalysis (plan reflection)
- NeedsAndFocus (plan foundation)
```

## **Schedule Creation Pattern**

```typescript
// Schedules are created when planning a visit
async function scheduleVisit(planId: string, scheduleData: ScheduleData) {
  // First create the visit
  const visit = await Visit.create({
    coachingActionPlanId: planId,
    schoolId: scheduleData.schoolId,
    teacherId: scheduleData.teacherId,
    coachId: scheduleData.coachId,
    cycleNumber: scheduleData.cycleNumber,
    weekNumber: scheduleData.weekNumber,
    status: "scheduled"
  });
  
  // Then create the schedule FOR that visit
  const schedule = await Schedule.create({
    coachingActionPlanId: planId,
    visitId: visit._id,           // Schedule belongs to this visit
    schoolId: visit.schoolId,     // Inherited from visit
    teacherId: visit.teacherId,   // Inherited from visit
    coachId: visit.coachId,       // Inherited from visit
    scheduledDate: scheduleData.date,
    scheduledTime: scheduleData.time,
    duration: scheduleData.duration,
    purpose: scheduleData.purpose,
    status: "scheduled"
  });
  
  return { visit, schedule };
}
```

## **Query Patterns for Schedules**

```typescript
// Get schedule for a specific visit
const visitSchedule = await Schedule.findOne({ visitId });

// Get all schedules for a teacher this week
const teacherWeeklySchedule = await Schedule.find({
  teacherId: teacherId,
  scheduledDate: { $gte: startOfWeek, $lt: endOfWeek },
  status: { $in: ["scheduled", "confirmed"] }
}).populate('visitId', 'purpose cycleNumber');

// Coach's daily schedule
const coachDailySchedule = await Schedule.find({
  coachId: coachId,
  scheduledDate: targetDate,
  status: { $ne: "cancelled" }
}).populate('visitId').populate('schoolId', 'name').populate('teacherId', 'name');

// Plan-level scheduling overview
const planScheduleOverview = await Schedule.aggregate([
  { $match: { coachingActionPlanId: planId } },
  { $group: {
    _id: "$status",
    count: { $sum: 1 },
    visits: { $push: "$visitId" }
  }}
]);
```

## **Complete Visit Lifecycle**

```typescript
// 1. Schedule the visit
const { visit, schedule } = await scheduleVisit(planId, scheduleData);

// 2. Confirm the visit  
await Schedule.updateOne(
  { visitId: visit._id },
  { status: "confirmed" }
);

// 3. Conduct the visit
await Visit.updateOne(
  { _id: visit._id },
  { status: "in_progress" }
);

// 4. Complete the visit and generate outcomes
const visitOutcomes = await completeVisit(visit._id, {
  notes: [...],
  nextSteps: [...], 
  evidence: [...],
  metrics: [...]
});

// 5. Update visit status
await Visit.updateOne(
  { _id: visit._id },
  { status: "completed" }
);
```

## **MongoDB Indexing Updates**

```typescript
// Schedule-specific indexes
db.schedules.createIndex({ visitId: 1 });
db.schedules.createIndex({ 
  coachId: 1, 
  scheduledDate: 1, 
  status: 1 
});
db.schedules.createIndex({ 
  teacherId: 1, 
  scheduledDate: 1, 
  status: 1 
});
db.schedules.createIndex({ 
  schoolId: 1, 
  scheduledDate: 1 
});

// Cross-visit queries
db.schedules.createIndex({ 
  coachingActionPlanId: 1, 
  status: 1 
});
```

## **UI Implications**

This means UI flows become visit-centric:

```typescript
// Visit detail page shows everything for that visit
const visitDetails = {
  visit: await Visit.findById(visitId),
  schedule: await Schedule.findOne({ visitId }),
  notes: await Note.find({ visitId }),
  nextSteps: await NextStep.find({ visitId }),
  evidence: await Evidence.find({ visitId }),
  metrics: await Metric.find({ visitId })
};

// Coach dashboard: upcoming scheduled visits
const upcomingVisits = await Schedule.find({
  coachId: coachId,
  scheduledDate: { $gte: new Date() },
  status: { $in: ["scheduled", "confirmed"] }
}).populate('visitId');
```

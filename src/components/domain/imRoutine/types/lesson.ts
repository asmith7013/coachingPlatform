// types/lesson.ts
export type BaseActivity = {
    activityNumber: string;
    routines: string[];
  };
  
  export type BaseLesson = {
    grade: string;
    unit: string;
    lessonNumber: string;
    activities: BaseActivity[];
    curriculum: 'ILC' | 'Kendall Hunt';
  };
  
  export type ILCLesson = BaseLesson;
  
  export type KHLesson = BaseLesson & {
    activities: (BaseActivity & {
      activityTitle?: string;
      isWarmUp?: boolean;
    })[];
  };
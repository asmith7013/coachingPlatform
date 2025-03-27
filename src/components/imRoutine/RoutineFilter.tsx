'use client';

// import { Switch } from '@components/tailwind/switch';

type RoutineFilterProps = {
  allRoutines: string[];
  selectedRoutines: string[];
  setSelectedRoutines: (routines: string[]) => void;
  // New optional props:
  selectedLesson?: string;
  lessonRoutines?: string[];
  onLessonSelected?: () => void;
  setDetailedView: (detailedView: boolean) => void;
  detailedView: boolean;
};

export function RoutineFilter({
  allRoutines,
  selectedRoutines,
  setSelectedRoutines,
  selectedLesson,
  lessonRoutines,
  onLessonSelected,
  // setDetailedView,
  // detailedView
}: RoutineFilterProps) {
  // Determine the list of routines to show:
  const routinesToShow = selectedLesson && lessonRoutines ? lessonRoutines : allRoutines;

  // If a lesson is selected, call onLessonSelected callback if provided.
  if (selectedLesson && onLessonSelected) {
    onLessonSelected();
  }

  const handleClick = (routine: string) => {
    if (selectedRoutines.length === routinesToShow.length) {
      // First click selects only the clicked routine.
      setSelectedRoutines([routine]);
    } else if (selectedRoutines.includes(routine)) {
      // Deselect it.
      setSelectedRoutines(selectedRoutines.filter((r) => r !== routine));
    } else {
      // Add it.
      setSelectedRoutines([...selectedRoutines, routine]);
    }
  };

  return (
    <div className="mb-4">
      {/* <div className="mb-4 flex items-center gap-3">
        <span className="text-sm font-medium">{detailedView ? 'More Detail' : 'Less Detail'}</span>
        <Switch
          checked={detailedView}
          onChange={setDetailedView}
          color="blue"
        />
      </div> */}
      <label className="block text-sm font-medium mb-1">
        Filter by Routine:
      </label>
      <div className="flex flex-wrap gap-2">
        {routinesToShow.map((routine, index) => {
          const selected = selectedRoutines.includes(routine);
          const isMLR = /^MLR\d+/.test(routine);
          const buttonClass = selected
            ? isMLR
              ? 'bg-purple-600 text-white border-purple-600'
              : 'bg-blue-600 text-white border-blue-600'
            : isMLR
            ? 'bg-purple-100 text-purple-800 border-purple-300'
            : 'bg-blue-100 text-blue-800 border-blue-300';
          return (
            <button
              key={`${routine}-${index}`}
              onClick={() => handleClick(routine)}
              className={`text-xs px-2 py-1 rounded border ${buttonClass}`}
            >
              {routine}
            </button>
          );
        })}
        <button
          onClick={() => setSelectedRoutines(routinesToShow)}
          className="text-xs px-2 py-1 rounded border bg-gray-600 text-white border-gray-300"
        >
          Select All
        </button>
      </div>
    </div>
  );
}
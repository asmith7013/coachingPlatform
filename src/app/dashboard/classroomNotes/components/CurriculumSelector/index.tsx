import React, { useState, useEffect } from "react";
import { tv } from "tailwind-variants";
import { Textarea } from "@/components/core/fields/Textarea";
import ResourceLinks from "./ResourceLinks";
import { FormData } from "../../page";

interface CurriculumSelectorProps {
  formData: FormData;
  handleInputChange: (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => void;
  curriculumData: Record<
    string,
    {
      units: Record<
        string,
        {
          lessons: string[];
        }
      >;
    }
  >;
  exampleLessonData: {
    course: string;
    unit: string;
    lesson: string;
    title: string;
    learningGoals: string[];
    coolDownUrl: string;
    handoutUrl: string;
    lessonUrl: string;
  };
}

const fieldLabel = tv({
  base: "text-sm font-medium text-gray-700 mb-1",
});

const subsectionTitle = tv({
  base: "text-base font-medium mt-4 mb-2",
});

const CurriculumSelector: React.FC<CurriculumSelectorProps> = ({
  formData,
  handleInputChange,
  curriculumData,
  exampleLessonData,
}) => {
  // Available units based on selected course
  const [availableUnits, setAvailableUnits] = useState<string[]>([]);

  // Available lessons based on selected unit
  const [availableLessons, setAvailableLessons] = useState<string[]>([]);

  // Set available units when course changes
  useEffect(() => {
    const course = formData.curriculum.course;
    if (course && curriculumData[course]) {
      const units = Object.keys(curriculumData[course].units);
      setAvailableUnits(units);
    } else {
      setAvailableUnits([]);
    }
  }, [formData.curriculum.course, curriculumData]);

  // Set available lessons when unit changes
  useEffect(() => {
    const { course, unit } = formData.curriculum;
    if (course && unit && curriculumData[course]?.units[unit]) {
      const lessons = curriculumData[course].units[unit].lessons;
      setAvailableLessons(lessons);
    } else {
      setAvailableLessons([]);
    }
  }, [
    formData.curriculum.course,
    formData.curriculum.unit,
    curriculumData,
    formData.curriculum,
  ]);

  const isExampleLesson =
    formData.curriculum.course === exampleLessonData.course &&
    formData.curriculum.unit === exampleLessonData.unit &&
    formData.curriculum.lesson === exampleLessonData.lesson;

  return (
    <div className="mb-6">
      <h3 className={subsectionTitle()}>Curriculum</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-2">
        <div>
          <label className={fieldLabel()}>Course</label>
          <select
            name="curriculum.course"
            value={formData.curriculum.course}
            onChange={handleInputChange}
            className="w-full p-2 border rounded-md"
          >
            <option value="">Select Course</option>
            {Object.keys(curriculumData).map((course) => (
              <option key={course} value={course}>
                {course}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={fieldLabel()}>Unit</label>
          <select
            name="curriculum.unit"
            value={formData.curriculum.unit}
            onChange={handleInputChange}
            className="w-full p-2 border rounded-md"
            disabled={availableUnits.length === 0}
          >
            <option value="">Select Unit</option>
            {availableUnits.map((unit) => (
              <option key={unit} value={unit}>
                {unit}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={fieldLabel()}>Lesson</label>
          <select
            name="curriculum.lesson"
            value={formData.curriculum.lesson}
            onChange={handleInputChange}
            className="w-full p-2 border rounded-md"
            disabled={availableLessons.length === 0}
          >
            <option value="">Select Lesson</option>
            {availableLessons.map((lesson) => (
              <option key={lesson} value={lesson}>
                {lesson}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Lesson Title */}
      {formData.curriculum.title && (
        <div className="text-lg font-medium mb-2">
          {formData.curriculum.title}
        </div>
      )}

      {/* Lesson Resources */}
      {isExampleLesson && (
        <ResourceLinks exampleLessonData={exampleLessonData} />
      )}

      <div className="mt-4">
        <label className={fieldLabel()}>Other Context</label>
        <Textarea
          name="otherContext"
          value={formData.otherContext}
          onChange={handleInputChange}
          placeholder="Additional context about the classroom, students, etc."
          rows={2}
        />
      </div>
    </div>
  );
};

export default CurriculumSelector;

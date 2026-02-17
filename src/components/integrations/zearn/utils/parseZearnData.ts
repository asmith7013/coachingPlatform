export interface ZearnCompletion {
  lessonTitle: string;
  lessonCompletionDate: string;
}

export interface ZearnWeek {
  week: string;
  zearnMin: string;
}

export interface ParsedStudentData {
  studentName: string;
  firstName: string;
  lastName: string;
  zearnCompletions: ZearnCompletion[];
  zearnWeeks: ZearnWeek[];
}

export function parseZearnData(text: string): ParsedStudentData {
  const lines = text.trim().split("\n");

  const result = {
    studentName: "",
    firstName: "",
    lastName: "",
    zearnCompletions: [] as ZearnCompletion[],
    zearnWeeks: [] as ZearnWeek[],
  };

  console.log("Initial result:", result);

  let weeklyMinutes = "";
  let weekRange = "";
  let currentLesson = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    if (!line) continue;

    // Extract student name - include hyphens in the pattern
    const nameMatch = line.match(/([A-Z\s-]+)\s+completed\s+\d+\s+Lessons?/);
    //                              ^^^^ added hyphen to character class

    if (nameMatch) {
      result.studentName = nameMatch[1].trim();
      const nameParts = result.studentName.split(/\s+/);
      result.firstName = nameParts[0] || "";
      result.lastName = nameParts.slice(1).join(" ") || "";
      continue;
    }

    // Extract lesson title
    const lessonMatch = line.match(/(G\d+\s+M\d+\s+L\d+)/);
    if (lessonMatch) {
      currentLesson = lessonMatch[1];
      continue;
    }

    // Extract completion time
    const timeMatch = line.match(
      /^(Mon|Tue|Wed|Thu|Fri|Sat|Sun),\s+.+,\s+\d{1,2}:\d{2}\s+[AP]M$/,
    );
    if (timeMatch && currentLesson) {
      result.zearnCompletions.push({
        lessonTitle: formatLessonTitle(currentLesson),
        lessonCompletionDate: line,
      });
      currentLesson = null;
      continue;
    }

    // Extract weekly minutes
    const minutesMatch = line.match(/(\d+h\s+\d+m|\d+m)\s+spent\s+on\s+Zearn/);
    if (minutesMatch) {
      weeklyMinutes = minutesMatch[1];
      continue;
    }

    // Extract week range
    const weekMatch = line.match(
      /(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+\d+\s+–\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+\d+/,
    );
    if (weekMatch) {
      weekRange = weekMatch[0];
    }
  }

  if (weekRange && weeklyMinutes) {
    result.zearnWeeks.push({
      week: weekRange,
      zearnMin: weeklyMinutes,
    });
  }

  console.log("Final result:", result);

  return result;
}

function formatLessonTitle(lessonTitle: string): string {
  // Match the pattern G# M# L# and extract the parts
  const match = lessonTitle.match(/^(G\d+)\s+(M\d+)\s+L(\d+)$/);

  if (match) {
    const gradeNum = match[1]; // G6, G7, G8, etc.
    const moduleNum = match[2]; // M1, M2, M3, etc.
    const lessonNum = match[3]; // 1, 2, 10, etc.

    // Convert M to U
    const convertedModule = moduleNum.replace("M", "U");

    // Pad lesson number with leading zero if single digit
    const paddedLesson = lessonNum.padStart(2, "0");

    return `${gradeNum} ${convertedModule} L${paddedLesson}`;
  }

  // Return original if pattern doesn't match
  return lessonTitle;
}

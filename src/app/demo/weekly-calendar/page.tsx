"use client";

import { useState } from "react";
import {
  WeeklyCalendar,
  type CalendarEvent,
} from "@/components/composed/calendar/weekly";
import {
  navigateWeek,
  toDateString,
  fromDateString,
} from "@/lib/data-processing/transformers/utils/date-utils";

const sampleEvents: CalendarEvent[] = [
  {
    id: "1",
    title: "Team Meeting",
    startTime: "09:00",
    duration: 12, // 1 hour = 12 five-minute slots
    color: "blue",
    day: 1, // Tuesday
  },
  {
    id: "2",
    title: "Lunch Break",
    startTime: "12:00",
    duration: 12,
    color: "green",
    day: 1, // Tuesday
  },
  {
    id: "3",
    title: "Client Call",
    startTime: "14:30",
    duration: 6, // 30 minutes
    color: "purple",
    day: 2, // Wednesday
  },
  {
    id: "4",
    title: "Code Review",
    startTime: "10:00",
    duration: 18, // 1.5 hours
    color: "yellow",
    day: 3, // Thursday
  },
  {
    id: "5",
    title: "Project Planning",
    startTime: "15:00",
    duration: 24, // 2 hours
    color: "pink",
    day: 4, // Friday
  },
];

export default function WeeklyCalendarDemo() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>(sampleEvents);

  const handleNavigate = (direction: "prev" | "next" | "today") => {
    if (direction === "today") {
      setCurrentDate(new Date());
      return;
    }

    // Convert Date to string, navigate, then convert back to Date
    const dateString = toDateString(currentDate);
    const newDateString = navigateWeek(dateString, direction);
    setCurrentDate(fromDateString(newDateString));
  };

  const handleEventClick = (event: CalendarEvent) => {
    alert(`Clicked event: ${event.title} at ${event.startTime}`);
  };

  const handleAddEvent = () => {
    const newEvent: CalendarEvent = {
      id: `${events.length + 1}`,
      title: "New Event",
      startTime: "16:00",
      duration: 6,
      color: "gray",
      day: 0, // Monday
    };
    setEvents([...events, newEvent]);
  };

  const handleViewChange = (view: "day" | "week" | "month" | "year") => {
    console.log("View changed to:", view);
  };

  return (
    <div className="h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-none">
          <div className="bg-white shadow rounded-lg overflow-hidden h-screen">
            <WeeklyCalendar
              currentDate={currentDate}
              events={events}
              onEventClick={handleEventClick}
              onAddEvent={handleAddEvent}
              onNavigate={handleNavigate}
              onViewChange={handleViewChange}
              size="default"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

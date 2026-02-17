"use client";

import { useEffect, useRef } from "react";
import { tv, type VariantProps } from "tailwind-variants";
import { CalendarHeader } from "./CalendarHeader";
import { TimeGrid } from "./TimeGrid";
import { DayColumns } from "./DayColumns";

const weeklyCalendar = tv({
  slots: {
    container: "flex h-full flex-col",
    scrollContainer: "isolate flex flex-auto flex-col overflow-auto bg-white",
    innerContainer:
      "flex max-w-full flex-none flex-col sm:max-w-none md:max-w-full",
  },
  variants: {
    size: {
      default: {
        innerContainer: "w-[165%]",
      },
      compact: {
        innerContainer: "w-[140%]",
      },
    },
  },
  defaultVariants: {
    size: "default",
  },
});

export interface CalendarEvent {
  id: string;
  title: string;
  startTime: string;
  duration: number; // in 5-minute increments
  color: "blue" | "pink" | "gray" | "green" | "purple" | "yellow";
  day: number; // 0-6 for Sunday-Saturday
}

export interface WeeklyCalendarProps
  extends VariantProps<typeof weeklyCalendar> {
  currentDate?: Date;
  events?: CalendarEvent[];
  onEventClick?: (event: CalendarEvent) => void;
  onAddEvent?: () => void;
  onNavigate?: (direction: "prev" | "next" | "today") => void;
  onViewChange?: (view: "day" | "week" | "month" | "year") => void;
  className?: string;
}

export function WeeklyCalendar({
  currentDate = new Date(),
  events = [],
  onEventClick,
  onAddEvent,
  onNavigate,
  onViewChange,
  size,
  className,
}: WeeklyCalendarProps) {
  const container = useRef<HTMLDivElement>(null);
  const containerNav = useRef<HTMLDivElement>(null);
  const containerOffset = useRef<HTMLDivElement>(null);

  const styles = weeklyCalendar({ size });

  useEffect(() => {
    // Set the container scroll position based on the current time
    if (container.current && containerNav.current && containerOffset.current) {
      const currentMinute = new Date().getHours() * 60;
      container.current.scrollTop =
        ((container.current.scrollHeight -
          containerNav.current.offsetHeight -
          containerOffset.current.offsetHeight) *
          currentMinute) /
        1440;
    }
  }, []);

  return (
    <div className={styles.container({ className })}>
      <CalendarHeader
        currentDate={currentDate}
        onNavigate={onNavigate}
        onViewChange={onViewChange}
        onAddEvent={onAddEvent}
      />

      <div ref={container} className={styles.scrollContainer()}>
        <div className={styles.innerContainer()}>
          <DayColumns ref={containerNav} currentDate={currentDate} />

          <TimeGrid
            containerRefs={{ container, containerOffset }}
            events={events}
            onEventClick={onEventClick}
          />
        </div>
      </div>
    </div>
  );
}

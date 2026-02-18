"use client";

import { tv, type VariantProps } from "tailwind-variants";
import type { CalendarEvent } from "./WeeklyCalendar";

const eventItem = tv({
  slots: {
    container:
      "group absolute inset-1 flex flex-col overflow-y-auto rounded-lg p-2 text-xs/5",
    title: "order-1 font-semibold",
    time: "group-hover:text-opacity-80",
  },
  variants: {
    color: {
      blue: {
        container: "bg-blue-50 hover:bg-blue-100",
        title: "text-blue-700",
        time: "text-blue-500 group-hover:text-blue-700",
      },
      pink: {
        container: "bg-pink-50 hover:bg-pink-100",
        title: "text-pink-700",
        time: "text-pink-500 group-hover:text-pink-700",
      },
      gray: {
        container: "bg-gray-100 hover:bg-gray-200",
        title: "text-gray-700",
        time: "text-gray-500 group-hover:text-gray-700",
      },
      green: {
        container: "bg-green-50 hover:bg-green-100",
        title: "text-green-700",
        time: "text-green-500 group-hover:text-green-700",
      },
      purple: {
        container: "bg-purple-50 hover:bg-purple-100",
        title: "text-purple-700",
        time: "text-purple-500 group-hover:text-purple-700",
      },
      yellow: {
        container: "bg-yellow-50 hover:bg-yellow-100",
        title: "text-yellow-700",
        time: "text-yellow-500 group-hover:text-yellow-700",
      },
    },
  },
  defaultVariants: {
    color: "blue",
  },
});

export interface EventItemProps extends VariantProps<typeof eventItem> {
  event: CalendarEvent;
  onClick?: (event: CalendarEvent) => void;
}

export function EventItem({ event, onClick }: EventItemProps) {
  const styles = eventItem({ color: event.color });

  const formatTime = (timeString: string) => {
    const date = new Date(`2000-01-01T${timeString}`);
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  return (
    <a
      href="#"
      onClick={(e) => {
        e.preventDefault();
        onClick?.(event);
      }}
      className={styles.container()}
    >
      <p className={styles.title()}>{event.title}</p>
      <p className={styles.time()}>
        <time dateTime={event.startTime}>{formatTime(event.startTime)}</time>
      </p>
    </a>
  );
}

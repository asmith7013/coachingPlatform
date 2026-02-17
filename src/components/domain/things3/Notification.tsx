import React from "react";
import { Heading } from "@/components/core/typography/Heading";
import { Text } from "@/components/core/typography/Text";
import { Notification as NotificationType } from "@domain-types/things3-types";

interface NotificationProps {
  notification: NotificationType;
  show: boolean;
}

export function Notification({ notification, show }: NotificationProps) {
  if (!show) return null;

  const { title, message, type } = notification;

  const backgroundClass =
    type === "success"
      ? "bg-green-100 border-green-500"
      : type === "error"
        ? "bg-red-100 border-red-500"
        : "bg-blue-100 border-blue-500";

  return (
    <div
      className={`fixed top-4 right-4 p-4 rounded-md shadow-md ${backgroundClass} border-l-4 z-50`}
    >
      <Heading level="h4">{title}</Heading>
      <Text>{message}</Text>
    </div>
  );
}

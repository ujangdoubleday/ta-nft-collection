"use client";

import React from "react";
import { Win98Notification } from "./Win98Notification";

interface Win98ErrorNotificationProps {
  message: string;
  onClose: () => void;
  position?: "top" | "bottom";
  className?: string;
}

export function Win98ErrorNotification({
  message,
  onClose,
  position = "bottom",
  className,
}: Win98ErrorNotificationProps) {
  return (
    <Win98Notification
      title="Error"
      message={message}
      onClose={onClose}
      position={position}
      className={className}
    />
  );
}

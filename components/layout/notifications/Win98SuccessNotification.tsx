"use client";

import React from "react";
import { Win98Notification } from "./Win98Notification";

interface Win98SuccessNotificationProps {
  message: string;
  onClose: () => void;
  position?: "top" | "bottom";
  className?: string;
}

export function Win98SuccessNotification({
  message,
  onClose,
  position = "top",
  className,
}: Win98SuccessNotificationProps) {
  return (
    <Win98Notification
      title="Success"
      message={message}
      onClose={onClose}
      position={position}
      className={className}
    />
  );
}

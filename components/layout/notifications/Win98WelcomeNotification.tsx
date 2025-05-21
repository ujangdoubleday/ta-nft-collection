"use client";

import React from "react";
import { Win98Notification } from "./Win98Notification";

interface Win98WelcomeNotificationProps {
  onClose: () => void;
  position?: "top" | "bottom";
  className?: string;
}

export function Win98WelcomeNotification({
  onClose,
  position,
  className,
}: Win98WelcomeNotificationProps) {
  return (
    <Win98Notification
      title="Welcome"
      message="Welcome to Pixel Vault! Create, collect, and share digital art in a retro-styled environment."
      onClose={onClose}
      position={position}
      className={className}
    />
  );
}

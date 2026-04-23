"use client";
import { ReactNode } from "react";

interface Props {
  children: ReactNode;
}

/** Phone-like container – max 430px on desktop, full on mobile */
export default function PhoneFrame({ children }: Props) {
  return (
    <div className="flex items-start justify-center min-h-screen w-full">
      <div
        className="relative w-full flex flex-col"
        style={{
          maxWidth: 430,
          minHeight: "100dvh",
          overflowX: "hidden",
        }}
      >
        {children}
      </div>
    </div>
  );
}

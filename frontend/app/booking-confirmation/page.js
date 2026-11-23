
"use client";

import { Suspense } from "react";
import BookingConfirmationContent from "./BookingConfirmationContent";

export default function BookingConfirmationPage() {
  return (
    <Suspense
      fallback={
        <main
          style={{
            minHeight: "80vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "#faf7f1",
          }}
        >
          Loading booking confirmation...
        </main>
      }
    >
      <BookingConfirmationContent />
    </Suspense>
  );
}

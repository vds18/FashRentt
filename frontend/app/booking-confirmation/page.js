
"use client";

import { useSearchParams, useRouter } from "next/navigation";

export default function BookingConfirmation() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const bookingId = searchParams.get("bookingId");

  return (
    <main
      style={{
        minHeight: "80vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px 20px",
        background: "#faf7f1",
      }}
    >
      <div
        style={{
          maxWidth: "600px",
          width: "100%",
          background: "white",
          padding: "45px 30px",
          borderRadius: "14px",
          textAlign: "center",
          boxShadow: "0 8px 35px rgba(0,0,0,0.06)",
        }}
      >
        <div
          style={{
            width: "75px",
            height: "75px",
            borderRadius: "50%",
            background: "#e8f5e9",
            color: "#287a3d",
            fontSize: "40px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 25px",
          }}
        >
          ✓
        </div>

        <p
          style={{
            letterSpacing: "3px",
            color: "#a17c45",
            fontSize: "13px",
          }}
        >
          FASHRENTT
        </p>

        <h1
          style={{
            fontSize: "32px",
            margin: "20px 0",
            color: "#171717",
          }}
        >
          Booking Created!
        </h1>

        <p
          style={{
            color: "#666",
            lineHeight: "1.8",
            marginBottom: "25px",
          }}
        >
          Your outfit booking has been created successfully.
          Keep your booking ID for future reference.
        </p>

        {bookingId ? (
          <div
            style={{
              background: "#f8f6f2",
              padding: "20px",
              borderRadius: "8px",
              marginBottom: "25px",
            }}
          >
            <p style={{ color: "#777", fontSize: "14px" }}>
              Your Booking ID
            </p>

            <h2
              style={{
                marginTop: "10px",
                fontSize: "20px",
                overflowWrap: "anywhere",
              }}
            >
              {bookingId}
            </h2>
          </div>
        ) : (
          <p style={{ color: "#b00020", marginBottom: "25px" }}>
            Booking ID is missing. Please check your bookings.
          </p>
        )}

        <div
          style={{
            padding: "15px",
            border: "1px solid #e5d5b5",
            borderRadius: "8px",
            marginBottom: "25px",
          }}
        >
          <strong>Payment Status: Pending</strong>

          <p
            style={{
              fontSize: "13px",
              color: "#777",
              marginTop: "8px",
              lineHeight: "1.6",
            }}
          >
            Online payment has not been integrated yet.
            Your booking is awaiting payment and confirmation.
          </p>
        </div>

        <button
          onClick={() => router.push("/account")}
          style={{
            width: "100%",
            padding: "16px",
            background: "#171717",
            color: "white",
            border: "none",
            cursor: "pointer",
            letterSpacing: "1px",
            marginBottom: "12px",
          }}
        >
          MY ACCOUNT
        </button>

        <button
          onClick={() => router.push("/")}
          style={{
            width: "100%",
            padding: "16px",
            background: "white",
            color: "#171717",
            border: "1px solid #171717",
            cursor: "pointer",
          }}
        >
          CONTINUE EXPLORING
        </button>
      </div>
    </main>
  );
}
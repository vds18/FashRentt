"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

export default function OutfitDetails() {
  const { id } = useParams();
  const router = useRouter();

  const [outfit, setOutfit] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [startDate, setStartDate] = useState("");

  const [checkingAvailability, setCheckingAvailability] = useState(false);
  const [isAvailable, setIsAvailable] = useState(null);
  const [availabilityMessage, setAvailabilityMessage] = useState("");

  useEffect(() => {
    async function fetchOutfit() {
      try {
        const response = await fetch(
          `http://localhost:5000/api/outfits/${id}`
        );

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.message || "Outfit not found");
        }

        setOutfit(data.outfit);
      } catch (err) {
        setError(err.message || "Unable to load outfit");
      } finally {
        setLoading(false);
      }
    }

    if (id) fetchOutfit();
  }, [id]);

  async function handleRentNow() {
    const token = localStorage.getItem("token");

    if (!token) {
      router.push("/login");
      return;
    }

    if (!selectedColor || !selectedSize || !startDate) {
      alert("Please select your color, size and rental start date.");
      return;
    }

    const duration = Number(outfit.rentalDuration);

    if (!Number.isInteger(duration) || duration <= 0) {
      alert("Invalid rental duration for this outfit.");
      return;
    }

    // Calculate rental end date
    const start = new Date(`${startDate}T00:00:00`);
    const end = new Date(start);

    end.setDate(end.getDate() + duration);

    const endDate = [
      end.getFullYear(),
      String(end.getMonth() + 1).padStart(2, "0"),
      String(end.getDate()).padStart(2, "0"),
    ].join("-");

    try {
      setCheckingAvailability(true);
      setAvailabilityMessage("");
      setIsAvailable(null);

      const response = await fetch(
        `http://localhost:5000/api/bookings/check-availability?outfitId=${id}&size=${encodeURIComponent(
          selectedSize
        )}&rentalStartDate=${startDate}&rentalEndDate=${endDate}`
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Unable to check availability."
        );
      }

      if (!data.available) {
        setIsAvailable(false);
        setAvailabilityMessage(
          data.message ||
            "This outfit size is unavailable for the selected dates."
        );
        return;
      }

      setIsAvailable(true);

      setAvailabilityMessage(
        `Available! ${data.availableQuantity} unit${
          data.availableQuantity > 1 ? "s" : ""
        } available.`
      );

      // Send booking details to checkout
      const params = new URLSearchParams({
        outfitId: id,
        color: selectedColor,
        size: selectedSize,
        startDate,
        endDate,
      });

      router.push(`/checkout?${params.toString()}`);
    } catch (err) {
      setIsAvailable(false);
      setAvailabilityMessage(
        err.message || "Unable to check availability."
      );
    } finally {
      setCheckingAvailability(false);
    }
  }

  if (loading) {
    return <p style={{ padding: "100px" }}>Loading outfit...</p>;
  }

  if (error || !outfit) {
    return (
      <div style={{ padding: "100px", textAlign: "center" }}>
        <h2>Outfit not found</h2>
        <p>{error}</p>
      </div>
    );
  }

  const rentalPrice = outfit.rentalPrice || 0;
  const deposit = outfit.securityDeposit || 0;

  return (
    <main
      style={{
        maxWidth: "1200px",
        margin: "auto",
        padding: "60px 24px",
      }}
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          gap: "50px",
          alignItems: "start",
        }}
      >
        {/* OUTFIT IMAGE */}
        <div>
          {outfit.images?.length > 0 ? (
            <img
              src={outfit.images[0]}
              alt={outfit.name}
              style={{
                width: "100%",
                maxHeight: "650px",
                objectFit: "cover",
                borderRadius: "12px",
              }}
            />
          ) : (
            <div
              style={{
                height: "500px",
                background: "#f4f0eb",
                borderRadius: "12px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#777",
              }}
            >
              Outfit image coming soon
            </div>
          )}
        </div>

        {/* OUTFIT DETAILS */}
        <div>
          <p style={{ letterSpacing: "3px", color: "#a17c45" }}>
            FASHRENTT COLLECTION
          </p>

          <h1 style={{ fontSize: "36px", margin: "15px 0" }}>
            {outfit.name}
          </h1>

          <p style={{ color: "#777" }}>{outfit.category}</p>

          <h2 style={{ marginTop: "25px" }}>
            ₹{rentalPrice}
            <span style={{ fontSize: "15px", fontWeight: "normal" }}>
              {" "}/ {outfit.rentalDuration} days
            </span>
          </h2>

          <p style={{ marginTop: "10px" }}>
            Refundable security deposit: ₹{deposit}
          </p>

          <hr style={{ margin: "25px 0" }} />

          <h3>Product Description</h3>

          <p style={{ marginTop: "10px", lineHeight: "1.8" }}>
            {outfit.description}
          </p>

          {/* AVAILABLE COLORS */}
          <h3 style={{ marginTop: "30px" }}>Available Colors</h3>

          <div
            style={{
              display: "flex",
              gap: "10px",
              marginTop: "15px",
              flexWrap: "wrap",
            }}
          >
            {Array.isArray(outfit.color) && outfit.color.length > 0 ? (
              outfit.color.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => {
                    setSelectedColor(color);
                    setIsAvailable(null);
                    setAvailabilityMessage("");
                  }}
                  style={{
                    padding: "9px 16px",
                    border:
                      selectedColor === color
                        ? "2px solid #171717"
                        : "1px solid #d8d0c5",
                    borderRadius: "20px",
                    background:
                      selectedColor === color
                        ? "#171717"
                        : "#f8f6f2",
                    color:
                      selectedColor === color
                        ? "white"
                        : "#333",
                    fontSize: "14px",
                    cursor: "pointer",
                  }}
                >
                  {color}
                </button>
              ))
            ) : (
              <span
                style={{
                  color: "#777",
                  fontSize: "14px",
                }}
              >
                Color information not available
              </span>
            )}
          </div>

          {/* SIZE SELECTION */}
          <h3 style={{ marginTop: "30px" }}>
            Select Your Size
          </h3>

          <div
            style={{
              display: "flex",
              gap: "12px",
              marginTop: "15px",
              flexWrap: "wrap",
            }}
          >
            {outfit.sizes
              ?.filter((item) => item.quantity > 0)
              .map((item) => (
                <button
                  key={item._id || item.size}
                  onClick={() => {
                    setSelectedSize(item.size);
                    setIsAvailable(null);
                    setAvailabilityMessage("");
                  }}
                  style={{
                    padding: "12px 22px",
                    border: "1px solid #222",
                    background:
                      selectedSize === item.size
                        ? "#222"
                        : "white",
                    color:
                      selectedSize === item.size
                        ? "white"
                        : "#222",
                    cursor: "pointer",
                  }}
                >
                  {item.size}
                </button>
              ))}
          </div>

          {/* RENTAL DATE */}
          <h3 style={{ marginTop: "30px" }}>
            Rental Start Date
          </h3>

          <input
            type="date"
            value={startDate}
            min={new Date().toISOString().split("T")[0]}
            onChange={(e) => {
              setStartDate(e.target.value);
              setIsAvailable(null);
              setAvailabilityMessage("");
            }}
            style={{
              width: "100%",
              padding: "14px",
              marginTop: "12px",
              border: "1px solid #ccc",
              borderRadius: "6px",
            }}
          />

          {/* PRICE SUMMARY */}
          <div
            style={{
              background: "#f8f6f2",
              padding: "20px",
              marginTop: "30px",
              borderRadius: "8px",
            }}
          >
            <h3>Rental Summary</h3>

            <p style={{ marginTop: "15px" }}>
              Rental Price: ₹{rentalPrice}
            </p>

            <p style={{ marginTop: "10px" }}>
              Security Deposit: ₹{deposit}
            </p>

            <hr style={{ margin: "15px 0" }} />

            <h3>Total: ₹{rentalPrice + deposit}</h3>

            <p style={{ fontSize: "13px", color: "#777" }}>
              Deposit is refundable subject to return conditions.
            </p>
          </div>

          {/* AVAILABILITY MESSAGE */}
          {availabilityMessage && (
            <p
              style={{
                marginTop: "15px",
                padding: "12px",
                borderRadius: "6px",
                background: isAvailable
                  ? "#eef8f0"
                  : "#fff1f1",
                color: isAvailable
                  ? "#26733a"
                  : "#b42318",
                fontSize: "14px",
                textAlign: "center",
              }}
            >
              {availabilityMessage}
            </p>
          )}

          {/* GO TO CHECKOUT */}
          <button
            disabled={
              !selectedColor ||
              !selectedSize ||
              !startDate ||
              checkingAvailability
            }
            onClick={handleRentNow}
            style={{
              width: "100%",
              padding: "16px",
              marginTop: "25px",
              background:
                selectedColor &&
                selectedSize &&
                startDate &&
                !checkingAvailability
                  ? "#171717"
                  : "#999",
              color: "white",
              border: "none",
              cursor:
                selectedColor &&
                selectedSize &&
                startDate &&
                !checkingAvailability
                  ? "pointer"
                  : "not-allowed",
              letterSpacing: "1px",
            }}
          >
            {checkingAvailability
              ? "CHECKING AVAILABILITY..."
              : "CHECK AVAILABILITY & RENT"}
          </button>
        </div>
      </div>
    </main>
  );
}

"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function CheckoutPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const outfitId = searchParams.get("outfitId");
  const color = searchParams.get("color");
  const size = searchParams.get("size");
  const startDate = searchParams.get("startDate");
  const endDate = searchParams.get("endDate");

  const [outfit, setOutfit] = useState(null);
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState("");

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const API = "http://localhost:5000/api";

  useEffect(() => {
    async function loadCheckout() {
      try {
        const token = localStorage.getItem("token");

        if (!token) {
          router.push("/login");
          return;
        }

        if (!outfitId || !color || !size || !startDate || !endDate) {
          setError("Booking details are missing. Please select your outfit again.");
          return;
        }

        const [outfitResponse, addressResponse] = await Promise.all([
          fetch(`${API}/outfits/${outfitId}`),
          fetch(`${API}/auth/addresses`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }),
        ]);

        const outfitData = await outfitResponse.json();
        const addressData = await addressResponse.json();

        if (!outfitResponse.ok || !outfitData.success) {
          throw new Error(outfitData.message || "Unable to load outfit.");
        }

        if (!addressResponse.ok || !addressData.success) {
          throw new Error(addressData.message || "Unable to load saved addresses.");
        }

        setOutfit(outfitData.outfit);

        const savedAddresses = addressData.addresses || [];
        setAddresses(savedAddresses);

        const defaultAddress = savedAddresses.find(
          (address) => address.isDefault
        );

        if (defaultAddress) {
          setSelectedAddress(defaultAddress._id);
        } else if (savedAddresses.length > 0) {
          setSelectedAddress(savedAddresses[0]._id);
        }
      } catch (err) {
        setError(err.message || "Unable to load checkout.");
      } finally {
        setLoading(false);
      }
    }

    loadCheckout();
  }, [outfitId, color, size, startDate, endDate, router]);

  async function handleConfirmBooking() {
    try {
      setError("");

      const token = localStorage.getItem("token");

      if (!token) {
        router.push("/login");
        return;
      }

      if (!selectedAddress) {
        setError("Please select a delivery address.");
        return;
      }

      const address = addresses.find(
        (item) => item._id === selectedAddress
      );

      if (!address) {
        setError("Please select a valid delivery address.");
        return;
      }

      setSubmitting(true);

      const response = await fetch(`${API}/bookings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          outfitId,
          color,
          size,
          rentalStartDate: startDate,
          rentalEndDate: endDate,
          deliveryAddress: {
            fullName: address.fullName,
            phone: address.phone,
            addressLine: address.addressLine,
            city: address.city,
            state: address.state,
            pincode: address.pincode,
          },
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Booking could not be created.");
      }

      router.push(
        `/booking-confirmation?bookingId=${encodeURIComponent(
          data.booking.bookingId
        )}`
      );
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return <p style={{ padding: "100px" }}>Loading checkout...</p>;
  }

  if (error && !outfit) {
    return (
      <main style={{ padding: "100px 24px", textAlign: "center" }}>
        <h2>Unable to load checkout</h2>
        <p>{error}</p>
        <button onClick={() => router.push("/outfits")}>
          Browse Outfits
        </button>
      </main>
    );
  }

  if (!outfit) return null;

  const rentalPrice = outfit.rentalPrice || 0;
  const deposit = outfit.securityDeposit || 0;
  const deliveryFee = 0;
  const total = rentalPrice + deposit + deliveryFee;

  const selectedAddressDetails = addresses.find(
    (address) => address._id === selectedAddress
  );

  return (
    <main
      style={{
        maxWidth: "1100px",
        margin: "auto",
        padding: "60px 24px",
        color: "#222",
      }}
    >
      <p
        style={{
          letterSpacing: "3px",
          color: "#a17c45",
          textAlign: "center",
        }}
      >
        FASHRENTT
      </p>

      <h1
        style={{
          textAlign: "center",
          fontSize: "36px",
          margin: "15px 0 40px",
        }}
      >
        Checkout
      </h1>

      {error && (
        <div
          style={{
            padding: "15px",
            background: "#fff0f0",
            color: "#b00020",
            borderRadius: "8px",
            marginBottom: "25px",
          }}
        >
          {error}
        </div>
      )}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          gap: "35px",
          alignItems: "start",
        }}
      >
        {/* OUTFIT AND PRICE SUMMARY */}

        <section
          style={{
            background: "#f8f6f2",
            padding: "25px",
            borderRadius: "12px",
          }}
        >
          <h2 style={{ marginBottom: "20px" }}>Order Summary</h2>

          {outfit.images?.length > 0 && (
            <img
              src={outfit.images[0]}
              alt={outfit.name}
              style={{
                width: "100%",
                height: "300px",
                objectFit: "cover",
                borderRadius: "8px",
              }}
            />
          )}

          <h3 style={{ marginTop: "20px", fontSize: "22px" }}>
            {outfit.name}
          </h3>

          <p style={{ color: "#777", marginTop: "8px" }}>
            Category: {outfit.category}
          </p>
          <p style={{ marginTop: "10px" }}>
  Selected color: {color}
</p>
          <p style={{ marginTop: "10px" }}>Selected size: {size}</p>

          <p style={{ marginTop: "10px" }}>
            Rental period: {outfit.rentalDuration} days
          </p>

          <p style={{ marginTop: "10px" }}>
            Start date: {startDate}
          </p>

          <p style={{ marginTop: "10px" }}>
            Return date: {endDate}
          </p>

          <hr style={{ margin: "25px 0" }} />

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: "15px",
            }}
          >
            <span>Rental price</span>
            <span>₹{rentalPrice}</span>
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: "15px",
            }}
          >
            <span>Refundable deposit</span>
            <span>₹{deposit}</span>
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: "15px",
            }}
          >
            <span>Delivery</span>
            <span>
              {deliveryFee === 0 ? "Free" : `₹${deliveryFee}`}
            </span>
          </div>

          <hr style={{ margin: "20px 0" }} />

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontSize: "22px",
              fontWeight: "bold",
            }}
          >
            <span>Total</span>
            <span>₹{total}</span>
          </div>

          <p
            style={{
              fontSize: "13px",
              color: "#777",
              marginTop: "15px",
              lineHeight: "1.6",
            }}
          >
            The security deposit is refundable subject to the outfit's
            return condition and applicable return policy.
          </p>
        </section>

        {/* DELIVERY ADDRESS */}

        <section>
          <h2 style={{ fontSize: "25px", marginBottom: "20px" }}>
            Delivery Address
          </h2>

          {addresses.length === 0 ? (
            <div
              style={{
                padding: "25px",
                background: "#f8f6f2",
                borderRadius: "10px",
              }}
            >
              <p>You haven't saved any delivery addresses yet.</p>

              <button
                onClick={() => router.push("/addresses")}
                style={{
                  padding: "14px 20px",
                  marginTop: "20px",
                  background: "#171717",
                  color: "white",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                Add Delivery Address
              </button>
            </div>
          ) : (
            <div style={{ display: "grid", gap: "15px" }}>
              {addresses.map((address) => (
                <label
                  key={address._id}
                  style={{
                    display: "flex",
                    gap: "12px",
                    alignItems: "flex-start",
                    padding: "20px",
                    border:
                      selectedAddress === address._id
                        ? "2px solid #a17c45"
                        : "1px solid #ddd",
                    borderRadius: "10px",
                    cursor: "pointer",
                    background:
                      selectedAddress === address._id
                        ? "#fcfaf6"
                        : "white",
                  }}
                >
                  <input
                    type="radio"
                    name="deliveryAddress"
                    value={address._id}
                    checked={selectedAddress === address._id}
                    onChange={() => setSelectedAddress(address._id)}
                    style={{ marginTop: "5px" }}
                  />

                  <div style={{ lineHeight: "1.7" }}>
                    <strong>{address.fullName}</strong>

                    {address.isDefault && (
                      <span
                        style={{
                          marginLeft: "10px",
                          color: "#a17c45",
                          fontSize: "12px",
                        }}
                      >
                        DEFAULT
                      </span>
                    )}

                    <p>{address.phone}</p>
                    <p>{address.addressLine}</p>
                    <p>
                      {address.city}, {address.state} - {address.pincode}
                    </p>
                  </div>
                </label>
              ))}

              <button
                onClick={() => router.push("/addresses")}
                style={{
                  padding: "14px",
                  background: "white",
                  border: "1px solid #222",
                  cursor: "pointer",
                }}
              >
                Manage / Add Addresses
              </button>
            </div>
          )}

          {/* FINAL CONFIRMATION */}

          <div
            style={{
              marginTop: "30px",
              padding: "25px",
              border: "1px solid #eee",
              borderRadius: "10px",
            }}
          >
            <h3>Confirm Your Booking</h3>

            {selectedAddressDetails && (
              <p
                style={{
                  color: "#777",
                  fontSize: "14px",
                  marginTop: "12px",
                  lineHeight: "1.6",
                }}
              >
                Your outfit will be delivered to{" "}
                <strong>{selectedAddressDetails.fullName}</strong> at{" "}
                {selectedAddressDetails.city}.
              </p>
            )}

            <button
              onClick={handleConfirmBooking}
              disabled={
                submitting ||
                addresses.length === 0 ||
                !selectedAddress
              }
              style={{
                width: "100%",
                padding: "17px",
                marginTop: "25px",
                background:
                  submitting ||
                  addresses.length === 0 ||
                  !selectedAddress
                    ? "#999"
                    : "#171717",
                color: "white",
                border: "none",
                cursor:
                  submitting ||
                  addresses.length === 0 ||
                  !selectedAddress
                    ? "not-allowed"
                    : "pointer",
                letterSpacing: "1px",
              }}
            >
              {submitting
                ? "CREATING BOOKING..."
                : "CONFIRM BOOKING"}
            </button>

            <p
              style={{
                fontSize: "12px",
                color: "#777",
                textAlign: "center",
                marginTop: "15px",
              }}
            >
              Payment is not collected at this stage.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
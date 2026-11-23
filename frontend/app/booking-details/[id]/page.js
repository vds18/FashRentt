"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

export default function BookingDetails() {
  const params = useParams();
  const router = useRouter();

  const bookingId = params.id;

  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch booking details
  useEffect(() => {
    const fetchBookingDetails = async () => {
      try {
        const token = localStorage.getItem("token");

        if (!token) {
          router.push("/login");
          return;
        }

        const response = await fetch(
          `http://localhost:5000/api/bookings/${bookingId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(
            data.message || "Unable to fetch booking details."
          );
        }

        setBooking(data.booking);
      } catch (err) {
        setError(
          err.message || "Something went wrong."
        );
      } finally {
        setLoading(false);
      }
    };

    if (bookingId) {
      fetchBookingDetails();
    }
  }, [bookingId, router]);

  // Format date
  const formatDate = (date) => {
    if (!date) return "N/A";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  // Format status
  const formatStatus = (status) => {
    if (!status) return "Pending";

    return status
      .replaceAll("_", " ")
      .replace(/\b\w/g, (char) => char.toUpperCase());
  };

  // Status colors
  const getStatusColor = (status) => {
    const colors = {
      pending: "#b45309",
      confirmed: "#15803d",
      preparing: "#7c3aed",
      dispatched: "#2563eb",
      delivered: "#15803d",
      returned: "#0369a1",
      completed: "#15803d",
      cancelled: "#dc2626",
      disputed: "#b91c1c",
    };

    return colors[status] || "#64748b";
  };

  // Loading screen
  if (loading) {
    return (
      <main className="details-page">
        <div className="message-box">
          <div className="loader"></div>
          <p>Loading your booking details...</p>
        </div>

        <style jsx>{`
          .details-page {
            min-height: 100vh;
            background: #faf8f5;
            display: flex;
            justify-content: center;
            align-items: center;
            padding: 30px;
            color: #25211e;
          }

          .message-box {
            text-align: center;
          }

          .loader {
            width: 38px;
            height: 38px;
            border: 3px solid #e5ddd4;
            border-top-color: #9a7757;
            border-radius: 50%;
            animation: spin 0.8s linear infinite;
            margin: 0 auto 20px;
          }

          @keyframes spin {
            to {
              transform: rotate(360deg);
            }
          }
        `}</style>
      </main>
    );
  }

  // Error screen
  if (error || !booking) {
    return (
      <main className="details-page">
        <div className="error-box">
          <div className="error-icon">!</div>

          <h1>Booking Not Found</h1>

          <p>
            {error || "We couldn't find this booking."}
          </p>

          <Link
            href="/my-bookings"
            className="back-btn"
          >
            Back to My Bookings
          </Link>
        </div>

        <style jsx>{`
          .details-page {
            min-height: 100vh;
            background: #faf8f5;
            display: flex;
            justify-content: center;
            align-items: center;
            padding: 25px;
            color: #25211e;
          }

          .error-box {
            max-width: 500px;
            width: 100%;
            background: white;
            padding: 45px 25px;
            text-align: center;
            border-radius: 12px;
            border: 1px solid #eee8e1;
          }

          .error-icon {
            width: 45px;
            height: 45px;
            border-radius: 50%;
            background: #fee2e2;
            color: #dc2626;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto 20px;
            font-size: 25px;
            font-weight: bold;
          }

          h1 {
            font-family: Georgia, serif;
            font-size: 28px;
          }

          p {
            color: #777;
            margin: 15px 0 25px;
          }

          .back-btn {
            display: inline-block;
            background: #25211e;
            color: white;
            padding: 13px 22px;
            text-decoration: none;
            border-radius: 6px;
          }
        `}</style>
      </main>
    );
  }

  // Booking data
  const outfit = booking.outfit || {};
  const vendor = booking.vendor || {};

  const outfitName =
    outfit.title || outfit.name || "Fashion Outfit";

  const outfitImage = Array.isArray(outfit.images)
    ? outfit.images[0]
    : outfit.images;

  const deliveryAddress = booking.deliveryAddress;

  // Handle address stored as text or object
  const addressText =
    typeof deliveryAddress === "string"
      ? deliveryAddress
      : deliveryAddress
      ? [
          deliveryAddress.fullName,
          deliveryAddress.name,
          deliveryAddress.phone,
          deliveryAddress.mobile,
          deliveryAddress.addressLine1,
          deliveryAddress.addressLine2,
          deliveryAddress.address,
          deliveryAddress.landmark,
          deliveryAddress.city,
          deliveryAddress.state,
          deliveryAddress.pincode,
          deliveryAddress.postalCode,
        ]
          .filter(Boolean)
          .filter(
            (value, index, array) =>
              array.indexOf(value) === index
          )
          .join(", ")
      : "";

  return (
    <main className="details-page">
      <div className="details-container">

        {/* Top Navigation */}
        <div className="details-topbar">
          <Link
            href="/my-bookings"
            className="back-link"
          >
            ← Back to My Bookings
          </Link>

          <span className="brand-name">
            FASHRENTT
          </span>
        </div>

        {/* Page Header */}
        <div className="details-header">
          <div>
            <p className="eyebrow">
              YOUR RENTAL JOURNEY
            </p>

            <h1>Booking Details</h1>

            <p className="subtitle">
              Everything about your FashRentt order.
            </p>
          </div>

          <span
            className="status-badge"
            style={{
              color: getStatusColor(
                booking.bookingStatus
              ),
              backgroundColor:
                `${getStatusColor(
                  booking.bookingStatus
                )}15`,
            }}
          >
            {formatStatus(booking.bookingStatus)}
          </span>
        </div>

        {/* Booking ID */}
        <section className="booking-reference">
          <div>
            <span className="section-label">
              BOOKING ID
            </span>

            <h2>
              {booking.bookingId || booking._id}
            </h2>
          </div>

          <div className="booked-date">
            <span className="section-label">
              BOOKED ON
            </span>

            <p>{formatDate(booking.createdAt)}</p>
          </div>
        </section>

        {/* Main Layout */}
        <div className="details-grid">

          {/* Left Column */}
          <div className="details-main">

            {/* Outfit Details */}
            <section className="details-card">
              <h2 className="card-heading">
                Outfit Details
              </h2>

              <div className="outfit-section">
                <div className="outfit-image">
                  {outfitImage ? (
                    <img
                      src={
                        typeof outfitImage === "string"
                          ? outfitImage
                          : outfitImage.url || ""
                      }
                      alt={outfitName}
                    />
                  ) : (
                    <div className="image-placeholder">
                      ♡
                    </div>
                  )}
                </div>

                <div className="outfit-info">
                  <h3>{outfitName}</h3>

                  <p>
                    Size:{" "}
                    <strong>
                      {booking.size || "N/A"}
                    </strong>
                  </p>
                  <p>
  Color:{" "}
  <strong>
    {booking.color || "N/A"}
  </strong>
</p>

                  <p>
                    Rental Duration:{" "}
                    <strong>
                      {outfit.rentalDuration
                        ? `${outfit.rentalDuration} days`
                        : "As booked"}
                    </strong>
                  </p>

                  {vendor.businessName && (
                    <p>
                      Rental Partner:{" "}
                      <strong>
                        {vendor.businessName}
                      </strong>
                    </p>
                  )}
                </div>
              </div>
            </section>

            {/* Rental Schedule */}
            <section className="details-card">
              <h2 className="card-heading">
                Rental Schedule
              </h2>

              <div className="schedule-grid">
                <div className="schedule-item">
                  <span className="schedule-icon">
                    ↗
                  </span>

                  <div>
                    <span className="section-label">
                      RENTAL START DATE
                    </span>

                    <p>
                      {formatDate(
                        booking.rentalStartDate
                      )}
                    </p>
                  </div>
                </div>

                <div className="schedule-item">
                  <span className="schedule-icon">
                    ↙
                  </span>

                  <div>
                    <span className="section-label">
                      RENTAL END DATE
                    </span>

                    <p>
                      {formatDate(
                        booking.rentalEndDate
                      )}
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Delivery Address */}
            <section className="details-card">
              <h2 className="card-heading">
                Delivery Address
              </h2>

              {addressText ? (
                <div className="address-box">
                  <span className="address-icon">
                    ♧
                  </span>

                  <div>
                    <h3>Shipping Address</h3>
                    <p>{addressText}</p>
                  </div>
                </div>
              ) : (
                <p className="muted-text">
                  No delivery address available.
                </p>
              )}

              {booking.trackingId && (
                <div className="tracking-box">
                  <span className="section-label">
                    TRACKING ID
                  </span>

                  <p>{booking.trackingId}</p>
                </div>
              )}
            </section>

            {/* Payment Details */}
            <section className="details-card">
              <h2 className="card-heading">
                Payment & Refund Details
              </h2>

              <div className="payment-row">
                <span>Payment Status</span>

                <strong
                  style={{
                    color: getStatusColor(
                      booking.paymentStatus
                    ),
                  }}
                >
                  {formatStatus(
                    booking.paymentStatus
                  )}
                </strong>
              </div>

              <div className="payment-row">
                <span>Security Deposit Status</span>

                <strong>
                  {formatStatus(
                    booking.depositRefundStatus ||
                      "pending"
                  )}
                </strong>
              </div>

              {booking.cancelledAt && (
                <div className="payment-row">
                  <span>Cancelled On</span>

                  <strong>
                    {formatDate(booking.cancelledAt)}
                  </strong>
                </div>
              )}
            </section>
          </div>

          {/* Right Sidebar */}
          <aside className="details-sidebar">

            {/* Price Summary */}
            <section className="price-card">
              <h2>Price Summary</h2>

              <div className="price-row">
                <span>Rental Price</span>

                <span>
                  ₹{booking.rentalPrice || 0}
                </span>
              </div>

              <div className="price-row">
                <span>Security Deposit</span>

                <span>
                  ₹{booking.securityDeposit || 0}
                </span>
              </div>

              <div className="price-row">
                <span>Delivery Fee</span>

                <span>
                  ₹{booking.deliveryFee || 0}
                </span>
              </div>

              <div className="price-divider"></div>

              <div className="total-row">
                <span>Total Amount</span>

                <strong>
                  ₹{booking.totalAmount || 0}
                </strong>
              </div>

              <p className="price-note">
                Your security deposit is refundable
                according to FashRentt's rental and
                return policy.
              </p>
            </section>

            {/* Support Card */}
            <section className="support-card">
              <span className="support-icon">
                ♡
              </span>

              <h3>Need Help?</h3>

              <p>
                Have questions about your booking,
                delivery, or security deposit?
                Our support team is here to help.
              </p>

              <a
                href="mailto:fashrentt@gmail.com"
                className="support-btn"
              >
                Contact Us
              </a>
            </section>
          </aside>
        </div>

        {/* Bottom Action */}
        <div className="bottom-action">
          <Link
            href="/my-bookings"
            className="back-btn"
          >
            Back to My Bookings
          </Link>
        </div>
      </div>

      {/* Page Styling */}
      <style jsx>{`
        .details-page {
          min-height: 100vh;
          background: #faf8f5;
          padding: 50px 25px;
          color: #25211e;
        }

        .details-container {
          max-width: 1150px;
          margin: 0 auto;
        }

        .details-topbar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 45px;
        }

        .back-link {
          color: #777;
          text-decoration: none;
          font-size: 14px;
        }

        .back-link:hover {
          color: #9a7757;
        }

        .brand-name {
          font-size: 14px;
          font-weight: 700;
          letter-spacing: 4px;
          color: #9a7757;
        }

        .details-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 20px;
          margin-bottom: 30px;
        }

        .eyebrow {
          font-size: 11px;
          letter-spacing: 3px;
          font-weight: 700;
          color: #9a7757;
          margin-bottom: 12px;
        }

        .details-header h1 {
          font-family: Georgia, serif;
          font-size: 40px;
          font-weight: 500;
          margin: 0;
        }

        .subtitle {
          color: #888;
          font-size: 14px;
          margin-top: 12px;
        }

        .status-badge {
          padding: 10px 18px;
          border-radius: 30px;
          font-size: 12px;
          font-weight: 700;
          white-space: nowrap;
        }

        .booking-reference {
          background: white;
          border: 1px solid #eee8e1;
          border-radius: 12px;
          padding: 25px 30px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 20px;
          margin-bottom: 25px;
        }

        .section-label {
          display: block;
          color: #999;
          font-size: 10px;
          letter-spacing: 1.5px;
          font-weight: 700;
          margin-bottom: 9px;
        }

        .booking-reference h2 {
          font-size: 17px;
          margin: 0;
          overflow-wrap: anywhere;
        }

        .booked-date p {
          margin: 0;
          font-size: 14px;
          color: #777;
        }

        .details-grid {
          display: grid;
          grid-template-columns: minmax(0, 1fr) 320px;
          gap: 25px;
          align-items: start;
        }

        .details-main {
          display: flex;
          flex-direction: column;
          gap: 22px;
          min-width: 0;
        }

        .details-card {
          background: white;
          border: 1px solid #eee8e1;
          border-radius: 12px;
          padding: 28px;
        }

        .card-heading {
          font-family: Georgia, serif;
          font-size: 23px;
          font-weight: 500;
          margin: 0 0 25px;
        }

        .outfit-section {
          display: flex;
          align-items: center;
          gap: 25px;
        }

        .outfit-image {
          width: 140px;
          height: 175px;
          flex-shrink: 0;
          background: #f5f0ea;
          border-radius: 8px;
          overflow: hidden;
        }

        .outfit-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .image-placeholder {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 40px;
          color: #9a7757;
        }

        .outfit-info h3 {
          font-family: Georgia, serif;
          font-size: 22px;
          font-weight: 500;
          margin: 0 0 18px;
        }

        .outfit-info p {
          font-size: 13px;
          color: #777;
          margin: 12px 0;
        }

        .outfit-info strong {
          color: #25211e;
        }

        .schedule-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
        }

        .schedule-item {
          display: flex;
          align-items: center;
          gap: 15px;
          background: #faf8f5;
          border-radius: 8px;
          padding: 20px 15px;
          min-width: 0;
        }

        .schedule-icon {
          width: 38px;
          height: 38px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: white;
          border-radius: 50%;
          color: #9a7757;
          font-size: 20px;
          flex-shrink: 0;
        }

        .schedule-item p {
          font-size: 14px;
          font-weight: 600;
          margin: 0;
        }

        .address-box {
          display: flex;
          align-items: flex-start;
          gap: 18px;
          background: #faf8f5;
          padding: 22px;
          border-radius: 8px;
        }

        .address-icon {
          font-size: 26px;
          color: #9a7757;
        }

        .address-box h3 {
          font-size: 15px;
          margin: 0 0 10px;
        }

        .address-box p {
          color: #777;
          font-size: 14px;
          line-height: 1.8;
          margin: 0;
          overflow-wrap: anywhere;
        }

        .muted-text {
          color: #888;
          font-size: 14px;
        }

        .tracking-box {
          margin-top: 20px;
          padding: 20px;
          border: 1px solid #eee8e1;
          border-radius: 8px;
        }

        .tracking-box p {
          font-size: 14px;
          font-weight: 600;
          margin: 0;
          overflow-wrap: anywhere;
        }

        .payment-row {
          display: flex;
          justify-content: space-between;
          gap: 15px;
          padding: 17px 0;
          border-bottom: 1px solid #eee;
          font-size: 13px;
        }

        .payment-row:last-child {
          border-bottom: none;
          padding-bottom: 0;
        }

        .payment-row span {
          color: #777;
        }

        .payment-row strong {
          font-size: 12px;
          text-align: right;
        }

        .details-sidebar {
          display: flex;
          flex-direction: column;
          gap: 22px;
        }

        .price-card {
          background: white;
          border: 1px solid #eee8e1;
          border-radius: 12px;
          padding: 28px;
        }

        .price-card h2 {
          font-family: Georgia, serif;
          font-size: 24px;
          font-weight: 500;
          margin: 0 0 25px;
        }

        .price-row {
          display: flex;
          justify-content: space-between;
          gap: 15px;
          margin: 20px 0;
          font-size: 13px;
          color: #777;
        }

        .price-row span:last-child {
          color: #25211e;
          font-weight: 600;
        }

        .price-divider {
          height: 1px;
          background: #eee;
          margin: 25px 0;
        }

        .total-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 15px;
          font-size: 14px;
        }

        .total-row strong {
          font-size: 23px;
          font-family: Georgia, serif;
        }

        .price-note {
          font-size: 12px;
          line-height: 1.8;
          color: #999;
          margin-top: 22px;
        }

        .support-card {
          background: #f1e9df;
          border-radius: 12px;
          padding: 28px;
        }

        .support-icon {
          color: #9a7757;
          font-size: 28px;
        }

        .support-card h3 {
          font-family: Georgia, serif;
          font-size: 23px;
          font-weight: 500;
          margin: 15px 0 10px;
        }

        .support-card p {
          color: #777;
          font-size: 13px;
          line-height: 1.8;
          margin-bottom: 22px;
        }

        .support-btn {
          display: block;
          text-align: center;
          background: #25211e;
          color: white;
          text-decoration: none;
          padding: 13px;
          border-radius: 6px;
          font-size: 13px;
        }

        .support-btn:hover {
          background: #9a7757;
        }

        .bottom-action {
          margin-top: 30px;
        }

        .back-btn {
          display: inline-block;
          background: #25211e;
          color: white;
          text-decoration: none;
          padding: 14px 24px;
          border-radius: 6px;
          font-size: 13px;
        }

        .back-btn:hover {
          background: #9a7757;
        }

        @media (max-width: 900px) {
          .details-grid {
            grid-template-columns: 1fr;
          }

          .details-sidebar {
            display: grid;
            grid-template-columns: 1fr 1fr;
          }
        }

        @media (max-width: 600px) {
          .details-page {
            padding: 25px 15px 45px;
          }

          .details-topbar {
            margin-bottom: 35px;
          }

          .brand-name {
            font-size: 11px;
            letter-spacing: 2px;
          }

          .details-header {
            align-items: flex-start;
            flex-direction: column;
          }

          .details-header h1 {
            font-size: 32px;
          }

          .booking-reference {
            align-items: flex-start;
            flex-direction: column;
            padding: 22px;
          }

          .details-card {
            padding: 22px;
          }

          .outfit-section {
            align-items: flex-start;
            flex-direction: column;
          }

          .outfit-image {
            width: 100%;
            height: 280px;
          }

          .schedule-grid {
            grid-template-columns: 1fr;
          }

          .details-sidebar {
            display: flex;
          }

          .price-card,
          .support-card {
            padding: 23px;
          }

          .bottom-action .back-btn {
            display: block;
            text-align: center;
          }
        }
      `}</style>
    </main>
  );
}

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cancellingId, setCancellingId] = useState("");
  const [cancelMessage, setCancelMessage] = useState("");

  // Fetch customer bookings
  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const token = localStorage.getItem("token");

        if (!token) {
          setError("Please log in to view your bookings.");
          setLoading(false);
          return;
        }

        const response = await fetch(
          "http://localhost:5000/api/bookings/my-bookings",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(
            data.message || "Unable to fetch bookings."
          );
        }

        setBookings(data.bookings || []);
      } catch (err) {
        setError(err.message || "Something went wrong.");
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, []);

  // Format dates
  const formatDate = (date) => {
    if (!date) return "N/A";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  // Status colors
  const getStatusColor = (status) => {
    const colors = {
      pending: "#b45309",
      confirmed: "#15803d",
      preparing: "#7c3aed",
      dispatched: "#2563eb",
      delivered: "#15803d",
      return_requested: "#c2410c",
      returned: "#0369a1",
      completed: "#15803d",
      cancelled: "#dc2626",
      disputed: "#b91c1c",
      paid: "#15803d",
      refunded: "#0369a1",
    };

    return colors[status] || "#64748b";
  };

  // Cancel booking
  const handleCancelBooking = async (booking) => {
    const confirmed = window.confirm(
      `Are you sure you want to cancel booking ${
        booking.bookingId || booking._id
      }?`
    );

    if (!confirmed) return;

    try {
      setCancellingId(booking._id);
      setCancelMessage("");

      const token = localStorage.getItem("token");

      const response = await fetch(
        `http://localhost:5000/api/bookings/${booking._id}/cancel`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            cancellationReason: "Cancelled by customer",
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Unable to cancel booking."
        );
      }

      setBookings((previousBookings) =>
        previousBookings.map((item) =>
          item._id === booking._id
            ? {
                ...item,
                bookingStatus: "cancelled",
              }
            : item
        )
      );

      setCancelMessage("Booking cancelled successfully.");
    } catch (err) {
      setCancelMessage(
        err.message || "Unable to cancel booking."
      );
    } finally {
      setCancellingId("");
    }
  };

  return (
    <main className="my-bookings-page">
      <div className="my-bookings-container">

        {/* PAGE HEADER */}
        <div className="my-bookings-header">
          <div className="header-content">
            <p className="my-bookings-label">
              YOUR FASHRENTT EXPERIENCE
            </p>

            <h1>
              My <span>Bookings.</span>
            </h1>

            <p className="my-bookings-subtitle">
              Your rental orders, all in one place.
            </p>
          </div>

          <Link href="/" className="book-more-btn">
            Explore Outfits <span>↗</span>
          </Link>
        </div>

        {/* SUCCESS OR ERROR MESSAGE */}
        {cancelMessage && (
          <div
            className={`cancel-message ${
              cancelMessage.toLowerCase().includes("success")
                ? "success"
                : "error"
            }`}
            role="status"
          >
            <span>
              {cancelMessage.toLowerCase().includes("success")
                ? "✓"
                : "!"}
            </span>
            {cancelMessage}
          </div>
        )}

        {/* LOADING */}
        {loading ? (
          <div className="bookings-message">
            <div className="loading-spinner" />
            <p>Loading your bookings...</p>
          </div>
        ) : error ? (
          /* ERROR */
          <div className="bookings-message error-message">
            <div className="message-icon">!</div>
            <h2>Something went wrong</h2>
            <p>{error}</p>

            <Link href="/login" className="book-more-btn">
              Go to Login <span>↗</span>
            </Link>
          </div>
        ) : bookings.length === 0 ? (
          /* EMPTY STATE */
          <div className="empty-bookings">
            <div className="empty-bookings-icon">♡</div>

            <p className="empty-label">YOUR WARDROBE AWAITS</p>

            <h2>No bookings yet</h2>

            <p className="empty-description">
              Your next favorite outfit is waiting for you.
              Discover something beautiful for your next occasion.
            </p>

            <Link href="/" className="book-more-btn">
              Explore Outfits <span>↗</span>
            </Link>
          </div>
        ) : (
          /* BOOKINGS LIST */
          <>
            <div className="bookings-list-header">
              <div>
                <h2>Your Orders</h2>
                <p>Manage your fashion rentals</p>
              </div>

              <span className="bookings-count">
                {bookings.length}{" "}
                {bookings.length === 1 ? "BOOKING" : "BOOKINGS"}
              </span>
            </div>

            <div className="bookings-list">
              {bookings.map((booking) => {
                const outfit = booking.outfit;

                const status = booking.bookingStatus || "pending";

                const outfitTitle = outfit
                  ? outfit.title ||
                    outfit.name ||
                    "Fashion Outfit"
                  : "Outfit details unavailable";

                return (
                  <article
                    className="booking-card"
                    key={booking._id}
                  >
                    {/* BOOKING TOP */}
                    <div className="booking-card-top">
                      <div className="booking-reference">
                        <span className="booking-id-label">
                          BOOKING REFERENCE
                        </span>

                        <p className="booking-id">
                          {booking.bookingId || booking._id}
                        </p>
                      </div>

                      <span
                        className="booking-status"
                        style={{
                          color: getStatusColor(status),
                          backgroundColor:
                            `${getStatusColor(status)}15`,
                        }}
                      >
                        <span className="status-dot" />
                        {status
                          .replaceAll("_", " ")
                          .toUpperCase()}
                      </span>
                    </div>

                    {/* BOOKING DETAILS */}
                    <div className="booking-card-content">
                      <div className="booking-outfit-info">
                        <span className="section-eyebrow">
                          YOUR RENTAL
                        </span>

                        <h2>{outfitTitle}</h2>

                        <div className="booking-detail-row">
                          <span className="detail-icon">◇</span>

                          <div>
                            <span className="detail-label">
                              Selected Size
                            </span>
                            <p>{booking.size || "N/A"}</p>
                          </div>
                        </div>
                        <div className="booking-detail-row">
  <span className="detail-icon">●</span>

  <div>
    <span className="detail-label">
      Selected Color
    </span>
    <p>{booking.color || "N/A"}</p>
  </div>
</div>

                        <div className="booking-detail-row">
                          <span className="detail-icon">▦</span>

                          <div>
                            <span className="detail-label">
                              Rental Period
                            </span>
                            <p>
                              {formatDate(
                                booking.rentalStartDate
                              )}
                              <span className="date-separator">
                                {" "}
                                –{" "}
                              </span>
                              {formatDate(
                                booking.rentalEndDate
                              )}
                            </p>
                          </div>
                        </div>

                        {booking.trackingId && (
                          <div className="booking-detail-row">
                            <span className="detail-icon">↗</span>

                            <div>
                              <span className="detail-label">
                                Tracking ID
                              </span>
                              <p className="tracking-number">
                                {booking.trackingId}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* PRICE SUMMARY */}
                      <div className="booking-price-info">
                        <div className="price-summary-heading">
                          <span>PAYMENT SUMMARY</span>
                        </div>

                        <div className="price-row">
                          <span>Rental Price</span>
                          <strong>
                            ₹{booking.rentalPrice ?? 0}
                          </strong>
                        </div>

                        <div className="price-row">
                          <span>Security Deposit</span>
                          <strong>
                            ₹{booking.securityDeposit ?? 0}
                          </strong>
                        </div>

                        <div className="price-row payment-row">
                          <span>Payment Status</span>

                          <strong
                            style={{
                              color: getStatusColor(
                                booking.paymentStatus
                              ),
                            }}
                          >
                            {(
                              booking.paymentStatus || "pending"
                            )
                              .replaceAll("_", " ")
                              .toUpperCase()}
                          </strong>
                        </div>

                        <div className="price-total">
                          <span>Total Amount</span>
                          <strong>
                            ₹{booking.totalAmount ?? 0}
                          </strong>
                        </div>
                      </div>
                    </div>

                    {/* BOOKING FOOTER */}
                    <div className="booking-card-footer">
                      <div className="footer-info">
                        <span className="footer-label">
                          BOOKED ON
                        </span>
                        <p>{formatDate(booking.createdAt)}</p>
                      </div>

                      <div className="footer-info">
                        <span className="footer-label">
                          DEPOSIT REFUND
                        </span>
                        <p>
                          {(
                            booking.depositRefundStatus ||
                            "pending"
                          )
                            .replaceAll("_", " ")
                            .toUpperCase()}
                        </p>
                      </div>
                    </div>

                    {/* ACTION BUTTONS */}
                    <div className="booking-details-action">
                      <Link
                        href={`/booking-details/${booking._id}`}
                        className="view-booking-btn"
                      >
                        View Booking Details
                        <span>↗</span>
                      </Link>

                      {["pending", "confirmed"].includes(
                        booking.bookingStatus
                      ) && (
                        <button
                          type="button"
                          className="cancel-booking-btn"
                          onClick={() =>
                            handleCancelBooking(booking)
                          }
                          disabled={
                            cancellingId === booking._id
                          }
                        >
                          {cancellingId === booking._id
                            ? "Cancelling..."
                            : "Cancel Booking"}
                        </button>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* RESPONSIVE STYLING */}
      <style jsx>{`
        .my-bookings-page {
          width: 100%;
          max-width: 100%;
          min-height: 100vh;
          margin: 0;
          padding: 60px 24px 90px;
          background: #faf8f5;
          color: #25211e;
          overflow-x: clip;
          box-sizing: border-box;
        }

        .my-bookings-page *,
        .my-bookings-page *::before,
        .my-bookings-page *::after {
          box-sizing: border-box;
        }

        .my-bookings-container {
          width: 100%;
          max-width: 1000px;
          min-width: 0;
          margin: 0 auto;
        }

        /* HEADER */

        .my-bookings-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 24px;
          margin-bottom: 45px;
          min-width: 0;
        }

        .header-content {
          min-width: 0;
        }

        .my-bookings-label {
          font-size: 11px;
          letter-spacing: 3px;
          font-weight: 700;
          color: #9a7757;
          margin: 0 0 14px;
        }

        .my-bookings-header h1 {
          font-size: clamp(32px, 4vw, 48px);
          line-height: 1.15;
          margin: 0;
          font-family: Georgia, "Times New Roman", serif;
          font-weight: 500;
          overflow-wrap: anywhere;
        }

        .my-bookings-header h1 span {
          color: #a98752;
          font-style: italic;
        }

        .my-bookings-subtitle {
          color: #817970;
          margin: 13px 0 0;
          font-size: 14px;
          line-height: 1.6;
        }

        .book-more-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 16px;
          flex-shrink: 0;
          background: #25211e;
          color: white;
          text-decoration: none;
          padding: 15px 22px;
          border-radius: 4px;
          font-size: 13px;
          font-weight: 600;
          transition: all 0.25s ease;
        }

        .book-more-btn span {
          color: #d7b56d;
          font-size: 18px;
        }

        .book-more-btn:hover {
          background: #9a7757;
          transform: translateY(-2px);
        }

        /* LIST HEADER */

        .bookings-list-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 15px;
          margin-bottom: 20px;
        }

        .bookings-list-header h2 {
          margin: 0;
          font-family: Georgia, serif;
          font-size: 24px;
          font-weight: 500;
        }

        .bookings-list-header p {
          margin: 7px 0 0;
          color: #8a8178;
          font-size: 13px;
        }

        .bookings-count {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          padding: 9px 13px;
          background: #f0e9df;
          color: #8c704c;
          border-radius: 30px;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 1px;
        }

        /* BOOKING LIST */

        .bookings-list {
          display: flex;
          flex-direction: column;
          gap: 22px;
          width: 100%;
          min-width: 0;
        }

        .booking-card {
          width: 100%;
          max-width: 100%;
          min-width: 0;
          padding: 26px;
          background: #fff;
          border: 1px solid #eee8e1;
          border-radius: 12px;
          box-shadow: 0 5px 24px rgba(37, 33, 30, 0.035);
          overflow: hidden;
          transition:
            box-shadow 0.25s ease,
            transform 0.25s ease;
        }

        .booking-card:hover {
          box-shadow: 0 10px 35px rgba(37, 33, 30, 0.07);
        }

        /* BOOKING TOP */

        .booking-card-top {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 16px;
          padding-bottom: 20px;
          border-bottom: 1px solid #eeeae5;
          min-width: 0;
        }

        .booking-reference {
          min-width: 0;
        }

        .booking-id-label {
          color: #a29a91;
          font-size: 10px;
          letter-spacing: 1.5px;
          font-weight: 700;
        }

        .booking-id {
          font-size: 13px;
          font-weight: 700;
          color: #37312b;
          margin: 8px 0 0;
          overflow-wrap: anywhere;
          word-break: break-word;
        }

        .booking-status {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 7px;
          padding: 9px 13px;
          border-radius: 30px;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.5px;
          text-align: center;
          white-space: normal;
          overflow-wrap: anywhere;
          flex-shrink: 0;
        }

        .status-dot {
          width: 6px;
          height: 6px;
          background: currentColor;
          border-radius: 50%;
          flex-shrink: 0;
        }

        /* BOOKING CONTENT */

        .booking-card-content {
          display: grid;
          grid-template-columns: minmax(0, 1fr) minmax(220px, 0.8fr);
          gap: 30px;
          padding: 27px 0;
          min-width: 0;
        }

        .booking-outfit-info {
          min-width: 0;
        }

        .section-eyebrow {
          color: #a58a64;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 2px;
        }

        .booking-outfit-info h2 {
          font-family: Georgia, "Times New Roman", serif;
          font-size: 25px;
          font-weight: 500;
          line-height: 1.3;
          margin: 12px 0 22px;
          color: #28231f;
          overflow-wrap: anywhere;
        }

        .booking-detail-row {
          display: flex;
          align-items: flex-start;
          gap: 13px;
          margin-top: 18px;
          min-width: 0;
        }

        .detail-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 30px;
          height: 30px;
          flex-shrink: 0;
          background: #f7f2eb;
          color: #a1855e;
          border-radius: 50%;
          font-size: 16px;
        }

        .booking-detail-row > div {
          min-width: 0;
        }

        .detail-label {
          display: block;
          color: #a19a92;
          font-size: 11px;
          margin-bottom: 6px;
        }

        .booking-detail-row p {
          margin: 0;
          color: #423c36;
          font-size: 13px;
          line-height: 1.6;
          overflow-wrap: anywhere;
          word-break: break-word;
        }

        .tracking-number {
          font-weight: 600;
        }

        /* PAYMENT SUMMARY */

        .booking-price-info {
          width: 100%;
          min-width: 0;
          padding: 22px;
          background: #faf8f5;
          border: 1px solid #f0e9e1;
          border-radius: 8px;
          align-self: start;
        }

        .price-summary-heading {
          padding-bottom: 17px;
          margin-bottom: 10px;
          border-bottom: 1px solid #eae3da;
        }

        .price-summary-heading span {
          font-size: 10px;
          letter-spacing: 1.5px;
          font-weight: 700;
          color: #8e7b62;
        }

        .price-row {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 12px;
          padding: 11px 0;
          font-size: 12px;
          color: #817970;
        }

        .price-row span {
          min-width: 0;
          overflow-wrap: anywhere;
        }

        .price-row strong {
          color: #39332e;
          font-size: 13px;
          text-align: right;
          overflow-wrap: anywhere;
        }

        .payment-row {
          border-top: 1px solid #eae3da;
          margin-top: 4px;
          padding-top: 15px;
        }

        .payment-row strong {
          font-size: 10px;
        }

        .price-total {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 12px;
          margin-top: 12px;
          padding-top: 17px;
          border-top: 1px solid #e1d6c9;
          color: #39332e;
          font-size: 13px;
          font-weight: 600;
        }

        .price-total strong {
          font-family: Georgia, serif;
          font-size: 23px;
          color: #92703f;
          overflow-wrap: anywhere;
        }

        /* FOOTER */

        .booking-card-footer {
          border-top: 1px solid #eeeae5;
          padding-top: 19px;
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          flex-wrap: wrap;
          gap: 16px;
        }

        .footer-info {
          min-width: 0;
        }

        .footer-label {
          display: block;
          color: #a19a92;
          font-size: 9px;
          letter-spacing: 1.3px;
          font-weight: 700;
          margin-bottom: 7px;
        }

        .footer-info p {
          color: #625a52;
          font-size: 12px;
          font-weight: 600;
          margin: 0;
          overflow-wrap: anywhere;
        }

        /* ACTION BUTTONS */

        .booking-details-action {
          display: flex;
          justify-content: flex-end;
          align-items: stretch;
          flex-wrap: wrap;
          gap: 12px;
          margin-top: 24px;
          min-width: 0;
        }

        .view-booking-btn,
        .cancel-booking-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          min-height: 46px;
          padding: 13px 20px;
          border-radius: 5px;
          font-family: inherit;
          font-size: 12px;
          font-weight: 600;
          text-align: center;
          cursor: pointer;
          transition: all 0.25s ease;
          overflow-wrap: anywhere;
        }

        .view-booking-btn {
          background: #25211e;
          color: #fff;
          text-decoration: none;
          border: 1px solid #25211e;
        }

        .view-booking-btn span {
          color: #d7b56d;
          font-size: 17px;
        }

        .view-booking-btn:hover {
          background: #9a7757;
          border-color: #9a7757;
        }

        .cancel-booking-btn {
          background: #fff;
          color: #dc2626;
          border: 1px solid #e7baba;
        }

        .cancel-booking-btn:hover {
          background: #dc2626;
          color: #fff;
          border-color: #dc2626;
        }

        .cancel-booking-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        /* CANCEL MESSAGE */

        .cancel-message {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 15px 18px;
          margin-bottom: 25px;
          border-radius: 7px;
          font-size: 13px;
          line-height: 1.5;
          overflow-wrap: anywhere;
        }

        .cancel-message span {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 25px;
          height: 25px;
          border-radius: 50%;
          flex-shrink: 0;
          font-weight: 700;
        }

        .cancel-message.success {
          background: #edf8f0;
          color: #166534;
          border: 1px solid #cce8d2;
        }

        .cancel-message.success span {
          background: #d2f0d9;
        }

        .cancel-message.error {
          background: #fff1f1;
          color: #b91c1c;
          border: 1px solid #f4cccc;
        }

        .cancel-message.error span {
          background: #ffe0e0;
        }

        /* LOADING / EMPTY / ERROR */

        .bookings-message,
        .empty-bookings {
          width: 100%;
          max-width: 100%;
          padding: 50px 25px;
          text-align: center;
          background: white;
          border-radius: 12px;
          border: 1px solid #eee8e1;
          overflow-wrap: anywhere;
        }

        .bookings-message p {
          color: #817970;
          font-size: 14px;
          line-height: 1.7;
        }

        .loading-spinner {
          width: 38px;
          height: 38px;
          margin: 0 auto 20px;
          border: 3px solid #eee5da;
          border-top-color: #a98752;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        .error-message h2,
        .empty-bookings h2 {
          font-family: Georgia, serif;
          font-size: 28px;
          font-weight: 500;
          overflow-wrap: anywhere;
        }

        .error-message {
          color: #b91c1c;
        }

        .message-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 45px;
          height: 45px;
          margin: 0 auto;
          border-radius: 50%;
          background: #fff0f0;
          color: #b91c1c;
          font-size: 22px;
        }

        .empty-bookings-icon {
          font-size: 55px;
          color: #a98752;
          line-height: 1.2;
        }

        .empty-label {
          color: #a98752;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 2px;
          margin-top: 20px;
        }

        .empty-bookings h2 {
          margin: 12px 0;
        }

        .empty-description {
          max-width: 400px;
          margin: 0 auto 25px;
          color: #817970;
          font-size: 14px;
          line-height: 1.8;
        }

        /* TABLET */

        @media (max-width: 900px) {
          .my-bookings-page {
            padding: 45px 20px 70px;
          }

          .booking-card {
            padding: 22px;
          }

          .booking-card-content {
            grid-template-columns: minmax(0, 1fr) minmax(190px, 0.8fr);
            gap: 20px;
          }

          .booking-price-info {
            padding: 17px;
          }

          .price-total strong {
            font-size: 21px;
          }
        }

        /* MOBILE */

        @media (max-width: 650px) {
          .my-bookings-page {
            width: 100%;
            max-width: 100%;
            min-width: 0;
            margin: 0;
            padding: 32px 14px 60px;
            overflow-x: clip;
          }

          .my-bookings-container {
            width: 100%;
            max-width: 100%;
            min-width: 0;
            margin: 0 auto;
          }

          .my-bookings-header {
            display: flex;
            flex-direction: column;
            align-items: flex-start;
            gap: 22px;
            margin-bottom: 32px;
          }

          .my-bookings-label {
            font-size: 9px;
            letter-spacing: 2px;
            line-height: 1.6;
          }

          .my-bookings-header h1 {
            font-size: clamp(29px, 8vw, 38px);
            line-height: 1.2;
          }

          .my-bookings-subtitle {
            font-size: 13px;
            line-height: 1.7;
            overflow-wrap: anywhere;
          }

          .book-more-btn {
            width: 100%;
            max-width: 100%;
            min-height: 48px;
            padding: 13px 16px;
          }

          .bookings-list-header {
            align-items: flex-start;
            gap: 10px;
            margin-bottom: 17px;
          }

          .bookings-list-header h2 {
            font-size: 22px;
          }

          .bookings-list-header p {
            font-size: 12px;
            line-height: 1.5;
          }

          .bookings-count {
            padding: 8px 10px;
            font-size: 9px;
            letter-spacing: 0.5px;
          }

          .bookings-list {
            width: 100%;
            gap: 17px;
          }

          .booking-card {
            width: 100%;
            max-width: 100%;
            min-width: 0;
            padding: 17px 15px;
            border-radius: 10px;
            overflow: hidden;
          }

          .booking-card-top {
            display: flex;
            flex-direction: column;
            align-items: flex-start;
            gap: 13px;
            padding-bottom: 17px;
          }

          .booking-reference {
            width: 100%;
            max-width: 100%;
          }

          .booking-id-label {
            font-size: 9px;
            letter-spacing: 1.2px;
          }

          .booking-id {
            font-size: 12px;
            line-height: 1.6;
            overflow-wrap: anywhere;
            word-break: break-word;
          }

          .booking-status {
            max-width: 100%;
            padding: 8px 12px;
            font-size: 9px;
            white-space: normal;
            overflow-wrap: anywhere;
          }

          .booking-card-content {
            display: flex;
            flex-direction: column;
            width: 100%;
            max-width: 100%;
            min-width: 0;
            gap: 22px;
            padding: 22px 0;
          }

          .booking-outfit-info {
            width: 100%;
            max-width: 100%;
            min-width: 0;
          }

          .section-eyebrow {
            font-size: 9px;
            letter-spacing: 1.5px;
          }

          .booking-outfit-info h2 {
            font-size: 23px;
            line-height: 1.3;
            margin: 11px 0 20px;
            overflow-wrap: anywhere;
            word-break: normal;
          }

          .booking-detail-row {
            gap: 10px;
            margin-top: 17px;
            min-width: 0;
          }

          .detail-icon {
            width: 28px;
            height: 28px;
            font-size: 14px;
          }

          .detail-label {
            font-size: 10px;
          }

          .booking-detail-row p {
            font-size: 12px;
            line-height: 1.7;
            overflow-wrap: anywhere;
            word-break: break-word;
          }

          .booking-price-info {
            width: 100%;
            max-width: 100%;
            min-width: 0;
            padding: 18px 14px;
            border-radius: 7px;
          }

          .price-summary-heading {
            padding-bottom: 14px;
          }

          .price-summary-heading span {
            font-size: 9px;
            letter-spacing: 1px;
          }

          .price-row {
            gap: 10px;
            padding: 11px 0;
            font-size: 11px;
          }

          .price-row strong {
            font-size: 12px;
            flex-shrink: 0;
          }

          .payment-row strong {
            font-size: 9px;
          }

          .price-total {
            gap: 10px;
            font-size: 12px;
          }

          .price-total strong {
            font-size: 21px;
          }

          .booking-card-footer {
            display: flex;
            flex-direction: column;
            align-items: flex-start;
            gap: 16px;
            padding-top: 17px;
          }

          .footer-info {
            width: 100%;
            min-width: 0;
          }

          .footer-label {
            font-size: 9px;
          }

          .footer-info p {
            font-size: 12px;
            overflow-wrap: anywhere;
          }

          .booking-details-action {
            display: flex;
            flex-direction: column;
            align-items: stretch;
            width: 100%;
            max-width: 100%;
            min-width: 0;
            gap: 10px;
            margin-top: 20px;
          }

          .view-booking-btn,
          .cancel-booking-btn {
            width: 100%;
            max-width: 100%;
            min-width: 0;
            min-height: 46px;
            padding: 13px 12px;
            font-size: 12px;
            text-align: center;
            overflow-wrap: anywhere;
          }

          .cancel-message {
            padding: 13px;
            font-size: 12px;
          }

          .bookings-message,
          .empty-bookings {
            padding: 35px 18px;
          }

          .empty-bookings h2,
          .error-message h2 {
            font-size: 25px;
          }

          .empty-description {
            font-size: 13px;
            line-height: 1.7;
          }
        }

        /* SMALL PHONES */

        @media (max-width: 380px) {
          .my-bookings-page {
            padding: 26px 10px 45px;
          }

          .my-bookings-header {
            gap: 18px;
          }

          .my-bookings-header h1 {
            font-size: 30px;
          }

          .booking-card {
            padding: 14px 12px;
          }

          .booking-outfit-info h2 {
            font-size: 21px;
          }

          .booking-price-info {
            padding: 15px 11px;
          }

          .price-row {
            font-size: 10px;
          }

          .price-row strong {
            font-size: 11px;
          }

          .price-total strong {
            font-size: 19px;
          }

          .bookings-count {
            font-size: 8px;
            padding: 7px 8px;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .my-bookings-page *,
          .my-bookings-page *::before,
          .my-bookings-page *::after {
            animation-duration: 0.01ms !important;
            transition-duration: 0.01ms !important;
          }
        }
      `}</style>
    </main>
  );
}
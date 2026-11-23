
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import "./addresses.css";

const API_URL = "http://localhost:5000/api/auth/addresses";

const emptyAddress = {
  fullName: "",
  phone: "",
  addressLine: "",
  city: "",
  state: "",
  pincode: "",
  isDefault: false,
};

export default function AddressesPage() {
  const router = useRouter();

  const [addresses, setAddresses] = useState([]);
  const [formData, setFormData] = useState(emptyAddress);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  // Fetch addresses from backend
  const fetchAddresses = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      router.replace("/login");
      return;
    }

    try {
      const response = await fetch(API_URL, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (response.status === 401 || response.status === 403) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.dispatchEvent(new Event("authChange"));
        router.replace("/login");
        return;
      }

      if (!response.ok) {
        setError(data.message || "Unable to load addresses.");
        return;
      }

      setAddresses(data.addresses || []);
    } catch {
      setError("Unable to connect to the server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, []);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value, checked, type } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // Open add address form
  const handleAdd = () => {
    setFormData({
      ...emptyAddress,
      fullName:
        JSON.parse(localStorage.getItem("user") || "{}").name || "",
      phone:
        JSON.parse(localStorage.getItem("user") || "{}").phone || "",
    });

    setEditingId(null);
    setShowForm(true);
    setError("");
    setSuccess("");
  };

  // Open edit address form
  const handleEdit = (address) => {
    setFormData({
      fullName: address.fullName || "",
      phone: address.phone || "",
      addressLine: address.addressLine || "",
      city: address.city || "",
      state: address.state || "",
      pincode: address.pincode || "",
      isDefault: Boolean(address.isDefault),
    });

    setEditingId(address._id);
    setShowForm(true);
    setError("");
    setSuccess("");
  };

  // Save address
  const handleSubmit = async (e) => {
    e.preventDefault();

    setSaving(true);
    setError("");
    setSuccess("");

    const token = localStorage.getItem("token");

    try {
      const url = editingId
        ? `${API_URL}/${editingId}`
        : API_URL;

      const response = await fetch(url, {
        method: editingId ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...formData,
          fullName: formData.fullName.trim(),
          phone: formData.phone.trim(),
          addressLine: formData.addressLine.trim(),
          city: formData.city.trim(),
          state: formData.state.trim(),
          pincode: formData.pincode.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Failed to save address.");
        return;
      }

      setAddresses(data.addresses || []);
      setShowForm(false);
      setEditingId(null);
      setFormData(emptyAddress);

      setSuccess(
        editingId
          ? "Your address has been updated successfully."
          : "Your new delivery address has been saved."
      );
    } catch {
      setError("Unable to connect to the server. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  // Delete address
  const handleDelete = async (addressId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this address?"
    );

    if (!confirmed) return;

    setDeletingId(addressId);
    setError("");
    setSuccess("");

    try {
      const token = localStorage.getItem("token");

      const response = await fetch(`${API_URL}/${addressId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Failed to delete address.");
        return;
      }

      setAddresses(data.addresses || []);
      setSuccess("Address deleted successfully.");
    } catch {
      setError("Unable to connect to the server.");
    } finally {
      setDeletingId(null);
    }
  };

  // Cancel form
  const handleCancel = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData(emptyAddress);
    setError("");
  };

  if (loading) {
    return (
      <main className="address-loading">
        <div className="address-loader"></div>
        <p>Preparing your address book...</p>
      </main>
    );
  }

  return (
    <main className="addresses-page">
      <div className="addresses-wrapper">

        {/* Breadcrumb */}
        <div className="addresses-breadcrumb">
          <Link href="/">Home</Link>
          <span>/</span>
          <Link href="/account">My Account</Link>
          <span>/</span>
          <span>Address Book</span>
        </div>

        {/* Heading */}
        <section className="addresses-heading">
          <div>
            <span className="addresses-eyebrow">
              THE FASHRENTT EXPERIENCE
            </span>

            <h1>
              Your addresses.
              <br />
              <span>Your convenience.</span>
            </h1>

            <p>
              Save your favourite delivery locations and make
              your next rental effortless.
            </p>
          </div>

          <div className="addresses-heading-mark">
            <span>F</span>
            <small>STYLE • RENT • REPEAT</small>
          </div>
        </section>

        {/* Notifications */}
        {success && (
          <div className="address-alert address-alert-success">
            ✓ {success}
          </div>
        )}

        {error && (
          <div className="address-alert address-alert-error">
            {error}
          </div>
        )}

        {/* Address Book Header */}
        <section className="address-book-card">
          <div className="address-book-header">
            <div>
              <span className="addresses-section-label">
                YOUR DELIVERY DETAILS
              </span>

              <h2>Address Book</h2>

              <p>
                {addresses.length}{" "}
                {addresses.length === 1 ? "address" : "addresses"} saved
              </p>
            </div>

            {!showForm && (
              <button
                type="button"
                className="address-primary-btn"
                onClick={handleAdd}
              >
                + Add New Address
              </button>
            )}
          </div>

          {/* Add/Edit Form */}
          {showForm && (
            <form
              className="address-form"
              onSubmit={handleSubmit}
            >
              <div className="address-form-heading">
                <div>
                  <h3>
                    {editingId
                      ? "Edit Delivery Address"
                      : "Add New Address"}
                  </h3>

                  <p>
                    Enter the details where you want your outfits delivered.
                  </p>
                </div>

                <button
                  type="button"
                  className="address-close-btn"
                  onClick={handleCancel}
                  aria-label="Close form"
                >
                  ×
                </button>
              </div>

              <div className="address-form-grid">

                <div className="address-field">
                  <label htmlFor="fullName">
                    FULL NAME *
                  </label>

                  <input
                    id="fullName"
                    name="fullName"
                    type="text"
                    value={formData.fullName}
                    onChange={handleChange}
                    placeholder="Enter full name"
                    required
                    maxLength={100}
                  />
                </div>

                <div className="address-field">
                  <label htmlFor="phone">
                    PHONE NUMBER *
                  </label>

                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="Enter phone number"
                    required
                    maxLength={15}
                  />
                </div>

                <div className="address-field address-field-full">
                  <label htmlFor="addressLine">
                    HOUSE NO. / STREET / AREA *
                  </label>

                  <textarea
                    id="addressLine"
                    name="addressLine"
                    value={formData.addressLine}
                    onChange={handleChange}
                    placeholder="House number, street, landmark, area"
                    required
                    rows={3}
                    maxLength={300}
                  />
                </div>

                <div className="address-field">
                  <label htmlFor="city">
                    CITY *
                  </label>

                  <input
                    id="city"
                    name="city"
                    type="text"
                    value={formData.city}
                    onChange={handleChange}
                    placeholder="Enter city"
                    required
                    maxLength={100}
                  />
                </div>

                <div className="address-field">
                  <label htmlFor="state">
                    STATE *
                  </label>

                  <input
                    id="state"
                    name="state"
                    type="text"
                    value={formData.state}
                    onChange={handleChange}
                    placeholder="Enter state"
                    required
                    maxLength={100}
                  />
                </div>

                <div className="address-field">
                  <label htmlFor="pincode">
                    PIN CODE *
                  </label>

                  <input
                    id="pincode"
                    name="pincode"
                    type="text"
                    inputMode="numeric"
                    value={formData.pincode}
                    onChange={handleChange}
                    placeholder="6-digit PIN code"
                    pattern="[0-9]{6}"
                    title="Please enter a valid 6-digit PIN code"
                    required
                    maxLength={6}
                  />
                </div>

              </div>

              <label className="address-default-checkbox">
                <input
                  type="checkbox"
                  name="isDefault"
                  checked={formData.isDefault}
                  onChange={handleChange}
                />

                <span>
                  Set as my default delivery address
                </span>
              </label>

              <div className="address-form-actions">
                <button
                  type="button"
                  className="address-secondary-btn"
                  onClick={handleCancel}
                  disabled={saving}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="address-primary-btn"
                  disabled={saving}
                >
                  {saving
                    ? "Saving..."
                    : editingId
                    ? "Save Changes"
                    : "Save Address"}

                  {!saving && <span>↗</span>}
                </button>
              </div>
            </form>
          )}

          {/* Empty State */}
          {addresses.length === 0 && !showForm && (
            <div className="address-empty-state">
              <div className="address-empty-icon">
                ♧
              </div>

              <h3>No addresses saved yet</h3>

              <p>
                Add your delivery address to make your next
                FashRentt rental smooth and effortless.
              </p>

              <button
                type="button"
                className="address-primary-btn"
                onClick={handleAdd}
              >
                Add Your First Address
              </button>
            </div>
          )}

          {/* Saved Addresses */}
          {addresses.length > 0 && (
            <div className="address-list">
              {addresses.map((address) => (
                <article
                  className="address-item"
                  key={address._id}
                >
                  <div className="address-item-top">
                    <div className="address-item-icon">
                      ♧
                    </div>

                    <div className="address-item-title">
                      <h3>{address.fullName}</h3>

                      {address.isDefault && (
                        <span className="address-default-badge">
                          DEFAULT ADDRESS
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="address-item-details">
                    <p>{address.addressLine}</p>

                    <p>
                      {address.city}, {address.state} -{" "}
                      {address.pincode}
                    </p>

                    <p className="address-item-phone">
                      Phone: {address.phone}
                    </p>
                  </div>

                  <div className="address-item-actions">
                    <button
                      type="button"
                      onClick={() => handleEdit(address)}
                    >
                      Edit
                    </button>

                    <span className="address-action-divider">
                      |
                    </span>

                    <button
                      type="button"
                      className="address-delete-btn"
                      onClick={() => handleDelete(address._id)}
                      disabled={deletingId === address._id}
                    >
                      {deletingId === address._id
                        ? "Deleting..."
                        : "Delete"}
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}

        </section>

        {/* Back to Account */}
        <div className="addresses-bottom-link">
          <Link href="/account">
            ← Back to My Account
          </Link>

          <p>
            FashRentt — Rent less. Wear more.
          </p>
        </div>

      </div>
    </main>
  );
}
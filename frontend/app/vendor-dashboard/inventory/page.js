"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function VendorInventory() {
  const router = useRouter();

  const [outfits, setOutfits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [actionLoading, setActionLoading] = useState("");
  const [editingOutfit, setEditingOutfit] = useState(null);

  const [editForm, setEditForm] = useState({
    name: "",
    description: "",
    category: "",
    occasion: "",
    color: [],
    imageUrl: "",
    sizes: [],
    rentalPrice: "",
    securityDeposit: "",
    rentalDuration: 3,
  });

  const fetchInventory = async () => {
    const token = localStorage.getItem("vendorToken");

    if (!token) {
      router.replace("/vendor-login");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        "http://localhost:5000/api/outfits/vendor",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to load inventory");
      }

      setOutfits(data.outfits || []);
      setError("");
    } catch (err) {
      setError(err.message || "Unable to load inventory");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  // Toggle outfit availability.
  const handleAvailability = async (outfit) => {
    const token = localStorage.getItem("vendorToken");

    if (!token) {
      router.replace("/vendor-login");
      return;
    }

    setActionLoading(outfit._id);
    setError("");
    setMessage("");

    try {
      const response = await fetch(
        `http://localhost:5000/api/outfits/vendor/${outfit._id}/availability`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Unable to update availability"
        );
      }

      setMessage("Availability updated successfully.");
      await fetchInventory();
    } catch (err) {
      setError(err.message || "Unable to update availability");
    } finally {
      setActionLoading("");
    }
  };

  // Delete an outfit.
  const handleDelete = async (outfit) => {
    if (
      !window.confirm(
        `Delete "${outfit.name}" permanently?`
      )
    ) {
      return;
    }

    const token = localStorage.getItem("vendorToken");

    if (!token) {
      router.replace("/vendor-login");
      return;
    }

    setActionLoading(outfit._id);
    setError("");
    setMessage("");

    try {
      const response = await fetch(
        `http://localhost:5000/api/outfits/vendor/${outfit._id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Unable to delete outfit"
        );
      }

      setMessage("Outfit deleted successfully.");
      await fetchInventory();
    } catch (err) {
      setError(err.message || "Unable to delete outfit");
    } finally {
      setActionLoading("");
    }
  };

  // Open the edit popup and load existing colors and sizes.
  const handleEdit = (outfit) => {
    const existingColors = Array.isArray(outfit.color)
      ? outfit.color
      : outfit.color
        ? String(outfit.color)
            .split(",")
            .map((item) => item.trim())
            .filter(Boolean)
        : [];

    const existingSizes = Array.isArray(outfit.sizes)
      ? outfit.sizes.map((item) => ({
          size: item.size,
          quantity: Number(item.quantity) || 1,
        }))
      : [];

    setEditingOutfit(outfit);

    setEditForm({
      name: outfit.name || "",
      description: outfit.description || "",
      category: outfit.category || "",
      occasion: Array.isArray(outfit.occasion)
        ? outfit.occasion.join(", ")
        : outfit.occasion || "",
      color: existingColors,
      imageUrl: outfit.images?.[0] || "",
      sizes: existingSizes,
      rentalPrice: outfit.rentalPrice ?? "",
      securityDeposit: outfit.securityDeposit ?? "",
      rentalDuration: outfit.rentalDuration || 3,
    });

    setError("");
    setMessage("");
  };

  // Save outfit changes.
  const handleUpdate = async (e) => {
    e.preventDefault();

    if (!editingOutfit) return;

    if (!editForm.color.length) {
      setError("Please select at least one available color.");
      return;
    }

    if (!editForm.sizes.length) {
      setError("Please select at least one available size.");
      return;
    }

    const hasInvalidQuantity = editForm.sizes.some(
      (item) =>
        !Number.isInteger(Number(item.quantity)) ||
        Number(item.quantity) < 1
    );

    if (hasInvalidQuantity) {
      setError(
        "Each selected size must have a quantity of at least 1."
      );
      return;
    }

    const token = localStorage.getItem("vendorToken");

    if (!token) {
      router.replace("/vendor-login");
      return;
    }

    setActionLoading("edit");
    setError("");
    setMessage("");

    try {
      const response = await fetch(
        `http://localhost:5000/api/outfits/vendor/${editingOutfit._id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            name: editForm.name,
            description: editForm.description,
            category: editForm.category,

            occasion: editForm.occasion
              .split(",")
              .map((item) => item.trim())
              .filter(Boolean),

            color: editForm.color,

            images: editForm.imageUrl.trim()
              ? [editForm.imageUrl.trim()]
              : [],

            sizes: editForm.sizes.map((item) => ({
              size: item.size,
              quantity: Number(item.quantity),
            })),

            rentalPrice: Number(editForm.rentalPrice),
            securityDeposit: Number(editForm.securityDeposit),
            rentalDuration: Number(editForm.rentalDuration),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Unable to update outfit"
        );
      }

      setEditingOutfit(null);
      setMessage("Outfit updated successfully!");

      await fetchInventory();
    } catch (err) {
      setError(err.message || "Unable to update outfit");
    } finally {
      setActionLoading("");
    }
  };

  return (
    <main className="inventory-page">
      <header className="inventory-header">
        <div>
          <p className="eyebrow">FASHRENTT VENDOR STUDIO</p>
          <h1>My Inventory</h1>
          <p>
            Manage your outfits, rental prices and availability.
          </p>
        </div>

        <Link href="/vendor-dashboard" className="back-btn">
          ← Dashboard
        </Link>
      </header>

      <div className="inventory-toolbar">
        <div>
          <h2>Your Collection</h2>
          <p>{outfits.length} outfit(s) listed</p>
        </div>

        <Link href="/vendor-dashboard" className="add-btn">
          + Add Outfit
        </Link>
      </div>

      {message && <div className="success">{message}</div>}
      {error && <div className="error">{error}</div>}

      {loading ? (
        <div className="empty-state">
          Loading your inventory...
        </div>
      ) : outfits.length === 0 ? (
        <div className="empty-state">
          <h3>Your inventory is empty</h3>
          <p>
            Add your first outfit to start listing your collection.
          </p>
          <Link href="/vendor-dashboard" className="add-btn">
            Add Your First Outfit
          </Link>
        </div>
      ) : (
        <div className="inventory-grid">
          {outfits.map((outfit) => (
            <article className="outfit-card" key={outfit._id}>
              <div className="outfit-image">
                {outfit.images?.[0] ? (
                  <img
                    src={outfit.images[0]}
                    alt={outfit.name}
                  />
                ) : (
                  <div className="no-image">
                    No Image Available
                  </div>
                )}

                <span className={`status ${outfit.status}`}>
                  {outfit.status || "pending"}
                </span>
              </div>

              <div className="outfit-body">
                <h3>{outfit.name}</h3>
                <p className="category">{outfit.category}</p>
                <p className="description">
                  {outfit.description}
                </p>

                <div className="price-row">
                  <div>
                    <small>Rental Price</small>
                    <strong>₹{outfit.rentalPrice}</strong>
                  </div>

                  <div>
                    <small>Security Deposit</small>
                    <strong>₹{outfit.securityDeposit}</strong>
                  </div>
                </div>

                <div className="availability">
                  <span>
                    {outfit.available
                      ? "Available"
                      : "Unavailable"}
                  </span>

                  <button
                    type="button"
                    className={`toggle ${
                      outfit.available ? "on" : ""
                    }`}
                    onClick={() => handleAvailability(outfit)}
                    disabled={actionLoading === outfit._id}
                    aria-label="Toggle outfit availability"
                  >
                    <span />
                  </button>
                </div>

                <button
                  type="button"
                  className="edit-btn"
                  onClick={() => handleEdit(outfit)}
                >
                  Edit Details
                </button>

                <button
                  type="button"
                  className="delete-btn"
                  onClick={() => handleDelete(outfit)}
                  disabled={actionLoading === outfit._id}
                >
                  {actionLoading === outfit._id
                    ? "Please wait..."
                    : "Delete Outfit"}
                </button>
              </div>
            </article>
          ))}
        </div>
      )}

      {/* EDIT OUTFIT MODAL */}
      {editingOutfit && (
        <div className="edit-overlay">
          <div className="edit-modal">
            <div className="edit-modal-header">
              <div>
                <p className="eyebrow">VENDOR STUDIO</p>
                <h2>Edit Outfit</h2>
                <p>Update your outfit listing details.</p>
              </div>

              <button
                type="button"
                className="close-modal"
                onClick={() => setEditingOutfit(null)}
                aria-label="Close edit form"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleUpdate}>
              <div className="edit-form-grid">
                {/* OUTFIT NAME */}
                <div className="edit-field">
                  <label htmlFor="edit-outfit-name">
                    Outfit Name *
                  </label>
                  <input
                    id="edit-outfit-name"
                    required
                    value={editForm.name}
                    onChange={(e) =>
                      setEditForm((prev) => ({
                        ...prev,
                        name: e.target.value,
                      }))
                    }
                  />
                </div>

                {/* CATEGORY */}
                <div className="edit-field">
                  <label htmlFor="edit-outfit-category">
                    Category *
                  </label>
                  <select
                    id="edit-outfit-category"
                    required
                    value={editForm.category}
                    onChange={(e) =>
                      setEditForm((prev) => ({
                        ...prev,
                        category: e.target.value,
                      }))
                    }
                  >
                    <option value="">Select category</option>
                    <option value="Women">Women</option>
                    <option value="Men">Men</option>
                    <option value="Ethnic Wear">Ethnic Wear</option>
                    <option value="Western Wear">
                      Western Wear
                    </option>
                    <option value="Party Wear">Party Wear</option>
                    <option value="Accessories">Accessories</option>
                  </select>
                </div>

                {/* DESCRIPTION */}
                <div className="edit-field full-width">
                  <label htmlFor="edit-outfit-description">
                    Description *
                  </label>
                  <textarea
                    id="edit-outfit-description"
                    required
                    rows={4}
                    value={editForm.description}
                    onChange={(e) =>
                      setEditForm((prev) => ({
                        ...prev,
                        description: e.target.value,
                      }))
                    }
                  />
                </div>

                {/* OCCASIONS */}
                <div className="edit-field full-width">
                  <label htmlFor="edit-outfit-occasion">
                    Occasions
                  </label>
                  <input
                    id="edit-outfit-occasion"
                    value={editForm.occasion}
                    placeholder="Wedding, Party, Festive"
                    onChange={(e) =>
                      setEditForm((prev) => ({
                        ...prev,
                        occasion: e.target.value,
                      }))
                    }
                  />
                </div>

                {/* IMAGE URL */}
                <div className="edit-field full-width">
                  <label htmlFor="edit-outfit-image">
                    Image URL
                  </label>
                  <input
                    id="edit-outfit-image"
                    type="url"
                    value={editForm.imageUrl}
                    placeholder="https://example.com/outfit.jpg"
                    onChange={(e) =>
                      setEditForm((prev) => ({
                        ...prev,
                        imageUrl: e.target.value,
                      }))
                    }
                  />
                </div>

                {/* AVAILABLE COLORS */}
                <div className="edit-field full-width">
                  <label>Available Colors *</label>

                  <div className="choice-options">
                    {[
                      "Black",
                      "White",
                      "Red",
                      "Blue",
                      "Green",
                      "Pink",
                      "Yellow",
                      "Orange",
                      "Purple",
                      "Gold",
                      "Silver",
                      "Beige",
                      "Brown",
                      "Grey",
                      "Multicolor",
                    ].map((color) => {
                      const selected =
                        editForm.color.includes(color);

                      return (
                        <label
                          key={color}
                          className={`choice-chip ${
                            selected ? "selected" : ""
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={selected}
                            onChange={(e) =>
                              setEditForm((prev) => ({
                                ...prev,
                                color: e.target.checked
                                  ? [...prev.color, color]
                                  : prev.color.filter(
                                      (item) => item !== color
                                    ),
                              }))
                            }
                          />
                          <span>{color}</span>
                        </label>
                      );
                    })}
                  </div>

                  <small className="choice-help">
                    Select every color available for this outfit.
                  </small>
                </div>

                {/* AVAILABLE SIZES AND QUANTITIES */}
                <div className="edit-field full-width">
                  <label>Available Sizes and Quantities *</label>

                  <div className="choice-options size-choice-options">
                    {[
                      "XS",
                      "S",
                      "M",
                      "L",
                      "XL",
                      "XXL",
                      "Free Size",
                    ].map((size) => {
                      const selectedSize = editForm.sizes.find(
                        (item) => item.size === size
                      );

                      const selected = Boolean(selectedSize);

                      const quantityId =
                        `quantity-${size.replace(/\s/g, "-")}`;

                      return (
                        <div
                          key={size}
                          className={`size-choice ${
                            selected ? "selected" : ""
                          }`}
                        >
                          <label className="choice-chip size-choice-label">
                            <input
                              type="checkbox"
                              checked={selected}
                              onChange={(e) =>
                                setEditForm((prev) => ({
                                  ...prev,
                                  sizes: e.target.checked
                                    ? [
                                        ...prev.sizes,
                                        {
                                          size,
                                          quantity: 1,
                                        },
                                      ]
                                    : prev.sizes.filter(
                                        (item) =>
                                          item.size !== size
                                      ),
                                }))
                              }
                            />
                            <span>{size}</span>
                          </label>

                          {selected && (
                            <div className="quantity-field">
                              <label htmlFor={quantityId}>
                                Quantity
                              </label>

                              <input
                                id={quantityId}
                                type="number"
                                min="1"
                                step="1"
                                required
                                value={selectedSize.quantity}
                                onChange={(e) => {
                                  const quantity = e.target.value;

                                  setEditForm((prev) => ({
                                    ...prev,
                                    sizes: prev.sizes.map(
                                      (item) =>
                                        item.size === size
                                          ? {
                                              ...item,
                                              quantity,
                                            }
                                          : item
                                    ),
                                  }));
                                }}
                              />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  <small className="choice-help">
                    Select each available size and set its quantity.
                  </small>
                </div>

                {/* RENTAL PRICE */}
                <div className="edit-field">
                  <label htmlFor="edit-rental-price">
                    Rental Price (₹) *
                  </label>
                  <input
                    id="edit-rental-price"
                    required
                    type="number"
                    min="0"
                    value={editForm.rentalPrice}
                    onChange={(e) =>
                      setEditForm((prev) => ({
                        ...prev,
                        rentalPrice: e.target.value,
                      }))
                    }
                  />
                </div>

                {/* SECURITY DEPOSIT */}
                <div className="edit-field">
                  <label htmlFor="edit-security-deposit">
                    Security Deposit (₹) *
                  </label>
                  <input
                    id="edit-security-deposit"
                    required
                    type="number"
                    min="0"
                    value={editForm.securityDeposit}
                    onChange={(e) =>
                      setEditForm((prev) => ({
                        ...prev,
                        securityDeposit: e.target.value,
                      }))
                    }
                  />
                </div>

                {/* RENTAL DURATION */}
                <div className="edit-field full-width">
                  <label htmlFor="edit-rental-duration">
                    Rental Duration (Days) *
                  </label>
                  <input
                    id="edit-rental-duration"
                    required
                    type="number"
                    min="1"
                    step="1"
                    value={editForm.rentalDuration}
                    onChange={(e) =>
                      setEditForm((prev) => ({
                        ...prev,
                        rentalDuration: e.target.value,
                      }))
                    }
                  />
                </div>
              </div>

              <div className="edit-modal-actions">
                <button
                  type="button"
                  className="cancel-edit"
                  onClick={() => setEditingOutfit(null)}
                  disabled={actionLoading === "edit"}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="save-edit"
                  disabled={actionLoading === "edit"}
                >
                  {actionLoading === "edit"
                    ? "Saving..."
                    : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style jsx>{`
        .inventory-page {
          min-height: 100vh;
          padding: 45px 6%;
          background: #faf8f4;
          color: #211e19;
          font-family: Arial, sans-serif;
        }

        .inventory-header,
        .inventory-toolbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
          flex-wrap: wrap;
        }

        .eyebrow {
          color: #b38b48;
          letter-spacing: 2px;
          font-size: 11px;
          font-weight: bold;
        }

        h1,
        h2 {
          font-family: Georgia, serif;
          font-weight: 400;
        }

        h1 {
          font-size: clamp(32px, 4vw, 46px);
          margin: 12px 0;
        }

        .inventory-header p,
        .inventory-toolbar p {
          color: #888176;
          font-size: 14px;
        }

        .inventory-toolbar {
          margin: 45px 0 25px;
          padding-bottom: 20px;
          border-bottom: 1px solid #eee8df;
        }

        .inventory-toolbar h2 {
          margin: 0;
          font-size: 27px;
        }

        .back-btn,
        .add-btn {
          display: inline-block;
          text-decoration: none;
          padding: 13px 20px;
          border-radius: 8px;
          font-size: 13px;
          font-weight: 600;
        }

        .back-btn {
          border: 1px solid #e7d5b5;
          color: #946d29;
          background: white;
        }

        .add-btn {
          background: #211e19;
          color: white;
        }

        .inventory-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 24px;
        }

        .outfit-card {
          background: white;
          border: 1px solid #eee8df;
          border-radius: 14px;
          overflow: hidden;
          min-width: 0;
        }

        .outfit-image {
          height: 250px;
          position: relative;
          background: #f2ede5;
        }

        .outfit-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .no-image {
          display: grid;
          place-items: center;
          height: 100%;
          color: #888176;
        }

        .status {
          position: absolute;
          top: 12px;
          left: 12px;
          background: #fff4d9;
          color: #946d29;
          padding: 7px 12px;
          border-radius: 20px;
          font-size: 11px;
          text-transform: capitalize;
        }

        .status.approved {
          background: #e9f6ed;
          color: #267346;
        }

        .status.rejected {
          background: #ffebeb;
          color: #a83232;
        }

        .outfit-body {
          padding: 20px;
        }

        .outfit-body h3 {
          margin: 0 0 8px;
          font-size: 19px;
        }

        .category {
          color: #a17a36;
          font-size: 12px;
        }

        .description {
          color: #888176;
          font-size: 13px;
          line-height: 1.6;
        }

        .price-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
          padding: 18px 0;
          border-top: 1px solid #eee8df;
          border-bottom: 1px solid #eee8df;
        }

        .price-row div {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .price-row small {
          color: #888176;
          font-size: 11px;
        }

        .price-row strong {
          font-size: 17px;
        }

        .availability {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 18px 0;
          font-size: 13px;
        }

        .toggle {
          width: 44px;
          height: 24px;
          border: 0;
          border-radius: 20px;
          background: #ccc5ba;
          padding: 3px;
          cursor: pointer;
        }

        .toggle span {
          display: block;
          width: 18px;
          height: 18px;
          background: white;
          border-radius: 50%;
        }

        .toggle.on {
          background: #4b9a68;
        }

        .toggle.on span {
          transform: translateX(20px);
        }

        .edit-btn,
        .delete-btn {
          display: block;
          width: 100%;
          text-align: center;
          padding: 13px;
          border-radius: 8px;
          margin-top: 10px;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
        }

        .edit-btn {
          background: #f7f0e4;
          color: #946d29;
          border: 1px solid #e7d5b5;
          text-decoration: none;
        }

        .delete-btn {
          background: #fff5f5;
          color: #b33a3a;
          border: 1px solid #f0d5d5;
        }

        .empty-state {
          text-align: center;
          padding: 70px 20px;
          background: white;
          border: 1px solid #eee8df;
          border-radius: 14px;
          color: #888176;
        }

        .empty-state h3 {
          color: #211e19;
        }

        .empty-state .add-btn {
          margin-top: 15px;
        }

        .success,
        .error {
          padding: 15px;
          border-radius: 8px;
          margin-bottom: 18px;
        }

        .success {
          background: #e9f6ed;
          color: #267346;
        }

        .error {
          background: #ffebeb;
          color: #a83232;
        }

        @media (max-width: 1000px) {
          .inventory-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }

        @media (max-width: 650px) {
          .inventory-page {
            padding: 25px 5%;
          }

          .inventory-grid {
            grid-template-columns: 1fr;
          }
        }

        /* Edit outfit popup */
        .edit-overlay {
          position: fixed;
          inset: 0;
          z-index: 3000;
          background: rgba(20, 18, 15, 0.65);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
        }

        .edit-modal {
          width: 100%;
          max-width: 760px;
          max-height: 90vh;
          overflow-y: auto;
          background: #fff;
          border-radius: 16px;
          padding: 30px;
          box-shadow: 0 20px 70px rgba(0, 0, 0, 0.2);
        }

        .edit-modal-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 25px;
          gap: 15px;
        }

        .edit-modal-header h2 {
          font-family: Georgia, serif;
          font-size: 30px;
          font-weight: 400;
          margin: 8px 0;
        }

        .edit-modal-header p {
          color: #888176;
          font-size: 13px;
        }

        .close-modal {
          width: 38px;
          height: 38px;
          border: 1px solid #eee8df;
          border-radius: 50%;
          background: #faf8f4;
          font-size: 25px;
          cursor: pointer;
          flex-shrink: 0;
        }

        .edit-form-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 20px;
        }

        .edit-field {
          display: flex;
          flex-direction: column;
          gap: 8px;
          min-width: 0;
        }

        .edit-field > label {
          font-size: 13px;
          font-weight: 600;
          color: #373129;
        }

        .edit-field input:not([type="checkbox"]),
        .edit-field select,
        .edit-field textarea {
          width: 100%;
          box-sizing: border-box;
          padding: 13px;
          border: 1px solid #e7e0d6;
          border-radius: 8px;
          background: #fdfcfb;
          color: #211e19;
          font: inherit;
          font-size: 14px;
          outline: none;
        }

        .edit-field input:focus,
        .edit-field select:focus,
        .edit-field textarea:focus {
          border-color: #b38b48;
        }

        .edit-field textarea {
          resize: vertical;
        }

        .choice-options {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          margin-top: 4px;
        }

        .choice-chip {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 10px 12px;
          border: 1px solid #e7e0d6;
          border-radius: 8px;
          background: #fff;
          cursor: pointer;
          font-size: 13px;
          font-weight: 500;
        }

        .choice-chip.selected,
        .size-choice.selected {
          border-color: #b38b48;
          background: #faf5eb;
        }

        .choice-chip input {
          width: auto;
          margin: 0;
          accent-color: #946d29;
        }

        .size-choice-options {
          align-items: flex-start;
        }

        .size-choice {
          display: flex;
          flex-direction: column;
          gap: 12px;
          min-width: 100px;
          padding: 10px;
          border: 1px solid #e7e0d6;
          border-radius: 8px;
          background: #fff;
        }

        .size-choice-label {
          padding: 0;
          border: 0;
          background: transparent;
        }

        .quantity-field {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .quantity-field label {
          font-size: 12px;
          color: #777066;
        }

        .quantity-field input {
          width: 100%;
          box-sizing: border-box;
          padding: 9px;
        }

        .choice-help {
          display: block;
          margin-top: 8px;
          color: #888176;
          font-size: 12px;
        }

        .full-width {
          grid-column: 1 / -1;
        }

        .edit-modal-actions {
          display: flex;
          justify-content: flex-end;
          gap: 12px;
          margin-top: 25px;
        }

        .cancel-edit,
        .save-edit {
          padding: 13px 22px;
          border-radius: 8px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
        }

        .cancel-edit {
          border: 1px solid #e7e0d6;
          background: white;
          color: #777066;
        }

        .save-edit {
          border: none;
          background: #211e19;
          color: white;
        }

        .save-edit:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        @media (max-width: 600px) {
          .edit-modal {
            padding: 20px;
          }

          .edit-form-grid {
            grid-template-columns: 1fr;
          }

          .full-width {
            grid-column: auto;
          }

          .edit-modal-actions {
            flex-direction: column-reverse;
          }

          .cancel-edit,
          .save-edit {
            width: 100%;
          }
        }
      `}</style>
    </main>
  );
}
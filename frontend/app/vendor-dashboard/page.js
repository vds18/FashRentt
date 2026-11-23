"use client";

import Link from "next/link";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function VendorDashboard() {
  const router = useRouter();

  const [vendor, setVendor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);

  // Outfit form
const [outfitForm, setOutfitForm] = useState({
  name: "",
  description: "",
  category: "",
  occasion: "",
  color: [],
  imageUrl: "",
  size: [],
  rentalPrice: "",
  securityDeposit: "",
  rentalDuration: 3,
});

const [outfitSubmitting, setOutfitSubmitting] = useState(false);
const [outfitMessage, setOutfitMessage] = useState("");
const [outfitError, setOutfitError] = useState("");
// Vendor inventory
const [outfits, setOutfits] = useState([]);
const [inventoryLoading, setInventoryLoading] = useState(true);
const [inventoryError, setInventoryError] = useState("");
// Vendor orders
const [orders, setOrders] = useState([]);
const [ordersLoading, setOrdersLoading] = useState(true);
const [ordersError, setOrdersError] = useState("");
const [orderActionLoading, setOrderActionLoading] = useState("");
const [ordersMessage, setOrdersMessage] = useState("");
const [trackingInputs, setTrackingInputs] = useState({});
// Inventory actions
const [editingOutfit, setEditingOutfit] = useState(null);
const [inventoryActionLoading, setInventoryActionLoading] = useState("");
const [inventoryActionMessage, setInventoryActionMessage] = useState("");
const [inventoryActionError, setInventoryActionError] = useState("");

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

  useEffect(() => {
    const token = localStorage.getItem("vendorToken");

    if (!token) {
      router.replace("/vendor-login");
      return;
    }

    const fetchProfile = async () => {
      try {
        const response = await fetch(
          "http://localhost:5000/api/vendors/profile",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();

        if (!response.ok) {
          localStorage.removeItem("vendorToken");
          localStorage.removeItem("vendor");
          router.replace("/vendor-login");
          return;
        }

        setVendor(data.vendor);
        // Fetch vendor inventory
try {
  const inventoryResponse = await fetch(
    "http://localhost:5000/api/outfits/vendor",
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  const inventoryData = await inventoryResponse.json();

  if (!inventoryResponse.ok) {
    throw new Error(
      inventoryData.message || "Unable to fetch inventory"
    );
  }

  setOutfits(inventoryData.outfits || []);
} catch (error) {
  setInventoryError(error.message);
} finally {
  setInventoryLoading(false);
}
        // Fetch vendor orders
        try {
          const ordersResponse = await fetch(
            "http://localhost:5000/api/bookings/vendor/orders",
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          const ordersData = await ordersResponse.json();

          if (!ordersResponse.ok) {
            throw new Error(
              ordersData.message || "Unable to fetch orders"
            );
          }

          setOrders(ordersData.bookings || []);
        } catch (error) {
          console.error("Vendor orders error:", error);
          setOrdersError(error.message);
        } finally {
          setOrdersLoading(false);
        }
      } catch (error) {
        console.error("Dashboard error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("vendorToken");
    localStorage.removeItem("vendor");
    router.replace("/vendor-login");
  };

  // Submit outfit for admin approval
const handleOutfitSubmit = async (e) => {
  e.preventDefault();

  if (outfitForm.sizes.length === 0) {
  setOutfitError("Please select at least one size.");
  return;
}

  setOutfitSubmitting(true);
  setOutfitMessage("");
  setOutfitError("");

  try {
    const token = localStorage.getItem("vendorToken");

    if (!token) {
      router.replace("/vendor-login");
      return;
    }

    const response = await fetch(
      "http://localhost:5000/api/outfits/vendor",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: outfitForm.name,
          description: outfitForm.description,
          category: outfitForm.category,
          occasion: outfitForm.occasion
            .split(",")
            .map((item) => item.trim())
            .filter(Boolean),

          color: outfitForm.color,


          images: outfitForm.imageUrl.trim()
            ? [outfitForm.imageUrl.trim()]
            : [],
          sizes: outfitForm.sizes,

          rentalPrice: Number(outfitForm.rentalPrice),
          securityDeposit: Number(outfitForm.securityDeposit),
          rentalDuration: Number(outfitForm.rentalDuration),
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.message || "Unable to submit outfit"
      );
    }

    setOutfitMessage(
      "Outfit submitted successfully! Waiting for admin approval."
    );

    setOutfitForm({
      name: "",
      description: "",
      category: "",
      occasion: "",
      color: [],
      imageUrl: "",
      size: [],
      rentalPrice: "",
      securityDeposit: "",
      rentalDuration: 3,
    });
  } catch (error) {
    setOutfitError(
      error.message || "Something went wrong"
    );
  } finally {
    setOutfitSubmitting(false);
  }
};
// Refresh vendor inventory
const refreshInventory = async () => {
  const token = localStorage.getItem("vendorToken");

  if (!token) {
    router.replace("/vendor-login");
    return;
  }

  setInventoryLoading(true);
  setInventoryError("");

  try {
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
  } catch (error) {
    setInventoryError(error.message);
  } finally {
    setInventoryLoading(false);
  }
};

// Open edit form
const handleEditClick = (outfit) => {
  setEditingOutfit(outfit);

  const existingColors = Array.isArray(outfit.color)
    ? outfit.color
    : outfit.color
      ? String(outfit.color)
          .split(",")
          .map((color) => color.trim())
          .filter(Boolean)
      : [];

  setEditForm({
    name: outfit.name || "",
    description: outfit.description || "",
    category: outfit.category || "",
    occasion: Array.isArray(outfit.occasion)
      ? outfit.occasion.join(", ")
      : outfit.occasion || "",
    color: existingColors,
    imageUrl: outfit.images?.[0] || "",
    sizes: Array.isArray(outfit.sizes)
      ? outfit.sizes.map((item) => ({
          size: item.size,
          quantity: Number(item.quantity) || 1,
        }))
      : [],
    rentalPrice: outfit.rentalPrice ?? "",
    securityDeposit: outfit.securityDeposit ?? "",
    rentalDuration: outfit.rentalDuration || 3,
  });

  setInventoryActionMessage("");
  setInventoryActionError("");
};

// Save edited outfit
const handleUpdateOutfit = async (e) => {
  e.preventDefault();

  if (!editingOutfit) return;

  if (!editForm.color.length) {
    setInventoryActionError(
      "Please select at least one available color."
    );
    return;
  }

  if (!editForm.sizes.length) {
    setInventoryActionError(
      "Please select at least one available size."
    );
    return;
  }

  const invalidQuantity = editForm.sizes.some(
    (item) =>
      !Number.isInteger(Number(item.quantity)) ||
      Number(item.quantity) < 1
  );

  if (invalidQuantity) {
    setInventoryActionError(
      "Each selected size must have a quantity of at least 1."
    );
    return;
  }

  const token = localStorage.getItem("vendorToken");

  if (!token) {
    router.replace("/vendor-login");
    return;
  }

  setInventoryActionLoading("edit");
  setInventoryActionError("");
  setInventoryActionMessage("");

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
        data.message || "Unable to update outfit."
      );
    }

    setEditingOutfit(null);
    setInventoryActionMessage(
      "Outfit updated successfully!"
    );

    await refreshInventory();
  } catch (error) {
    setInventoryActionError(
      error.message || "Unable to update outfit."
    );
  } finally {
    setInventoryActionLoading("");
  }
};

// Toggle availability
const handleToggleAvailability = async (outfit) => {
  const token = localStorage.getItem("vendorToken");

  if (!token) {
    router.replace("/vendor-login");
    return;
  }

  setInventoryActionLoading(outfit._id);
  setInventoryActionError("");
  setInventoryActionMessage("");

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
      throw new Error(data.message || "Unable to change availability");
    }

    setInventoryActionMessage("Availability updated successfully!");
    await refreshInventory();
  } catch (error) {
    setInventoryActionError(error.message);
  } finally {
    setInventoryActionLoading("");
  }
};

// Delete outfit
const handleDeleteOutfit = async (outfit) => {
  const confirmed = window.confirm(
    `Are you sure you want to delete "${outfit.name}"? This action cannot be undone.`
  );

  if (!confirmed) return;

  const token = localStorage.getItem("vendorToken");

  if (!token) {
    router.replace("/vendor-login");
    return;
  }

  setInventoryActionLoading(outfit._id);
  setInventoryActionError("");
  setInventoryActionMessage("");

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
      throw new Error(data.message || "Unable to delete outfit");
    }

    setInventoryActionMessage("Outfit deleted successfully!");
    await refreshInventory();
  } catch (error) {
    setInventoryActionError(error.message);
  } finally {
    setInventoryActionLoading("");
  }
};
// Update vendor order status
const handleOrderStatusUpdate = async (orderId, bookingStatus) => {
  setOrderActionLoading(orderId);
  setOrdersMessage("");
  setOrdersError("");

  try {
    const token = localStorage.getItem("vendorToken");

    const response = await fetch(
      `http://localhost:5000/api/bookings/vendor/orders/${orderId}/status`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ bookingStatus }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Unable to update order");
    }

    setOrders((previousOrders) =>
      previousOrders.map((order) =>
        order._id === orderId
          ? { ...order, bookingStatus }
          : order
      )
    );

    setOrdersMessage("Order status updated successfully.");
  } catch (error) {
    setOrdersError(error.message);
  } finally {
    setOrderActionLoading("");
  }
};
// Dispatch order with courier tracking ID
const handleDispatchOrder = async (orderId) => {
  const trackingId = trackingInputs[orderId]?.trim();

  if (!trackingId) {
    setOrdersError("Please enter a tracking ID.");
    return;
  }

  setOrderActionLoading(orderId);
  setOrdersError("");
  setOrdersMessage("");

  try {
    const token = localStorage.getItem("vendorToken");

    const response = await fetch(
      `http://localhost:5000/api/bookings/vendor/orders/${orderId}/dispatch`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ trackingId }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Unable to dispatch order");
    }

    setOrders((previousOrders) =>
      previousOrders.map((order) =>
        order._id === orderId
          ? {
              ...order,
              trackingId,
              bookingStatus: "dispatched",
            }
          : order
      )
    );

    setOrdersMessage("Order dispatched and tracking ID saved.");

    setTrackingInputs((previous) => ({
      ...previous,
      [orderId]: "",
    }));
  } catch (error) {
    setOrdersError(error.message);
  } finally {
    setOrderActionLoading("");
  }
};
  if (loading) {
    return (
      <div className="vd-loading">
        <div className="vd-spinner" />
        <p>Preparing your workspace...</p>

        <style jsx>{`
          .vd-loading {
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            gap: 16px;
            background: #faf7f1;
            color: #71685d;
            font-family: Arial, sans-serif;
          }
          .vd-spinner {
            width: 38px;
            height: 38px;
            border: 3px solid #e8dfd2;
            border-top-color: #b58b42;
            border-radius: 50%;
            animation: spin 0.8s linear infinite;
          }
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  if (!vendor) {
    return (
      <main className="vd-error">
        <h2>Unable to load your store</h2>
        <p>Please log in again to continue.</p>
        <button onClick={() => router.push("/vendor-login")}>
          Return to Login
        </button>

        <style jsx>{`
          .vd-error {
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            gap: 14px;
            background: #faf7f1;
            font-family: Arial, sans-serif;
            color: #201d19;
          }
          button {
            padding: 13px 24px;
            background: #201d19;
            color: white;
            border: 0;
            border-radius: 8px;
            cursor: pointer;
          }
        `}</style>
      </main>
    );
  }

  return (
    <div className="vd-app">
      {/* SIDEBAR */}
      <aside className={`vd-sidebar ${menuOpen ? "vd-sidebar-open" : ""}`}>
        <div className="vd-logo">
          <div className="vd-logo-mark">F</div>
          <div>
            <h2>FashRentt</h2>
            <span>VENDOR STUDIO</span>
          </div>
        </div>

        <div className="vd-side-label">WORKSPACE</div>

        <nav className="vd-nav">
          <Link
  href="/vendor-dashboard/inventory"
  className="vd-nav-item"
  onClick={() => setMenuOpen(false)}
>
  <span>♧</span>
  My Inventory
</Link>
            
<button
  className="vd-nav-item"
  onClick={() => {
    document
      .getElementById("vd-orders")
      ?.scrollIntoView({ behavior: "smooth" });

    setMenuOpen(false);
  }}
>
  <span>▤</span>
  Orders
</button>

          <button
            className="vd-nav-item"
            onClick={() =>
              document
                .getElementById("vd-store")
                ?.scrollIntoView({ behavior: "smooth" })
            }
          >
            <span>⌂</span>
            Store Profile
          </button>
        </nav>

        <div className="vd-sidebar-bottom">
          <div className="vd-help">
            <span className="vd-help-icon">✦</span>
            <h4>Need assistance?</h4>
            <p>We're here to help you grow your store.</p>
            <a href="mailto:fashrentt@gmail.com">
              Contact Support ↗
            </a>
          </div>

          <button className="vd-logout" onClick={handleLogout}>
            <span>↪</span> Log out
          </button>

          <div className="vd-sidebar-foot">
            FASHRENTT © 2026
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="vd-main">
        <header className="vd-topbar">
          <button
            className="vd-mobile-toggle"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle sidebar"
          >
            ☰
          </button>

          <div className="vd-breadcrumb">
            Partner Portal <span>/</span> Dashboard
          </div>

          <div className="vd-top-right">
            <span className="vd-live">
              <span /> Partner Account
            </span>

            <div className="vd-avatar">
              {vendor.name?.charAt(0)?.toUpperCase() || "V"}
            </div>
          </div>
        </header>

        <div className="vd-content">
          {/* WELCOME */}
          <section className="vd-welcome">
            <div>
              <p className="vd-eyebrow">
                YOUR FASHION BUSINESS, REIMAGINED
              </p>

              <h1>
                Welcome back,
                <br />
                <span>{vendor.name}.</span>
              </h1>

              <p className="vd-welcome-sub">
                Your store. Your collection. Your next big opportunity.
              </p>
            </div>

            <div className="vd-welcome-badge">
              <div className="vd-badge-icon">✧</div>
              <div>
                <span>PARTNER STATUS</span>
                <strong>
                  <i /> Approved Partner
                </strong>
              </div>
            </div>
          </section>

          {/* SUMMARY CARDS */}
          <section className="vd-stats">
            <div className="vd-stat-card">
              <div className="vd-stat-top">
                <span className="vd-stat-icon gold">♧</span>
                <span className="vd-stat-label">STORE STATUS</span>
              </div>
              <h3>Active</h3>
              <p>Your store is approved on FashRentt.</p>
            </div>

            <div className="vd-stat-card">
              <div className="vd-stat-top">
                <span className="vd-stat-icon beige">▦</span>
                <span className="vd-stat-label">LISTINGS</span>
              </div>
              <h3>{outfits.length}</h3>
              <p>Total outfits in your inventory.</p>
            </div>

            <div className="vd-stat-card">
              <div className="vd-stat-top">
                <span className="vd-stat-icon green">₹</span>
                <span className="vd-stat-label">TOTAL EARNINGS</span>
              </div>
              <h3>—</h3>
              <p>Your rental earnings will appear here.</p>
            </div>
          </section>

          {/* STORE PROFILE */}
          <section className="vd-section" id="vd-store">
            <div className="vd-section-heading">
              <div>
                <p className="vd-eyebrow">YOUR BUSINESS</p>
                <h2>Store Overview</h2>
                <p className="vd-section-sub">
                  Your registered store information.
                </p>
              </div>

              <span className="vd-verified">✓ Verified</span>
            </div>

            <div className="vd-store-card">
              <div className="vd-store-cover">
                <div className="vd-store-monogram">
                  {vendor.shopName?.charAt(0)?.toUpperCase() || "S"}
                </div>

                <div className="vd-store-cover-text">
                  <span>YOUR STORE</span>
                  <h3>{vendor.shopName}</h3>
                  <p>FashRentt Partner Store</p>
                </div>

                <div className="vd-store-status">
                  <i /> Approved
                </div>
              </div>

              <div className="vd-store-details">
                <div className="vd-detail">
                  <span className="vd-detail-icon">♙</span>
                  <div>
                    <label>Owner Name</label>
                    <strong>{vendor.name}</strong>
                  </div>
                </div>

                <div className="vd-detail">
                  <span className="vd-detail-icon">✉</span>
                  <div>
                    <label>Email Address</label>
                    <strong>{vendor.email}</strong>
                  </div>
                </div>

                <div className="vd-detail">
                  <span className="vd-detail-icon">☎</span>
                  <div>
                    <label>Contact Number</label>
                    <strong>{vendor.phone}</strong>
                  </div>
                </div>

                <div className="vd-detail">
                  <span className="vd-detail-icon">⌖</span>
                  <div>
                    <label>Store Location</label>
                    <strong>{vendor.shopAddress}</strong>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* INVENTORY */}
<section className="vd-section" id="vd-inventory">
  <div className="vd-section-heading">
    <div>
      <p className="vd-eyebrow">COLLECTION MANAGEMENT</p>
      <h2>Add a New Outfit</h2>
      <p className="vd-section-sub">
        List your fashion collection for customers to rent.
      </p>
    </div>
    <span className="vd-coming">ADMIN APPROVAL REQUIRED</span>
  </div>

  <form className="vd-outfit-form" onSubmit={handleOutfitSubmit}>
    <div className="vd-form-grid">
      <div className="vd-field">
        <label>Outfit Name *</label>
        <input
          required
          type="text"
          placeholder="e.g. Royal Blue Gown"
          value={outfitForm.name}
          onChange={(e) =>
            setOutfitForm({ ...outfitForm, name: e.target.value })
          }
        />
      </div>

      <div className="vd-field">
        <label>Category *</label>
        <select
          required
          value={outfitForm.category}
          onChange={(e) =>
            setOutfitForm({ ...outfitForm, category: e.target.value })
          }
        >
          <option value="">Select category</option>
          <option value="Women">Women</option>
          <option value="Men">Men</option>
          <option value="Ethnic Wear">Ethnic Wear</option>
          <option value="Western Wear">Western Wear</option>
          <option value="Party Wear">Party Wear</option>
          <option value="Accessories">Accessories</option>
        </select>
      </div>

      <div className="vd-field vd-field-full">
        <label>Description *</label>
        <textarea
          required
          rows="4"
          placeholder="Describe your outfit, fabric, style and features..."
          value={outfitForm.description}
          onChange={(e) =>
            setOutfitForm({ ...outfitForm, description: e.target.value })
          }
        />
      </div>

      <div className="vd-field vd-field-full">
        <label>Occasions</label>
        <input
          type="text"
          placeholder="Wedding, Party, Festive (comma separated)"
          value={outfitForm.occasion}
          onChange={(e) =>
            setOutfitForm({ ...outfitForm, occasion: e.target.value })
          }
        />
      </div>
      <div className="vd-field">
  <label>Color *</label>
  <div className="vd-field vd-field-full">
  <label>Available Colors *</label>

  <div className="size-options">
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
      const isSelected = (outfitForm.color || []).includes(color);

      return (
        <div
          key={color}
          className={`size-option ${
            isSelected ? "selected" : ""
          }`}
        >
          <label className="size-button">
            <input
              type="checkbox"
              checked={isSelected}
              onChange={(e) => {
                if (e.target.checked) {
                  setOutfitForm((prev) => ({
                    ...prev,
                    color: [
                      ...(prev.color || []),
                      color,
                    ],
                  }));
                } else {
                  setOutfitForm((prev) => ({
                    ...prev,
                    color: (prev.color || []).filter(
                      (item) => item !== color
                    ),
                  }));
                }
              }}
            />
            <span>{color}</span>
          </label>
        </div>
      );
    })}
  </div>

  {(outfitForm.color || []).length === 0 && (
    <small className="size-help">
      Select at least one available color.
    </small>
  )}
</div>
</div>
      <div className="vd-field vd-field-full">
        <label>Outfit Image URL</label>
        <input
          type="url"
          placeholder="https://example.com/outfit.jpg"
          value={outfitForm.imageUrl}
          onChange={(e) =>
            setOutfitForm({ ...outfitForm, imageUrl: e.target.value })
          }
        />
        <small>Paste a publicly accessible image URL.</small>
      </div>

      

      <div className="vd-field vd-field-full">
  <label>Available Sizes *</label>

<div className="size-options">
  {["XS", "S", "M", "L", "XL", "XXL", "Free Size"].map((size) => {
    const selectedSize = (outfitForm.sizes || []).find(
      (item) => item.size === size
    );

    const isSelected = Boolean(selectedSize);

    return (
      <div
        key={size}
        className={`size-option ${isSelected ? "selected" : ""}`}
      >
        <label className="size-button">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={(e) => {
              if (e.target.checked) {
                setOutfitForm((prev) => ({
                  ...prev,
                  sizes: [
                    ...(prev.sizes || []),
                    {
                      size: size,
                      quantity: 1,
                    },
                  ],
                }));
              } else {
                setOutfitForm((prev) => ({
                  ...prev,
                  sizes: (prev.sizes || []).filter(
                    (item) => item.size !== size
                  ),
                }));
              }
            }}
          />

          <span>{size}</span>
        </label>

        {isSelected && (
          <input
            type="number"
            min="1"
            value={selectedSize.quantity}
            onChange={(e) => {
              setOutfitForm((prev) => ({
                ...prev,
                sizes: (prev.sizes || []).map((item) =>
                  item.size === size
                    ? {
                        ...item,
                        quantity: Number(e.target.value),
                      }
                    : item
                ),
              }));
            }}
            className="size-quantity"
          />
        )}
      </div>
    );
  })}
</div>
    {(outfitForm.sizes || []).length === 0 && (
    <small className="size-help">
      Select at least one available size.
    </small>
  )}
</div>

      <div className="vd-field">
        <label>Rental Price (₹) *</label>
        <input
          required
          type="number"
          min="0"
          step="1"
          placeholder="799"
          value={outfitForm.rentalPrice}
          onChange={(e) =>
            setOutfitForm({ ...outfitForm, rentalPrice: e.target.value })
          }
        />
      </div>

      <div className="vd-field">
        <label>Security Deposit (₹) *</label>
        <input
          required
          type="number"
          min="0"
          step="1"
          placeholder="1500"
          value={outfitForm.securityDeposit}
          onChange={(e) =>
            setOutfitForm({ ...outfitForm, securityDeposit: e.target.value })
          }
        />
      </div>

      <div className="vd-field vd-field-full">
        <label>Rental Duration (Days) *</label>
        <input
          required
          type="number"
          min="1"
          value={outfitForm.rentalDuration}
          onChange={(e) =>
            setOutfitForm({ ...outfitForm, rentalDuration: e.target.value })
          }
        />
      </div>
    </div>

    {outfitError && (
      <div className="vd-form-error">{outfitError}</div>
    )}

    {outfitMessage && (
      <div className="vd-form-success">{outfitMessage}</div>
    )}

    <button
      type="submit"
      className="vd-submit-btn"
      disabled={outfitSubmitting}
    >
      {outfitSubmitting ? "Submitting..." : "Submit Outfit for Approval →"}
    </button>
  </form>
  {/* INVENTORY LIST */}
<div className="vd-inventory-list">
  <div className="vd-inventory-list-heading">
    <div>
      <p className="vd-eyebrow">YOUR COLLECTION</p>
      <h2>My Inventory ({outfits.length})</h2>
      <p className="vd-section-sub">
        Manage your submitted outfits, prices, and availability.
      </p>
    </div>
  </div>

  {inventoryActionMessage && (
    <div className="vd-form-success">
      {inventoryActionMessage}
    </div>
  )}

  {inventoryActionError && (
    <div className="vd-form-error">
      {inventoryActionError}
    </div>
  )}

  {inventoryError && (
    <div className="vd-form-error">{inventoryError}</div>
  )}

  {inventoryLoading ? (
    <div className="vd-empty-card">
      Loading your inventory...
    </div>
  ) : outfits.length === 0 ? (
    <div className="vd-empty-card">
      <div className="vd-empty-icon">♧</div>
      <h3>No outfits listed yet</h3>
      <p>
        Add your first outfit using the form above.
      </p>
    </div>
  ) : (
    <div className="vd-inventory-grid">
      {outfits.map((outfit) => (
        <article
          className="vd-inventory-card"
          key={outfit._id}
        >
          <div className="vd-inventory-image">
            {outfit.images?.[0] ? (
              <img
                src={outfit.images[0]}
                alt={outfit.name}
              />
            ) : (
              <div className="vd-no-image">
                No Image
              </div>
            )}

            <span
              className={`vd-status-badge ${
                outfit.status || "pending"
              }`}
            >
              {outfit.status || "Pending"}
            </span>
          </div>

          <div className="vd-inventory-card-body">
            <h3>{outfit.name}</h3>

            <p className="vd-inventory-category">
              {outfit.category}
            </p>

            <p className="vd-inventory-description">
              {outfit.description}
            </p>

            <div className="vd-inventory-price">
              <div>
                <span>Rental price</span>
                <strong>₹{outfit.rentalPrice}</strong>
              </div>

              <div>
                <span>Security deposit</span>
                <strong>₹{outfit.securityDeposit}</strong>
              </div>
            </div>

            <div className="vd-inventory-meta">
              <span>
                Size:{" "}
                {outfit.sizes
                  ?.map((item) => item.size)
                  .join(", ") || "N/A"}
              </span>

              <span>
                Quantity:{" "}
                {outfit.sizes?.reduce(
                  (total, item) =>
                    total + Number(item.quantity || 0),
                  0
                ) || 0}
              </span>
            </div>

            <div className="vd-availability-row">
              <span>Available for rent</span>

              <button
                type="button"
                className={`vd-toggle ${
                  outfit.available ? "on" : ""
                }`}
                onClick={() =>
                  handleToggleAvailability(outfit)
                }
                disabled={
                  inventoryActionLoading === outfit._id
                }
                aria-label="Toggle outfit availability"
              >
                <span />
              </button>
            </div>

            <div className="vd-inventory-actions">
              <button
                type="button"
                className="vd-edit-btn"
                onClick={() => handleEditClick(outfit)}
              >
                Edit Details
              </button>

              <button
                type="button"
                className="vd-delete-btn"
                onClick={() => handleDeleteOutfit(outfit)}
                disabled={
                  inventoryActionLoading === outfit._id
                }
              >
                {inventoryActionLoading === outfit._id
                  ? "Please wait..."
                  : "Delete"}
              </button>
            </div>
          </div>
        </article>
      ))}
    </div>
  )}
</div>
</section>
{/* EDIT OUTFIT MODAL */}
{editingOutfit && (
  <div className="vd-modal-overlay">
    <div className="vd-edit-modal">
      <div className="vd-modal-heading">
        <div>
          <p className="vd-eyebrow">COLLECTION MANAGEMENT</p>
          <h2>Edit Outfit</h2>
        </div>

        <button
          type="button"
          className="vd-modal-close"
          onClick={() => setEditingOutfit(null)}
        >
          ×
        </button>
      </div>
      <form onSubmit={handleUpdateOutfit}>
  <div className="vd-form-grid">
    {/* OUTFIT NAME */}
    <div className="vd-field">
      <label>Outfit Name *</label>
      <input
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
    <div className="vd-field">
      <label>Category *</label>
      <select
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
        <option value="Western Wear">Western Wear</option>
        <option value="Party Wear">Party Wear</option>
        <option value="Accessories">Accessories</option>
      </select>
    </div>

    {/* AVAILABLE COLORS */}
    <div className="vd-field vd-field-full">
      <label>Available Colors *</label>

      <div className="size-options">
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
          const selected = editForm.color.includes(color);

          return (
            <div
              key={color}
              className={`size-option ${
                selected ? "selected" : ""
              }`}
            >
              <label className="size-button">
                <input
                  type="checkbox"
                  checked={selected}
                  onChange={(e) => {
                    setEditForm((prev) => ({
                      ...prev,
                      color: e.target.checked
                        ? [...prev.color, color]
                        : prev.color.filter(
                            (item) => item !== color
                          ),
                    }));
                  }}
                />
                <span>{color}</span>
              </label>
            </div>
          );
        })}
      </div>

      {editForm.color.length === 0 && (
        <small className="size-help">
          Select at least one available color.
        </small>
      )}
    </div>

    {/* DESCRIPTION */}
    <div className="vd-field vd-field-full">
      <label>Description *</label>
      <textarea
        required
        rows="4"
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
    <div className="vd-field vd-field-full">
      <label>Occasions</label>
      <input
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
    <div className="vd-field vd-field-full">
      <label>Image URL</label>
      <input
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

    {/* AVAILABLE SIZES AND QUANTITIES */}
    <div className="vd-field vd-field-full">
      <label>Available Sizes *</label>

      <div className="size-options">
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

          return (
            <div
              key={size}
              className={`size-option ${
                selected ? "selected" : ""
              }`}
            >
              <label className="size-button">
                <input
                  type="checkbox"
                  checked={selected}
                  onChange={(e) => {
                    setEditForm((prev) => ({
                      ...prev,
                      sizes: e.target.checked
                        ? [
                            ...prev.sizes,
                            { size, quantity: 1 },
                          ]
                        : prev.sizes.filter(
                            (item) => item.size !== size
                          ),
                    }));
                  }}
                />

                <span>{size}</span>
              </label>

              {selected && (
                <div className="size-quantity-wrapper">
                  <label>Quantity</label>
                  <input
                    className="size-quantity"
                    type="number"
                    min="1"
                    step="1"
                    required
                    aria-label={`Quantity for ${size}`}
                    value={selectedSize.quantity}
                    onChange={(e) => {
                      const quantity = e.target.value;

                      setEditForm((prev) => ({
                        ...prev,
                        sizes: prev.sizes.map((item) =>
                          item.size === size
                            ? { ...item, quantity }
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

      {editForm.sizes.length === 0 && (
        <small className="size-help">
          Select at least one available size.
        </small>
      )}
    </div>

    {/* RENTAL PRICE */}
    <div className="vd-field">
      <label>Rental Price (₹) *</label>
      <input
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
    <div className="vd-field">
      <label>Security Deposit (₹) *</label>
      <input
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
    <div className="vd-field vd-field-full">
      <label>Rental Duration (Days) *</label>
      <input
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

  {/* FORM ACTIONS */}
  {inventoryActionError && (
    <p className="error">{inventoryActionError}</p>
  )}

  <div className="vd-modal-actions">
    <button
      type="button"
      onClick={() => setEditingOutfit(null)}
      disabled={inventoryActionLoading === "edit"}
    >
      Cancel
    </button>

    <button
      type="submit"
      disabled={inventoryActionLoading === "edit"}
    >
      {inventoryActionLoading === "edit"
        ? "Saving..."
        : "Save Changes"}
    </button>
  </div>
</form>
    </div>
  </div>
)}
{/* ORDERS */}
<section className="vd-section" id="vd-orders">
  <div className="vd-section-heading">
    <div>
      <p className="vd-eyebrow">RENTAL MANAGEMENT</p>
      <h2>Recent Orders</h2>
      <p className="vd-section-sub">
        Track customer rentals, payments, and order status.
      </p>
    </div>

    <span className="vd-coming">
      {orders.length} TOTAL ORDERS
    </span>
  </div>

  {ordersLoading ? (
    <div className="vd-empty-card">
      <p>Loading your orders...</p>
    </div>
  ) : ordersError && orders.length === 0 ? (
    <div className="vd-empty-card">
      <h3>Unable to load orders</h3>
      <p>{ordersError}</p>
    </div>
  ) : orders.length === 0 ? (
    <div className="vd-empty-card vd-orders-empty">
      <div className="vd-empty-icon">▤</div>
      <h3>No orders yet</h3>
      <p>
        Customer bookings will appear here when someone
        rents an outfit from your store.
      </p>
    </div>
  ) : (
    <>
      {ordersMessage && (
        <div className="vd-form-success">
          {ordersMessage}
        </div>
      )}

      {ordersError && (
        <div className="vd-form-error">
          {ordersError}
        </div>
      )}

      <div className="vd-orders-list">
        {orders.map((order) => (
          <div className="vd-order-card" key={order._id}>
            <div className="vd-order-top">
              <div>
                <span className="vd-order-label">
                  BOOKING ID
                </span>

                <h3>{order.bookingId}</h3>
              </div>

              <span className={`vd-order-status ${order.bookingStatus}`}>
                {order.bookingStatus?.replaceAll("_", " ")}
              </span>
            </div>

            <div className="vd-order-details">
              <div>
                <label>Outfit</label>
                <strong>
                  {order.outfit?.name ||
                    order.outfit?.title ||
                    "Outfit"}
                </strong>
              </div>

              <div>
                <label>Customer</label>
                <strong>
                  {order.customer?.name || "Customer"}
                </strong>
                <small>
                  {order.customer?.email || ""}
                </small>
              </div>

              <div>
                <label>Rental Dates</label>
                <strong>
                  {new Date(
                    order.rentalStartDate
                  ).toLocaleDateString("en-IN")}
                  {" – "}
                  {new Date(
                    order.rentalEndDate
                  ).toLocaleDateString("en-IN")}
                </strong>
              </div>
              <div>
  <label>Color</label>
  <strong>{order.color || "N/A"}</strong>
</div>

<div>
  <label>Size</label>
  <strong>{order.size}</strong>
</div>
              <div>
                <label>Total Amount</label>
                <strong>
                  ₹{Number(order.totalAmount || 0).toLocaleString("en-IN")}
                </strong>
              </div>

              <div>
                <label>Payment</label>
                <strong>
                  {order.paymentStatus?.replaceAll("_", " ")}
                </strong>
              </div>
            </div>

            <div className="vd-order-address">
              <label>Delivery Address</label>
              <p>
                {order.deliveryAddress?.fullName}
                {order.deliveryAddress?.phone
                  ? ` · ${order.deliveryAddress.phone}`
                  : ""}
                <br />
                {order.deliveryAddress?.addressLine}
                {order.deliveryAddress?.city
                  ? `, ${order.deliveryAddress.city}`
                  : ""}
                {order.deliveryAddress?.state
                  ? `, ${order.deliveryAddress.state}`
                  : ""}
                {order.deliveryAddress?.pincode
                  ? ` - ${order.deliveryAddress.pincode}`
                  : ""}
              </p>
            </div>

{order.trackingId && (
  <p className="vd-tracking">
    Tracking ID: {order.trackingId}
  </p>
)}

{["confirmed", "preparing", "dispatched"].includes(
  order.bookingStatus
) && (
  <div className="vd-order-actions">
    <label>Courier Tracking ID</label>

    <input
      type="text"
      placeholder="Enter courier tracking number"
      value={trackingInputs[order._id] || ""}
      onChange={(e) =>
        setTrackingInputs((previous) => ({
          ...previous,
          [order._id]: e.target.value,
        }))
      }
    />

    <button
      type="button"
      disabled={orderActionLoading === order._id}
      onClick={() => handleDispatchOrder(order._id)}
    >
      {orderActionLoading === order._id
        ? "Dispatching..."
        : "Dispatch Order"}
    </button>
  </div>
)}

            <div className="vd-order-actions">
              <label>Update Order Status</label>

              <select
                value={order.bookingStatus}
                disabled={
                  orderActionLoading === order._id ||
                  ["cancelled", "disputed", "completed"].includes(
                    order.bookingStatus
                  )
                }
                onChange={(e) =>
                  handleOrderStatusUpdate(
                    order._id,
                    e.target.value
                  )
                }
              >
                
                <option value="confirmed">Confirmed</option>
                <option value="preparing">Preparing</option>
                <option value="delivered">Delivered</option>
                <option value="return_requested">
                  Return Requested
                </option>
                <option value="returned">Returned</option>
                <option value="completed">Completed</option>
                <option value="cancelled" disabled>
                  Cancelled
                </option>
                <option value="disputed" disabled>
                  Disputed
                </option>
              </select>

              {orderActionLoading === order._id && (
                <small>Updating order...</small>
              )}
            </div>
          </div>
        ))}
      </div>
    </>
  )}
</section>
          <footer className="vd-footer">
            <span>© 2026 FashRentt. All rights reserved.</span>
            <span>Made for fashion. Built for partners.</span>
          </footer>
        </div>
      </main>

      {menuOpen && (
        <button
          className="vd-overlay"
          onClick={() => setMenuOpen(false)}
          aria-label="Close navigation"
        />
      )}

      <style jsx global>{`
        * {
          box-sizing: border-box;
        }

        .vd-app {
          --vd-bg: #faf8f4;
          --vd-card: #ffffff;
          --vd-text: #211e19;
          --vd-muted: #888176;
          --vd-border: #eee8df;
          --vd-gold: #b38b48;
          display: flex;
          min-height: 100vh;
          background: var(--vd-bg);
          color: var(--vd-text);
          font-family: Arial, Helvetica, sans-serif;
        }

        .vd-sidebar {
          width: 260px;
          flex-shrink: 0;
          background: #fff;
          border-right: 1px solid var(--vd-border);
          padding: 30px 20px 18px;
          display: flex;
          flex-direction: column;
          min-height: 100vh;
          position: sticky;
          top: 0;
          height: 100vh;
          z-index: 1001;
        }

        .vd-logo {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 0 8px 38px;
        }

        .vd-logo-mark {
          width: 43px;
          height: 43px;
          display: grid;
          place-items: center;
          background: #f5ead5;
          color: #a17a23;
          border-radius: 13px;
          font-family: Georgia, serif;
          font-size: 28px;
          font-weight: bold;
        }

        .vd-logo h2 {
          font-family: Georgia, serif;
          font-size: 22px;
          margin: 0 0 5px;
          letter-spacing: -0.7px;
        }

        .vd-logo span {
          font-size: 8px;
          letter-spacing: 2.3px;
          color: var(--vd-gold);
          font-weight: bold;
        }

        .vd-side-label {
          font-size: 10px;
          letter-spacing: 2px;
          color: #b1a99d;
          font-weight: bold;
          padding: 0 13px;
          margin-bottom: 13px;
        }

        .vd-nav {
          display: flex;
          flex-direction: column;
          gap: 7px;
        }

        .vd-nav-item {
          display: flex;
          align-items: center;
          gap: 13px;
          padding: 14px 15px;
          width: 100%;
          border: 0;
          border-radius: 10px;
          background: transparent;
          color: #777066;
          text-decoration: none;
          font-size: 13px;
          font-weight: 500;
          text-align: left;
          cursor: pointer;
          transition: 0.2s ease;
        }

        .vd-nav-item {
  border: 1px solid transparent;
  outline: none;
  box-shadow: none;
}

.vd-nav-item:focus {
  outline: none;
  box-shadow: none;
}

.vd-nav-item:focus-visible {
  outline: 2px solid #c49a4a;
  outline-offset: 2px;
}

        .vd-nav-item > span:first-child {
          font-size: 20px;
          width: 22px;
          text-align: center;
        }

        .vd-nav-item:hover {
          background: #faf7f1;
          color: #9b742f;
        }

        .vd-nav-item.active {
          background: #f7f0e4;
          color: #946d29;
          font-weight: 600;
        }

        .vd-soon {
          margin-left: auto;
          font-size: 9px;
          color: #a79d8e;
          background: #f4f1ec;
          padding: 5px 7px;
          border-radius: 5px;
        }

        .vd-sidebar-bottom {
          margin-top: auto;
        }

        .vd-help {
          padding: 18px;
          border-radius: 12px;
          background: #faf7f1;
          border: 1px solid #f0e7d8;
          margin-bottom: 20px;
        }

        .vd-help-icon {
          display: grid;
          place-items: center;
          width: 32px;
          height: 32px;
          background: #f0e2c7;
          color: #9b742f;
          border-radius: 9px;
          font-size: 18px;
          margin-bottom: 12px;
        }

        .vd-help h4 {
          font-size: 13px;
          margin: 0 0 8px;
        }

        .vd-help p {
          font-size: 11px;
          line-height: 1.7;
          color: var(--vd-muted);
          margin: 0 0 13px;
        }

        .vd-help a {
          color: #9b742f;
          font-size: 11px;
          font-weight: bold;
          text-decoration: none;
        }

        .vd-logout {
          display: flex;
          align-items: center;
          gap: 12px;
          width: 100%;
          padding: 14px;
          border: 0;
          background: transparent;
          color: #7d7468;
          font-size: 13px;
          cursor: pointer;
          border-radius: 9px;
        }

        .vd-logout:hover {
          background: #f8f3ed;
          color: #9b742f;
        }

        .vd-logout span {
          font-size: 20px;
        }

        .vd-sidebar-foot {
          border-top: 1px solid var(--vd-border);
          margin-top: 10px;
          padding: 18px 12px 0;
          font-size: 9px;
          letter-spacing: 1.5px;
          color: #b4ac9f;
        }

        .vd-main {
          flex: 1;
          min-width: 0;
        }

        .vd-topbar {
          height: 83px;
          padding: 0 5%;
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: rgba(255, 255, 255, 0.8);
          border-bottom: 1px solid var(--vd-border);
        }

        .vd-breadcrumb {
          color: #a39b90;
          font-size: 12px;
        }

        .vd-breadcrumb span {
          margin: 0 10px;
          color: #d1c6b8;
        }

        .vd-top-right {
          display: flex;
          align-items: center;
          gap: 20px;
        }

        .vd-live {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 11px;
          color: #776e63;
        }

        .vd-live span,
        .vd-store-status i,
        .vd-welcome-badge strong i {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #4b9a68;
          display: inline-block;
        }

        .vd-avatar {
          display: grid;
          place-items: center;
          width: 39px;
          height: 39px;
          border-radius: 50%;
          background: #f2e6d0;
          color: #8d692b;
          font-family: Georgia, serif;
          font-size: 18px;
          border: 1px solid #e7d5b5;
        }

        .vd-content {
          width: 100%;
          max-width: 1450px;
          margin: 0 auto;
          padding: 45px 5% 30px;
        }

        .vd-welcome {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 25px;
          flex-wrap: wrap;
          margin-bottom: 35px;
        }

        .vd-eyebrow {
          font-size: 10px;
          letter-spacing: 2.1px;
          color: var(--vd-gold);
          font-weight: bold;
          margin: 0 0 15px;
        }

        .vd-welcome h1 {
          font-family: Georgia, "Times New Roman", serif;
          font-weight: 400;
          font-size: clamp(34px, 3.2vw, 48px);
          line-height: 1.15;
          letter-spacing: -1.5px;
          margin: 0;
        }

        .vd-welcome h1 span {
          color: #a17a35;
          font-style: italic;
        }

        .vd-welcome-sub {
          font-size: 13px;
          color: var(--vd-muted);
          margin: 18px 0 0;
          line-height: 1.7;
        }

        .vd-welcome-badge {
          display: flex;
          align-items: center;
          gap: 13px;
          background: #fff;
          border: 1px solid var(--vd-border);
          border-radius: 12px;
          padding: 16px 20px;
          min-width: 225px;
        }

        .vd-badge-icon {
          width: 39px;
          height: 39px;
          display: grid;
          place-items: center;
          border-radius: 10px;
          background: #f6eedf;
          color: #a17a35;
          font-size: 23px;
        }

        .vd-welcome-badge span {
          display: block;
          font-size: 9px;
          letter-spacing: 1.4px;
          color: #a69d90;
          margin-bottom: 8px;
        }

        .vd-welcome-badge strong {
          display: flex;
          align-items: center;
          gap: 7px;
          font-size: 12px;
          color: #4b8d60;
        }

        .vd-stats {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 18px;
          margin-bottom: 50px;
        }

        .vd-stat-card {
          background: #fff;
          border: 1px solid var(--vd-border);
          border-radius: 13px;
          padding: 24px;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }

        .vd-stat-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 12px 30px rgba(52, 39, 20, 0.05);
        }

        .vd-stat-top {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 10px;
        }

        .vd-stat-icon {
          width: 38px;
          height: 38px;
          display: grid;
          place-items: center;
          border-radius: 10px;
          font-size: 21px;
        }

        .vd-stat-icon.gold {
          background: #f7eddb;
          color: #a47c33;
        }

        .vd-stat-icon.beige {
          background: #f1eeea;
          color: #847665;
        }

        .vd-stat-icon.green {
          background: #e9f3eb;
          color: #4d8b5c;
        }

        .vd-stat-label {
          color: #a59c90;
          font-size: 9px;
          letter-spacing: 1.2px;
          font-weight: bold;
        }

        .vd-stat-card h3 {
          font-family: Georgia, serif;
          font-size: 30px;
          font-weight: 400;
          margin: 22px 0 8px;
        }

        .vd-stat-card p {
          font-size: 11px;
          line-height: 1.7;
          color: var(--vd-muted);
          margin: 0;
        }

        .vd-section {
          margin-bottom: 48px;
          scroll-margin-top: 30px;
        }

        .vd-section-heading {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 20px;
          flex-wrap: wrap;
          margin-bottom: 20px;
        }

        .vd-section-heading .vd-eyebrow {
          margin-bottom: 9px;
        }

        .vd-section-heading h2 {
          font-family: Georgia, "Times New Roman", serif;
          font-size: 27px;
          font-weight: 400;
          letter-spacing: -0.5px;
          margin: 0;
        }

        .vd-section-sub {
          font-size: 12px;
          color: var(--vd-muted);
          margin: 9px 0 0;
          line-height: 1.6;
        }

        .vd-verified {
          border: 1px solid #dcecdf;
          background: #f0f8f1;
          color: #4e8a5b;
          font-size: 11px;
          padding: 9px 13px;
          border-radius: 30px;
          font-weight: 600;
        }

        .vd-store-card {
          background: #fff;
          border: 1px solid var(--vd-border);
          border-radius: 15px;
          overflow: hidden;
        }

        .vd-store-cover {
          display: flex;
          align-items: center;
          gap: 20px;
          flex-wrap: wrap;
          background: linear-gradient(110deg, #28231d, #453a2c);
          color: white;
          padding: 30px;
        }

        .vd-store-monogram {
          width: 65px;
          height: 65px;
          display: grid;
          place-items: center;
          border-radius: 13px;
          background: #f0dfbf;
          color: #8c6525;
          font-family: Georgia, serif;
          font-size: 34px;
          flex-shrink: 0;
        }

        .vd-store-cover-text {
          flex: 1;
          min-width: 150px;
        }

        .vd-store-cover-text span {
          color: #d4b981;
          font-size: 9px;
          letter-spacing: 2px;
        }

        .vd-store-cover-text h3 {
          font-family: Georgia, serif;
          font-weight: 400;
          font-size: 25px;
          margin: 8px 0;
        }

        .vd-store-cover-text p {
          color: #c9c0b4;
          font-size: 11px;
          margin: 0;
        }

        .vd-store-status {
          display: flex;
          align-items: center;
          gap: 8px;
          border: 1px solid rgba(255,255,255,0.18);
          border-radius: 30px;
          padding: 10px 14px;
          color: #e1efdf;
          font-size: 11px;
        }

        .vd-store-details {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 0;
          padding: 10px 30px;
        }

        .vd-detail {
          display: flex;
          align-items: center;
          gap: 15px;
          padding: 22px 10px;
          border-bottom: 1px solid #f2eee8;
          min-width: 0;
        }

        .vd-detail:nth-last-child(-n+2) {
          border-bottom: 0;
        }

        .vd-detail-icon {
          display: grid;
          place-items: center;
          width: 40px;
          height: 40px;
          border-radius: 11px;
          background: #faf6ef;
          color: #a17a35;
          font-size: 19px;
          flex-shrink: 0;
        }

        .vd-detail label {
          display: block;
          font-size: 10px;
          color: #a39a8e;
          margin-bottom: 7px;
        }

        .vd-detail strong {
          display: block;
          font-size: 13px;
          font-weight: 600;
          overflow-wrap: anywhere;
        }

        .vd-coming {
          font-size: 9px;
          letter-spacing: 1.2px;
          color: #a17a35;
          background: #f6eddd;
          padding: 9px 12px;
          border-radius: 5px;
          font-weight: bold;
        }

        .vd-empty-card {
          background: #fff;
          border: 1px dashed #e5d9c8;
          border-radius: 15px;
          padding: 45px 25px;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
        }

        .vd-empty-icon {
          width: 58px;
          height: 58px;
          display: grid;
          place-items: center;
          background: #f7f0e4;
          color: #a17a35;
          border-radius: 17px;
          font-size: 28px;
          margin-bottom: 20px;
        }

        .vd-empty-card h3 {
          font-family: Georgia, serif;
          font-weight: 400;
          font-size: 22px;
          margin: 0 0 12px;
        }

        .vd-empty-card p {
          max-width: 420px;
          color: var(--vd-muted);
          font-size: 12px;
          line-height: 1.9;
          margin: 0;
        }

        .vd-feature-tag {
          margin-top: 20px;
          padding: 9px 13px;
          border-radius: 30px;
          background: #faf6ef;
          color: #9b742f;
          font-size: 10px;
          font-weight: 600;
        }

        .vd-orders-empty {
          padding: 35px 25px;
        }

.vd-orders-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.vd-order-card {
  background: #fff;
  border: 1px solid var(--vd-border);
  border-radius: 15px;
  padding: 25px;
}

.vd-order-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 15px;
  flex-wrap: wrap;
  padding-bottom: 20px;
  border-bottom: 1px solid var(--vd-border);
}

.vd-order-label {
  color: #a39a8e;
  font-size: 9px;
  letter-spacing: 1.5px;
}

.vd-order-top h3 {
  margin: 8px 0 0;
  font-size: 15px;
  overflow-wrap: anywhere;
}

.vd-order-status {
  padding: 8px 12px;
  background: #f6eddd;
  color: #946d29;
  border-radius: 20px;
  font-size: 11px;
  text-transform: capitalize;
}

.vd-order-details {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 22px;
  padding: 23px 0;
}

.vd-order-details label,
.vd-order-address label,
.vd-order-actions label {
  display: block;
  color: #a39a8e;
  font-size: 10px;
  margin-bottom: 8px;
}

.vd-order-details strong {
  display: block;
  font-size: 13px;
  overflow-wrap: anywhere;
  text-transform: capitalize;
}

.vd-order-details small {
  display: block;
  margin-top: 5px;
  color: var(--vd-muted);
  font-size: 11px;
  overflow-wrap: anywhere;
}

.vd-order-address {
  padding: 17px;
  background: #faf7f1;
  border-radius: 10px;
}

.vd-order-address p {
  font-size: 12px;
  line-height: 1.8;
  margin: 0;
  overflow-wrap: anywhere;
}

.vd-tracking {
  color: #946d29;
  font-size: 12px;
  margin-top: 15px;
}

.vd-order-actions {
  display: flex;
  align-items: center;
  gap: 15px;
  flex-wrap: wrap;
  margin-top: 20px;
}

.vd-order-actions label {
  margin: 0;
}

.vd-order-actions select {
  min-width: 190px;
  padding: 11px 14px;
  border: 1px solid var(--vd-border);
  border-radius: 8px;
  background: #fff;
  font-size: 12px;
  color: var(--vd-text);
}

.vd-order-actions select:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.vd-order-actions small {
  color: var(--vd-muted);
  font-size: 11px;
}

@media (max-width: 700px) {
  .vd-order-card {
    padding: 18px;
  }

  .vd-order-details {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 18px 12px;
  }

  .vd-order-actions {
    align-items: stretch;
    flex-direction: column;
  }

  .vd-order-actions select {
    width: 100%;
  }
}

        .vd-orders-empty .vd-empty-icon {
          width: 48px;
          height: 48px;
          font-size: 23px;
          margin-bottom: 15px;
        }

        .vd-footer {
          border-top: 1px solid var(--vd-border);
          padding-top: 25px;
          display: flex;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 12px;
          color: #aaa195;
          font-size: 10px;
        }

        .vd-mobile-toggle {
          display: none;
          border: 1px solid var(--vd-border);
          border-radius: 8px;
          background: white;
          width: 40px;
          height: 40px;
          font-size: 20px;
          cursor: pointer;
        }

        .vd-overlay {
          display: none;
        }

        .vd-outfit-form {
  background: #fff;
  border: 1px solid var(--vd-border);
  border-radius: 15px;
  padding: 30px;
}

.vd-form-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 22px;
}

.vd-field {
  display: flex;
  flex-direction: column;
  gap: 9px;
  min-width: 0;
}

.vd-field-full {
  grid-column: 1 / -1;
}

.vd-field label {
  font-size: 12px;
  font-weight: 600;
  color: #51483d;
}

.vd-field input,
.vd-field select,
.vd-field textarea {
  width: 100%;
  padding: 13px 15px;
  border: 1px solid #e6dfd5;
  border-radius: 9px;
  background: #fdfcfb;
  color: #211e19;
  font-family: Arial, sans-serif;
  font-size: 13px;
  outline: none;
}

.vd-field input:focus,
.vd-field select:focus,
.vd-field textarea:focus {
  border-color: #b38b48;
  box-shadow: 0 0 0 3px rgba(179, 139, 72, 0.1);
}

.vd-field textarea {
  resize: vertical;
}

.vd-field small {
  color: #888176;
  font-size: 11px;
}

.vd-submit-btn {
  margin-top: 25px;
  width: 100%;
  padding: 16px;
  border: 0;
  border-radius: 9px;
  background: #29231c;
  color: white;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: 0.2s ease;
}

.vd-submit-btn:hover {
  background: #a17a35;
}

.vd-submit-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.vd-form-error,
.vd-form-success {
  margin-top: 20px;
  padding: 14px;
  border-radius: 8px;
  font-size: 13px;
}

.vd-form-error {
  color: #a12626;
  background: #fff0f0;
}

.vd-form-success {
  color: #276b3c;
  background: #edf8ef;
}

@media (max-width: 560px) {
  .vd-outfit-form {
    padding: 20px 16px;
  }

  .vd-form-grid {
    grid-template-columns: 1fr;
  }

  .vd-field-full {
    grid-column: auto;
  }
}

        @media (max-width: 1100px) {
          .vd-sidebar {
            width: 235px;
          }

          .vd-content {
            padding-left: 4%;
            padding-right: 4%;
          }

          .vd-stats {
            gap: 12px;
          }

          .vd-stat-card {
            padding: 19px;
          }
        }
          .vd-order-actions input {
  min-width: 190px;
  padding: 11px 14px;
  border: 1px solid var(--vd-border);
  border-radius: 8px;
  background: #fff;
  font-size: 12px;
}

.vd-order-actions button {
  padding: 11px 18px;
  border: none;
  border-radius: 8px;
  background: #171717;
  color: #fff;
  font-size: 12px;
  cursor: pointer;
}

.vd-order-actions button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

        @media (max-width: 850px) {
          .vd-sidebar {
            position: fixed;
            left: 0;
            top: 0;
            bottom: 0;
            transform: translateX(-100%);
            transition: transform 0.25s ease;
            box-shadow: none;
          }

          .vd-sidebar.vd-sidebar-open {
            transform: translateX(0);
            box-shadow: 15px 0 40px rgba(0,0,0,0.12);
          }

          .vd-mobile-toggle {
            display: block;
          }

          .vd-topbar {
            padding: 0 25px;
            gap: 15px;
          }

          .vd-breadcrumb {
            flex: 1;
          }

          .vd-overlay {
            display: block;
            position: fixed;
            inset: 0;
            z-index: 1000;
            background: rgba(20, 18, 15, 0.3);
            border: 0;
          }

          .vd-stats {
            grid-template-columns: 1fr;
          }

          .vd-stat-card {
            padding: 23px;
          }

          .vd-content {
            padding: 35px 25px;
          }
        }

        @media (max-width: 560px) {
          .vd-topbar {
            height: 70px;
            padding: 0 17px;
          }

          .vd-top-right {
            gap: 10px;
          }

          .vd-live {
            font-size: 10px;
          }

          .vd-avatar {
            width: 34px;
            height: 34px;
          }

          .vd-content {
            padding: 30px 17px;
          }

          .vd-welcome {
            align-items: flex-start;
            margin-bottom: 28px;
          }

          .vd-welcome h1 {
            font-size: 35px;
          }

          .vd-welcome-badge {
            width: 100%;
          }

          .vd-section-heading h2 {
            font-size: 24px;
          }

          .vd-store-cover {
            padding: 22px;
            gap: 15px;
          }

          .vd-store-monogram {
            width: 53px;
            height: 53px;
            font-size: 27px;
          }

          .vd-store-cover-text h3 {
            font-size: 21px;
          }

          .vd-store-status {
            margin-top: 5px;
          }

          .vd-store-details {
            grid-template-columns: 1fr;
            padding: 8px 20px;
          }

          .vd-detail:nth-last-child(-n+2) {
            border-bottom: 1px solid #f2eee8;
          }

          .vd-detail:last-child {
            border-bottom: 0;
          }

          .vd-empty-card {
            padding: 35px 20px;
          }

          .vd-footer {
            flex-direction: column;
          }
        }
          /* Inventory management */
.vd-inventory-list {
  margin-top: 40px;
}

.vd-inventory-list-heading {
  margin-bottom: 22px;
}

.vd-inventory-list-heading h2 {
  font-family: Georgia, serif;
  font-size: 28px;
  font-weight: 400;
  margin: 0 0 10px;
}

.vd-inventory-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 22px;
}

.vd-inventory-card {
  background: #fff;
  border: 1px solid #eee8df;
  border-radius: 15px;
  overflow: hidden;
  min-width: 0;
}

.vd-inventory-image {
  height: 230px;
  position: relative;
  background: #f5f0e8;
}

.vd-inventory-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.vd-no-image {
  height: 100%;
  display: grid;
  place-items: center;
  color: #888176;
  font-size: 13px;
}

.vd-status-badge {
  position: absolute;
  top: 12px;
  left: 12px;
  background: #fff;
  padding: 7px 12px;
  border-radius: 20px;
  font-size: 11px;
  text-transform: capitalize;
}

.vd-status-badge.approved {
  color: #267346;
  background: #e9f6ed;
}

.vd-status-badge.pending {
  color: #946d29;
  background: #fff4d9;
}

.vd-status-badge.rejected {
  color: #a83232;
  background: #ffebeb;
}

.vd-inventory-card-body {
  padding: 20px;
}

.vd-inventory-card-body h3 {
  font-size: 18px;
  margin: 0 0 8px;
}

.vd-inventory-category {
  color: #a17a36;
  font-size: 12px;
  margin: 0 0 12px;
}

.vd-inventory-description {
  color: #888176;
  font-size: 13px;
  line-height: 1.6;
  overflow-wrap: anywhere;
}

.vd-inventory-price {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  padding: 15px 0;
  border-top: 1px solid #eee8df;
  border-bottom: 1px solid #eee8df;
}

.vd-inventory-price div {
  display: flex;
  flex-direction: column;
  gap: 7px;
}

.vd-inventory-price span,
.vd-inventory-meta {
  font-size: 11px;
  color: #888176;
}

.vd-inventory-price strong {
  font-size: 17px;
  color: #211e19;
}

.vd-inventory-meta {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 8px;
  padding: 15px 0;
}

.vd-availability-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 13px;
  padding: 14px 0;
  border-top: 1px solid #eee8df;
}

.vd-toggle {
  width: 44px;
  height: 24px;
  padding: 3px;
  border: none;
  border-radius: 30px;
  background: #ccc5ba;
  cursor: pointer;
  transition: 0.2s;
}

.vd-toggle span {
  display: block;
  width: 18px;
  height: 18px;
  background: white;
  border-radius: 50%;
  transition: 0.2s;
}

.vd-toggle.on {
  background: #4b9a68;
}

.vd-toggle.on span {
  transform: translateX(20px);
}

.vd-toggle:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.vd-inventory-actions {
  display: flex;
  gap: 10px;
  margin-top: 10px;
}

.vd-edit-btn,
.vd-delete-btn,
.vd-cancel-btn {
  padding: 12px 14px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
}

.vd-edit-btn {
  flex: 1;
  border: 1px solid #e7d5b5;
  background: #f7f0e4;
  color: #946d29;
}

.vd-delete-btn {
  border: 1px solid #f0d5d5;
  background: #fff5f5;
  color: #b33a3a;
}

.vd-delete-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Edit modal */
.vd-modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 2000;
  background: rgba(20, 18, 15, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.vd-edit-modal {
  width: 100%;
  max-width: 760px;
  max-height: 90vh;
  overflow-y: auto;
  background: #fff;
  border-radius: 16px;
  padding: 28px;
}

.vd-modal-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 25px;
}

.vd-modal-heading h2 {
  font-family: Georgia, serif;
  font-weight: 400;
  font-size: 30px;
  margin: 0;
}

.vd-modal-close {
  width: 38px;
  height: 38px;
  border: 1px solid #eee8df;
  border-radius: 50%;
  background: #faf8f4;
  font-size: 25px;
  cursor: pointer;
}

.vd-modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 22px;
}

.vd-cancel-btn {
  background: white;
  border: 1px solid #eee8df;
  color: #777066;
}

.vd-modal-actions .vd-submit-btn {
  margin: 0;
}

@media (max-width: 1100px) {
  .vd-inventory-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 600px) {
  .vd-inventory-grid {
    grid-template-columns: 1fr;
  }

  .vd-inventory-image {
    height: 260px;
  }

  .vd-edit-modal {
    padding: 20px;
  }

  .vd-modal-heading h2 {
    font-size: 25px;
  }

  .vd-inventory-actions {
    flex-wrap: wrap;
  }
}

.size-options {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 12px;
}

.size-option {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 12px;
  border: 1px solid #e8dfd2;
  border-radius: 10px;
  background: #fff;
}

.size-option.selected {
  border-color: #b58b42;
  background: #faf7f1;
}

.size-button {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  font-size: 14px;
}

.size-button input {
  accent-color: #b58b42;
}

.size-quantity-wrapper {
  display: flex;
  flex-direction: column;
  gap: 5px;
  font-size: 12px;
}

.size-quantity {
  width: 90px;
  padding: 8px;
  border: 1px solid #ddd2c2;
  border-radius: 6px;
}

.size-help {
  display: block;
  margin-top: 10px;
  color: #8a6a39;
}

.vd-modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
}



.size-check {
  display: flex;
  align-items: center;
  justify-content: center;

  width: 20px;
  height: 20px;

  border: 1px solid #cfc6b8;
  border-radius: 5px;

  font-size: 12px;
  color: white;

  transition: all 0.2s ease;
}

.size-option.selected .size-check {
  background: #b8860b;
  border-color: #b8860b;
}

.size-quantity {
  width: 62px;

  padding: 7px 8px;

  border: 1px solid #ddd4c6;
  border-radius: 7px;

  background: white;

  font-size: 13px;
  text-align: center;
}

.size-help {
  display: block;
  margin-top: 8px;

  color: #9a9185;
  font-size: 12px;
}
      `}</style>
    </div>
  );
}

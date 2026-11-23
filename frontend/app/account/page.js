
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import "./account.css";

export default function AccountPage() {
  const router = useRouter();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
  });
    const [wishlist, setWishlist] = useState([]);

const getWishlistKey = () => {
  const storedUser = localStorage.getItem("user");

  if (!storedUser) return null;

  try {
    const user = JSON.parse(storedUser);

    return `wishlist_${user._id || user.id || user.email}`;
  } catch {
    return null;
  }
};

useEffect(() => {
  const loadWishlist = () => {
    try {
      const wishlistKey = getWishlistKey();

      if (!wishlistKey) {
        setWishlist([]);
        return;
      }

      const saved = JSON.parse(
        localStorage.getItem(wishlistKey) || "[]"
      );

      setWishlist(Array.isArray(saved) ? saved : []);
    } catch {
      setWishlist([]);
    }
  };

  loadWishlist();

  window.addEventListener("wishlistUpdated", loadWishlist);
  window.addEventListener("storage", loadWishlist);

  return () => {
    window.removeEventListener("wishlistUpdated", loadWishlist);
    window.removeEventListener("storage", loadWishlist);
  };
}, []);

const removeFromWishlist = (outfitId) => {
  try {
    const wishlistKey = getWishlistKey();

    if (!wishlistKey) return;

    const savedWishlist = JSON.parse(
      localStorage.getItem(wishlistKey) || "[]"
    );

    const updatedWishlist = savedWishlist.filter(
      (item) => String(item._id || item.id) !== String(outfitId)
    );

    localStorage.setItem(
      wishlistKey,
      JSON.stringify(updatedWishlist)
    );

    setWishlist(updatedWishlist);

    window.dispatchEvent(
      new Event("wishlistUpdated")
    );
  } catch (error) {
    console.error("Error removing from wishlist:", error);
  }
};
// Scroll to Wishlist when opened from Navbar
useEffect(() => {
  const scrollToWishlist = () => {
    const wishlist = document.getElementById("wishlist");

    if (wishlist) {
      wishlist.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  };

  if (window.location.hash === "#wishlist") {
    const timer = setTimeout(scrollToWishlist, 1000);

    return () => clearTimeout(timer);
  }
}, []);
  // Fetch customer profile
  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        router.replace("/login");
        return;
      }

      try {
        const response = await fetch(
          "http://localhost:5000/api/auth/profile",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();

        if (!response.ok) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");

          window.dispatchEvent(new Event("authChange"));
          router.replace("/login");
          return;
        }

        setUser(data.user);

        setFormData({
          name: data.user.name || "",
          phone: data.user.phone || "",
        });
      } catch {
        setError("Unable to load your profile. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [router]);

  // Handle form changes
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Save updated profile
  const handleSave = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!formData.name.trim()) {
      setError("Please enter your full name.");
      return;
    }

    setSaving(true);

    try {
      const token = localStorage.getItem("token");

      const response = await fetch(
        "http://localhost:5000/api/auth/profile",
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            name: formData.name.trim(),
            phone: formData.phone.trim(),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Failed to update profile.");
        return;
      }

      // Update page with saved profile
      setUser(data.user);

      setFormData({
        name: data.user.name || "",
        phone: data.user.phone || "",
      });

      // Update saved user for Navbar
      const savedUser = JSON.parse(
        localStorage.getItem("user") || "{}"
      );

      const updatedUser = {
        ...savedUser,
        name: data.user.name,
        email: data.user.email,
        phone: data.user.phone,
        role: data.user.role,
      };

      localStorage.setItem(
        "user",
        JSON.stringify(updatedUser)
      );

      // Notify Navbar in the same tab
      window.dispatchEvent(new Event("authChange"));

      setIsEditing(false);
      setSuccess("Your profile has been updated successfully!");
    } catch {
      setError("Unable to connect to the server. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  // Cancel editing
  const handleCancel = () => {
    setFormData({
      name: user?.name || "",
      phone: user?.phone || "",
    });

    setIsEditing(false);
    setError("");
    setSuccess("");
  };

  // Logout
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    window.dispatchEvent(new Event("authChange"));

    router.push("/");
    router.refresh();
  };

  if (loading) {
    return (
      <main className="account-loading">
        <div className="account-loader"></div>
        <p>Curating your account...</p>
      </main>
    );
  }

  if (error && !user) {
    return (
      <main className="account-loading">
        <p>{error}</p>

        <button
          className="account-primary-btn"
          onClick={() => window.location.reload()}
        >
          Try Again
        </button>
      </main>
    );
  }

  if (!user) return null;

  const firstName =
    user.name?.trim().split(" ")[0] || "Customer";

  const initial =
    user.name?.trim().charAt(0).toUpperCase() || "C";

  return (
    <main className="account-page">
      <div className="account-glow"></div>

      <div className="account-wrapper">

        {/* Breadcrumb */}
        <div className="account-breadcrumb">
          <Link href="/">Home</Link>
          <span>/</span>
          <span>My Account</span>
        </div>

        {/* Page heading */}
        <section className="account-heading">
          <div>
            <span className="account-eyebrow">
              THE FASHRENTT EXPERIENCE
            </span>

            <h1>
              Your style.
              <br />
              <span>Your space.</span>
            </h1>

            <p>
              Everything you need, all in one place.
              Welcome to your personal FashRentt space.
            </p>
          </div>

          <div className="account-heading-decoration">
            <span>F</span>
            <small>STYLE • RENT • REPEAT</small>
          </div>
        </section>

        {/* Account layout */}
        <section className="account-layout">

          {/* Sidebar */}
          <aside className="account-sidebar">
            <div className="account-avatar">
              {initial}
            </div>

            <h2>{user.name}</h2>

            <p className="account-member-label">
              FASHRENTT MEMBER
            </p>

            <div className="account-sidebar-divider"></div>

            <div className="account-menu-item active">
              <span>♧</span>
              My Profile
            </div>

            <Link
              href="/"
              className="account-menu-item"
            >
              <span>⌕</span>
              Explore Collection
            </Link>

            <Link
  href="/addresses"
  className="account-menu-item"
>
  <span>⌖</span>
  Address Book
</Link>
<Link
  href="/account#wishlist"
  className="account-menu-item"
>
  <span>♡</span>
  My Wishlist
</Link>
<Link
  href="/my-bookings"
  style={{
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "12px",
    padding: "20px 32px",
    background: "#1b1a18",
    color: "#ffffff",
    borderRadius: "6px",
    textDecoration: "none",
    fontSize: "15px",
    fontWeight: "500",
    transition: "all 0.3s ease",
  }}
>
  My Bookings
  <span style={{ color: "#d4a72c" }}>↗</span>
</Link>

            <button
              className="account-sidebar-logout"
              onClick={handleLogout}
            >
              Log out <span>↗</span>
            </button>
          </aside>

          {/* Main profile section */}
          <div className="account-main">

            <div className="account-card-header">
              <div>
                <span className="account-section-label">
                  PERSONAL DETAILS
                </span>

                <h2>My Profile</h2>

                <p>
                  Manage your personal information.
                </p>
              </div>

              <div className="account-status">
                <span></span>
                Active Member
              </div>
            </div>

            {/* Welcome banner */}
            <div className="account-profile-banner">
              <div className="account-banner-icon">
                ✦
              </div>

              <div>
                <h3>Welcome back, {firstName}!</h3>

                <p>
                  Your next favourite outfit is just around the corner.
                </p>
              </div>
            </div>

            {/* Success message */}
            {success && (
              <div className="account-message account-success">
                ✓ {success}
              </div>
            )}

            {/* Error message */}
            {error && (
              <div className="account-message account-error">
                {error}
              </div>
            )}

            {/* Edit mode */}
            {isEditing ? (
              <form
                className="account-edit-form"
                onSubmit={handleSave}
              >
                <h3>Edit Personal Details</h3>

                <p className="account-edit-description">
                  Update your details below and save your changes.
                </p>

                <div className="account-form-group">
                  <label htmlFor="name">
                    FULL NAME
                  </label>

                  <input
                    id="name"
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter your full name"
                    required
                    maxLength={100}
                  />
                </div>

                <div className="account-form-group">
                  <label htmlFor="email">
                    EMAIL ADDRESS
                  </label>

                  <input
                    id="email"
                    type="email"
                    value={user.email || ""}
                    disabled
                  />

                  <small>
                    Email address cannot be changed here.
                  </small>
                </div>

                <div className="account-form-group">
                  <label htmlFor="phone">
                    PHONE NUMBER
                  </label>

                  <input
                    id="phone"
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="Enter your phone number"
                    maxLength={15}
                  />
                </div>

                <div className="account-edit-actions">
                  <button
                    type="button"
                    className="account-cancel-btn"
                    onClick={handleCancel}
                    disabled={saving}
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="account-primary-btn"
                    disabled={saving}
                  >
                    {saving ? "Saving..." : "Save Changes"}
                    {!saving && <span>↗</span>}
                  </button>
                </div>
              </form>
            ) : (
              <>
                {/* Profile details */}
                <div className="account-details-grid">

                  <div className="account-detail">
                    <span className="account-detail-icon">
                      ♙
                    </span>

                    <div>
                      <label>FULL NAME</label>
                      <p>{user.name || "Not provided"}</p>
                    </div>
                  </div>

                  <div className="account-detail">
                    <span className="account-detail-icon">
                      ✉
                    </span>

                    <div>
                      <label>EMAIL ADDRESS</label>
                      <p>{user.email || "Not provided"}</p>
                    </div>
                  </div>

                  <div className="account-detail">
                    <span className="account-detail-icon">
                      ☏
                    </span>

                    <div>
                      <label>PHONE NUMBER</label>
                      <p>{user.phone || "Not provided"}</p>
                    </div>
                  </div>

                  <div className="account-detail">
                    <span className="account-detail-icon">
                      ✧
                    </span>

                    <div>
                      <label>MEMBERSHIP</label>
                      <p>FashRentt Customer</p>
                    </div>
                  </div>

                </div>

                {/* Footer */}
                <div className="account-card-footer">
                  <p>
                    Keep your personal details up to date.
                  </p>

                  <button
                    type="button"
                    className="account-primary-btn"
                    onClick={() => {
                      setIsEditing(true);
                      setError("");
                      setSuccess("");
                    }}
                  >
                    Edit Profile <span>✎</span>
                  </button>
                </div>
              </>
            )}

          </div>
        </section>
        {/* My Wishlist Section */}
<section
  id="wishlist"
  className="account-main account-wishlist"
>
  <div className="account-card-header">
    <div>
      <span className="account-section-label">
        YOUR SAVED STYLES
      </span>

      <h2>My Wishlist ♡</h2>

      <p>
        Your favourite looks, saved for your next occasion.
      </p>
    </div>
  </div>

  {wishlist.length === 0 ? (
    <div className="wishlist-empty">
      <span className="wishlist-heart">♡</span>

      <h3>Your wishlist is waiting for a little fashion magic.</h3>

      <p>
        Save the outfits you love and find them here whenever
        you're ready to rent your next iconic look.
      </p>

      <Link href="/" className="account-primary-btn">
        Explore Collection <span>↗</span>
      </Link>
    </div>
  ) : (
    <div className="wishlist-grid">
      {wishlist.map((outfit) => (
        <div
          className="wishlist-card"
          key={outfit._id || outfit.id}
        >
          <img
            src={
              outfit.images?.[0] ||
              outfit.image ||
              "/images/ethnic.png"
            }
            alt={outfit.name}
          />

          <div className="wishlist-card-info">
            <h3>{outfit.name}</h3>

            <p>
              ₹{outfit.rentalPrice} / rental
            </p>

            <button
             type="button"
             className="remove-wishlist-btn"
             onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();

              removeFromWishlist(outfit._id || outfit.id);
            }}
          >
            ♥ Remove from Wishlist
            </button>
            <Link
              href={`/outfits/${outfit._id || outfit.id}`}
              className="account-primary-btn"
            >
              View Outfit ↗
            </Link>
          </div>
        </div>
      ))}
    </div>
  )}
</section>

        {/* Bottom note */}
        <div className="account-bottom-note">
          <span>FASHRENTT</span>

          <p>
            Rent less. Wear more. Make every moment memorable.
          </p>
        </div>

      </div>
    </main>
  );
}; 
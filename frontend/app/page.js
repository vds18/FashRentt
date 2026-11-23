"use client";

import Link from "next/link";
import HowItWorks from "../components/HowItWorks";

const categories = [
  {
    name: "Women",
    image: "/images/women.jpg",
    subtitle: "Elegance in every outfit",
  },
  {
    name: "Men",
    image: "/images/men.jpg",
    subtitle: "Style that speaks",
  },
  {
    name: "Party Wear",
    image: "/images/party.png",
    subtitle: "Own every occasion",
  },
  {
    name: "Ethnic Wear",
    image: "/images/ethnic.png",
    subtitle: "Tradition meets elegance",
  },
    {
  name: "Western Wear",
  image: "/images/western-wear.png",
  subtitle: "Chic & Trendy Styles",
},
{
  name: "Accessories",
  image: "/images/accessories.png",
  subtitle: "Complete Your Look",
},

];

export default function Home() {
// Add or remove outfit from Wishlist
const toggleWishlist = (outfit) => {
  const outfitId = String(outfit._id || outfit.id);

  if (!outfitId || outfitId === "undefined") return;

  const wishlistKey = getWishlistKey();

  if (!wishlistKey) {
    alert("Please login to use Wishlist.");
    return;
  }

  let savedWishlist = [];

  try {
    const parsed = JSON.parse(
      localStorage.getItem(wishlistKey) || "[]"
    );

    savedWishlist = Array.isArray(parsed) ? parsed : [];
  } catch {
    savedWishlist = [];
  }

  const isSaved = savedWishlist.some(
    (item) =>
      String(item._id || item.id) === outfitId
  );

  const updatedWishlist = isSaved
    ? savedWishlist.filter(
        (item) =>
          String(item._id || item.id) !== outfitId
      )
    : [...savedWishlist, outfit];

  localStorage.setItem(
    wishlistKey,
    JSON.stringify(updatedWishlist)
  );

  setWishlist(updatedWishlist);

  window.dispatchEvent(
    new Event("wishlistUpdated")
  );
};
// Check if outfit is in Wishlist
const isWishlisted = (outfit) =>
  wishlist.some(
    (item) =>
      (item._id || item.id) === (outfit._id || outfit.id)
  );

  return (
    <main>
      {/* HERO SECTION */}
      <section className="hero" id="explore">
        <p className="hero-tagline">
          RENT. ROCK. REPEAT.
        </p>

        <h1 className="hero-title">
          Welcome to
          <br />
          <span>FashRentt</span>
        </h1>

<p
  className="hero-description"
  style={{
    fontSize: "20px",
    fontWeight: 500,
    lineHeight: 1.8,
    letterSpacing: "1px",
    color: "#2B2118",
    textShadow: "0 1px 8px rgba(255,255,255,0.7)",
    maxWidth: "650px",
    margin: "0 auto",
    fontStyle: "italic",
  }}
>
  Wear the moment. Own the spotlight. Rent your next iconic look with FashRentt.
</p>
        <div className="hero-buttons">
          <a
            href="#categories"
            className="primary-btn"
          >
            Explore Outfits
          </a>

          {/* HOW IT WORKS BUTTON */}
          <a
            href="#how-it-works"
            className="secondary-btn"
          >
            How It Works
          </a>

          {/* MY BOOKINGS BUTTON */}
          <Link
            href="/my-bookings"
            className="secondary-btn"
          >
            My Bookings ↗
          </Link>
        </div>
      </section>
      {/* CATEGORIES SECTION */}
<section
  className="categories-section"
  id="categories"
>
  <div className="categories-header">
    <p className="section-eyebrow">
      CURATED FOR EVERY OCCASION
    </p>

    <h2 className="categories-title">
      Find Your <span>Perfect Look</span>
    </h2>

    <p className="categories-description">
      From everyday elegance to unforgettable
      celebrations, discover your next statement outfit.
    </p>
  </div>

  <div className="categories-grid">
    {categories.map((category) => (
      <Link
        href={`/category/${encodeURIComponent(category.name)}`}
        className="category-card"
        key={category.name}
        aria-label={`Explore ${category.name}`}
      >
        <div className="category-image-wrapper">
          <img
            src={category.image}
            alt={`${category.name} fashion collection`}
            className="category-image"
          />
        </div>

        <div className="category-details">
          <div className="category-text">
            <p className="category-subtitle">
              {category.subtitle}
            </p>

            <h3 className="category-title">
              {category.name}
            </h3>
          </div>

          <span className="category-link">
            EXPLORE COLLECTION
            <span className="category-arrow">
              ↗
            </span>
          </span>
        </div>
      </Link>
    ))}
  </div>
</section>


      {/* HOW IT WORKS - NEW SECTION */}
      <HowItWorks />

      {/* FOR STORES - VENDOR PARTNERSHIP */}
      <section
        id="stores"
        style={{
          background: "#211e1b",
          color: "#ffffff",
          padding: "90px 24px",
          margin: "60px 0",
          textAlign: "center",
          borderRadius: "18px",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            maxWidth: "850px",
            margin: "0 auto",
          }}
        >
          <p
            style={{
              color: "#d4a72c",
              fontSize: "12px",
              letterSpacing: "5px",
              fontWeight: "600",
              marginBottom: "24px",
            }}
          >
            FASHRENTT PARTNER PROGRAM
          </p>

          <h2
            style={{
              fontFamily: "Georgia, serif",
              fontSize: "clamp(36px, 5vw, 60px)",
              lineHeight: "1.15",
              fontWeight: "400",
              marginBottom: "25px",
            }}
          >
            Your Collection.
            <br />
            <span style={{ color: "#d4a72c" }}>
              Our Platform.
            </span>
          </h2>

          <p
            style={{
              color: "#d2ccc4",
              fontSize: "16px",
              lineHeight: "1.9",
              maxWidth: "650px",
              margin: "0 auto 35px",
            }}
          >
            Own a fashion store or boutique? Partner with
            FashRentt to showcase your collection, reach
            customers, and grow your rental business.
            Let us help bring your styles to more wardrobes.
          </p>

          {/* BENEFITS */}
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              flexWrap: "wrap",
              gap: "15px",
              marginBottom: "40px",
            }}
          >
            {[
              "Reach More Customers",
              "Showcase Your Collection",
              "Grow Your Rental Business",
            ].map((benefit) => (
              <div
                key={benefit}
                style={{
                  border: "1px solid #51483c",
                  borderRadius: "50px",
                  padding: "12px 20px",
                  color: "#e8dfd2",
                  fontSize: "13px",
                }}
              >
                ✦ {benefit}
              </div>
            ))}
          </div>

          {/* BUTTONS */}
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              flexWrap: "wrap",
              gap: "16px",
            }}
          >
            <a
              href="/vendor/register"
              style={{
                background: "#d4a72c",
                color: "#211e1b",
                padding: "17px 30px",
                textDecoration: "none",
                fontWeight: "600",
                fontSize: "14px",
                borderRadius: "4px",
                display: "inline-block",
              }}
            >
              Become a Vendor ↗
            </a>

            <a
              href="/vendor-login"
              style={{
                background: "transparent",
                color: "#ffffff",
                padding: "16px 30px",
                textDecoration: "none",
                fontWeight: "600",
                fontSize: "14px",
                border: "1px solid #a79b8a",
                borderRadius: "4px",
                display: "inline-block",
              }}
            >
              Vendor Login
            </a>
          </div>

          <p
            style={{
              color: "#a79b8a",
              fontSize: "12px",
              marginTop: "25px",
            }}
          >
            Join the FashRentt partner network.
          </p>
        </div>
      </section>

      {/* FOOTER */}
<footer className="site-footer">

  {/* FOOTER CTA */}
  <div className="footer-cta">
    <div>
      <p className="footer-eyebrow">
        YOUR NEXT LOOK AWAITS
      </p>

      <h2>
        Dress for the
        <span> moment.</span>
      </h2>

      <p className="footer-cta-text">
        Discover statement styles, rent what you love,
        and make every occasion memorable.
      </p>
    </div>

    <a href="#categories" className="footer-cta-btn">
      Explore Collection ↗
    </a>
  </div>


  {/* FOOTER MAIN */}
  <div className="footer-main">

    {/* BRAND */}
    <div className="footer-brand">

      <a href="/" className="footer-logo">
        <img
          src="/logo/fashrentt-logo.png"
          alt="FashRentt"
        />

        <span>FashRentt</span>
      </a>

      <p className="footer-tagline">
        RENT. ROCK. REPEAT.
      </p>

      <p className="footer-description">
        Fashion rentals made effortless. Discover
        statement looks, rent your favourites, and
        create unforgettable moments without
        owning every outfit.
      </p>

      <div className="footer-socials">
        <a
          href="https://www.instagram.com/fash_rentt01/"
          target="_blank"
          rel="noreferrer"
          aria-label="Instagram"
        >
          Instagram ↗
        </a>

        <a
          href="https://whatsapp.com/channel/0029Vb8LTQD6WaKkmgYghT2c"
          target="_blank"
          rel="noreferrer"
          aria-label="WhatsApp"
        >
          Follow WhatsApp Channel↗
        </a>
      </div>

    </div>


    {/* EXPLORE */}
    <div className="footer-column">

      <h3>Explore</h3>

      <a href="/">Home</a>

      <a href="#categories">
        Collection
      </a>

      <a href="#how-it-works">
        How It Works
      </a>

      <a href="/account#wishlist">
        Wishlist
      </a>

      <a href="/my-bookings">
        My Bookings
      </a>

    </div>


    {/* CUSTOMER */}
    <div className="footer-column">

      <h3>Customer</h3>

      <a href="/account">
        My Account
      </a>

      <a href="/my-bookings">
        My Bookings
      </a>

      <a href="/account#wishlist">
        Saved Styles
      </a>

      <a href="/addresses">
        Address Book
      </a>

      <a href="#categories">
        Rent an Outfit
      </a>

    </div>


    {/* STORES */}
    <div className="footer-column">

      <h3>For Stores</h3>

      <a href="#stores">
        Partner With Us
      </a>

      <a href="/vendor/register">
        Become a Vendor
      </a>

      <a href="/vendor-login">
        Vendor Login
      </a>

      <a href="#stores">
        Grow Your Business
      </a>

    </div>

  </div>


  {/* FOOTER BOTTOM */}
  <div className="footer-bottom">

    <p>
      © 2026 FashRentt. All rights reserved.
    </p>

    <p>
      Made for fashion. Built for moments.
    </p>

    <a href="#explore">
      Back to top ↑
    </a>

  </div>

</footer>
    </main>
  );
}
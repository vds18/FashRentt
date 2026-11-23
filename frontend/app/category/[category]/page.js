"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

const categoryImages = {
  Women: "/images/women.jpg",
  Men: "/images/men.jpg",
  "Party Wear": "/images/party.png",
  "Ethnic Wear": "/images/ethnic.png",
  "Western Wear": "/images/western-wear.png",
  Accessories: "/images/accessories.png",
};

export default function CategoryPage() {
  const params = useParams();

  const categoryName = decodeURIComponent(params.category || "");

  const [outfits, setOutfits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [wishlist, setWishlist] = useState([]);
  const [priceFilter, setPriceFilter] = useState("all");
  const [sizeFilter, setSizeFilter] = useState("all");
  const [colorFilter, setColorFilter] = useState("all");
  const [occasionFilter, setOccasionFilter] = useState("all");
  const [durationFilter, setDurationFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");

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

      setWishlist(
        Array.isArray(saved) ? saved : []
      );
    } catch {
      setWishlist([]);
    }
  };

  loadWishlist();

  window.addEventListener(
    "wishlistUpdated",
    loadWishlist
  );

  window.addEventListener(
    "storage",
    loadWishlist
  );

  return () => {
    window.removeEventListener(
      "wishlistUpdated",
      loadWishlist
    );

    window.removeEventListener(
      "storage",
      loadWishlist
    );
  };
}, []);

  // Fetch outfits
  useEffect(() => {
    const fetchOutfits = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          "http://localhost:5000/api/outfits"
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message || "Failed to fetch outfits"
          );
        }

        if (data.success) {
          const categoryOutfits = (data.outfits || []).filter(
            (outfit) => outfit.category === categoryName
          );

          setOutfits(categoryOutfits);
        } else {
          setOutfits([]);
        }
      } catch (err) {
        console.error("Error fetching outfits:", err);
        setError("Unable to load outfits. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    if (categoryName) {
      fetchOutfits();
    }
  }, [categoryName]);
const toggleWishlist = (outfit) => {
  const outfitId = String(
    outfit._id || outfit.id
  );

  if (!outfitId || outfitId === "undefined") {
    return;
  }

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

    savedWishlist = Array.isArray(parsed)
      ? parsed
      : [];
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
const isWishlisted = (outfit) => {
  const outfitId = String(
    outfit._id || outfit.id
  );

  return wishlist.some(
    (item) =>
      String(item._id || item.id) === outfitId
  );
};
// =========================
// FILTER + SORT LOGIC
// =========================

const filteredOutfits = outfits
  .filter((outfit) => {

    // PRICE
    if (priceFilter === "under500") {
      if (Number(outfit.rentalPrice) >= 500) {
        return false;
      }
    }

    if (priceFilter === "500to1000") {
      const price = Number(outfit.rentalPrice);

      if (price < 500 || price > 1000) {
        return false;
      }
    }

    if (priceFilter === "above1000") {
      if (Number(outfit.rentalPrice) <= 1000) {
        return false;
      }
    }


    // SIZE
    if (sizeFilter !== "all") {
      const hasSize = outfit.sizes?.some(
        (size) =>
          size.size === sizeFilter &&
          Number(size.quantity) > 0
      );

      if (!hasSize) {
        return false;
      }
    }


    // COLOR
if (colorFilter !== "all") {
  const outfitColors = Array.isArray(outfit.color)
    ? outfit.color
    : String(outfit.color || "")
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);

  const selectedColor = String(colorFilter)
    .trim()
    .toLowerCase();

  const hasColor = outfitColors.some(
    (color) =>
      String(color).trim().toLowerCase() === selectedColor
  );

  if (!hasColor) {
    return false;
  }
}
    // OCCASION
if (occasionFilter !== "all") {
  const outfitOccasion = String(outfit.occasion || "")
    .trim()
    .toLowerCase();

  const selectedOccasion = String(occasionFilter)
    .trim()
    .toLowerCase();

  if (!outfitOccasion.includes(selectedOccasion)) {
    return false;
  }
}
    // RENTAL DURATION
    if (durationFilter === "1to3") {
      const duration = Number(
        outfit.rentalDuration || 3
      );

      if (duration > 3) {
        return false;
      }
    }

    if (durationFilter === "4to7") {
      const duration = Number(
        outfit.rentalDuration || 3
      );

      if (duration < 4 || duration > 7) {
        return false;
      }
    }

    if (durationFilter === "above7") {
      const duration = Number(
        outfit.rentalDuration || 3
      );

      if (duration <= 7) {
        return false;
      }
    }

    return true;
  })
  .sort((a, b) => {

    // PRICE LOW → HIGH
    if (sortBy === "priceLow") {
      return (
        Number(a.rentalPrice) -
        Number(b.rentalPrice)
      );
    }


    // PRICE HIGH → LOW
    if (sortBy === "priceHigh") {
      return (
        Number(b.rentalPrice) -
        Number(a.rentalPrice)
      );
    }


    // NEWEST
    return (
      new Date(b.createdAt || 0) -
      new Date(a.createdAt || 0)
    );
  });
  const heroImage =
    categoryImages[categoryName] ||
    "/images/women.jpg";

  return (
    <main className="category-page">

      {/* =========================
          BREADCRUMB
      ========================== */}
      <div className="category-breadcrumb">
        <Link href="/">Home</Link>
        <span>›</span>
        <span>{categoryName}</span>
      </div>


      {/* =========================
          CATEGORY HERO
      ========================== */}
      <section className="category-hero">

        <div className="category-hero-content">

          <p className="category-eyebrow">
            FASHION RENTAL COLLECTION
          </p>

          <h1 className="category-hero-title">
            {categoryName}
          </h1>

          <div className="category-title-line"></div>

          <p className="category-hero-description">
            Discover stylish outfits available for rent
            in the {categoryName} collection. From
            everyday elegance to unforgettable occasions,
            find your next statement look.
          </p>

          <p className="category-hero-note">
            STYLE · RENT · REPEAT
          </p>

        </div>

        <div className="category-hero-image-wrapper">
          <img
            src={heroImage}
            alt={`${categoryName} collection`}
            className="category-hero-image"
          />

          <div className="hero-image-overlay-text">
            Style
            <br />
            Rent
            <br />
            Repeat
          </div>

        </div>

      </section>


      {/* =========================
          FILTER BAR
      ========================== */}
      {!loading && !error && outfits.length > 0 && (
        <section className="category-toolbar">

          <div className="filter-buttons">

  {/* PRICE */}
  <select
    className="filter-select"
    value={priceFilter}
    onChange={(e) =>
      setPriceFilter(e.target.value)
    }
  >
    <option value="all">Show All Prices</option>
    <option value="under500">
      Under ₹500
    </option>
    <option value="500to1000">
      ₹500 – ₹1000
    </option>
    <option value="above1000">
      ₹1000+
    </option>
  </select>


  {/* SIZE */}
  <select
    className="filter-select"
    value={sizeFilter}
    onChange={(e) =>
      setSizeFilter(e.target.value)
    }
  >
    <option value="all">All Sizes</option>
    <option value="S">S</option>
    <option value="M">M</option>
    <option value="L">L</option>
    <option value="XL">XL</option>
    <option value="Free Size">Free Size</option>

  </select>


  {/* COLOR */}
<select
  className="filter-select"
  value={colorFilter}
  onChange={(e) => setColorFilter(e.target.value)}
>
  <option value="all">Color</option>
  <option value="Black">Black</option>
  <option value="White">White</option>
  <option value="Red">Red</option>
  <option value="Blue">Blue</option>
  <option value="Green">Green</option>
  <option value="Pink">Pink</option>
  <option value="Yellow">Yellow</option>
  <option value="Orange">Orange</option>
  <option value="Purple">Purple</option>
  <option value="Gold">Gold</option>
  <option value="Silver">Silver</option>
  <option value="Beige">Beige</option>
  <option value="Brown">Brown</option>
  <option value="Grey">Grey</option>
  <option value="Multicolor">Multicolor</option>
</select>
  {/* OCCASION */}
<select
  className="filter-select"
  value={occasionFilter}
  onChange={(e) => setOccasionFilter(e.target.value)}
>
  <option value="all"> All Occasions</option>

  <option value="Wedding">Wedding</option>
  <option value="Party">Party</option>
  <option value="Festive">Festive</option>
  <option value="Birthday">Birthday</option>
  <option value="College Party">College Party</option>
  <option value="Dandiya">Dandiya</option>
  <option value="Diwali">Diwali</option>
  <option value="Engagement">Engagement</option>
</select>
  {/* RENTAL DURATION */}
  <select
    className="filter-select"
    value={durationFilter}
    onChange={(e) =>
      setDurationFilter(e.target.value)
    }
  >
    <option value="all">
      Rental Duration 
    </option>

    <option value="1to3">
      1–3 Days
    </option>

    <option value="4to7">
      4–7 Days
    </option>

    <option value="above7">
      7+ Days
    </option>
  </select>


  {/* CLEAR */}
  {(priceFilter !== "all" ||
    sizeFilter !== "all" ||
    colorFilter !== "all" ||
    occasionFilter !== "all" ||
    durationFilter !== "all") && (

    <button
      className="clear-filters-button"
      onClick={() => {
        setPriceFilter("all");
        setSizeFilter("all");
        setColorFilter("all");
        setOccasionFilter("all");
        setDurationFilter("all");
      }}
    >
      Clear
    </button>
  )}

</div>
        <div className="sort-wrapper">
  <span>Sort by:</span>

  <select
    className="sort-select"
    value={sortBy}
    onChange={(e) =>
      setSortBy(e.target.value)
    }
  >
    <option value="newest">
      Newest First
    </option>

    <option value="priceLow">
      Price: Low to High
    </option>

    <option value="priceHigh">
      Price: High to Low
    </option>
  </select>
</div>
        </section>
      )}


      {/* =========================
          COLLECTION HEADER
      ========================== */}
      {!loading && !error && outfits.length > 0 && (
        <div className="collection-heading">

          <div>
            <p className="collection-eyebrow">
              CURATED FOR YOU
            </p>

            <h2>
              {categoryName} Collection
            </h2>
          </div>

          <p className="outfit-count">
            Showing {filteredOutfits.length}{" "}
{filteredOutfits.length === 1
  ? "outfit"
  : "outfits"}
          </p>

        </div>
      )}
      {!loading && 
  !error && 
  outfits.length > 0 && 
  filteredOutfits.length === 0 && ( 
    <section className="category-status empty"> 
      <p className="category-eyebrow"> 
        NO MATCHES 
      </p> 
 
      <h2> 
        No outfits match your filters 
      </h2> 
 
      <p> 
        Try changing your filters to discover 
        more styles. 
      </p> 
 
      <button 
        className="status-button" 
        onClick={() => { 
          setPriceFilter("all"); 
          setSizeFilter("all"); 
          setColorFilter("all"); 
          setOccasionFilter("all"); 
          setDurationFilter("all"); 
        }} 
      > 
        Clear All Filters 
      </button> 
    </section> 
)}

      {/* =========================
          LOADING
      ========================== */}
      {loading && (
        <section className="category-status">
          <div className="loading-circle"></div>

          <p>
            Curating your collection...
          </p>
        </section>
      )}


      {/* =========================
          ERROR
      ========================== */}
      {!loading && error && (
        <section className="category-status">
          <h2>Something went wrong</h2>

          <p>{error}</p>

          <button
            onClick={() => window.location.reload()}
            className="status-button"
          >
            Try Again
          </button>
        </section>
      )}


      {/* =========================
          EMPTY
      ========================== */}
      {!loading && !error && outfits.length === 0 && (
        <section className="category-status empty">

          <p className="category-eyebrow">
            COMING SOON
          </p>

          <h2>
            No outfits available yet
          </h2>

          <p>
            We are adding beautiful new styles
            to this collection soon.
          </p>

          <Link
            href="/"
            className="status-button"
          >
            Explore Other Collections
            <span>↗</span>
          </Link>

        </section>
      )}


      {/* =========================
          OUTFIT GRID
      ========================== */}
      {!loading && !error && outfits.length > 0 && (

        <section className="outfit-collection">

          <div className="outfit-grid">

            {filteredOutfits.map((outfit) => (

              <article
                className="modern-outfit-card"
                key={outfit._id}
              >

                {/* IMAGE */}
                <div className="modern-outfit-image-wrapper">

                  {outfit.images?.length > 0 ? (

                    <img
                      src={outfit.images[0]}
                      alt={outfit.name}
                      className="modern-outfit-image"
                    />

                  ) : (

                    <div className="modern-image-placeholder">
                      Image Coming Soon
                    </div>

                  )}


                  {/* WISHLIST */}
                  <button
  type="button"
  className={`wishlist-button ${
    isWishlisted(outfit)
      ? "wishlisted"
      : ""
  }`}
  onClick={(e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(outfit);
  }}
  aria-label={
    isWishlisted(outfit)
      ? "Remove from wishlist"
      : "Add to wishlist"
  }
>
  {isWishlisted(outfit) ? "♥" : "♡"}
</button>
                </div>


                {/* CARD CONTENT */}
                <div className="modern-outfit-content">

                  <p className="modern-outfit-category">
                    {outfit.occasion ||
                      outfit.category ||
                      "FASHION RENTAL"}
                  </p>

                  <h3 className="modern-outfit-name">
                    {outfit.name}
                  </h3>

                  {outfit.description && (
                    <p className="modern-outfit-description">
                      {outfit.description}
                    </p>
                  )}


                  {/* PRICE */}
                  <div className="modern-price-row">

                    <div className="modern-rental-price">
                      ₹{outfit.rentalPrice}
                    </div>

                    {outfit.originalPrice &&
                      outfit.originalPrice >
                        outfit.rentalPrice && (
                        <div className="modern-original-price">
                          ₹{outfit.originalPrice}
                        </div>
                      )}

                  </div>


                  {/* SIZES */}
                  {outfit.sizes?.length > 0 && (

                    <div className="modern-sizes">

                      {outfit.sizes
                        .filter(
                          (size) => size.quantity > 0
                        )
                        .map((size) => (
                          <span
                            key={size.size}
                            className="size-pill"
                          >
                            {size.size}
                          </span>
                        ))}

                    </div>

                  )}


                  {/* RENT BUTTON */}
                  <Link
                    href={`/outfits/${outfit._id}`}
                    className="modern-rent-button"
                  >
                    VIEW DETAILS & RENT
                    <span>↗</span>
                  </Link>

                </div>

              </article>

            ))}

          </div>

        </section>

      )}

    </main>
  );
}
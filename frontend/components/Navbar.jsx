"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [user, setUser] = useState(null);
  const router = useRouter();

  // Detect the currently logged-in account
  const checkUser = useCallback(() => {
    if (typeof window === "undefined") return;

    // Check vendor login
    const vendorToken = localStorage.getItem("vendorToken");
    const savedVendor = localStorage.getItem("vendor");

    if (vendorToken && savedVendor) {
      try {
        const vendor = JSON.parse(savedVendor);

        setUser({
          ...vendor,
          name: vendor.name || vendor.shopName || "Vendor",
          role: "vendor",
          accountType: "vendor",
        });

        return;
      } catch {
        localStorage.removeItem("vendor");
      }
    }

    // Check customer or admin login
    const token = localStorage.getItem("token");
    const savedUser = localStorage.getItem("user");

    if (token && savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);

        setUser({
          ...parsedUser,
          name:
            parsedUser.name ||
            parsedUser.fullName ||
            parsedUser.email ||
            "User",
          role:
            parsedUser.role === "admin"
              ? "admin"
              : "customer",
          accountType:
            parsedUser.role === "admin"
              ? "admin"
              : "customer",
        });

        return;
      } catch {
        localStorage.removeItem("user");
      }
    }

    setUser(null);
  }, []);

  // Listen for login/logout events
  useEffect(() => {
    checkUser();

    window.addEventListener("storage", checkUser);
    window.addEventListener("authChange", checkUser);

    return () => {
      window.removeEventListener("storage", checkUser);
      window.removeEventListener("authChange", checkUser);
    };
  }, [checkUser]);

  // Close menu when switching to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 1050) {
        setMenuOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  // Prevent background scrolling when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  const closeMenu = () => setMenuOpen(false);

  // Logout from all account types
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    localStorage.removeItem("vendorToken");
    localStorage.removeItem("vendor");

    setUser(null);
    closeMenu();

    window.dispatchEvent(new Event("authChange"));

    router.push("/");
    router.refresh();
  };

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Explore", href: "/#categories" },
    { name: "How It Works", href: "/#how-it-works" },
    { name: "For Stores", href: "/#stores" },
  ];

  // Determine the dashboard link for the current account
  const dashboardLink =
    user?.role === "vendor"
      ? "/vendor-dashboard"
      : user?.role === "admin"
      ? "/admin"
      : "/account";

  return (
    <>
      <header className="navbar">
        <div className="navbar-container">

          {/* LOGO */}
          <Link
            href="/"
            className="navbar-logo"
            onClick={closeMenu}
          >
            <Image
              src="/logo/fashrentt-logo.png"
              alt="FashRentt Logo"
              width={65}
              height={65}
              className="navbar-logo-img"
              priority
            />

<span className="brand-name">
  <span className="brand-fash">Fash</span><span className="brand-rentt">Rentt</span>
</span>
          
          </Link>

          {/* DESKTOP LINKS */}
          <nav className="navbar-links">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="navbar-link"
              >
                {link.name}
              </Link>
            ))}
          </nav>

          {/* DESKTOP ACTIONS */}
          <div className="navbar-actions">

            <Link
              href="/account#wishlist"
              className="navbar-icon-link"
              aria-label="Wishlist"
            >
              ♡
            </Link>

            {user ? (
              <>
                {/* ADMIN DASHBOARD */}
                {user.role === "admin" && (
                  <Link
                    href="/admin"
                    className="navbar-account"
                  >
                    Admin Dashboard
                  </Link>
                )}

                {/* VENDOR DASHBOARD */}
                {user.role === "vendor" && (
                  <Link
                    href="/vendor-dashboard"
                    className="navbar-account"
                  >
                    Vendor Dashboard
                  </Link>
                )}

                {/* ACCOUNT NAME */}
                <Link
                  href={dashboardLink}
                  className="navbar-account"
                >
                  Hi, {user.name?.split(" ")[0] || "User"}
                </Link>

                {/* LOGOUT */}
                <button
                  type="button"
                  onClick={handleLogout}
                  className="navbar-account logout-btn"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="navbar-account"
                >
                  Login
                </Link>

                <Link
                  href="/register"
                  className="navbar-account"
                >
                  Register
                </Link>
              </>
            )}

            <Link
              href="/#categories"
              className="navbar-cta"
            >
              Explore Collection
              <span>↗</span>
            </Link>

            <Link href="/account">
  My Account
</Link>
          </div>
          {/* MOBILE TOGGLE */}
          <button
            type="button"
            className={`navbar-toggle ${
              menuOpen ? "open" : ""
            }`}
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label={
              menuOpen
                ? "Close navigation menu"
                : "Open navigation menu"
            }
            aria-expanded={menuOpen}
          >
            <span />
            <span />
            <span />
          </button>
        </div>

        {/* MOBILE MENU */}
        <div
          className={`mobile-menu ${
            menuOpen ? "mobile-menu-open" : ""
          }`}
          aria-hidden={!menuOpen}
        >
          <div className="mobile-menu-inner">

            <div className="mobile-menu-label">
              DISCOVER FASHRENTT
            </div>

            <nav className="mobile-nav-links">
              {navLinks.map((link, index) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className="mobile-nav-link"
                  onClick={closeMenu}
                  tabIndex={menuOpen ? 0 : -1}
                >
                  <span className="mobile-link-number">
                    0{index + 1}
                  </span>

                  <span>{link.name}</span>

                  <span className="mobile-link-arrow">
                    ↗
                  </span>
                </Link>
              ))}
            </nav>

            <div className="mobile-menu-account">

              <Link
                href="/account#wishlist"
                onClick={closeMenu}
                tabIndex={menuOpen ? 0 : -1}
              >
                ♡ Wishlist
              </Link>

              {user ? (
                <>
                  {/* ADMIN DASHBOARD */}
                  {user.role === "admin" && (
                    <Link
                      href="/admin"
                      onClick={closeMenu}
                      tabIndex={menuOpen ? 0 : -1}
                    >
                      Admin Dashboard
                    </Link>
                  )}

                  {/* VENDOR DASHBOARD */}
                  {user.role === "vendor" && (
                    <Link
                      href="/vendor-dashboard"
                      onClick={closeMenu}
                      tabIndex={menuOpen ? 0 : -1}
                    >
                      Vendor Dashboard
                    </Link>
                  )}

                  {/* ACCOUNT NAME */}
                  <Link
                    href={dashboardLink}
                    onClick={closeMenu}
                    tabIndex={menuOpen ? 0 : -1}
                  >
                    Hi, {user.name?.split(" ")[0] || "User"}
                  </Link>

                  {/* LOGOUT */}
                  <button
                    type="button"
                    onClick={handleLogout}
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="navbar-account"
                    onClick={closeMenu}
                    tabIndex={menuOpen ? 0 : -1}
                  >
                    Login
                  </Link>

                  <Link
                    href="/register"
                    className="navbar-account"
                    onClick={closeMenu}
                    tabIndex={menuOpen ? 0 : -1}
                  >
                    Register
                  </Link>
                </>
              )}
            </div>

            <Link
              href="/#categories"
              className="mobile-cta"
              onClick={closeMenu}
              tabIndex={menuOpen ? 0 : -1}
            >
              Explore Collection
              <span>↗</span>
            </Link>

            <p className="mobile-menu-tagline">
              RENT. ROCK. REPEAT.
            </p>
          </div>
        </div>
      </header>

      {/* NAVBAR STYLES - ORIGINAL STYLING PRESERVED */}
      <style jsx global>{`
        .navbar {
          position: sticky;
          top: 0;
          z-index: 1000;
          width: 100%;
          background: rgba(255, 250, 243, 0.97);
          border-bottom: 1px solid #eee5da;
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          box-shadow: 0 4px 20px rgba(30, 20, 10, 0.025);
        }

        .navbar *,
        .navbar *::before,
        .navbar *::after {
          box-sizing: border-box;
        }

        .navbar-container {
          width: 100%;
          max-width: 1600px;
          min-height: 100px;
          margin: 0 auto;
          padding: 14px 4%;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 30px;
        }

        /* LOGO */

        .navbar-logo {
          display: inline-flex;
          align-items: center;
          gap: 12px;
          flex-shrink: 0;
          text-decoration: none;
          color: #191817;
        }

        .navbar-logo-img {
          width: 62px;
          height: 62px;
          object-fit: contain;
          flex-shrink: 0;
        }

        .navbar-brand {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .brand-name {
          font-family: Georgia, "Times New Roman", serif;
          font-size: 32px;
          font-weight: 700;
          line-height: 1;
          letter-spacing: -1px;
          white-space: nowrap;
          display: inline-flex;
          align-items: center;
        }
        .brand-name {
          display: inline-flex;
          align-items: center;
          white-space: nowrap;
          transform: translateY(11px);

        }

        .brand-fash {
         color: #171513;
        }

        .brand-rentt {
             color: #b8860b;
  text-shadow:
    0 1px 0 #f3d77a,
    0 2px 4px rgba(120, 82, 0, 0.25);

        }

        .navbar-brand small {
          color: #ad821c;
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 3px;
          white-space: nowrap;
        }

        /* DESKTOP NAVIGATION */

.navbar-links {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: clamp(24px, 3vw, 42px);
  flex: 1;
  min-width: 0;
}

.navbar-link {
  position: relative;
  padding: 10px 2px;

  color: #292621;
  text-decoration: none;

  font-family: "Inter", sans-serif;
  font-size: 13px;
  font-weight: 500;
  letter-spacing: 0.7px;

  white-space: nowrap;

  transition:
    color 0.25s ease,
    transform 0.25s ease;
}

.navbar-link::after {
  content: "";

  position: absolute;
  left: 0;
  bottom: 3px;

  width: 0;
  height: 1.5px;

  background: #b8860b;

  transition: width 0.3s ease;
}

.navbar-link:hover {
  color: #9a6d08;
  transform: translateY(-1px);
}

.navbar-link:hover::after {
  width: 100%;
}

        .navbar-link {
          position: relative;
          padding: 10px 0;
          color: #49433e;
          text-decoration: none;
          font-size: 15px;
          font-weight: 500;
          white-space: nowrap;
          transition: color 0.25s ease;
        }

        .navbar-link::after {
          content: "";
          position: absolute;
          left: 0;
          bottom: 3px;
          width: 0;
          height: 1px;
          background: #b88625;
          transition: width 0.25s ease;
        }

        .navbar-link:hover {
          color: #a17a23;
        }

        .navbar-link:hover::after {
          width: 100%;
        }
.my-bookings-home-btn {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 12px 24px;
  border: 1px solid #222;
  border-radius: 30px;
  color: #222;
  text-decoration: none;
  font-weight: 600;
  transition: all 0.3s ease;
}

.my-bookings-home-btn:hover {
  background: #222;
  color: #fff;
}

        /* DESKTOP NAVIGATION */

.navbar-links {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: clamp(24px, 3vw, 42px);
  flex: 1;
  min-width: 0;
}

.navbar-link {
  position: relative;

  padding: 10px 2px;

  color: #292621;
  text-decoration: none;

  font-family: "Inter", sans-serif;
  font-size: 13px;
  font-weight: 500;
  letter-spacing: 0.7px;

  white-space: nowrap;

  transition:
    color 0.25s ease,
    transform 0.25s ease;
}

/* Elegant gold underline */
.navbar-link::after {
  content: "";

  position: absolute;
  left: 0;
  bottom: 3px;

  width: 0;
  height: 1.5px;

  background: #b8860b;

  transition: width 0.3s ease;
}

/* Hover */
.navbar-link:hover {
  color: #9a6d08;
  transform: translateY(-1px);
}

.navbar-link:hover::after {
  width: 100%;
}

.navbar-icon-link {
  display: inline-flex;
  justify-content: center;
  align-items: center;

  width: 40px;
  height: 40px;

  color: #292621;
  text-decoration: none;

  font-size: 27px;
  font-weight: 400;

  transition:
    color 0.25s ease,
    transform 0.25s ease;
}

.navbar-icon-link:hover {
  color: #b8860b;
  transform: translateY(-2px) scale(1.04);
}
        /* MOBILE MENU BUTTON */

        .navbar-toggle {
          display: none;
          width: 44px;
          height: 44px;
          padding: 10px;
          border: 1px solid #e9ddd1;
          border-radius: 50%;
          background: #fffaf4;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 5px;
          cursor: pointer;
          flex-shrink: 0;
        }

        .navbar-toggle span {
          display: block;
          width: 19px;
          height: 2px;
          border-radius: 5px;
          background: #191817;
          transition: all 0.25s ease;
        }

        .navbar-toggle.open span:first-child {
          transform: translateY(7px) rotate(45deg);
        }

        .navbar-toggle.open span:nth-child(2) {
          opacity: 0;
        }

        .navbar-toggle.open span:last-child {
          transform: translateY(-7px) rotate(-45deg);
        }
.navbar-account {
  position: relative;

  border: none;
  background: transparent;

  color: #292621;

  font-family: "Inter", sans-serif;
  font-size: 13px;
  font-weight: 500;
  letter-spacing: 0.4px;

  text-decoration: none;
  white-space: nowrap;

  cursor: pointer;

  padding: 8px 0;

  transition:
    color 0.25s ease,
    transform 0.25s ease;
}
    .navbar-cta {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 16px;

  min-height: 55px;
  padding: 15px 23px;

  background: #191817;
  color: white;

  text-decoration: none;

  font-family: "Inter", sans-serif;
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.5px;

  white-space: nowrap;

  transition: all 0.25s ease;
}
  .navbar-cta span {
  color: #d5a934;
  font-size: 18px;
}

.navbar-cta:hover {
  background: #a17a23;
  transform: translateY(-2px);
}


        /* MOBILE MENU PANEL */

        .mobile-menu {
          display: none;
        }

        /* TABLET AND MOBILE */

        @media (max-width: 1050px) {
          .navbar-container {
            min-height: 78px;
            padding: 10px 24px;
            gap: 15px;
          }

          .navbar-logo {
            gap: 8px;
          }

          .navbar-logo-img {
            width: 48px;
            height: 48px;
          }

          .brand-name {
            font-size: 25px;
          }

          .navbar-brand small {
            font-size: 8px;
            letter-spacing: 2px;
          }

          .navbar-links,
          .navbar-actions {
            display: none;
          }

          .navbar-toggle {
            display: flex;
          }

          .mobile-menu {
            display: block;
            position: absolute;
            top: 100%;
            left: 0;
            right: 0;
            width: 100%;
            max-height: calc(100dvh - 78px);
            overflow-y: auto;
            overscroll-behavior: contain;
            background: #fffaf4;
            border-top: 1px solid #eee5da;
            box-shadow: 0 20px 35px rgba(35, 25, 15, 0.12);
            visibility: hidden;
            opacity: 0;
            transform: translateY(-10px);
            pointer-events: none;
            transition:
              opacity 0.25s ease,
              transform 0.25s ease,
              visibility 0.25s ease;
          }

          .mobile-menu.mobile-menu-open {
            visibility: visible;
            opacity: 1;
            transform: translateY(0);
            pointer-events: auto;
          }

          .mobile-menu-inner {
            width: 100%;
            max-width: 600px;
            margin: 0 auto;
            padding: 30px 25px 25px;
          }

          .mobile-menu-label {
            font-size: 10px;
            font-weight: 700;
            letter-spacing: 2.5px;
            color: #b08a4a;
            margin-bottom: 20px;
          }

          .mobile-nav-links {
            display: flex;
            flex-direction: column;
          }

          .mobile-nav-link {
            display: grid;
            grid-template-columns: 35px minmax(0, 1fr) 25px;
            align-items: center;
            gap: 10px;
            min-height: 65px;
            border-bottom: 1px solid #eee5da;
            color: #201d1a;
            font-family: Georgia, "Times New Roman", serif;
            font-size: 22px;
            text-decoration: none;
            transition: color 0.2s ease;
          }

          .mobile-nav-link:hover {
            color: #a17a23;
          }

          .mobile-link-number {
            color: #b69b7e;
            font-family: Arial, sans-serif;
            font-size: 11px;
          }

          .mobile-link-arrow {
            color: #b88625;
            text-align: right;
            font-family: Arial, sans-serif;
            font-size: 18px;
          }

          .mobile-menu-account {
            display: flex;
            flex-wrap: wrap;
            gap: 10px;
            padding: 25px 0;
          }

          .mobile-menu-account a,
          .mobile-menu-account button {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            min-height: 42px;
            padding: 10px 15px;
            border: 1px solid #e8dcd0;
            border-radius: 30px;
            background: white;
            color: #302923;
            font-family: inherit;
            font-size: 13px;
            text-decoration: none;
            cursor: pointer;
          }

          .mobile-menu-account a:hover,
          .mobile-menu-account button:hover {
            background: #f6ece1;
          }

          .mobile-cta {
            display: flex;
            justify-content: space-between;
            align-items: center;
            gap: 15px;
            width: 100%;
            min-height: 55px;
            padding: 16px 20px;
            background: #191817;
            color: white;
            text-decoration: none;
            font-size: 14px;
            font-weight: 600;
            border-radius: 4px;
          }

          .mobile-cta span {
            color: #d5a934;
            font-size: 20px;
          }

          .mobile-menu-tagline {
            margin: 25px 0 0;
            text-align: center;
            color: #b18a43;
            font-size: 9px;
            font-weight: 700;
            letter-spacing: 4px;
          }
        }

        /* SMALL PHONES */

        @media (max-width: 380px) {
          .navbar-container {
            padding: 10px 14px;
            min-height: 70px;
          }

          .navbar-logo-img {
            width: 42px;
            height: 42px;
          }

          .brand-name {
            font-size: 22px;
          }

          .navbar-brand small {
            font-size: 7px;
            letter-spacing: 1.5px;
          }

          .navbar-toggle {
            width: 40px;
            height: 40px;
          }

          .mobile-menu-inner {
            padding: 25px 20px;
          }

          .mobile-nav-link {
            font-size: 20px;
            min-height: 60px;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .navbar *,
          .navbar *::before,
          .navbar *::after,
          .mobile-menu,
          .mobile-menu * {
            transition-duration: 0.01ms !important;
          }
        }
      `}</style>
    </>
  );
}
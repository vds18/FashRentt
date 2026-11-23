
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import "./../auth.css";

export default function LoginPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      setLoading(true);

      const response = await fetch(
        "http://localhost:5000/api/auth/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(form),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || "Login failed.");
        return;
      }

// Clear previous vendor session
localStorage.removeItem("vendorToken");
localStorage.removeItem("vendor");

// Save customer session
localStorage.setItem("token", data.token);
localStorage.setItem("user", JSON.stringify(data.user));

// Notify Navbar about the login change
window.dispatchEvent(new Event("authChange"));

router.push("/");

    } catch (error) {
      setMessage("Unable to connect to the server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-page">
      <div className="auth-container">

        <section className="auth-brand-panel">
          <div className="auth-brand-content">
            <span className="auth-brand-label">
              WELCOME TO FASHRENTT
            </span>

            <h1 className="auth-brand-title">
              Dress up.
              <br />
              Stand out.
              <br />
              <span>Be you.</span>
            </h1>

            <p className="auth-brand-description">
              Your favourite styles, your special
              moments, and a wardrobe without limits.
              Sign in and find your next statement look.
            </p>
          </div>

          <div className="auth-brand-bottom">
            RENT. ROCK. REPEAT.
          </div>
        </section>

        <section className="auth-form-panel">
          <h2 className="auth-heading">
            Welcome Back
          </h2>

          <p className="auth-subheading">
            Login to continue your FashRentt journey.
          </p>

          <form
            onSubmit={handleSubmit}
            className="auth-form"
          >
            <div className="auth-field">
              <label className="auth-label">
                EMAIL ADDRESS
              </label>

              <input
                type="email"
                name="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={handleChange}
                required
                className="auth-input"
              />
            </div>

            <div className="auth-field">
              <label className="auth-label">
                PASSWORD
              </label>

              <input
                type="password"
                name="password"
                placeholder="Enter your password"
                value={form.password}
                onChange={handleChange}
                required
                className="auth-input"
              />
            </div>

            {message && (
              <p className="auth-message">
                {message}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="auth-submit"
            >
              {loading
                ? "LOGGING IN..."
                : "LOGIN TO YOUR ACCOUNT →"}
            </button>
          </form>

          <div className="auth-divider"></div>

          <p className="auth-footer">
            Don't have an account?
            <Link href="/register">Create Account</Link>
          </p>

          <p className="auth-note">
            YOUR STYLE. YOUR MOMENT. YOUR WAY.
          </p>
        </section>

      </div>
    </main>
  );
}
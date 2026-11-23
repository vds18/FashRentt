
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import "./../auth.css";

export default function RegisterPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
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

    if (form.password.length < 8) {
      setMessage("Password must be at least 8 characters.");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        "http://localhost:5000/api/auth/register",
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
        setMessage(data.message || "Registration failed.");
        return;
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      router.push("/login");
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
              THE FASHION EXPERIENCE
            </span>

            <h1 className="auth-brand-title">
              Your next
              <br />
              look is
              <br />
              <span>waiting.</span>
            </h1>

            <p className="auth-brand-description">
              Discover the joy of dressing up without
              the price of buying. Rent premium styles,
              create unforgettable moments, and
              repeat your favourite looks.
            </p>
          </div>

          <div className="auth-brand-bottom">
            RENT. ROCK. REPEAT.
          </div>
        </section>

        <section className="auth-form-panel">
          <h2 className="auth-heading">
            Join FashRentt
          </h2>

          <p className="auth-subheading">
            Create your account and discover your next look.
          </p>

          <form
            onSubmit={handleSubmit}
            className="auth-form"
          >
            <div className="auth-field">
              <label className="auth-label">
                FULL NAME
              </label>

              <input
                type="text"
                name="name"
                placeholder="Enter your full name"
                value={form.name}
                onChange={handleChange}
                required
                className="auth-input"
              />
            </div>

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
                PHONE NUMBER
              </label>

              <input
                type="tel"
                name="phone"
                placeholder="Enter your phone number (optional)"
                value={form.phone}
                onChange={handleChange}
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
                placeholder="Minimum 8 characters"
                value={form.password}
                onChange={handleChange}
                required
                minLength={8}
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
                ? "CREATING ACCOUNT..."
                : "CREATE MY ACCOUNT →"}
            </button>
          </form>

          <div className="auth-divider"></div>

          <p className="auth-footer">
            Already have an account?
            <Link href="/login">Login</Link>
          </p>

          <p className="auth-note">
            YOUR STYLE. YOUR MOMENT. YOUR WAY.
          </p>
        </section>

      </div>
    </main>
  );
}
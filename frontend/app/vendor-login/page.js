
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function VendorLogin() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

const handleLogin = async (e) => {
  e.preventDefault();
  setError("");
  setLoading(true);

  try {
    const response = await fetch(
      "http://localhost:5000/api/vendors/login",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      setError(data.message || "Login failed.");
      return;
    }

    // Clear previous customer/admin session
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    // Save vendor credentials
    localStorage.setItem("vendorToken", data.token);
    localStorage.setItem(
      "vendor",
      JSON.stringify(data.vendor)
    );

    // Immediately update the navbar
    window.dispatchEvent(new Event("authChange"));

    // Navigate to vendor dashboard
    router.push("/vendor-dashboard");
    router.refresh();

  } catch (error) {
    console.error("Vendor login error:", error);
    setError(
      "Unable to connect to server. Please try again."
    );
  } finally {
    setLoading(false);
  }
};

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
        background: "#fffaf4",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "440px",
          padding: "40px",
          background: "#ffffff",
          border: "1px solid #eee5da",
          borderRadius: "16px",
          boxShadow: "0 12px 40px rgba(0,0,0,0.06)",
        }}
      >
        <p
          style={{
            color: "#a17a23",
            fontSize: "12px",
            fontWeight: "700",
            letterSpacing: "3px",
            textAlign: "center",
          }}
        >
          FASHRENTT PARTNERS
        </p>

        <h1
          style={{
            fontFamily: "Georgia, serif",
            fontSize: "32px",
            textAlign: "center",
            color: "#191817",
            margin: "16px 0 8px",
          }}
        >
          Vendor Login
        </h1>

        <p
          style={{
            textAlign: "center",
            color: "#777",
            fontSize: "14px",
            marginBottom: "30px",
          }}
        >
          Sign in to manage your fashion store.
        </p>

        <form onSubmit={handleLogin}>
          <label
            style={{
              display: "block",
              fontSize: "14px",
              fontWeight: "600",
              marginBottom: "8px",
            }}
          >
            Email Address
          </label>

          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your vendor email"
            autoComplete="email"
            style={{
              width: "100%",
              padding: "14px",
              marginBottom: "20px",
              border: "1px solid #ddd",
              borderRadius: "8px",
              fontSize: "14px",
              boxSizing: "border-box",
            }}
          />

          <label
            style={{
              display: "block",
              fontSize: "14px",
              fontWeight: "600",
              marginBottom: "8px",
            }}
          >
            Password
          </label>

          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            autoComplete="current-password"
            style={{
              width: "100%",
              padding: "14px",
              marginBottom: "20px",
              border: "1px solid #ddd",
              borderRadius: "8px",
              fontSize: "14px",
              boxSizing: "border-box",
            }}
          />

          {error && (
            <p
              role="alert"
              style={{
                color: "#b42318",
                background: "#fff1f0",
                padding: "12px",
                borderRadius: "8px",
                fontSize: "13px",
                marginBottom: "20px",
              }}
            >
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: "15px",
              background: "#191817",
              color: "#fff",
              border: "none",
              borderRadius: "8px",
              fontSize: "15px",
              fontWeight: "600",
              cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? "Signing in..." : "Login to Vendor Portal"}
          </button>
        </form>

        <p
          style={{
            marginTop: "24px",
            textAlign: "center",
            fontSize: "13px",
            color: "#777",
          }}
        >
          Not registered as a vendor?{" "}
          <a
            href="/vendor/register"
            style={{
              color: "#a17a23",
              fontWeight: "600",
              textDecoration: "none",
            }}
          >
            Register here
          </a>
        </p>

        <p
          style={{
            textAlign: "center",
            marginTop: "16px",
            fontSize: "13px",
          }}
        >
          <a
            href="/"
            style={{
              color: "#777",
              textDecoration: "none",
            }}
          >
            ← Back to FashRentt
          </a>
        </p>
      </div>
    </main>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const API_URL = "http://localhost:5000/api/vendors";

export default function VendorRegister() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    shopName: "",
    shopAddress: "",
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    setMessage("");
    setSuccess(false);

    try {
      const response = await fetch(`${API_URL}/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Registration failed."
        );
      }

      setSuccess(true);
      setMessage(
        "Registration successful! Your shop is awaiting admin approval."
      );

      setFormData({
        name: "",
        email: "",
        phone: "",
        password: "",
        shopName: "",
        shopAddress: "",
      });
    } catch (error) {
      setMessage(
        error.message || "Unable to connect to the server."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main
      style={{
        minHeight: "100vh",
        padding: "50px 20px",
        background: "#fcf8f3",
      }}
    >
      <div
        style={{
          maxWidth: "600px",
          margin: "0 auto",
          background: "#fff",
          padding: "35px",
          borderRadius: "16px",
          boxShadow: "0 8px 30px rgba(0,0,0,0.06)",
        }}
      >
        <p
          style={{
            color: "#b88625",
            letterSpacing: "3px",
            fontSize: "12px",
            fontWeight: "600",
            textAlign: "center",
          }}
        >
          PARTNER WITH FASHRENTT
        </p>

        <h1
          style={{
            fontFamily: "Georgia, serif",
            fontSize: "32px",
            textAlign: "center",
            margin: "15px 0",
          }}
        >
          Register Your Store
        </h1>

        <p
          style={{
            textAlign: "center",
            color: "#77736f",
            marginBottom: "30px",
          }}
        >
          Bring your collection to more customers
          through FashRentt.
        </p>

        <form
          onSubmit={handleSubmit}
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "16px",
          }}
        >
          {[
            {
              name: "name",
              label: "Owner Name",
              type: "text",
            },
            {
              name: "email",
              label: "Email Address",
              type: "email",
            },
            {
              name: "phone",
              label: "Phone Number",
              type: "tel",
            },
            {
              name: "shopName",
              label: "Shop Name",
              type: "text",
            },
          ].map((field) => (
            <div key={field.name}>
              <label
                htmlFor={field.name}
                style={{
                  display: "block",
                  marginBottom: "7px",
                  fontWeight: "600",
                  fontSize: "14px",
                }}
              >
                {field.label}
              </label>

              <input
                id={field.name}
                name={field.name}
                type={field.type}
                value={formData[field.name]}
                onChange={handleChange}
                required
                style={inputStyle}
              />
            </div>
          ))}

          <div>
            <label
              htmlFor="shopAddress"
              style={labelStyle}
            >
              Shop Address
            </label>

            <textarea
              id="shopAddress"
              name="shopAddress"
              value={formData.shopAddress}
              onChange={handleChange}
              required
              rows={3}
              style={inputStyle}
            />
          </div>

          <div>
            <label
              htmlFor="password"
              style={labelStyle}
            >
              Password
            </label>

            <input
              id="password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              minLength={8}
              required
              style={inputStyle}
            />
          </div>

          {message && (
            <p
              role="status"
              style={{
                color: success ? "green" : "#c0392b",
                fontSize: "14px",
                lineHeight: "1.6",
              }}
            >
              {message}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              padding: "15px",
              background: "#191817",
              color: "#fff",
              border: "none",
              borderRadius: "8px",
              fontWeight: "600",
              marginTop: "10px",
              cursor: loading ? "wait" : "pointer",
            }}
          >
            {loading
              ? "Registering..."
              : "Register My Store"}
          </button>
        </form>

        <p
          style={{
            fontSize: "13px",
            color: "#77736f",
            textAlign: "center",
            marginTop: "20px",
          }}
        >
          Your store will be reviewed by the FashRentt
          admin before approval.
        </p>
      </div>
    </main>
  );
}

const labelStyle = {
  display: "block",
  marginBottom: "7px",
  fontWeight: "600",
  fontSize: "14px",
};

const inputStyle = {
  width: "100%",
  padding: "13px",
  border: "1px solid #eee4dc",
  borderRadius: "8px",
  background: "#fcf8f3",
  outline: "none",
  fontSize: "14px",
};
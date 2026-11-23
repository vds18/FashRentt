
"use client";

import { useEffect, useMemo, useState } from "react";

export default function AdminDashboard() {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updating, setUpdating] = useState("");

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  const [outfits, setOutfits] = useState([]);
  const [outfitLoading, setOutfitLoading] = useState(true);
  const [outfitUpdating, setOutfitUpdating] = useState("");
  const [outfitFilter, setOutfitFilter] = useState("all");
  const [outfitMessage, setOutfitMessage] = useState("");

  const [confirmVendor, setConfirmVendor] = useState(null);
  const [confirmStatus, setConfirmStatus] = useState(null);

  const fetchVendors = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");

      if (!token) {
        setError("Please log in using your admin account.");
        return;
      }

      const response = await fetch(
        "http://localhost:5000/api/admin/vendors",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to load vendors");
      }

      setVendors(
        Array.isArray(data) ? data : data.vendors || data.data || []
      );
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const fetchOutfits = async () => {
    try {
      setOutfitLoading(true);
      setOutfitMessage("");

      const token = localStorage.getItem("token");

      if (!token) {
        setOutfitMessage("Please log in as admin.");
        return;
      }

      const response = await fetch(
        "http://localhost:5000/api/admin/outfits",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to fetch outfits");
      }

      setOutfits(data.outfits || []);
    } catch (err) {
      setOutfitMessage(err.message || "Unable to fetch outfits");
    } finally {
      setOutfitLoading(false);
    }
  };

  useEffect(() => {
    fetchVendors();
    fetchOutfits();
  }, []);

  const updateStatus = async () => {
    if (!confirmVendor || !confirmStatus) return;

    try {
      setUpdating(confirmVendor._id);
      setError("");

      const token = localStorage.getItem("token");

      const response = await fetch(
        `http://localhost:5000/api/admin/vendors/${confirmVendor._id}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status: confirmStatus }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Status update failed");
      }

      setConfirmVendor(null);
      setConfirmStatus(null);
      await fetchVendors();
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setUpdating("");
    }
  };

  const updateOutfitStatus = async (outfitId, status) => {
    try {
      setOutfitUpdating(outfitId);
      setOutfitMessage("");

      const token = localStorage.getItem("token");

      const response = await fetch(
        `http://localhost:5000/api/admin/outfits/${outfitId}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to update outfit");
      }

      setOutfits((previous) =>
        previous.map((outfit) =>
          outfit._id === outfitId ? { ...outfit, status } : outfit
        )
      );

      setOutfitMessage(`Outfit ${status} successfully.`);
      await fetchOutfits();
    } catch (err) {
      setOutfitMessage(err.message || "Something went wrong");
    } finally {
      setOutfitUpdating("");
    }
  };

  const pending = vendors.filter(
    (vendor) => vendor.status === "pending"
  ).length;

  const approved = vendors.filter(
    (vendor) => vendor.status === "approved"
  ).length;

  const rejected = vendors.filter(
    (vendor) => vendor.status === "rejected"
  ).length;

  const filteredVendors = useMemo(() => {
    return vendors.filter((vendor) => {
      const name = vendor.name || vendor.ownerName || "";
      const shop = vendor.shopName || vendor.storeName || "";
      const phone = vendor.phone || "";
      const email = vendor.email || "";

      const matchesSearch = [name, shop, phone, email]
        .join(" ")
        .toLowerCase()
        .includes(search.toLowerCase());

      const matchesFilter =
        filter === "all" || vendor.status === filter;

      return matchesSearch && matchesFilter;
    });
  }, [vendors, search, filter]);

  const getAddress = (vendor) => {
    if (vendor.shopAddress) return vendor.shopAddress;

    const address = vendor.businessAddress;
    if (!address) return "Address not provided";

    return [
      address.addressLine,
      address.city,
      address.state,
      address.pincode,
    ]
      .filter(Boolean)
      .join(", ") || "Address not provided";
  };

  const getName = (vendor) =>
    vendor.name || vendor.ownerName || "Vendor";

  const getShopName = (vendor) =>
    vendor.shopName || vendor.storeName || "Store";

  const filteredOutfits = outfits.filter(
    (outfit) =>
      outfitFilter === "all" || outfit.status === outfitFilter
  );

  const refreshAll = () => {
    fetchVendors();
    fetchOutfits();
  };

  const summaryCards = [
    {
      label: "Total Vendors",
      value: vendors.length,
      subtitle: "Registered stores",
      icon: "♙",
      color: "neutral",
    },
    {
      label: "Pending Review",
      value: pending,
      subtitle: "Awaiting review",
      icon: "◷",
      color: "gold",
    },
    {
      label: "Approved",
      value: approved,
      subtitle: "Active vendors",
      icon: "✓",
      color: "green",
    },
    {
      label: "Rejected",
      value: rejected,
      subtitle: "Rejected applications",
      icon: "×",
      color: "red",
    },
  ];

  return (
    <main className="admin-dashboard-page min-h-screen w-full overflow-x-hidden bg-[#f8f5ef] text-[#211e19]">
      {/* ADMIN HEADER */}
      <header className="w-full bg-[#211e19] text-white">
        <div className="mx-auto flex w-full max-w-[1440px] flex-col items-center justify-center gap-5 px-5 py-7 text-center sm:px-8 lg:px-12">
          <div className="flex w-full flex-col items-center justify-center gap-3 text-center sm:flex-row sm:justify-center">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-[#c9a45c]/40 bg-[#c9a45c]/10 text-3xl text-[#d7b66b]">
              ♛
            </div>

            <div className="text-center">
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[#d7b66b]">
                FASHRENTT
              </p>

              <h1 className="mt-2 font-serif text-3xl font-normal text-white sm:text-4xl">
                Admin Dashboard
              </h1>

              <p className="mt-2 text-sm text-white/70">
                Your marketplace, beautifully managed.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <div className="rounded-xl border border-white/15 bg-white/5 px-5 py-3 text-center">
              <p className="text-xs text-white/70">Administrator</p>
              <p className="mt-1 text-sm font-semibold text-white">
                Store Management
              </p>
            </div>

            <button
              type="button"
              onClick={refreshAll}
              disabled={loading || outfitLoading}
              className="rounded-xl border border-[#c9a45c]/50 bg-[#c9a45c] px-5 py-3 text-sm font-semibold text-[#211e19] transition hover:bg-[#dfc583] disabled:opacity-50"
            >
              {loading || outfitLoading ? "Refreshing..." : "↻ Refresh"}
            </button>
          </div>
        </div>
      </header>

      {/* CENTERED MAIN CONTENT */}
      <div className="mx-auto box-border w-full max-w-[1320px] px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
        {/* PAGE INTRO */}
        <section className="mx-auto mb-12 w-full max-w-3xl scroll-mt-24 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[#a77b2b]">
            OVERVIEW / VENDORS
          </p>

          <h2 className="mt-4 text-center font-serif text-4xl font-normal tracking-tight sm:text-5xl">
            Vendor Management
          </h2>

          <div className="mx-auto mt-5 h-px w-20 bg-[#c9a45c]" />

          <p className="mx-auto mt-5 w-full max-w-2xl text-center text-sm leading-7 text-[#81796e] sm:text-base">
            Manage store registrations, review applications, and maintain
            your FashRentt fashion rental marketplace.
          </p>
        </section>

        {error && (
          <div className="mx-auto mb-8 max-w-4xl rounded-2xl border border-red-200 bg-red-50 p-4 text-center text-sm text-red-700">
            {error}
          </div>
        )}

        {/* CENTERED VENDOR SUMMARY CARDS */}
        <section className="mx-auto mb-14 w-full">
          <div className="mx-auto grid w-full max-w-[1240px] grid-cols-1 justify-items-center gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {summaryCards.map((card) => (
              <div
                key={card.label}
                className="flex min-h-[205px] w-full flex-col items-center justify-center rounded-3xl border border-[#e9dfce] bg-[#fffdf9] p-7 text-center shadow-sm transition duration-300 hover:-translate-y-1 hover:border-[#c9a45c] hover:shadow-lg"
              >
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-2xl text-2xl ${
                    card.color === "gold"
                      ? "bg-[#f8efd9] text-[#a77b2b]"
                      : card.color === "green"
                      ? "bg-emerald-50 text-emerald-700"
                      : card.color === "red"
                      ? "bg-red-50 text-red-600"
                      : "bg-[#f0ece5] text-[#494239]"
                  }`}
                >
                  {card.icon}
                </div>

                <p className="mt-4 text-center text-sm font-medium text-[#81796e]">
                  {card.label}
                </p>

                <h3
                  className={`mt-2 text-center text-4xl font-semibold tracking-tight ${
                    card.color === "gold"
                      ? "text-[#a77b2b]"
                      : card.color === "green"
                      ? "text-emerald-700"
                      : card.color === "red"
                      ? "text-red-600"
                      : "text-[#211e19]"
                  }`}
                >
                  {card.value}
                </h3>

                <p className="mt-2 text-center text-xs uppercase tracking-[0.15em] text-[#a49a8c]">
                  {card.subtitle}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* VENDOR APPLICATIONS */}
        <section className="mx-auto mb-16 w-full max-w-[1240px] overflow-hidden rounded-3xl border border-[#e9dfce] bg-[#fffdf9] shadow-sm">
          <div className="border-b border-[#eee6d9] px-5 py-9 text-center sm:px-8">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#a77b2b]">
              STORE MANAGEMENT
            </p>

            <h3 className="mt-3 text-center font-serif text-3xl font-normal sm:text-4xl">
              Vendor Applications
            </h3>

            <p className="mx-auto mt-3 w-full max-w-xl text-center text-sm leading-6 text-[#81796e]">
              Review store registrations and manage your marketplace partners.
            </p>

            <p className="mt-4 text-center text-xs font-semibold uppercase tracking-[0.18em] text-[#a77b2b]">
              {filteredVendors.length} records
            </p>

            <div className="mx-auto mt-6 w-full max-w-md">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search name, store, phone..."
                className="w-full rounded-xl border border-[#e9dfce] bg-[#faf7f1] px-5 py-3.5 text-center text-sm outline-none transition placeholder:text-[#a49a8c] focus:border-[#c9a45c] focus:bg-white focus:ring-2 focus:ring-[#c9a45c]/15"
              />
            </div>
          </div>

          <div className="flex flex-wrap justify-center gap-2 border-b border-[#eee6d9] px-4 py-5">
            {[
              { label: "All Vendors", value: "all" },
              { label: "Pending", value: "pending" },
              { label: "Approved", value: "approved" },
              { label: "Rejected", value: "rejected" },
            ].map((item) => (
              <button
                key={item.value}
                type="button"
                onClick={() => setFilter(item.value)}
                className={`rounded-full px-5 py-2.5 text-sm font-semibold transition ${
                  filter === item.value
                    ? "bg-[#211e19] text-white shadow-sm"
                    : "border border-[#e9dfce] bg-white text-[#746b5e] hover:border-[#c9a45c] hover:bg-[#faf5eb]"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="p-16 text-center">
              <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-[#eee6d9] border-t-[#b38b48]" />
              <p className="mt-4 text-center text-sm text-[#81796e]">
                Loading vendors...
              </p>
            </div>
          ) : filteredVendors.length === 0 ? (
            <div className="px-6 py-16 text-center">
              <div className="text-4xl">♙</div>
              <h4 className="mt-4 text-center font-serif text-2xl">
                No vendors found
              </h4>
              <p className="mt-3 text-center text-sm text-[#81796e]">
                Try changing your search or filter.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[850px] text-center">
                <thead className="bg-[#f8f5ef]">
                  <tr className="text-center text-xs uppercase tracking-[0.14em] text-[#81796e]">
                    <th className="px-6 py-5 text-center font-semibold">
                      Vendor
                    </th>
                    <th className="px-6 py-5 text-center font-semibold">
                      Store Details
                    </th>
                    <th className="px-6 py-5 text-center font-semibold">
                      Contact
                    </th>
                    <th className="px-6 py-5 text-center font-semibold">
                      Status
                    </th>
                    <th className="px-6 py-5 text-center font-semibold">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-[#f0e9dd]">
                  {filteredVendors.map((vendor) => (
                    <tr
                      key={vendor._id}
                      className="text-center transition hover:bg-[#faf7f1]"
                    >
                      <td className="px-6 py-5 text-center">
                        <div className="flex flex-col items-center gap-2">
                          <div className="flex h-11 w-11 items-center justify-center rounded-full border border-[#ead8b7] bg-[#f8efd9] font-semibold text-[#946d29]">
                            {getName(vendor).charAt(0).toUpperCase()}
                          </div>

                          <p className="w-full text-center font-semibold text-[#211e19]">
                            {getName(vendor)}
                          </p>

                          <p className="text-center text-xs text-[#a49a8c]">
                            ID: {String(vendor._id).slice(-5)}
                          </p>
                        </div>
                      </td>

                      <td className="px-6 py-5 text-center">
                        <p className="w-full text-center font-semibold text-[#211e19]">
                          {getShopName(vendor)}
                        </p>

                        <p className="mx-auto mt-2 w-full max-w-xs text-center text-sm leading-6 text-[#81796e]">
                          {getAddress(vendor)}
                        </p>
                      </td>

                      <td className="px-6 py-5 text-center">
                        <p className="break-all text-center text-sm text-[#494239]">
                          {vendor.email || "Email unavailable"}
                        </p>

                        <p className="mt-2 text-center text-sm text-[#81796e]">
                          {vendor.phone || "Phone unavailable"}
                        </p>
                      </td>

                      <td className="px-6 py-5 text-center">
                        <span
                          className={`inline-flex items-center gap-2 rounded-full px-3.5 py-2 text-xs font-semibold capitalize ${
                            vendor.status === "approved"
                              ? "bg-emerald-50 text-emerald-700"
                              : vendor.status === "rejected"
                              ? "bg-red-50 text-red-700"
                              : "bg-[#fbf0d8] text-[#946d29]"
                          }`}
                        >
                          <span
                            className={`h-2 w-2 rounded-full ${
                              vendor.status === "approved"
                                ? "bg-emerald-500"
                                : vendor.status === "rejected"
                                ? "bg-red-500"
                                : "bg-[#c9a45c]"
                            }`}
                          />
                          {vendor.status}
                        </span>
                      </td>

                      <td className="px-6 py-5 text-center">
                        {vendor.status === "pending" ? (
                          <div className="flex flex-col items-center gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                setConfirmVendor(vendor);
                                setConfirmStatus("approved");
                              }}
                              className="w-24 rounded-lg bg-emerald-600 px-3 py-2.5 text-xs font-semibold text-white transition hover:bg-emerald-700"
                            >
                              Approve
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                setConfirmVendor(vendor);
                                setConfirmStatus("rejected");
                              }}
                              className="w-24 rounded-lg border border-red-200 bg-white px-3 py-2.5 text-xs font-semibold text-red-600 transition hover:bg-red-50"
                            >
                              Reject
                            </button>
                          </div>
                        ) : (
                          <span className="text-center text-sm text-[#a49a8c]">
                            Completed
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="flex flex-col items-center justify-center gap-2 border-t border-[#eee6d9] bg-[#faf7f1] px-6 py-5 text-center text-xs text-[#81796e] sm:flex-row sm:justify-center sm:gap-8">
            <p className="text-center">
              Showing {filteredVendors.length} of {vendors.length} vendors
            </p>

            <p className="text-center">
              FashRentt Admin · Vendor Management
            </p>
          </div>
        </section>

        {/* OUTFIT MANAGEMENT */}
        <section className="mx-auto w-full max-w-[1240px]">
          <div className="mx-auto mb-9 w-full max-w-3xl text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#a77b2b]">
              REVIEW / COLLECTION
            </p>

            <h2 className="mt-4 text-center font-serif text-4xl font-normal sm:text-5xl">
              Outfit Management
            </h2>

            <div className="mx-auto mt-5 h-px w-20 bg-[#c9a45c]" />

            <p className="mx-auto mt-5 w-full max-w-2xl text-center text-sm leading-7 text-[#81796e] sm:text-base">
              Review outfits submitted by vendors and approve collections
              before they appear to customers.
            </p>
          </div>

          <div className="mx-auto mb-7 grid w-full grid-cols-1 gap-5 sm:grid-cols-3">
            {["pending", "approved", "rejected"].map((status) => {
              const count = outfits.filter(
                (item) => item.status === status
              ).length;

              return (
                <div
                  key={status}
                  className="flex min-h-[155px] flex-col items-center justify-center rounded-2xl border border-[#e9dfce] bg-[#fffdf9] p-6 text-center shadow-sm transition hover:-translate-y-1 hover:border-[#c9a45c] hover:shadow-lg"
                >
                  <p className="text-center text-sm capitalize text-[#81796e]">
                    {status} outfits
                  </p>

                  <h3
                    className={`mt-3 text-center text-4xl font-semibold ${
                      status === "approved"
                        ? "text-emerald-700"
                        : status === "rejected"
                        ? "text-red-600"
                        : "text-[#a77b2b]"
                    }`}
                  >
                    {count}
                  </h3>

                  <p className="mt-2 text-center text-xs uppercase tracking-[0.15em] text-[#a49a8c]">
                    Collection
                  </p>
                </div>
              );
            })}
          </div>

          <div className="mb-6 flex flex-wrap items-center justify-center gap-3">
            {["all", "pending", "approved", "rejected"].map((status) => (
              <button
                key={status}
                type="button"
                onClick={() => setOutfitFilter(status)}
                className={`rounded-full px-5 py-2.5 text-sm font-semibold capitalize transition ${
                  outfitFilter === status
                    ? "bg-[#211e19] text-white"
                    : "border border-[#e9dfce] bg-[#fffdf9] text-[#746b5e] hover:border-[#c9a45c]"
                }`}
              >
                {status === "all" ? "All Outfits" : status}
              </button>
            ))}

            <button
              type="button"
              onClick={fetchOutfits}
              disabled={outfitLoading}
              className="rounded-xl border border-[#e9dfce] bg-[#fffdf9] px-5 py-2.5 text-sm font-semibold text-[#746b5e] transition hover:border-[#c9a45c] disabled:opacity-50"
            >
              {outfitLoading ? "Refreshing..." : "↻ Refresh"}
            </button>
          </div>

          {outfitMessage && (
            <div className="mx-auto mb-6 w-full rounded-xl border border-[#e9dfce] bg-[#fbf0d8] p-4 text-center text-sm text-[#806126]">
              {outfitMessage}
            </div>
          )}

          <div className="overflow-hidden rounded-3xl border border-[#e9dfce] bg-[#fffdf9] shadow-[0_12px_40px_rgba(40,30,15,0.05)]">
            {outfitLoading ? (
  <div className="mx-auto w-full max-w-4xl rounded-3xl border border-[#e9dfce] bg-[#fffdf9] p-16 text-center text-sm text-[#81796e] shadow-sm">
    <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-[#eee6d9] border-t-[#b38b48]" />
    <p className="mt-4">Loading outfits...</p>
  </div>
) : filteredOutfits.length === 0 ? (
  <div className="mx-auto w-full max-w-4xl rounded-3xl border border-[#e9dfce] bg-[#fffdf9] p-16 text-center shadow-sm">
    <div className="text-4xl">👗</div>
    <h3 className="mt-4 font-serif text-2xl">
      No outfits found
    </h3>
    <p className="mt-3 text-sm text-[#81796e]">
      Vendor submissions will appear here.
    </p>
  </div>
) : (
  <div className="mx-auto grid w-full grid-cols-1 items-stretch gap-6 sm:grid-cols-2 lg:grid-cols-3">
    {filteredOutfits.map((outfit) => (
      <article
        key={outfit._id}
        className="flex h-full min-w-0 flex-col overflow-hidden rounded-3xl border border-[#e9dfce] bg-[#fffdf9] text-center shadow-sm transition duration-300 hover:-translate-y-1 hover:border-[#c9a45c] hover:shadow-xl"
      >
        {/* Outfit image */}
        <div className="relative aspect-[4/5] w-full overflow-hidden bg-[#f2ede5]">
          {outfit.images?.[0] ? (
            <img
              src={outfit.images[0]}
              alt={outfit.name || "Outfit"}
              className="h-full w-full object-cover transition duration-500 hover:scale-[1.03]"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-5xl">
              👗
            </div>
          )}

          <span
            className={`absolute right-3 top-3 rounded-full px-3 py-1.5 text-xs font-semibold capitalize shadow-sm ${
              outfit.status === "approved"
                ? "bg-emerald-50 text-emerald-700"
                : outfit.status === "rejected"
                ? "bg-red-50 text-red-700"
                : "bg-[#fbf0d8] text-[#946d29]"
            }`}
          >
            {outfit.status}
          </span>
        </div>

        {/* Outfit information */}
        <div className="flex flex-1 flex-col items-center px-5 py-6 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#a77b2b]">
            {outfit.category || "Fashion"}
          </p>

          <h3 className="mt-2 line-clamp-2 min-h-[3.5rem] font-serif text-2xl font-normal leading-tight text-[#211e19]">
            {outfit.name || "Untitled outfit"}
          </h3>

          <p className="mt-3 line-clamp-3 min-h-[4.5rem] w-full text-sm leading-6 text-[#81796e]">
            {outfit.description || "No description provided."}
          </p>

          <div className="mt-4 w-full space-y-2 text-sm text-[#746b5e]">
            <p className="break-words">
              <span className="font-semibold text-[#211e19]">
                Occasions:{" "}
              </span>
              {Array.isArray(outfit.occasion)
                ? outfit.occasion.join(", ") || "Not specified"
                : outfit.occasion || "Not specified"}
            </p>

            <p className="break-words">
              <span className="font-semibold text-[#211e19]">
                Colors:{" "}
              </span>
              {Array.isArray(outfit.color)
                ? outfit.color.join(", ") || "Not specified"
                : outfit.color || "Not specified"}
            </p>
          </div>

          {/* Pricing details */}
          <div className="mt-5 grid w-full grid-cols-3 gap-2">
            <div className="min-w-0 rounded-xl border border-[#e9dfce] bg-white px-2 py-3">
              <p className="text-[11px] leading-4 text-[#a49a8c]">
                Rental price
              </p>
              <p className="mt-1 break-words text-sm font-semibold text-[#211e19]">
                ₹{outfit.rentalPrice ?? "—"}
              </p>
            </div>

            <div className="min-w-0 rounded-xl border border-[#e9dfce] bg-white px-2 py-3">
              <p className="text-[11px] leading-4 text-[#a49a8c]">
                Security deposit
              </p>
              <p className="mt-1 break-words text-sm font-semibold text-[#211e19]">
                ₹{outfit.securityDeposit ?? "—"}
              </p>
            </div>

            <div className="min-w-0 rounded-xl border border-[#e9dfce] bg-white px-2 py-3">
              <p className="text-[11px] leading-4 text-[#a49a8c]">
                Duration
              </p>
              <p className="mt-1 text-sm font-semibold text-[#211e19]">
                {outfit.rentalDuration ?? "—"} days
              </p>
            </div>
          </div>

          <p className="mt-4 w-full break-all text-xs text-[#a49a8c]">
            Vendor ID:{" "}
            {typeof outfit.vendor === "object"
              ? outfit.vendor?._id || "Unavailable"
              : outfit.vendor || "Unavailable"}
          </p>

          {/* Actions stay at the bottom */}
          <div className="mt-auto flex w-full flex-col justify-center gap-2 pt-6">
            <a
              href={`/outfits/${outfit._id}`}
              className="inline-flex w-full items-center justify-center rounded-xl border border-[#e9dfce] bg-white px-4 py-3 text-sm font-semibold text-[#494239] transition hover:border-[#c9a45c] hover:bg-[#faf7f1]"
            >
              View Details
            </a>

            {outfit.status === "pending" && (
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  disabled={outfitUpdating === outfit._id}
                  onClick={() =>
                    updateOutfitStatus(outfit._id, "approved")
                  }
                  className="rounded-xl bg-emerald-600 px-3 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-50"
                >
                  {outfitUpdating === outfit._id
                    ? "Updating..."
                    : "✓ Approve"}
                </button>

                <button
                  type="button"
                  disabled={outfitUpdating === outfit._id}
                  onClick={() =>
                    updateOutfitStatus(outfit._id, "rejected")
                  }
                  className="rounded-xl border border-red-200 bg-white px-3 py-3 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:opacity-50"
                >
                  {outfitUpdating === outfit._id
                    ? "Updating..."
                    : "Reject"}
                </button>
              </div>
            )}
          </div>
        </div>
      </article>
    ))}
  </div>
)}
          </div>
        </section>
        {/* CENTERED ADMIN NOTE */}
        <section className="mx-auto w-full max-w-[1240px] px-4 py-2">
          <div className="mx-auto mt-10 flex w-full max-w-4xl items-center justify-center rounded-2xl border border-[#e9dfce] bg-[#fffdf9] px-6 py-5 text-center shadow-sm">
            <p className="m-0 w-full text-center text-sm leading-7 text-[#746b5e]">
              <span className="font-semibold text-[#a77b2b]">
                {"✦ Admin note: "}
              </span>
              Only approve vendors after reviewing their store details and
              registration information.
            </p>
          </div>
        </section>
      </div>



      {/* VENDOR CONFIRMATION MODAL */}
      {confirmVendor && confirmStatus && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 py-6 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl border border-[#e9dfce] bg-[#fffdf9] p-8 text-center shadow-2xl">
            <div 
            className={`mx-auto flex h-14 w-14 items-center justify-center rounded-2xl text-2xl ${
                confirmStatus === "approved"
                  ? "bg-emerald-50 text-emerald-600"
                  : "bg-red-50 text-red-600"
              }`}
            >
              {confirmStatus === "approved" ? "✓" : "!"}
            </div>

            <p className="mt-5 text-center text-xs font-semibold uppercase tracking-[0.25em] text-[#a77b2b]">
              Vendor Review
            </p>

            <h3 className="mt-3 text-center font-serif text-3xl font-normal">
              {confirmStatus === "approved"
                ? "Approve vendor?"
                : "Reject vendor?"}
            </h3>

            <p className="mt-4 text-center text-sm leading-7 text-[#81796e]">
              Are you sure you want to{" "}
              {confirmStatus === "approved" ? "approve" : "reject"}{" "}
              <span className="font-semibold text-[#211e19]">
                {getName(confirmVendor)}
              </span>{" "}
              from{" "}
              <span className="font-semibold text-[#211e19]">
                {getShopName(confirmVendor)}
              </span>
              ?
            </p>

            <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row">
              <button
                type="button"
                disabled={updating !== ""}
                onClick={() => {
                  setConfirmVendor(null);
                  setConfirmStatus(null);
                }}
                className="flex-1 rounded-xl border border-[#e9dfce] bg-white px-5 py-3 text-sm font-semibold text-[#746b5e] transition hover:bg-[#faf7f1] disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={updating !== ""}
                onClick={updateStatus}
                className={`flex-1 rounded-xl px-5 py-3 text-sm font-semibold text-white transition disabled:opacity-50 ${
                  confirmStatus === "approved"
                    ? "bg-emerald-600 hover:bg-emerald-700"
                    : "bg-red-600 hover:bg-red-700"
                }`}
              >
                {updating
                  ? "Processing..."
                  : confirmStatus === "approved"
                  ? "Yes, Approve"
                  : "Yes, Reject"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

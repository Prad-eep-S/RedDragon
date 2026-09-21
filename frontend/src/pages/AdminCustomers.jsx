import React, { useEffect, useState } from "react";
import Cookies from "js-cookie";
import api from "../api/api";
import "./AdminCustomers.css";

const AdminCustomers = () => {
  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [error, setError] = useState("");

  const getAuthHeaders = () => {
    const token = Cookies.get("token");

    if (!token) {
      throw new Error("Authentication token not found. Please login again.");
    }

    return {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    };
  };

  // =========================================================
  // GET CUSTOMERS
  // =========================================================

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/admin/customers", getAuthHeaders());

      console.log("Customers response:", response.data);

      setCustomers(response.data.customers || []);
    } catch (error) {
      console.error("Customer status update error:", {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
        url: error.config?.url,
        method: error.config?.method,
      });

      setError(
        error.response?.data?.message ||
          error.response?.data?.error ||
          error.message ||
          "Failed to update customer status.",
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // SEARCH CUSTOMERS
  // =========================================================

  const handleSearch = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get(
        `/admin/customers?search=${encodeURIComponent(search.trim())}`,
        getAuthHeaders(),
      );

      console.log("Customer search response:", response.data);

      setCustomers(response.data.customers || []);
    } catch (error) {
      console.error(
        "Customer search error:",
        error.response?.data || error.message,
      );

      setError(
        error.response?.data?.message ||
          error.response?.data?.error ||
          error.message ||
          "Failed to search customers.",
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // SEARCH ON ENTER
  // =========================================================

  const handleSearchKeyDown = (event) => {
    if (event.key === "Enter") {
      handleSearch();
    }
  };

  // =========================================================
  // CLEAR SEARCH
  // =========================================================

  const handleClearSearch = () => {
    setSearch("");
    fetchCustomers();
  };

  // =========================================================
  // TOGGLE CUSTOMER STATUS
  // =========================================================

  const handleStatusToggle = async (customer) => {
    const customerId = customer.customer_id;

    const newStatus = !customer.is_active;

    const actionText = newStatus ? "activate" : "deactivate";

    const confirmed = window.confirm(
      `Are you sure you want to ${actionText} ${
        customer.name || "this customer"
      }?`,
    );

    if (!confirmed) {
      return;
    }

    try {
      setActionLoadingId(customerId);
      setError("");

      const response = await api.patch(
        `/admin/customers/${customerId}/status`,
        {
          is_active: newStatus,
        },
        getAuthHeaders(),
      );

      console.log("Customer status update response:", response.data);

      // Update only the changed customer in the current list
      setCustomers((currentCustomers) =>
        currentCustomers.map((item) =>
          item.customer_id === customerId
            ? {
                ...item,
                ...response.data.customer,
                is_active: newStatus,
                account_status: newStatus ? "ACTIVE" : "INACTIVE",
              }
            : item,
        ),
      );
    } catch (error) {
      console.error(
        "Customer status update error:",
        error.response?.data || error.message,
      );

      setError(
        error.response?.data?.message ||
          error.response?.data?.error ||
          error.message ||
          "Failed to update customer status.",
      );
    } finally {
      setActionLoadingId(null);
    }
  };

  // =========================================================
  // INITIAL LOAD
  // =========================================================

  useEffect(() => {
    fetchCustomers();
  }, []);

  // =========================================================
  // LOADING
  // =========================================================

  if (loading && customers.length === 0) {
    return (
      <div className="admin-customers-page">
        <div className="admin-customers-loading">
          <div className="admin-customers-spinner"></div>

          <p>Loading customers...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-customers-page">
      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="admin-customers-header">
        <div>
          <p className="admin-customers-eyebrow">ADMIN PANEL</p>

          <h1>Customers</h1>

          <p className="admin-customers-description">
            View and manage customer accounts.
          </p>
        </div>

        <button
          type="button"
          className="admin-customers-refresh-btn"
          onClick={fetchCustomers}
          disabled={loading}
        >
          {loading ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      {/* =====================================================
          ERROR
      ===================================================== */}

      {error && (
        <div className="admin-customers-error">
          <span>{error}</span>

          <button type="button" onClick={() => setError("")}>
            ×
          </button>
        </div>
      )}

      {/* =====================================================
          SEARCH
      ===================================================== */}

      <div className="admin-customers-toolbar">
        <div className="admin-customers-search">
          <input
            type="text"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            onKeyDown={handleSearchKeyDown}
            placeholder="Search by name, email, phone or ID..."
          />

          {search && (
            <button
              type="button"
              className="admin-customers-clear-btn"
              onClick={handleClearSearch}
              title="Clear search"
            >
              ×
            </button>
          )}
        </div>

        <button
          type="button"
          className="admin-customers-search-btn"
          onClick={handleSearch}
          disabled={loading}
        >
          Search
        </button>
      </div>

      {/* =====================================================
          CUSTOMER COUNT
      ===================================================== */}

      <div className="admin-customers-summary">
        <span>
          {customers.length} customer
          {customers.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* =====================================================
          TABLE
      ===================================================== */}

      <div className="admin-customers-table-wrapper">
        <table className="admin-customers-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Customer</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Status</th>
              <th>Created</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {customers.length === 0 ? (
              <tr>
                <td colSpan="7" className="admin-customers-empty">
                  No customers found.
                </td>
              </tr>
            ) : (
              customers.map((customer) => {
                const isActive = customer.is_active === true;

                const actionLoading = actionLoadingId === customer.customer_id;

                return (
                  <tr key={customer.customer_id}>
                    <td>
                      <span className="customer-id">
                        #{customer.customer_id}
                      </span>
                    </td>

                    <td>
                      <div className="customer-name-cell">
                        <div className="customer-avatar">
                          {(customer.name || "C").charAt(0).toUpperCase()}
                        </div>

                        <div>
                          <div className="customer-name">
                            {customer.name || "—"}
                          </div>

                          <div className="customer-subtext">Customer</div>
                        </div>
                      </div>
                    </td>

                    <td>
                      <span className="customer-email">
                        {customer.email || "—"}
                      </span>
                    </td>

                    <td>{customer.phone || "—"}</td>

                    <td>
                      <span
                        className={`customer-status ${
                          isActive ? "active" : "inactive"
                        }`}
                      >
                        {isActive ? "ACTIVE" : "INACTIVE"}
                      </span>
                    </td>

                    <td>
                      <span className="customer-date">
                        {customer.created_at
                          ? new Date(customer.created_at).toLocaleDateString()
                          : "—"}
                      </span>
                    </td>

                    <td>
                      <button
                        type="button"
                        className={`customer-status-btn ${
                          isActive ? "deactivate" : "activate"
                        }`}
                        onClick={() => handleStatusToggle(customer)}
                        disabled={actionLoading}
                      >
                        {actionLoading
                          ? "Updating..."
                          : isActive
                            ? "Deactivate"
                            : "Activate"}
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminCustomers;

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import api from "../api/api";
import "./AdminOrders.css";

const AdminOrders = () => {
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");

  const [loading, setLoading] = useState(true);
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
  // GET ORDERS
  // =========================================================

  const fetchOrders = async (searchValue = search, statusValue = status) => {
    try {
      setLoading(true);
      setError("");

      const params = new URLSearchParams();

      if (searchValue.trim()) {
        params.append("search", searchValue.trim());
      }

      if (statusValue) {
        params.append("status", statusValue);
      }

      const query = params.toString();

      const url = query ? `/admin/orders?${query}` : "/admin/orders";

      const response = await api.get(url, getAuthHeaders());

      console.log("Admin orders response:", response.data);

      setOrders(response.data.orders || []);
    } catch (error) {
      console.error(
        "Admin orders error:",
        error.response?.data || error.message,
      );

      setError(
        error.response?.data?.message ||
          error.response?.data?.error ||
          error.message ||
          "Failed to load orders.",
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // SEARCH
  // =========================================================

  const handleSearch = () => {
    fetchOrders(search, status);
  };

  // =========================================================
  // ENTER KEY SEARCH
  // =========================================================

  const handleSearchKeyDown = (event) => {
    if (event.key === "Enter") {
      handleSearch();
    }
  };

  // =========================================================
  // STATUS FILTER
  // =========================================================

  const handleStatusChange = (event) => {
    const newStatus = event.target.value;

    setStatus(newStatus);

    fetchOrders(search, newStatus);
  };

  // =========================================================
  // CLEAR SEARCH
  // =========================================================

  const handleClearSearch = () => {
    setSearch("");
    fetchOrders("", status);
  };

  // =========================================================
  // CLEAR ALL FILTERS
  // =========================================================

  const handleClearFilters = () => {
    setSearch("");
    setStatus("");

    fetchOrders("", "");
  };

  // =========================================================
  // INITIAL LOAD
  // =========================================================

  useEffect(() => {
    fetchOrders("", "");
  }, []);

  // =========================================================
  // ORDER STATUS CLASS
  // =========================================================

  const getOrderStatusClass = (orderStatus) => {
    const normalizedStatus = String(orderStatus || "")
      .toLowerCase()
      .replaceAll("_", "-");

    return `order-status ${normalizedStatus}`;
  };

  // =========================================================
  // PAYMENT STATUS CLASS
  // =========================================================

  const getPaymentStatusClass = (paymentStatus) => {
    const normalizedStatus = String(paymentStatus || "").toLowerCase();

    return `payment-status ${normalizedStatus}`;
  };

  // =========================================================
  // FORMAT AMOUNT
  // =========================================================

  const formatAmount = (amount) => {
    const value = Number(amount || 0);

    return `₹${value.toFixed(2)}`;
  };

  // =========================================================
  // FORMAT DATE
  // =========================================================

  const formatDate = (date) => {
    if (!date) {
      return "—";
    }

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "—";
    }

    return parsedDate.toLocaleString();
  };

  // =========================================================
  // LOADING
  // =========================================================

  if (loading && orders.length === 0) {
    return (
      <div className="admin-orders-page">
        <div className="admin-orders-loading">
          <div className="admin-orders-spinner"></div>
          <p>Loading orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-orders-page">
      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="admin-orders-header">
        <div>
          <p className="admin-orders-eyebrow">ADMIN PANEL</p>

          <h1>Orders</h1>

          <p className="admin-orders-description">
            View and monitor all customer orders.
          </p>
        </div>

        <button
          type="button"
          className="admin-orders-refresh-btn"
          onClick={() => fetchOrders(search, status)}
          disabled={loading}
        >
          {loading ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      {/* =====================================================
          ERROR
      ===================================================== */}

      {error && (
        <div className="admin-orders-error">
          <span>{error}</span>

          <button type="button" onClick={() => setError("")}>
            ×
          </button>
        </div>
      )}

      {/* =====================================================
          FILTERS
      ===================================================== */}

      <div className="admin-orders-filters">
        {/* SEARCH */}

        <div className="admin-orders-search">
          <input
            type="text"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            onKeyDown={handleSearchKeyDown}
            placeholder="Search order, customer or restaurant..."
          />

          {search && (
            <button
              type="button"
              className="admin-orders-clear-search"
              onClick={handleClearSearch}
            >
              ×
            </button>
          )}
        </div>

        {/* SEARCH BUTTON */}

        <button
          type="button"
          className="admin-orders-search-btn"
          onClick={handleSearch}
          disabled={loading}
        >
          Search
        </button>

        {/* STATUS */}

        <select
          value={status}
          onChange={handleStatusChange}
          className="admin-orders-status-select"
        >
          <option value="">All Status</option>

          <option value="PLACED">Placed</option>

          <option value="CONFIRMED">Confirmed</option>

          <option value="ACCEPTED">Accepted</option>

          <option value="PREPARING">Preparing</option>

          <option value="READY">Ready</option>

          <option value="OUT_FOR_DELIVERY">Out for Delivery</option>

          <option value="DELIVERED">Delivered</option>

          <option value="CANCELLED">Cancelled</option>
        </select>

        {/* CLEAR */}

        {(search || status) && (
          <button
            type="button"
            className="admin-orders-clear-btn"
            onClick={handleClearFilters}
          >
            Clear
          </button>
        )}
      </div>

      {/* =====================================================
          SUMMARY
      ===================================================== */}

      <div className="admin-orders-summary">
        <span>
          {orders.length} order
          {orders.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* =====================================================
          TABLE
      ===================================================== */}

      <div className="admin-orders-table-wrapper">
        <table className="admin-orders-table">
          <thead>
            <tr>
              <th>Order</th>

              <th>Customer</th>

              <th>Restaurant</th>

              <th>Items</th>

              <th>Total</th>

              <th>Order Status</th>

              <th>Payment</th>

              <th>Date</th>

              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {orders.length === 0 ? (
              <tr>
                <td colSpan="9" className="admin-orders-empty">
                  No orders found.
                </td>
              </tr>
            ) : (
              orders.map((order) => (
                <tr key={order.order_id}>
                  {/* ORDER ID */}

                  <td>
                    <span className="order-id">#{order.order_id}</span>
                  </td>

                  {/* CUSTOMER */}

                  <td>
                    <div className="order-customer">
                      <div className="order-avatar">
                        {(order.customer_name || "C").charAt(0).toUpperCase()}
                      </div>

                      <div>
                        <div className="order-customer-name">
                          {order.customer_name || "—"}
                        </div>

                        <div className="order-customer-email">
                          {order.customer_email || "—"}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* RESTAURANT */}

                  <td>
                    <div className="order-restaurant">
                      <div className="restaurant-mini-avatar">
                        {(order.restaurant_name || "R").charAt(0).toUpperCase()}
                      </div>

                      <span>{order.restaurant_name || "—"}</span>
                    </div>
                  </td>

                  {/* ITEMS */}

                  <td>
                    <span className="order-items-count">
                      {order.item_count || 0}
                    </span>
                  </td>

                  {/* TOTAL */}

                  <td>
                    <strong className="order-total">
                      {formatAmount(order.total_amount)}
                    </strong>
                  </td>

                  {/* STATUS */}

                  <td>
                    <span className={getOrderStatusClass(order.order_status)}>
                      {String(order.order_status || "UNKNOWN").replaceAll(
                        "_",
                        " ",
                      )}
                    </span>
                  </td>

                  {/* PAYMENT */}

                  <td>
                    <div className="order-payment">
                      <span className="payment-method">
                        {order.payment_method || "—"}
                      </span>

                      {order.payment_status && (
                        <span
                          className={getPaymentStatusClass(
                            order.payment_status,
                          )}
                        >
                          {order.payment_status}
                        </span>
                      )}
                    </div>
                  </td>

                  {/* DATE */}

                  <td>
                    <span className="order-date">
                      {formatDate(order.created_at)}
                    </span>
                  </td>

                  {/* ACTION */}

                  <td>
                    <button
                      type="button"
                      className="order-view-btn"
                      onClick={() =>
                        navigate(`/admin/orders/${order.order_id}`)
                      }
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminOrders;

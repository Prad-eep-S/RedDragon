import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Cookies from "js-cookie";
import api from "../api/api";
import "./AdminOrderDetails.css";

const AdminOrderDetails = () => {
  const { orderId } = useParams();

  const [orderData, setOrderData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // =========================================================
  // AUTH HEADERS
  // =========================================================

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
  // FETCH ORDER DETAILS
  // =========================================================

  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get(
        `/admin/orders/${orderId}`,
        getAuthHeaders(),
      );

      console.log("Admin order details response:", response.data);

      setOrderData(response.data);
    } catch (error) {
      console.error(
        "Admin order details error:",
        error.response?.data || error.message,
      );

      setError(
        error.response?.data?.message ||
          error.response?.data?.error ||
          error.message ||
          "Failed to load order details.",
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // INITIAL LOAD
  // =========================================================

  useEffect(() => {
    if (orderId) {
      fetchOrderDetails();
    }
  }, [orderId]);

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
  // FORMAT AMOUNT
  // =========================================================

  const formatAmount = (amount) => {
    const value = Number(amount || 0);

    return `₹${value.toFixed(2)}`;
  };

  // =========================================================
  // STATUS CLASS
  // =========================================================

  const getStatusClass = (status) => {
    return String(status || "")
      .toLowerCase()
      .replaceAll("_", "-");
  };

  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {
    return (
      <div className="admin-order-details-page">
        <div className="admin-order-details-loading">
          <div className="admin-order-details-spinner"></div>

          <p>Loading order details...</p>
        </div>
      </div>
    );
  }

  // =========================================================
  // ERROR
  // =========================================================

  if (error) {
    return (
      <div className="admin-order-details-page">
        <div className="admin-order-details-error">
          <h2>Unable to load order</h2>

          <p>{error}</p>

          <div className="admin-order-details-error-actions">
            <Link to="/admin/orders" className="admin-order-details-back-btn">
              Back to Orders
            </Link>

            <button
              type="button"
              onClick={fetchOrderDetails}
              className="admin-order-details-retry-btn"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!orderData?.order) {
    return (
      <div className="admin-order-details-page">
        <div className="admin-order-details-error">
          <h2>Order not found</h2>

          <Link to="/admin/orders" className="admin-order-details-back-btn">
            Back to Orders
          </Link>
        </div>
      </div>
    );
  }

  // =========================================================
  // DATA
  // =========================================================

  const order = orderData.order;

  const items = orderData.order_items || [];

  const deliveryAddress = orderData.delivery_address || null;

  const totalAmount = orderData.total_amount ?? order.total_amount ?? 0;

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <div className="admin-order-details-page">
      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="admin-order-details-header">
        <div>
          <Link to="/admin/orders" className="admin-order-details-back-link">
            ← Back to Orders
          </Link>

          <p className="admin-order-details-eyebrow">ADMIN PANEL</p>

          <div className="admin-order-title-row">
            <h1>Order #{order.order_id}</h1>

            <span
              className={`admin-order-status ${getStatusClass(
                order.order_status,
              )}`}
            >
              {String(order.order_status || "UNKNOWN").replaceAll("_", " ")}
            </span>
          </div>

          <p className="admin-order-created">
            Created {formatDate(order.created_at)}
          </p>
        </div>

        <button
          type="button"
          className="admin-order-refresh-btn"
          onClick={fetchOrderDetails}
        >
          Refresh
        </button>
      </div>

      {/* =====================================================
          OVERVIEW
      ===================================================== */}

      <div className="admin-order-overview-grid">
        {/* CUSTOMER */}

        <section className="admin-order-info-card">
          <div className="admin-order-card-title">Customer</div>

          <div className="admin-order-person">
            <div className="admin-order-avatar">
              {(order.customer_name || "C").charAt(0).toUpperCase()}
            </div>

            <div>
              <h3>{order.customer_name || "—"}</h3>

              <p>{order.customer_email || "—"}</p>

              <p>{order.customer_phone || "—"}</p>
            </div>
          </div>
        </section>

        {/* RESTAURANT */}

        <section className="admin-order-info-card">
          <div className="admin-order-card-title">Restaurant</div>

          <div className="admin-order-person">
            <div className="admin-order-avatar restaurant">
              {(order.restaurant_name || "R").charAt(0).toUpperCase()}
            </div>

            <div>
              <h3>{order.restaurant_name || "—"}</h3>

              <p>{order.restaurant_email || "—"}</p>

              <p>{order.restaurant_phone || "—"}</p>
            </div>
          </div>
        </section>
      </div>

      {/* =====================================================
          DELIVERY ADDRESS
      ===================================================== */}

      <section className="admin-order-section">
        <div className="admin-order-section-title">Delivery Address</div>

        <div className="admin-order-address-card">
          {deliveryAddress ? (
            <>
              <div className="admin-address-type">
                {deliveryAddress.address_type || "ADDRESS"}
              </div>

              <p>{deliveryAddress.address_line1 || ""}</p>

              {deliveryAddress.address_line2 && (
                <p>{deliveryAddress.address_line2}</p>
              )}

              <p>
                {deliveryAddress.city || ""}
                {deliveryAddress.city && deliveryAddress.state ? ", " : ""}
                {deliveryAddress.state || ""}
              </p>

              <p>{deliveryAddress.postal_code || ""}</p>

              {deliveryAddress.landmark && (
                <p>Landmark: {deliveryAddress.landmark}</p>
              )}

              {!deliveryAddress.is_active && (
                <span className="admin-address-history-note">
                  This address is no longer active, but it is retained for this
                  historical order.
                </span>
              )}
            </>
          ) : (
            <p className="admin-no-address">Delivery address not available.</p>
          )}
        </div>
      </section>

      {/* =====================================================
          ORDER ITEMS
      ===================================================== */}

      <section className="admin-order-section">
        <div className="admin-order-section-header">
          <div>
            <div className="admin-order-section-title">Order Items</div>

            <p className="admin-order-section-subtitle">
              {items.length} item
              {items.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>

        <div className="admin-order-items-card">
          {items.length === 0 ? (
            <div className="admin-order-no-items">
              No items found for this order.
            </div>
          ) : (
            <div className="admin-order-items-list">
              {items.map((item) => {
                const itemTotal =
                  item.item_total ??
                  Number(item.quantity || 0) *
                    Number(item.price_at_the_time_of_order || 0);

                return (
                  <div className="admin-order-item" key={item.order_item_id}>
                    <div className="admin-order-item-main">
                      <div className="admin-order-item-image">
                        {item.image_url ? (
                          <img
                            src={item.image_url}
                            alt={item.food_name || "Food"}
                          />
                        ) : (
                          <span>🍽️</span>
                        )}
                      </div>

                      <div>
                        <h3>{item.food_name || "Food item"}</h3>

                        {item.description && <p>{item.description}</p>}

                        <div className="admin-order-item-meta">
                          <span>Qty: {item.quantity || 0}</span>

                          <span>
                            Price:{" "}
                            {formatAmount(item.price_at_the_time_of_order)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="admin-order-item-total">
                      {formatAmount(itemTotal)}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* =====================================================
          PAYMENT
      ===================================================== */}

      <section className="admin-order-section">
        <div className="admin-order-section-title">Payment</div>

        <div className="admin-payment-card">
          <div className="admin-payment-row">
            <span>Payment Method</span>

            <strong>{order.payment_method || "—"}</strong>
          </div>

          <div className="admin-payment-row">
            <span>Payment Status</span>

            <span
              className={`admin-payment-status ${String(
                order.payment_status || "",
              ).toLowerCase()}`}
            >
              {order.payment_status || "—"}
            </span>
          </div>

          <div className="admin-payment-row">
            <span>Payment Amount</span>

            <strong>{formatAmount(order.payment_amount)}</strong>
          </div>

          {order.payment_date && (
            <div className="admin-payment-row">
              <span>Payment Date</span>

              <span>{formatDate(order.payment_date)}</span>
            </div>
          )}
        </div>
      </section>

      {/* =====================================================
          TOTAL
      ===================================================== */}

      <section className="admin-order-total-card">
        <div>
          <span>Order Total</span>

          <small>
            {items.length} item
            {items.length !== 1 ? "s" : ""}
          </small>
        </div>

        <strong>{formatAmount(totalAmount)}</strong>
      </section>
    </div>
  );
};

export default AdminOrderDetails;

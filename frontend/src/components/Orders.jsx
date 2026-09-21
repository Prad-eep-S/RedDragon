import { Fragment, useEffect, useState } from "react";

import { getRestaurantOrders, updateOrderStatus } from "../services/api";

import {
  ClipboardList,
  CreditCard,
  Package,
  CalendarDays,
  ChevronDown,
  ChevronUp,
  Check,
  X,
  Clock,
} from "lucide-react";

function Orders() {
  const [orders, setOrders] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [activeTab, setActiveTab] = useState("incoming");

  const [expandedOrderId, setExpandedOrderId] = useState(null);

  const [updatingOrderId, setUpdatingOrderId] = useState(null);

  // =====================================================
  // LOAD ORDERS
  // =====================================================

  useEffect(() => {
    const loadOrders = async () => {
      try {
        setLoading(true);

        setError("");

        const ordersData = await getRestaurantOrders();

        console.log("Restaurant Orders:", ordersData);

        setOrders(Array.isArray(ordersData?.orders) ? ordersData.orders : []);
      } catch (err) {
        console.error("Orders Error:", err);

        setError(err.message || "Failed to load orders.");

        setOrders([]);
      } finally {
        setLoading(false);
      }
    };

    loadOrders();
  }, []);

  // =====================================================
  // UPDATE ORDER STATUS
  // =====================================================

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      setUpdatingOrderId(orderId);

      setError("");

      console.log("=================================");

      console.log("FRONTEND STATUS UPDATE");

      console.log("ORDER ID:", orderId);

      console.log("NEW STATUS:", newStatus);

      console.log("=================================");

      // =================================================
      // CALL BACKEND
      // =================================================

      const result = await updateOrderStatus(orderId, newStatus);

      console.log("BACKEND UPDATE SUCCESS:", result);

      // =================================================
      // UPDATE LOCAL ORDER
      // =================================================

      setOrders((currentOrders) =>
        currentOrders.map((order) =>
          order.order_id === orderId
            ? {
                ...order,
                order_status: newStatus,
                updated_at: new Date().toISOString(),
              }
            : order,
        ),
      );

      // =================================================
      // MOVE TO ACTIVE
      // =================================================

      if (
        newStatus === "ACCEPTED" ||
        newStatus === "PREPARING" ||
        newStatus === "READY" ||
        newStatus === "OUT_FOR_DELIVERY"
      ) {
        setActiveTab("active");

        setExpandedOrderId(orderId);
      }

      // =================================================
      // MOVE TO HISTORY
      // =================================================

      if (newStatus === "CANCELLED" || newStatus === "DELIVERED") {
        setActiveTab("history");

        setExpandedOrderId(orderId);
      }
    } catch (err) {
      console.error("STATUS UPDATE ERROR:", err);

      setError(err.message || "Failed to update order status.");
    } finally {
      setUpdatingOrderId(null);
    }
  };

  // =====================================================
  // EXPAND / COLLAPSE
  // =====================================================

  const toggleOrder = (orderId) => {
    setExpandedOrderId((currentId) => (currentId === orderId ? null : orderId));
  };

  // =====================================================
  // INCOMING ORDERS
  // =====================================================

  const incomingOrders = orders.filter(
    (order) => order.order_status === "CONFIRMED",
  );

  // =====================================================
  // ACTIVE ORDERS
  // =====================================================

  const activeOrders = orders.filter((order) =>
    ["ACCEPTED", "PREPARING", "READY", "OUT_FOR_DELIVERY"].includes(
      order.order_status,
    ),
  );

  // =====================================================
  // HISTORY ORDERS
  // =====================================================

  const historyOrders = orders.filter((order) =>
    ["CANCELLED", "DELIVERED"].includes(order.order_status),
  );

  // =====================================================
  // DISPLAYED ORDERS
  // =====================================================

  let displayedOrders = [];

  if (activeTab === "incoming") {
    displayedOrders = incomingOrders;
  }

  if (activeTab === "active") {
    displayedOrders = activeOrders;
  }

  if (activeTab === "history") {
    displayedOrders = historyOrders;
  }

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div className="orders-page">
        <div className="orders-loading">
          <ClipboardList size={40} />

          <p>Loading orders...</p>
        </div>
      </div>
    );
  }

  // =====================================================
  // PAGE
  // =====================================================

  return (
    <div className="orders-page">
      {/* =================================================
          HEADER
      ================================================= */}

      <div className="orders-header">
        <div>
          <h1>Orders</h1>

          <p>Manage orders received by your restaurant</p>
        </div>

        <div className="orders-count">
          <ClipboardList size={22} />

          <span>{orders.length} Orders</span>
        </div>
      </div>

      {/* =================================================
          ERROR
      ================================================= */}

      {error && (
        <div className="orders-error">
          <X size={20} />

          <span>{error}</span>
        </div>
      )}

      {/* =================================================
          TABS
      ================================================= */}

      <div className="orders-tabs">
        {/* =================================================
            INCOMING
        ================================================= */}

        <button
          type="button"
          className={
            activeTab === "incoming" ? "order-tab active" : "order-tab"
          }
          onClick={() => setActiveTab("incoming")}
        >
          <Clock size={18} />

          <span>Incoming Orders</span>

          <strong>{incomingOrders.length}</strong>
        </button>

        {/* =================================================
            ACTIVE
        ================================================= */}

        <button
          type="button"
          className={activeTab === "active" ? "order-tab active" : "order-tab"}
          onClick={() => setActiveTab("active")}
        >
          <Package size={18} />

          <span>Active Orders</span>

          <strong>{activeOrders.length}</strong>
        </button>

        {/* =================================================
            HISTORY
        ================================================= */}

        <button
          type="button"
          className={activeTab === "history" ? "order-tab active" : "order-tab"}
          onClick={() => setActiveTab("history")}
        >
          <ClipboardList size={18} />

          <span>Order History</span>

          <strong>{historyOrders.length}</strong>
        </button>
      </div>

      {/* =================================================
          EMPTY STATE
      ================================================= */}

      {displayedOrders.length === 0 ? (
        <div className="no-orders">
          <ClipboardList size={50} />

          <h3>
            {activeTab === "incoming" && "No Incoming Orders"}

            {activeTab === "active" && "No Active Orders"}

            {activeTab === "history" && "No Order History"}
          </h3>

          <p>
            {activeTab === "incoming" &&
              "There are currently no new orders waiting for your restaurant."}

            {activeTab === "active" && "There are currently no active orders."}

            {activeTab === "history" &&
              "There are currently no completed or cancelled orders."}
          </p>
        </div>
      ) : (
        <div className="orders-table-container">
          <table className="orders-table">
            <thead>
              <tr>
                <th>Order ID</th>

                <th>Customer ID</th>

                <th>Items</th>

                <th>Amount</th>

                <th>Status</th>

                <th>Date</th>

                <th>Details</th>
              </tr>
            </thead>

            <tbody>
              {displayedOrders.map((order) => {
                const isExpanded = expandedOrderId === order.order_id;

                const isUpdating = updatingOrderId === order.order_id;

                return (
                  <Fragment key={order.order_id}>
                    {/* =================================================
                          MAIN ROW
                      ================================================= */}

                    <tr
                      className={
                        isExpanded ? "order-row expanded" : "order-row"
                      }
                      onClick={() => toggleOrder(order.order_id)}
                    >
                      <td>
                        <strong>#{order.order_id}</strong>
                      </td>

                      <td>#{order.customer_id}</td>

                      <td>{getItemCount(order)}</td>

                      <td>
                        <strong>₹{getOrderAmount(order)}</strong>
                      </td>

                      <td>
                        <span
                          className={`order-status ${getStatusClass(
                            order.order_status,
                          )}`}
                        >
                          {order.order_status}
                        </span>
                      </td>

                      <td>
                        <div className="table-date">
                          <CalendarDays size={15} />

                          <span>{formatDate(order.created_at)}</span>
                        </div>
                      </td>

                      <td>
                        {isExpanded ? (
                          <ChevronUp size={20} />
                        ) : (
                          <ChevronDown size={20} />
                        )}
                      </td>
                    </tr>

                    {/* =================================================
                          EXPANDED DETAILS
                      ================================================= */}

                    {isExpanded && (
                      <tr className="order-details-row">
                        <td colSpan="7">
                          <div className="order-details">
                            {/* =================================================
                                  HEADER
                              ================================================= */}

                            <div className="details-header">
                              <div>
                                <h2>Order #{order.order_id}</h2>

                                <p>Placed on {formatDate(order.created_at)}</p>
                              </div>

                              <span
                                className={`order-status ${getStatusClass(
                                  order.order_status,
                                )}`}
                              >
                                {order.order_status}
                              </span>
                            </div>

                            {/* =================================================
                                  ORDER INFORMATION
                              ================================================= */}

                            <div className="order-section">
                              <div className="section-title">
                                <ClipboardList size={20} />

                                <h3>Order Information</h3>
                              </div>

                              <div className="order-info-grid">
                                <div>
                                  <span>Order ID</span>

                                  <strong>#{order.order_id}</strong>
                                </div>

                                <div>
                                  <span>Customer ID</span>

                                  <strong>#{order.customer_id}</strong>
                                </div>

                                <div>
                                  <span>Restaurant ID</span>

                                  <strong>#{order.restaurant_id}</strong>
                                </div>

                                <div>
                                  <span>Address ID</span>

                                  <strong>#{order.address_id}</strong>
                                </div>
                              </div>
                            </div>

                            {/* =================================================
                                  ITEMS
                              ================================================= */}

                            <div className="order-section">
                              <div className="section-title">
                                <Package size={20} />

                                <h3>Order Items</h3>
                              </div>

                              <div className="order-items">
                                {order.items && order.items.length > 0 ? (
                                  order.items.map((item) => (
                                    <div
                                      className="order-item"
                                      key={item.order_item_id}
                                    >
                                      <div className="food-info">
                                        <strong>
                                          {item.food_name ||
                                            `Food #${item.food_id}`}
                                        </strong>

                                        <span>Food ID: {item.food_id}</span>
                                      </div>

                                      <div className="item-quantity">
                                        <span>Quantity</span>

                                        <strong>{item.quantity}</strong>
                                      </div>

                                      <div className="item-price">
                                        <span>Unit Price</span>

                                        <strong>
                                          ₹
                                          {formatPrice(
                                            item.price_at_the_time_of_order,
                                          )}
                                        </strong>
                                      </div>

                                      <div className="item-total">
                                        <span>Total</span>

                                        <strong>
                                          ₹
                                          {formatPrice(
                                            Number(
                                              item.price_at_the_time_of_order,
                                            ) * Number(item.quantity),
                                          )}
                                        </strong>
                                      </div>
                                    </div>
                                  ))
                                ) : (
                                  <div className="no-items">
                                    No items found for this order.
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* =================================================
                                  PAYMENT
                              ================================================= */}

                            <div className="order-section">
                              <div className="section-title">
                                <CreditCard size={20} />

                                <h3>Payment</h3>
                              </div>

                              {order.payment ? (
                                <div className="payment-info">
                                  <div>
                                    <span>Payment ID</span>

                                    <strong>#{order.payment.payment_id}</strong>
                                  </div>

                                  <div>
                                    <span>Payment Method</span>

                                    <strong>
                                      {order.payment.payment_method ||
                                        "Not available"}
                                    </strong>
                                  </div>

                                  <div>
                                    <span>Payment Status</span>

                                    <strong
                                      className={`payment-status ${getPaymentClass(
                                        order.payment.payment_status,
                                      )}`}
                                    >
                                      {order.payment.payment_status ||
                                        "Not available"}
                                    </strong>
                                  </div>

                                  <div>
                                    <span>Amount</span>

                                    <strong>
                                      ₹{formatPrice(order.payment.amount)}
                                    </strong>
                                  </div>
                                </div>
                              ) : (
                                <div className="no-payment">
                                  No payment information available.
                                </div>
                              )}
                            </div>

                            {/* =================================================
                                  STATUS
                              ================================================= */}

                            <div className="order-section">
                              <div className="section-title">
                                <ClipboardList size={20} />

                                <h3>Order Status</h3>
                              </div>

                              <div className="status-management">
                                <div className="current-status">
                                  <span>Current Status</span>

                                  <strong
                                    className={`order-status ${getStatusClass(
                                      order.order_status,
                                    )}`}
                                  >
                                    {order.order_status}
                                  </strong>
                                </div>

                                {/* =================================================
                                      CONFIRMED
                                  ================================================= */}

                                {order.order_status === "CONFIRMED" && (
                                  <div className="status-actions">
                                    <button
                                      type="button"
                                      className="accept-order-btn"
                                      disabled={isUpdating}
                                      onClick={(event) => {
                                        event.stopPropagation();

                                        handleStatusUpdate(
                                          order.order_id,
                                          "ACCEPTED",
                                        );
                                      }}
                                    >
                                      <Check size={18} />

                                      {isUpdating
                                        ? "Updating..."
                                        : "Accept Order"}
                                    </button>

                                    <button
                                      type="button"
                                      className="reject-order-btn"
                                      disabled={isUpdating}
                                      onClick={(event) => {
                                        event.stopPropagation();

                                        handleStatusUpdate(
                                          order.order_id,
                                          "CANCELLED",
                                        );
                                      }}
                                    >
                                      <X size={18} />

                                      {isUpdating
                                        ? "Updating..."
                                        : "Reject Order"}
                                    </button>
                                  </div>
                                )}

                                {/* =================================================
                                      ACCEPTED
                                  ================================================= */}

                                {order.order_status === "ACCEPTED" && (
                                  <button
                                    type="button"
                                    className="status-action-btn"
                                    disabled={isUpdating}
                                    onClick={(event) => {
                                      event.stopPropagation();

                                      handleStatusUpdate(
                                        order.order_id,
                                        "PREPARING",
                                      );
                                    }}
                                  >
                                    <Clock size={18} />

                                    {isUpdating
                                      ? "Updating..."
                                      : "Start Preparing"}
                                  </button>
                                )}

                                {/* =================================================
                                      PREPARING
                                  ================================================= */}

                                {order.order_status === "PREPARING" && (
                                  <button
                                    type="button"
                                    className="status-action-btn"
                                    disabled={isUpdating}
                                    onClick={(event) => {
                                      event.stopPropagation();

                                      handleStatusUpdate(
                                        order.order_id,
                                        "READY",
                                      );
                                    }}
                                  >
                                    <Check size={18} />

                                    {isUpdating ? "Updating..." : "Mark Ready"}
                                  </button>
                                )}

                                {/* =================================================
                                      READY
                                  ================================================= */}

                                {order.order_status === "READY" && (
                                  <button
                                    type="button"
                                    className="status-action-btn"
                                    disabled={isUpdating}
                                    onClick={(event) => {
                                      event.stopPropagation();

                                      handleStatusUpdate(
                                        order.order_id,
                                        "OUT_FOR_DELIVERY",
                                      );
                                    }}
                                  >
                                    <Package size={18} />

                                    {isUpdating
                                      ? "Updating..."
                                      : "Out for Delivery"}
                                  </button>
                                )}

                                {/* =================================================
                                      OUT FOR DELIVERY
                                  ================================================= */}

                                {order.order_status === "OUT_FOR_DELIVERY" && (
                                  <button
                                    type="button"
                                    className="status-action-btn"
                                    disabled={isUpdating}
                                    onClick={(event) => {
                                      event.stopPropagation();

                                      handleStatusUpdate(
                                        order.order_id,
                                        "DELIVERED",
                                      );
                                    }}
                                  >
                                    <Check size={18} />

                                    {isUpdating
                                      ? "Updating..."
                                      : "Mark Delivered"}
                                  </button>
                                )}

                                {/* =================================================
                                      COMPLETED / CANCELLED
                                  ================================================= */}

                                {["CANCELLED", "DELIVERED"].includes(
                                  order.order_status,
                                ) && (
                                  <div className="completed-message">
                                    {order.order_status === "DELIVERED"
                                      ? "This order has been delivered."
                                      : "This order was cancelled."}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// =====================================================
// GET ITEM COUNT
// =====================================================

function getItemCount(order) {
  if (!order.items || !Array.isArray(order.items)) {
    return 0;
  }

  return order.items.reduce(
    (total, item) => total + Number(item.quantity || 0),
    0,
  );
}

// =====================================================
// GET ORDER AMOUNT
// =====================================================

function getOrderAmount(order) {
  if (
    order.payment &&
    order.payment.amount !== null &&
    order.payment.amount !== undefined
  ) {
    return formatPrice(order.payment.amount);
  }

  if (!order.items || !Array.isArray(order.items)) {
    return "0.00";
  }

  const total = order.items.reduce(
    (sum, item) =>
      sum +
      Number(item.price_at_the_time_of_order) * Number(item.quantity || 0),
    0,
  );

  return total.toFixed(2);
}

// =====================================================
// FORMAT PRICE
// =====================================================

function formatPrice(value) {
  const number = Number(value);

  if (Number.isNaN(number)) {
    return "0.00";
  }

  return number.toFixed(2);
}

// =====================================================
// FORMAT DATE
// =====================================================

function formatDate(dateString) {
  if (!dateString) {
    return "Date not available";
  }

  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) {
    return "Date not available";
  }

  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// =====================================================
// STATUS CLASS
// =====================================================

function getStatusClass(status) {
  if (!status) {
    return "";
  }

  return status.toLowerCase().replace(/\s+/g, "-");
}

// =====================================================
// PAYMENT CLASS
// =====================================================

function getPaymentClass(status) {
  if (!status) {
    return "";
  }

  return status.toLowerCase().replace(/\s+/g, "-");
}

// =====================================================
// EXPORT
// =====================================================

export default Orders;

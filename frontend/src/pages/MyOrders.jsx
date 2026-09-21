import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getMyOrders } from "../services/myOrderService";
import "./OrderPages.css";
import CustomerNavbar from "../components/CustomerNavbar";

const CUSTOMER_ID = 6; // Temporary testing customer ID

function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    // Temporary testing customer
    localStorage.setItem("customer_id", String(CUSTOMER_ID));

    async function loadOrders() {
      try {
        setLoading(true);
        setError("");

        const data = await getMyOrders(CUSTOMER_ID);

        console.log("GET MY ORDERS RESPONSE:", data);

        // The backend already excludes DRAFT orders.
        setOrders(data.orders || []);
      } catch (err) {
        console.error("GET MY ORDERS ERROR:", err);

        setError(err.message || "Unable to load your orders");
      } finally {
        setLoading(false);
      }
    }

    loadOrders();
  }, []);

  // ============================================================
  // LOADING
  // ============================================================

  if (loading) {
    return (
      <div className="order-page">
        <div className="page-loader">Loading your orders...</div>
      </div>
    );
  }

  // ============================================================
  // PAGE
  // ============================================================

  return (
    <div className="order-page">
      {/* ======================================================
          NAVBAR
          ====================================================== */}

      {/* <header className="order-navbar">
        <Link className="brand" to="/">
          Tomato
        </Link>

        <nav>
          <Link to="/">Home</Link>

          <Link to="/cart">Cart</Link>

          <Link className="active" to="/orders">
            My Orders
          </Link>
        </nav>

        <span className="checkout-step">Account</span>
      </header> */}
      <CustomerNavbar />

      {/* ======================================================
          MAIN CONTENT
          ====================================================== */}

      <main className="order-container">
        {/* ====================================================
            PAGE HEADER
            ==================================================== */}

        <div className="page-heading">
          <div>
            <p className="eyebrow">YOUR ACCOUNT</p>

            <h1>My orders</h1>

            <p>Track your recent orders and view their details.</p>
          </div>

          <span className="order-count">
            {orders.length} order
            {orders.length !== 1 ? "s" : ""}
          </span>
        </div>

        {/* ====================================================
            ERROR
            ==================================================== */}

        {error && <div className="inline-error">{error}</div>}

        {/* ====================================================
            NO ORDERS
            ==================================================== */}

        {orders.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📦</div>

            <h2>No orders yet</h2>

            <p>Your completed orders will appear here.</p>

            <Link className="primary-button" to="/">
              Start ordering
            </Link>
          </div>
        ) : (
          /* ==================================================
             ORDERS LIST
             ================================================== */

          <div className="orders-list">
            {orders.map((order) => (
              <Link
                className="order-list-card"
                to={`/orders/${order.order_id}`}
                key={order.order_id}
              >
                {/* ==========================================
                    ORDER BASIC INFORMATION
                    ========================================== */}

                <div className="order-list-main">
                  <div className="restaurant-avatar">
                    {(order.restaurant_name || "R").charAt(0).toUpperCase()}
                  </div>

                  <div>
                    <h2>
                      {order.restaurant_name ||
                        `Restaurant #${order.restaurant_id}`}
                    </h2>

                    <p>Order #{order.order_id}</p>

                    <small>
                      {order.created_at
                        ? new Date(order.created_at).toLocaleString("en-IN", {
                            dateStyle: "medium",
                            timeStyle: "short",
                          })
                        : "Recent order"}
                    </small>
                  </div>
                </div>

                {/* ==========================================
                    ORDER STATUS
                    ========================================== */}

                <div className="order-list-right">
                  <span
                    className={`status-pill ${String(
                      order.order_status,
                    ).toLowerCase()}`}
                  >
                    {order.order_status}
                  </span>

                  <span className="view-arrow">→</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default MyOrders;

import { Link, useLocation, useParams } from "react-router-dom";
import "./OrderPages.css";

const money = (value) => `₹${Number(value || 0).toFixed(2)}`;

function OrderConfirmation() {
  const { orderId } = useParams();
  const { state } = useLocation();
  const order = state?.order;

  return (
    <div className="order-page">
      <header className="order-navbar">
        <Link className="brand" to="/">
          Tomato
        </Link>
        <nav>
          <Link to="/">Home</Link>
          <Link to="/orders">My Orders</Link>
        </nav>
        <span className="checkout-step">Order confirmed</span>
      </header>

      <main className="order-container narrow">
        <section className="confirmation-card">
          <div className="success-mark">✓</div>
          <p className="eyebrow">ORDER CONFIRMED</p>
          <h1>Thank you for your order!</h1>
          <p className="confirmation-text">
            Your order has been confirmed and sent to the restaurant.
          </p>

          <div className="confirmation-meta">
            <div>
              <span>Order ID</span>
              <strong>#{orderId}</strong>
            </div>
            <div>
              <span>Status</span>
              <strong>{order?.order_status || "CONFIRMED"}</strong>
            </div>
            {order?.restaurant_id && (
              <div>
                <span>Restaurant</span>
                <strong>#{order.restaurant_id}</strong>
              </div>
            )}
          </div>

          {order?.total_amount && (
            <div className="confirmation-total">
              <span>Order total</span>
              <strong>{money(order.total_amount)}</strong>
            </div>
          )}

          <div className="confirmation-actions">
            <Link className="primary-button" to={`/orders/${orderId}`}>
              View order details
            </Link>
            <Link className="secondary-button" to="/orders">
              Go to my orders
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}

export default OrderConfirmation;

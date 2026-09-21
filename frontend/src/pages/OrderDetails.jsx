import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getOrders, getOrderItems } from "../services/orderService";
import "./OrderPages.css";
import CustomerNavbar from "../components/CustomerNavbar";

const money = (value) => `₹${Number(value || 0).toFixed(2)}`;

function OrderDetails() {
  const { orderId } = useParams();

  const [order, setOrder] = useState(null);
  const [items, setItems] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        setError("");

        // ------------------------------------------
        // 1. Get all customer orders
        // ------------------------------------------
        const ordersResponse = await getOrders();

        const orders =
          ordersResponse?.orders ||
          ordersResponse?.data ||
          (Array.isArray(ordersResponse) ? ordersResponse : []);

        // ------------------------------------------
        // 2. Find selected order
        // ------------------------------------------
        const selectedOrder = orders.find(
          (item) => Number(item.order_id) === Number(orderId),
        );

        if (!selectedOrder) {
          throw new Error("Order not found.");
        }

        console.log("SELECTED ORDER:", selectedOrder);

        // ------------------------------------------
        // 3. Get order items
        //
        // This API now also returns delivery_address
        // ------------------------------------------
        const itemsResponse = await getOrderItems(orderId);

        // console.log("ORDER ITEMS RESPONSE:", itemsResponse);

        const orderItems = itemsResponse?.order_items || [];

        setItems(orderItems);

        // ------------------------------------------
        // 4. Get historical delivery address
        // ------------------------------------------
        const deliveryAddress = itemsResponse?.delivery_address || null;

        // console.log("DELIVERY ADDRESS:", deliveryAddress);

        // ------------------------------------------
        // 5. Merge address into order
        // ------------------------------------------
        setOrder({
          ...selectedOrder,

          address_id: itemsResponse?.address_id ?? selectedOrder.address_id,

          address_line1:
            deliveryAddress?.address_line1 ?? selectedOrder.address_line1,

          address_line2:
            deliveryAddress?.address_line2 ?? selectedOrder.address_line2,

          city: deliveryAddress?.city ?? selectedOrder.city,

          state: deliveryAddress?.state ?? selectedOrder.state,

          postal_code:
            deliveryAddress?.postal_code ?? selectedOrder.postal_code,

          landmark: deliveryAddress?.landmark ?? selectedOrder.landmark,
        });
      } catch (err) {
        console.error("Order details error:", err);

        setError(
          err.response?.data?.message ||
            err.response?.data?.error ||
            err.message ||
            "Unable to load order details.",
        );
      } finally {
        setLoading(false);
      }
    }

    if (orderId) {
      load();
    }
  }, [orderId]);

  // ------------------------------------------
  // Calculate total
  // ------------------------------------------
  const total = items.reduce(
    (sum, item) =>
      sum +
      Number(item.price_at_the_time_of_order || 0) * Number(item.quantity || 0),
    0,
  );

  // ------------------------------------------
  // Loading
  // ------------------------------------------
  if (loading) {
    return (
      <div className="order-page">
        <CustomerNavbar />

        <div className="page-loader">Loading order details...</div>
      </div>
    );
  }

  // ------------------------------------------
  // Error
  // ------------------------------------------
  if (error || !order) {
    return (
      <div className="order-page">
        <CustomerNavbar />

        <div className="order-error">
          <span>!</span>

          <div>
            <strong>Order not found</strong>

            <p>{error || "We couldn't find this order."}</p>

            <Link className="secondary-button" to="/my-orders">
              Back to my orders
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="order-page">
      {/* Navbar */}
      <CustomerNavbar />

      <main className="order-container narrow">
        {/* Back */}
        <Link className="back-link" to="/my-orders">
          ← Back to my orders
        </Link>

        {/* -------------------------------------- */}
        {/* Order Header */}
        {/* -------------------------------------- */}
        <div className="detail-hero">
          <div>
            <p className="eyebrow">ORDER DETAILS</p>

            <h1>Order #{order.order_id}</h1>

            <p>
              {order.restaurant_name || `Restaurant #${order.restaurant_id}`}
            </p>
          </div>

          <span
            className={`status-pill ${String(
              order.order_status || "",
            ).toLowerCase()}`}
          >
            {order.order_status || "UNKNOWN"}
          </span>
        </div>

        <div className="detail-grid">
          {/* ====================================== */}
          {/* ITEMS */}
          {/* ====================================== */}

          <section className="checkout-card">
            <div className="section-title">
              <span className="step-number">✓</span>

              <div>
                <h2>Items</h2>

                <p>
                  {items.length} item
                  {items.length !== 1 ? "s" : ""}
                </p>
              </div>
            </div>

            <div className="checkout-items">
              {items.length === 0 ? (
                <div className="empty-cart compact">
                  <p>This order contains no items.</p>
                </div>
              ) : (
                items.map((item) => (
                  <div className="checkout-item" key={item.order_item_id}>
                    <div>
                      <strong>
                        {item.food_name || `Food #${item.food_id}`}
                      </strong>

                      <span>
                        {item.quantity} ×{" "}
                        {money(item.price_at_the_time_of_order)}
                      </span>
                    </div>

                    <strong>
                      {money(
                        Number(item.price_at_the_time_of_order || 0) *
                          Number(item.quantity || 0),
                      )}
                    </strong>
                  </div>
                ))
              )}
            </div>
          </section>

          {/* ====================================== */}
          {/* ORDER INFORMATION */}
          {/* ====================================== */}

          <aside className="summary-card">
            <h2>Order information</h2>

            {/* Restaurant */}
            <div className="info-row">
              <span>Restaurant</span>

              <strong>
                {order.restaurant_name || `#${order.restaurant_id}`}
              </strong>
            </div>

            {/* ------------------------------------ */}
            {/* Delivery Address */}
            {/* ------------------------------------ */}

            <div className="info-row">
              <span>Delivery address</span>

              <strong className="delivery-address">
                {order.address_line1 || "-"}
                {order.address_line2 && (
                  <>
                    <br />
                    {order.address_line2}
                  </>
                )}
                <br />
                {order.city || "-"}, {order.state || "-"} -{" "}
                {order.postal_code || "-"}
                {order.landmark && (
                  <>
                    <br />

                    <span className="address-landmark">
                      Landmark: {order.landmark}
                    </span>
                  </>
                )}
              </strong>
            </div>

            {/* Placed */}
            <div className="info-row">
              <span>Placed</span>

              <strong>
                {order.created_at
                  ? new Date(order.created_at).toLocaleString()
                  : "—"}
              </strong>
            </div>

            <div className="summary-divider" />

            {/* Total */}
            <div className="summary-total">
              <span>Total</span>

              <strong>{money(total)}</strong>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}

export default OrderDetails;

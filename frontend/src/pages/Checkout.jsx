import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Cookies from "js-cookie";
import {
  CreditCard,
  Banknote,
  MapPin,
  ShieldCheck,
  ShoppingBag,
  CheckCircle,
} from "lucide-react";
import "./Checkout.css";

import { getCartItems } from "../services/cartService";
import api from "../api/api";

import CustomerNavbar from "../components/CustomerNavbar";

// =====================================================
// MONEY FORMAT
// =====================================================

const money = (value) => `₹${Number(value || 0).toFixed(2)}`;

// =====================================================
// CHECKOUT / PAYMENT PAGE
// =====================================================

function Checkout() {
  const navigate = useNavigate();
  const { orderId } = useParams();

  // =====================================================
  // ORDER STATE
  // =====================================================

  const [order, setOrder] = useState(null);

  const [items, setItems] = useState([]);

  const [loading, setLoading] = useState(true);

  // =====================================================
  // PAYMENT STATE
  // =====================================================

  const [paymentMethod, setPaymentMethod] = useState("ONLINE");

  const [processingPayment, setProcessingPayment] = useState(false);

  // =====================================================
  // MESSAGE STATE
  // =====================================================

  const [message, setMessage] = useState("");

  const [error, setError] = useState("");

  // =====================================================
  // ADDRESS STATE
  // =====================================================

  const [addresses, setAddresses] = useState([]);

  const [selectedAddress, setSelectedAddress] = useState(null);

  // =====================================================
  // GET TOKEN
  // =====================================================

  const getToken = () => {
    const token =
      Cookies.get("token") ||
      localStorage.getItem("token") ||
      localStorage.getItem("id_token") ||
      localStorage.getItem("access_token");

    if (!token) {
      throw new Error("Authentication token not found. Please login again.");
    }

    return token;
  };

  // =====================================================
  // LOAD CHECKOUT DATA
  // =====================================================

  useEffect(() => {
    const loadCheckout = async () => {
      try {
        setLoading(true);
        setError("");

        const token = getToken();

        // =================================================
        // GET CART
        // =================================================

        // console.log("Loading cart for payment...");

        const cartResponse = await getCartItems();

        // console.log("Payment page cart response:", cartResponse);

        // =================================================
        // CHECK CART
        // =================================================

        if (
          !cartResponse?.order_id ||
          !Array.isArray(cartResponse.items) ||
          cartResponse.items.length === 0
        ) {
          throw new Error("Your cart is empty.");
        }

        // =================================================
        // CHECK ORDER ID
        // =================================================

        if (orderId && Number(orderId) !== Number(cartResponse.order_id)) {
          throw new Error(
            "The selected order does not match your current cart.",
          );
        }

        // =================================================
        // SET ORDER
        // =================================================

        setOrder({
          ...cartResponse,
        });

        // =================================================
        // SET ITEMS
        // =================================================

        setItems(cartResponse.items);

        // =================================================
        // GET CUSTOMER ADDRESSES
        // =================================================

        const addressResponse = await api.get("/customers/me/addresses", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const fetchedAddresses = addressResponse.data?.addresses || [];

        setAddresses(fetchedAddresses);

        // =================================================
        // FIND SELECTED ADDRESS
        // =================================================

        const cartAddressId =
          cartResponse.address_id ??
          cartResponse.delivery_address_id ??
          cartResponse.address?.address_id;

        let matchedAddress = null;

        if (cartAddressId && fetchedAddresses.length > 0) {
          matchedAddress =
            fetchedAddresses.find(
              (address) => Number(address.address_id) === Number(cartAddressId),
            ) || null;
        }

        // =================================================
        // SUPPORT CART RESPONSE THAT ALREADY CONTAINS
        // COMPLETE ADDRESS INFORMATION
        // =================================================

        if (
          cartResponse.address_line1 ||
          cartResponse.city ||
          cartResponse.postal_code
        ) {
          matchedAddress = {
            ...(matchedAddress || {}),
            address_id: cartAddressId,
            address_type:
              cartResponse.address_type ||
              matchedAddress?.address_type ||
              "Delivery",
            address_line1:
              cartResponse.address_line1 || matchedAddress?.address_line1 || "",
            address_line2:
              cartResponse.address_line2 || matchedAddress?.address_line2 || "",
            city: cartResponse.city || matchedAddress?.city || "",
            state: cartResponse.state || matchedAddress?.state || "",
            postal_code:
              cartResponse.postal_code || matchedAddress?.postal_code || "",
            landmark: cartResponse.landmark || matchedAddress?.landmark || "",
          };
        }

        setSelectedAddress(matchedAddress);
      } catch (err) {
        console.error("Payment page load error:", err);

        setError(
          err.response?.data?.message ||
            err.response?.data?.error ||
            err.message ||
            "Unable to load payment details.",
        );
      } finally {
        setLoading(false);
      }
    };

    loadCheckout();
  }, [orderId]);

  // =====================================================
  // CALCULATE TOTAL
  // =====================================================

  const total = items.reduce((sum, item) => {
    return (
      sum +
      Number(
        item.item_total || Number(item.price || 0) * Number(item.quantity || 0),
      )
    );
  }, 0);

  // =====================================================
  // ORDER STATUS
  // =====================================================

  const orderStatus = String(order?.order_status || "")
    .trim()
    .toUpperCase();

  // =====================================================
  // CHECK PAYMENT AVAILABILITY
  // =====================================================

  const canPay =
    items.length > 0 &&
    !processingPayment &&
    orderStatus === "DRAFT" &&
    Boolean(order?.order_id) &&
    Boolean(selectedAddress || order?.address_id);

  // =====================================================
  // HANDLE PAYMENT
  // =====================================================

  const handlePayment = async (event) => {
    event.preventDefault();

    setMessage("");
    setError("");

    // =================================================
    // CHECK ORDER
    // =================================================

    if (!order?.order_id) {
      setError("Order details are not available.");

      return;
    }

    // =================================================
    // CHECK ADDRESS
    // =================================================

    if (!selectedAddress && !order?.address_id) {
      setError("Please add a delivery address before making payment.");

      return;
    }

    // =================================================
    // CHECK ITEMS
    // =================================================

    if (items.length === 0) {
      setError("Your order has no items.");

      return;
    }

    // =================================================
    // PAYMENT STATUS
    // =================================================
    //
    // Existing backend contract:
    //
    // ONLINE → SUCCESS
    // COD    → PENDING
    //
    // =================================================

    let paymentStatus = "PENDING";

    if (paymentMethod === "ONLINE") {
      paymentStatus = "SUCCESS";
    }

    // =================================================
    // PAYMENT DATA
    // =================================================

    const paymentData = {
      order_id: Number(order.order_id),

      payment_method: paymentMethod,

      payment_status: paymentStatus,

      amount: Number(total || order.cart_total || 0),
    };

    console.log("Payment Data:", paymentData);

    try {
      setProcessingPayment(true);

      const token = getToken();

      // =================================================
      // CREATE PAYMENT
      // =================================================

      const response = await api.post("/payments", paymentData, {
        headers: {
          Authorization: `Bearer ${token}`,

          "Content-Type": "application/json",
        },
      });

      console.log("Payment API Response:", response.data);

      // =================================================
      // SUCCESS MESSAGE
      // =================================================

      if (paymentMethod === "ONLINE") {
        setMessage("Payment successful! Your order has been confirmed.");
      } else {
        setMessage("COD order placed successfully. Payment is pending.");
      }

      // =================================================
      // GO TO MY ORDERS
      // =================================================

      setTimeout(() => {
        navigate("/my-orders");
      }, 800);
    } catch (err) {
      console.error("Payment Error:", err);

      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          err.message ||
          "Payment failed. Please try again.",
      );
    } finally {
      setProcessingPayment(false);
    }
  };

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div className="payment-page">
        <CustomerNavbar />

        <div className="payment-loading">
          <div className="payment-spinner"></div>

          <h2>Preparing payment...</h2>

          <p>Loading your order details.</p>
        </div>
      </div>
    );
  }

  // =====================================================
  // ERROR
  // =====================================================

  if (error && !order) {
    return (
      <div className="payment-page">
        <CustomerNavbar />

        <main className="payment-main">
          <div className="payment-error-card">
            <div className="payment-error-icon">!</div>

            <h2>Payment unavailable</h2>

            <p>{error}</p>

            <Link to="/cart" className="payment-secondary-button">
              Back to Cart
            </Link>
          </div>
        </main>
      </div>
    );
  }

  // =====================================================
  // PAYMENT PAGE
  // =====================================================

  return (
    <div className="payment-page">
      <CustomerNavbar />

      <main className="payment-main">
        {/* =================================================
            PAGE HEADER
        ================================================= */}

        <div className="payment-page-heading">
          <div>
            <p className="payment-eyebrow">CHECKOUT</p>

            <h1>Complete your payment</h1>

            <p>Review your order and choose your payment method.</p>
          </div>

          <div className="secure-payment-badge">
            <ShieldCheck size={20} />

            <span>Secure Payment</span>
          </div>
        </div>

        {/* =================================================
            ERROR
        ================================================= */}

        {error && (
          <div className="payment-error-message">
            <span>!</span>

            <p>{error}</p>
          </div>
        )}

        {/* =================================================
            SUCCESS
        ================================================= */}

        {message && (
          <div className="payment-success-message">
            <CheckCircle size={21} />

            <p>{message}</p>
          </div>
        )}

        {/* =================================================
            PAYMENT LAYOUT
        ================================================= */}

        <div className="payment-layout">
          {/* =================================================
              LEFT
          ================================================= */}

          <section className="payment-left">
            {/* =================================================
                DELIVERY ADDRESS
            ================================================= */}

            <div className="payment-section-card">
              <div className="payment-section-title">
                <div className="payment-section-icon">
                  <MapPin size={20} />
                </div>

                <div>
                  <h2>Delivery Address</h2>

                  <p>Your order will be delivered here.</p>
                </div>
              </div>

              {selectedAddress ? (
                <div className="payment-address">
                  <div className="payment-address-type">
                    {selectedAddress.address_type || "Delivery"}
                  </div>

                  <div className="payment-address-content">
                    <strong>{selectedAddress.address_line1}</strong>

                    {selectedAddress.address_line2 && (
                      <span>{selectedAddress.address_line2}</span>
                    )}

                    <span>
                      {selectedAddress.city}, {selectedAddress.state}
                      {" - "}
                      {selectedAddress.postal_code}
                    </span>

                    {selectedAddress.landmark && (
                      <span>Landmark: {selectedAddress.landmark}</span>
                    )}
                  </div>

                  <Link to="/cart" className="payment-change-address">
                    Change
                  </Link>
                </div>
              ) : (
                <div className="payment-no-address">
                  <strong>No delivery address found</strong>

                  <p>Please add a delivery address before continuing.</p>

                  <Link to="/profile" className="payment-add-address">
                    Add Address
                  </Link>
                </div>
              )}
            </div>

            {/* =================================================
                ORDER ITEMS
            ================================================= */}

            <div className="payment-section-card">
              <div className="payment-section-title">
                <div className="payment-section-icon">
                  <ShoppingBag size={20} />
                </div>

                <div>
                  <h2>Order Items</h2>

                  <p>
                    {items.length} item
                    {items.length !== 1 ? "s" : ""}
                    {" from "}
                    {order?.restaurant_name ||
                      `Restaurant #${order?.restaurant_id}`}
                  </p>
                </div>
              </div>

              <div className="payment-items">
                {items.map((item) => (
                  <div className="payment-item" key={item.order_item_id}>
                    <div className="payment-item-info">
                      <h3>{item.food_name || `Food #${item.food_id}`}</h3>

                      <span>Qty: {item.quantity}</span>
                    </div>

                    <div className="payment-item-price">
                      <span>
                        {money(item.price || item.price_at_the_time_of_order)}{" "}
                        each
                      </span>

                      <strong>
                        {money(
                          item.item_total ||
                            Number(
                              item.price ||
                                item.price_at_the_time_of_order ||
                                0,
                            ) * Number(item.quantity || 0),
                        )}
                      </strong>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* =================================================
                PAYMENT METHOD
            ================================================= */}

            <div className="payment-section-card">
              <div className="payment-section-title">
                <div className="payment-section-icon">
                  <CreditCard size={20} />
                </div>

                <div>
                  <h2>Payment Method</h2>

                  <p>Select how you want to pay.</p>
                </div>
              </div>

              <form onSubmit={handlePayment}>
                <div className="payment-methods">
                  {/* ONLINE */}

                  <label
                    className={`payment-method-card ${
                      paymentMethod === "ONLINE" ? "selected" : ""
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="ONLINE"
                      checked={paymentMethod === "ONLINE"}
                      onChange={(event) => setPaymentMethod(event.target.value)}
                      disabled={processingPayment}
                    />

                    <div className="payment-method-icon">
                      <CreditCard size={22} />
                    </div>

                    <div className="payment-method-content">
                      <strong>Online Payment</strong>

                      <span>Pay securely online.</span>
                    </div>

                    <span className="payment-method-radio">
                      <span />
                    </span>
                  </label>

                  {/* COD */}

                  <label
                    className={`payment-method-card ${
                      paymentMethod === "COD" ? "selected" : ""
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="COD"
                      checked={paymentMethod === "COD"}
                      onChange={(event) => setPaymentMethod(event.target.value)}
                      disabled={processingPayment}
                    />

                    <div className="payment-method-icon">
                      <Banknote size={22} />
                    </div>

                    <div className="payment-method-content">
                      <strong>Cash on Delivery</strong>

                      <span>Pay when your order arrives.</span>
                    </div>

                    <span className="payment-method-radio">
                      <span />
                    </span>
                  </label>
                </div>

                {/* =================================================
                    PAY BUTTON
                ================================================= */}

                <button
                  type="submit"
                  className="payment-submit-button"
                  disabled={!canPay}
                >
                  {processingPayment
                    ? "Processing..."
                    : paymentMethod === "ONLINE"
                      ? `Pay ${money(total)}`
                      : `Place COD Order - ${money(total)}`}
                </button>
              </form>
            </div>
          </section>

          {/* =================================================
              RIGHT SUMMARY
          ================================================= */}

          <aside className="payment-summary-card">
            <div className="payment-summary-header">
              <h2>Order Summary</h2>

              <span>#{order?.order_id}</span>
            </div>

            <div className="payment-summary-row">
              <span>Items</span>

              <strong>{items.length}</strong>
            </div>

            <div className="payment-summary-row">
              <span>Subtotal</span>

              <strong>{money(total)}</strong>
            </div>

            <div className="payment-summary-row muted">
              <span>Delivery</span>

              <span>Calculated by service</span>
            </div>

            <div className="payment-summary-divider" />

            <div className="payment-summary-total">
              <span>Total</span>

              <strong>{money(total)}</strong>
            </div>

            <div className="payment-security-note">
              <ShieldCheck size={18} />

              <span>Your payment information is securely processed.</span>
            </div>

            <Link to="/cart" className="payment-back-cart">
              ← Back to Cart
            </Link>
          </aside>
        </div>
      </main>
    </div>
  );
}

export default Checkout;

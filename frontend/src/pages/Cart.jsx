import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Cookies from "js-cookie";

import {
  getCartItems,
  deleteCartItem,
  updateCartItemQuantity,
} from "../services/cartService";

import api from "../api/api";

import "./OrderPages.css";
import "./Cart.css";
import CustomerNavbar from "../components/CustomerNavbar";

const money = (value) => `₹${Number(value || 0).toFixed(2)}`;

function Cart() {
  // =====================================================
  // CART STATE
  // =====================================================

  const [cart, setCart] = useState(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  // =====================================================
  // QUANTITY STATE
  // =====================================================

  const [quantityUpdatingId, setQuantityUpdatingId] = useState(null);

  // =====================================================
  // ADDRESS STATE
  // =====================================================

  const [addresses, setAddresses] = useState([]);

  const [addressLoading, setAddressLoading] = useState(true);

  const [addressError, setAddressError] = useState("");

  const [selectedAddressId, setSelectedAddressId] = useState(null);

  const [showAddressSelector, setShowAddressSelector] = useState(false);

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
  // LOAD CART
  // =====================================================

  const loadCart = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getCartItems();

      console.log("Cart API response:", data);

      setCart(data);
    } catch (err) {
      console.error("Load cart error:", err);

      setError(err.message || "Unable to load cart");
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // LOAD CUSTOMER ADDRESSES
  // =====================================================

  const loadAddresses = async () => {
    try {
      setAddressLoading(true);
      setAddressError("");

      const token = getToken();

      const response = await api.get("/customers/me/addresses", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const fetchedAddresses = response.data?.addresses || [];

      console.log("Customer addresses:", fetchedAddresses);

      setAddresses(fetchedAddresses);
    } catch (err) {
      console.error("Load addresses error:", err);

      setAddressError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          err.message ||
          "Failed to load addresses",
      );

      setAddresses([]);
    } finally {
      setAddressLoading(false);
    }
  };

  // =====================================================
  // UPDATE CART ITEM QUANTITY
  // =====================================================

  const handleQuantityChange = async (item, nextQuantity) => {
    const currentQuantity = Number(item.quantity || 0);

    // -----------------------------------------------------
    // VALID CURRENT QUANTITY
    // -----------------------------------------------------

    if (!Number.isFinite(currentQuantity) || currentQuantity < 1) {
      return;
    }

    // -----------------------------------------------------
    // VALID NEXT QUANTITY
    // -----------------------------------------------------

    if (nextQuantity < 1 || nextQuantity > 100) {
      return;
    }

    // -----------------------------------------------------
    // NO CHANGE
    // -----------------------------------------------------

    if (nextQuantity === currentQuantity) {
      return;
    }

    try {
      setQuantityUpdatingId(item.order_item_id);

      setError("");

      // ---------------------------------------------------
      // UPDATE BACKEND
      // ---------------------------------------------------

      console.log("Updating quantity:", {
        orderItemId: item.order_item_id,
        oldQuantity: currentQuantity,
        newQuantity: nextQuantity,
      });

      await updateCartItemQuantity(item.order_item_id, nextQuantity);

      // ---------------------------------------------------
      // RELOAD CART
      // ---------------------------------------------------

      const updatedCart = await getCartItems();

      console.log("Updated cart:", updatedCart);

      setCart(updatedCart);
    } catch (err) {
      console.error("Quantity update error:", err);

      setError(err.message || "Unable to update quantity. Please try again.");
    } finally {
      setQuantityUpdatingId(null);
    }
  };

  // =====================================================
  // REMOVE CART ITEM
  // =====================================================

  const handleRemove = async (orderItemId) => {
    try {
      setError("");

      await deleteCartItem({
        orderItemId,
      });

      const updatedCart = await getCartItems();

      setCart(updatedCart);
    } catch (err) {
      console.error("Remove cart item error:", err);

      setError(err.message || "Failed to remove item from cart");
    }
  };

  // =====================================================
  // LOAD CART + ADDRESSES
  // =====================================================

  useEffect(() => {
    loadCart();
    loadAddresses();
  }, []);

  // =====================================================
  // GET CART ADDRESS ID
  // =====================================================

  const cartAddressId =
    cart?.address_id ??
    cart?.delivery_address_id ??
    cart?.address?.address_id ??
    null;

  // =====================================================
  // GET SELECTED ADDRESS
  // =====================================================

  const selectedAddress =
    addresses.find(
      (address) =>
        Number(address.address_id) ===
        Number(selectedAddressId ?? cartAddressId),
    ) || null;

  // =====================================================
  // SELECT ADDRESS IN UI
  // =====================================================

  const handleAddressSelect = (addressId) => {
    setSelectedAddressId(addressId);

    setShowAddressSelector(false);
  };

  // =====================================================
  // SET CART ADDRESS WHEN DATA IS AVAILABLE
  // =====================================================

  useEffect(() => {
    if (cartAddressId !== null && cartAddressId !== undefined) {
      setSelectedAddressId(cartAddressId);
    }
  }, [cartAddressId]);

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div className="order-page">
        <CustomerNavbar />

        <div className="page-loader">Loading your cart...</div>
      </div>
    );
  }

  // =====================================================
  // ERROR
  // =====================================================

  if (error) {
    return (
      <div className="order-page">
        <CustomerNavbar />

        <div className="order-error">
          <span>!</span>

          <div>
            <strong>We couldn't load your cart</strong>

            <p>{error}</p>

            <button
              type="button"
              onClick={() => {
                loadCart();
                loadAddresses();
              }}
            >
              Try again
            </button>
          </div>
        </div>
      </div>
    );
  }

  // =====================================================
  // CART DATA
  // =====================================================

  const items = cart?.items || [];

  const cartTotal = Number(cart?.cart_total || 0);

  const itemCount = Number(cart?.item_count || items.length);

  // =====================================================
  // EMPTY CART
  // =====================================================

  if (!cart || !cart.order_id || items.length === 0) {
    return (
      <div className="order-page">
        <CustomerNavbar />

        <main className="order-container">
          <div className="empty-state">
            <div className="empty-icon">🛒</div>

            <h1>Your cart is empty</h1>

            <p>Add delicious food from a restaurant to get started.</p>

            <Link className="primary-button" to="/">
              Browse restaurants
            </Link>
          </div>
        </main>
      </div>
    );
  }

  // =====================================================
  // PAGE
  // =====================================================

  return (
    <div className="order-page">
      <CustomerNavbar />

      <main className="order-container">
        {/* =================================================
            PAGE HEADING
        ================================================= */}

        <div className="page-heading">
          <div>
            <p className="eyebrow">YOUR ORDER</p>

            <h1>Shopping cart</h1>

            <p>Review your items before continuing to checkout.</p>
          </div>

          <span
            className={`status-pill ${String(
              cart.order_status || "DRAFT",
            ).toLowerCase()}`}
          >
            {cart.order_status || "DRAFT"}
          </span>
        </div>

        {/* =================================================
            DELIVERY ADDRESS
        ================================================= */}

        <section className="cart-address-card">
          <div className="cart-address-header">
            <div className="cart-address-title">
              <div className="cart-address-icon">🏠</div>

              <div>
                <span>DELIVERY ADDRESS</span>

                <h2>Deliver to</h2>
              </div>
            </div>

            <button
              type="button"
              className="change-address-button"
              onClick={() => setShowAddressSelector(true)}
              disabled={addressLoading || addresses.length === 0}
            >
              Change
            </button>
          </div>

          {/* ADDRESS LOADING */}

          {addressLoading && (
            <div className="cart-address-loading">
              Loading delivery address...
            </div>
          )}

          {/* ADDRESS ERROR */}

          {!addressLoading && addressError && (
            <div className="cart-address-error">
              <p>{addressError}</p>

              <button type="button" onClick={loadAddresses}>
                Retry
              </button>
            </div>
          )}

          {/* NO ADDRESS */}

          {!addressLoading && !addressError && addresses.length === 0 && (
            <div className="cart-no-address">
              <div>
                <strong>No delivery address</strong>

                <p>Please add a delivery address before checkout.</p>
              </div>

              <Link to="/profile" className="add-address-button">
                Add Address
              </Link>
            </div>
          )}

          {/* SELECTED ADDRESS */}

          {!addressLoading && !addressError && selectedAddress && (
            <div className="cart-selected-address">
              <div className="selected-address-left">
                <span className="cart-address-type">
                  {selectedAddress.address_type}
                </span>

                <div className="cart-address-details">
                  <strong>{selectedAddress.address_line1}</strong>

                  {selectedAddress.address_line2 && (
                    <span>{selectedAddress.address_line2}</span>
                  )}

                  <span>
                    {selectedAddress.city}
                    {", "}
                    {selectedAddress.state}
                    {" - "}
                    {selectedAddress.postal_code}
                  </span>

                  {selectedAddress.landmark && (
                    <span>Landmark: {selectedAddress.landmark}</span>
                  )}
                </div>
              </div>
            </div>
          )}
        </section>

        {/* =================================================
            ADDRESS SELECTOR
        ================================================= */}

        {showAddressSelector && (
          <div
            className="address-modal-overlay"
            onClick={() => setShowAddressSelector(false)}
          >
            <div
              className="address-modal"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="address-modal-header">
                <div>
                  <h2>Select delivery address</h2>

                  <p>Choose where you want your order delivered.</p>
                </div>

                <button
                  type="button"
                  className="address-modal-close"
                  onClick={() => setShowAddressSelector(false)}
                >
                  ×
                </button>
              </div>

              <div className="address-options">
                {addresses.map((address) => {
                  const isSelected =
                    Number(selectedAddressId) === Number(address.address_id);

                  return (
                    <button
                      key={address.address_id}
                      type="button"
                      className={`cart-address-option ${
                        isSelected ? "selected" : ""
                      }`}
                      onClick={() => handleAddressSelect(address.address_id)}
                    >
                      <div className="address-radio">
                        <span
                          className={
                            isSelected ? "radio-circle active" : "radio-circle"
                          }
                        />
                      </div>

                      <div className="address-option-content">
                        <div className="address-option-heading">
                          <strong>{address.address_type}</strong>

                          {isSelected && <span>Selected</span>}
                        </div>

                        <p>{address.address_line1}</p>

                        {address.address_line2 && (
                          <p>{address.address_line2}</p>
                        )}

                        <p>
                          {address.city}
                          {", "}
                          {address.state}
                          {" - "}
                          {address.postal_code}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="address-modal-footer">
                <Link to="/profile" className="modal-add-address-button">
                  + Add New Address
                </Link>

                <button
                  type="button"
                  className="modal-done-button"
                  onClick={() => setShowAddressSelector(false)}
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        )}

        {/* =================================================
            CART LAYOUT
        ================================================= */}

        <div className="cart-layout">
          {/* =================================================
              CART ITEMS
          ================================================= */}

          <section className="cart-card">
            <div className="cart-card-header">
              <div>
                <h2>Restaurant #{cart.restaurant_id}</h2>

                <p>Order #{cart.order_id}</p>
              </div>

              <span>
                {itemCount} item
                {itemCount !== 1 ? "s" : ""}
              </span>
            </div>

            {/* =================================================
                ITEMS
            ================================================= */}

            <div className="cart-items">
              {items.map((item) => {
                const currentQuantity = Number(item.quantity || 0);

                const isUpdating = quantityUpdatingId === item.order_item_id;

                return (
                  <article className="cart-item" key={item.order_item_id}>
                    {/* FOOD IMAGE */}

                    <div className="food-placeholder">
                      {item.is_veg ? "VEG" : "NON-VEG"}
                    </div>

                    {/* FOOD INFORMATION */}

                    <div className="food-info">
                      <div className="food-title-row">
                        <h3>{item.food_name || `Food #${item.food_id}`}</h3>

                        {item.is_veg && (
                          <span className="veg-dot" title="Vegetarian" />
                        )}
                      </div>

                      {item.description && <p>{item.description}</p>}

                      <p>{money(item.price)} each</p>
                    </div>

                    {/* =================================================
                        QUANTITY CONTROL
                    ================================================= */}

                    <div className="quantity-control">
                      <button
                        type="button"
                        onClick={() =>
                          handleQuantityChange(item, currentQuantity - 1)
                        }
                        disabled={currentQuantity <= 1 || isUpdating}
                        aria-label={`Decrease quantity for ${
                          item.food_name || "item"
                        }`}
                      >
                        −
                      </button>

                      <strong>{isUpdating ? "..." : currentQuantity}</strong>

                      <button
                        type="button"
                        onClick={() =>
                          handleQuantityChange(item, currentQuantity + 1)
                        }
                        disabled={currentQuantity >= 100 || isUpdating}
                        aria-label={`Increase quantity for ${
                          item.food_name || "item"
                        }`}
                      >
                        +
                      </button>
                    </div>

                    {/* REMOVE */}

                    <button
                      type="button"
                      onClick={() => handleRemove(item.order_item_id)}
                      className="remove-cart-button"
                      disabled={isUpdating}
                    >
                      Remove
                    </button>

                    {/* ITEM TOTAL */}

                    <strong className="item-total">
                      {money(item.item_total)}
                    </strong>
                  </article>
                );
              })}
            </div>
          </section>

          {/* =================================================
              ORDER SUMMARY
          ================================================= */}

          <aside className="summary-card">
            <h2>Order summary</h2>

            {/* ADDRESS SUMMARY */}

            <div className="summary-address">
              <div className="summary-address-heading">
                <span>Delivery address</span>

                <button
                  type="button"
                  onClick={() => setShowAddressSelector(true)}
                  disabled={addresses.length === 0}
                >
                  Change
                </button>
              </div>

              {selectedAddress ? (
                <div className="summary-address-content">
                  <strong>{selectedAddress.address_type}</strong>

                  <p>{selectedAddress.address_line1}</p>

                  <p>
                    {selectedAddress.city}
                    {", "}
                    {selectedAddress.state}
                    {" - "}
                    {selectedAddress.postal_code}
                  </p>
                </div>
              ) : (
                <p className="summary-no-address">
                  No delivery address selected.
                </p>
              )}
            </div>

            <div className="summary-row">
              <span>Items</span>

              <strong>{itemCount}</strong>
            </div>

            <div className="summary-row">
              <span>Subtotal</span>

              <strong>{money(cartTotal)}</strong>
            </div>

            <div className="summary-row muted">
              <span>Delivery</span>

              <span>Calculated at checkout</span>
            </div>

            <div className="summary-divider" />

            <div className="summary-total">
              <span>Total</span>

              <strong>{money(cartTotal)}</strong>
            </div>

            {/* =================================================
                CHECKOUT BUTTON
            ================================================= */}

            {selectedAddress ? (
              <Link
                className="primary-button full"
                to={`/checkout/${cart.order_id}`}
              >
                Continue to checkout
              </Link>
            ) : (
              <div>
                <button type="button" className="primary-button full" disabled>
                  Add Address to Continue
                </button>

                <Link to="/profile" className="cart-checkout-address-link">
                  Add delivery address
                </Link>
              </div>
            )}

            <p className="secure-note">🔒 Secure order processing</p>
          </aside>
        </div>
      </main>
    </div>
  );
}

export default Cart;

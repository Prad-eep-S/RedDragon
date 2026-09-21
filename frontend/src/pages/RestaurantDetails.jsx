import React, { useEffect, useState } from "react";
import CartReplaceModal from "../components/CartReplaceModal";
import Cookies from "js-cookie";
import { useNavigate, useParams } from "react-router-dom";

import api from "../api/api";
import CustomerNavbar from "../components/CustomerNavbar";

import { getCartItems, deleteCartItem } from "../services/cartService";

import "./RestaurantDetails.css";

const RestaurantDetails = () => {
  const { restaurantId } = useParams();
  const navigate = useNavigate();

  // =====================================================
  // RESTAURANT STATE
  // =====================================================

  const [restaurantData, setRestaurantData] = useState(null);

  const [selectedCategory, setSelectedCategory] = useState(null);

  // =====================================================
  // LOADING / ERROR
  // =====================================================

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  // =====================================================
  // ADDRESS STATE
  // =====================================================

  // Address is fetched silently.
  // Nothing is displayed on the page.

  const [addresses, setAddresses] = useState([]);

  const [addressLoading, setAddressLoading] = useState(true);

  // =====================================================
  // CART STATE
  // =====================================================

  const [cartLoading, setCartLoading] = useState(null);

  const [cartMessage, setCartMessage] = useState("");

  const [cartError, setCartError] = useState("");

  // =====================================================
  // CART REPLACE MODAL STATE
  // =====================================================

  const [showReplaceModal, setShowReplaceModal] = useState(false);

  const [pendingFood, setPendingFood] = useState(null);

  const [replacingCart, setReplacingCart] = useState(false);

  // =====================================================
  // GET TOKEN
  // =====================================================

  const getToken = () => {
    const token = Cookies.get("token");

    if (!token) {
      throw new Error("Authentication token not found. Please login again.");
    }

    return token;
  };

  // =====================================================
  // GET RESTAURANT DETAILS
  // =====================================================

  useEffect(() => {
    const getRestaurantDetails = async () => {
      try {
        setLoading(true);
        setError("");

        const token = getToken();

        const response = await api.get(`/restaurants/${restaurantId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        console.log("Restaurant API response:", response.data);

        const data = response.data?.data;

        setRestaurantData(data);

        // -------------------------------------------------
        // SELECT FIRST CATEGORY
        // -------------------------------------------------

        if (data?.categories && data.categories.length > 0) {
          setSelectedCategory(data.categories[0].category_id);
        }
      } catch (error) {
        console.error("Restaurant API error:", error);

        setError(
          error.response?.data?.message ||
            error.response?.data?.error ||
            error.message ||
            "Failed to load restaurant details",
        );
      } finally {
        setLoading(false);
      }
    };

    if (restaurantId) {
      getRestaurantDetails();
    }
  }, [restaurantId]);

  // =====================================================
  // GET CUSTOMER ADDRESSES
  // =====================================================

  useEffect(() => {
    const fetchAddresses = async () => {
      try {
        setAddressLoading(true);

        const token = getToken();

        const response = await api.get("/customers/me/addresses", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const fetchedAddresses = response.data?.addresses || [];

        setAddresses(fetchedAddresses);

        console.log("Customer addresses:", fetchedAddresses);
      } catch (error) {
        console.error("Failed to fetch addresses:", error);

        setAddresses([]);
      } finally {
        setAddressLoading(false);
      }
    };

    fetchAddresses();
  }, []);

  // =====================================================
  // GET CURRENT RESTAURANT ID
  // =====================================================

  const getCurrentRestaurantId = () => {
    return restaurantData?.restaurant?.restaurant_id || restaurantId;
  };

  // =====================================================
  // ADD FOOD DIRECTLY TO CART
  // =====================================================

  const addFoodToCart = async (food) => {
    try {
      // -------------------------------------------------
      // CHECK ADDRESS
      // -------------------------------------------------

      if (!addresses || addresses.length === 0) {
        setCartError(
          "Please add a delivery address before adding food to cart.",
        );

        return;
      }

      // -------------------------------------------------
      // CHECK FOOD ID
      // -------------------------------------------------

      if (!food?.food_id) {
        setCartError("Food ID is missing.");
        return;
      }

      // -------------------------------------------------
      // GET RESTAURANT ID
      // -------------------------------------------------

      const currentRestaurantId = getCurrentRestaurantId();

      if (!currentRestaurantId) {
        setCartError("Restaurant ID is missing.");

        return;
      }

      // -------------------------------------------------
      // GET TOKEN
      // -------------------------------------------------

      const token = Cookies.get("token");

      if (!token) {
        setCartError("Please login again.");

        return;
      }

      // -------------------------------------------------
      // GET ADDRESS
      // -------------------------------------------------

      const addressId = addresses[0]?.address_id;

      if (!addressId) {
        setCartError(
          "Please add a delivery address before adding food to cart.",
        );

        return;
      }

      // -------------------------------------------------
      // ADD TO CART
      // -------------------------------------------------

      const response = await api.post(
        "/cart/items",
        {
          restaurant_id: Number(currentRestaurantId),

          food_id: Number(food.food_id),

          quantity: 1,

          address_id: Number(addressId),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      console.log("Added to cart:", response.data);

      setCartMessage(`${food.food_name} added to cart successfully`);

      setCartError("");
    } catch (error) {
      console.error("Add to cart error:", error);

      setCartError(
        error.response?.data?.error ||
          error.response?.data?.message ||
          error.message ||
          "Failed to add food to cart",
      );

      throw error;
    }
  };

  // =====================================================
  // GET CART ITEMS FROM RESPONSE
  // =====================================================

  const getCartItemsFromResponse = (cartResponse) => {
    if (Array.isArray(cartResponse)) {
      return cartResponse;
    }

    if (Array.isArray(cartResponse?.order_items)) {
      return cartResponse.order_items;
    }

    if (Array.isArray(cartResponse?.items)) {
      return cartResponse.items;
    }

    if (Array.isArray(cartResponse?.cart_items)) {
      return cartResponse.cart_items;
    }

    if (Array.isArray(cartResponse?.data?.order_items)) {
      return cartResponse.data.order_items;
    }

    if (Array.isArray(cartResponse?.data?.items)) {
      return cartResponse.data.items;
    }

    if (Array.isArray(cartResponse?.data?.cart_items)) {
      return cartResponse.data.cart_items;
    }

    return [];
  };

  // =====================================================
  // GET RESTAURANT ID FROM CURRENT CART
  // =====================================================

  const getCartRestaurantId = (cartResponse, cartItems) => {
    return (
      cartResponse?.restaurant_id ||
      cartResponse?.data?.restaurant_id ||
      cartResponse?.order?.restaurant_id ||
      cartResponse?.data?.order?.restaurant_id ||
      cartItems[0]?.restaurant_id ||
      null
    );
  };

  // =====================================================
  // ADD TO CART
  // =====================================================

  const handleAddToCart = async (food) => {
    // -------------------------------------------------
    // CHECK ADDRESS
    // -------------------------------------------------

    if (!addresses || addresses.length === 0) {
      setCartError("Please add a delivery address before adding food to cart.");

      return;
    }

    // -------------------------------------------------
    // CHECK FOOD ID
    // -------------------------------------------------

    if (!food?.food_id) {
      setCartError("Food ID is missing.");

      return;
    }

    // -------------------------------------------------
    // GET CURRENT RESTAURANT ID
    // -------------------------------------------------

    const currentRestaurantId = getCurrentRestaurantId();

    if (!currentRestaurantId) {
      setCartError("Restaurant ID is missing.");

      return;
    }

    try {
      setCartLoading(food.food_id);

      setCartMessage("");
      setCartError("");

      // -------------------------------------------------
      // GET CURRENT CART
      // -------------------------------------------------

      const cartResponse = await getCartItems();

      console.log("CURRENT CART:", cartResponse);

      // -------------------------------------------------
      // EXTRACT CART ITEMS
      // -------------------------------------------------

      const cartItems = getCartItemsFromResponse(cartResponse);

      console.log("CURRENT CART ITEMS:", cartItems);

      // -------------------------------------------------
      // CART EMPTY
      // -------------------------------------------------

      if (!Array.isArray(cartItems) || cartItems.length === 0) {
        await addFoodToCart(food);

        return;
      }

      // -------------------------------------------------
      // GET RESTAURANT FROM CURRENT CART
      // -------------------------------------------------

      const cartRestaurantId = getCartRestaurantId(cartResponse, cartItems);

      console.log("CART RESTAURANT ID:", cartRestaurantId);

      console.log("CURRENT RESTAURANT ID:", currentRestaurantId);

      // -------------------------------------------------
      // IF CART RESTAURANT ID IS UNKNOWN
      // -------------------------------------------------

      if (!cartRestaurantId) {
        console.warn("Cart restaurant ID not found. Adding item directly.");

        await addFoodToCart(food);

        return;
      }

      // -------------------------------------------------
      // SAME RESTAURANT
      // -------------------------------------------------

      if (Number(cartRestaurantId) === Number(currentRestaurantId)) {
        await addFoodToCart(food);

        return;
      }

      // -------------------------------------------------
      // DIFFERENT RESTAURANT
      // -------------------------------------------------

      console.log("Different restaurant detected.");

      setPendingFood(food);

      setShowReplaceModal(true);
    } catch (error) {
      console.error("Handle add to cart error:", error);

      setCartError(
        error?.response?.data?.error ||
          error?.response?.data?.message ||
          error?.message ||
          "Unable to add item to cart.",
      );
    } finally {
      setCartLoading(null);
    }
  };

  // =====================================================
  // REPLACE CART
  // =====================================================

  const handleReplaceCart = async () => {
    if (!pendingFood) {
      return;
    }

    try {
      setReplacingCart(true);

      setCartMessage("");
      setCartError("");

      // -------------------------------------------------
      // GET CURRENT CART AGAIN
      // -------------------------------------------------

      const cartResponse = await getCartItems();

      console.log("CART BEFORE REPLACEMENT:", cartResponse);

      // -------------------------------------------------
      // GET CART ITEMS
      // -------------------------------------------------

      const cartItems = getCartItemsFromResponse(cartResponse);

      console.log("ITEMS TO DELETE:", cartItems);

      // -------------------------------------------------
      // DELETE OLD CART ITEMS
      // -------------------------------------------------

      for (const item of cartItems) {
        const orderItemId = item.order_item_id || item.cart_item_id;

        if (!orderItemId) {
          console.warn("Cart item ID not found:", item);

          continue;
        }

        console.log("Deleting cart item:", orderItemId);

        await deleteCartItem({
          orderItemId: Number(orderItemId),
        });
      }

      // -------------------------------------------------
      // ADD NEW FOOD
      // -------------------------------------------------

      await addFoodToCart(pendingFood);

      // -------------------------------------------------
      // CLOSE MODAL
      // -------------------------------------------------

      setShowReplaceModal(false);

      setPendingFood(null);
    } catch (error) {
      console.error("Replace cart error:", error);

      setCartError(
        error?.response?.data?.error ||
          error?.response?.data?.message ||
          error?.message ||
          "Unable to replace cart.",
      );
    } finally {
      setReplacingCart(false);
    }
  };

  // =====================================================
  // CANCEL REPLACE
  // =====================================================

  const handleCancelReplace = () => {
    if (replacingCart) {
      return;
    }

    setShowReplaceModal(false);

    setPendingFood(null);
  };

  // =====================================================
  // GET CURRENT CATEGORY
  // =====================================================

  if (loading) {
    return (
      <>
        <CustomerNavbar />

        <div className="restaurant-loading">
          <div className="loading-spinner"></div>

          <p>Loading restaurant...</p>
        </div>
      </>
    );
  }

  // =====================================================
  // ERROR
  // =====================================================

  if (error) {
    return (
      <>
        <CustomerNavbar />

        <div className="restaurant-error">
          <h2>Unable to load restaurant</h2>

          <p>{error}</p>

          <button type="button" onClick={() => navigate("/restaurants-menu")}>
            Back to Restaurants
          </button>
        </div>
      </>
    );
  }

  // =====================================================
  // RESTAURANT NOT FOUND
  // =====================================================

  if (!restaurantData) {
    return (
      <>
        <CustomerNavbar />

        <div className="restaurant-error">
          <h2>Restaurant not found</h2>

          <button type="button" onClick={() => navigate("/restaurants-menu")}>
            Back to Restaurants
          </button>
        </div>
      </>
    );
  }

  const { restaurant, categories = [] } = restaurantData;

  const currentCategory = categories.find(
    (category) => category.category_id === selectedCategory,
  );

  // =====================================================
  // PAGE
  // =====================================================

  return (
    <>
      <CustomerNavbar />

      <div className="restaurant-details">
        {/* =================================================
            RESTAURANT HEADER
        ================================================= */}

        <div className="restaurant-header">
          <div className="restaurant-header-content">
            <h1>{restaurant.restaurant_name}</h1>

            {restaurant.description && (
              <p className="restaurant-description">{restaurant.description}</p>
            )}

            {restaurant.address && (
              <p className="restaurant-address">{restaurant.address}</p>
            )}
          </div>
        </div>

        {/* =================================================
            CART MESSAGE
        ================================================= */}

        {cartMessage && (
          <div className="cart-success-message">✓ {cartMessage}</div>
        )}

        {cartError && (
          <div className="cart-error-message">
            <span>{cartError}</span>

            {addresses.length === 0 && !addressLoading && (
              <button type="button" onClick={() => navigate("/profile")}>
                Add Address
              </button>
            )}
          </div>
        )}

        {/* =================================================
            CATEGORY BUTTONS
        ================================================= */}

        {categories.length > 0 && (
          <div className="category-buttons">
            {categories.map((category) => (
              <button
                key={category.category_id}
                type="button"
                className={
                  selectedCategory === category.category_id
                    ? "category-button active"
                    : "category-button"
                }
                onClick={() => setSelectedCategory(category.category_id)}
              >
                {category.category_name}
              </button>
            ))}
          </div>
        )}

        {/* =================================================
            SELECTED CATEGORY
        ================================================= */}

        {currentCategory && (
          <div className="food-section">
            <div className="food-section-header">
              <div>
                <h2>{currentCategory.category_name}</h2>

                <p>
                  {currentCategory.foods?.length || 0} food item
                  {(currentCategory.foods?.length || 0) !== 1 ? "s" : ""}
                </p>
              </div>
            </div>

            {/* =================================================
                NO FOOD
            ================================================= */}

            {currentCategory.foods?.length === 0 ? (
              <div className="no-food-items">
                <h3>No food items available</h3>

                <p>This category currently has no available food items.</p>
              </div>
            ) : (
              /* =================================================
                 FOOD CARDS
              ================================================= */

              <div className="food-container">
                {currentCategory.foods.map((food) => {
                  const isAdding = cartLoading === food.food_id;

                  const cannotAdd =
                    addressLoading ||
                    addresses.length === 0 ||
                    !food.is_available ||
                    isAdding ||
                    replacingCart;

                  return (
                    <div className="food-card" key={food.food_id}>
                      {/* -----------------------------------------
                            IMAGE
                        ----------------------------------------- */}

                      <div className="food-image-wrapper">
                        {food.image_urls?.length > 0 ? (
                          <img
                            src={food.image_urls[0]}
                            alt={food.food_name}
                            className="food-image"
                          />
                        ) : (
                          <div className="food-image-placeholder">No Image</div>
                        )}

                        <span
                          className={
                            food.is_veg
                              ? "food-badge veg"
                              : "food-badge non-veg"
                          }
                        >
                          {food.is_veg ? "Veg" : "Non-Veg"}
                        </span>
                      </div>

                      {/* -----------------------------------------
                            FOOD DETAILS
                        ----------------------------------------- */}

                      <div className="food-info">
                        <h3>{food.food_name}</h3>

                        {food.description && (
                          <p className="food-description">{food.description}</p>
                        )}

                        <div className="food-price-row">
                          <span className="food-price">₹{food.price}</span>

                          {!food.is_available && (
                            <span className="food-unavailable">
                              Currently unavailable
                            </span>
                          )}
                        </div>
                      </div>

                      {/* -----------------------------------------
                            ADD TO CART
                        ----------------------------------------- */}

                      <div className="food-card-actions">
                        <button
                          type="button"
                          className="add-cart-button"
                          disabled={cannotAdd}
                          onClick={() => handleAddToCart(food)}
                        >
                          {isAdding
                            ? "Adding..."
                            : !food.is_available
                              ? "Unavailable"
                              : addressLoading
                                ? "Checking Address..."
                                : addresses.length === 0
                                  ? "Add Address First"
                                  : "Add to Cart"}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* =================================================
            NO CATEGORIES
        ================================================= */}

        {categories.length === 0 && (
          <div className="no-food-items">
            <h3>No food categories available</h3>

            <p>This restaurant has not added any food items yet.</p>
          </div>
        )}
      </div>

      {/* =================================================
          CART REPLACE MODAL
      ================================================= */}

      <CartReplaceModal
        isOpen={showReplaceModal}
        onCancel={handleCancelReplace}
        onConfirm={handleReplaceCart}
        loading={replacingCart}
      />
    </>
  );
};

export default RestaurantDetails;

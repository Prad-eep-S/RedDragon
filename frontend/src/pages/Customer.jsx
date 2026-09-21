import CustomerNavbar from "../components/CustomerNavbar";
import CartReplaceModal from "../components/CartReplaceModal";
import FoodCategory from "../components/FoodCategory";

import briyani from "../assets/food-category-images/briyani.jpg";
import pizza from "../assets/food-category-images/pizza.jpg";
import burger from "../assets/food-category-images/burger.jpg";
import chicken from "../assets/food-category-images/chicken.jpg";
import chineese from "../assets/food-category-images/chineese.jpg";
import indian from "../assets/food-category-images/indian.jpg";
import southIndian from "../assets/food-category-images/southIndian.jpg";
import rollsAndWraps from "../assets/food-category-images/rollsAndWraps.jpg";
import pasta from "../assets/food-category-images/pasta.jpg";
import fastFood from "../assets/food-category-images/fastFood.jpg";
import desserts from "../assets/food-category-images/desserts.jpg";
import beverages from "../assets/food-category-images/beverages.jpg";

import "./Customer.css";

import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";

import api from "../api/api";
import { getCartItems, deleteCartItem } from "../services/cartService";

/* ============================================================
   FOOD CATEGORIES
============================================================ */

const foodCategories = [
  {
    foodId: "BIRYANI",
    foodName: "Biryani",
    foodImgUrl: briyani,
  },
  {
    foodId: "PIZZA",
    foodName: "Pizza",
    foodImgUrl: pizza,
  },
  {
    foodId: "BURGER",
    foodName: "Burger",
    foodImgUrl: burger,
  },
  {
    foodId: "CHICKEN",
    foodName: "Chicken",
    foodImgUrl: chicken,
  },
  {
    foodId: "CHINESE",
    foodName: "Chinese",
    foodImgUrl: chineese,
  },
  {
    foodId: "INDIAN",
    foodName: "Indian",
    foodImgUrl: indian,
  },
  {
    foodId: "SOUTH_INDIAN",
    foodName: "South Indian",
    foodImgUrl: southIndian,
  },
  {
    foodId: "ROLLS",
    foodName: "Rolls & Wraps",
    foodImgUrl: rollsAndWraps,
  },
  {
    foodId: "PASTA",
    foodName: "Pasta",
    foodImgUrl: pasta,
  },
  {
    foodId: "FAST_FOOD",
    foodName: "Fast Food",
    foodImgUrl: fastFood,
  },
  {
    foodId: "DESSERTS",
    foodName: "Desserts",
    foodImgUrl: desserts,
  },
  {
    foodId: "BEVERAGES",
    foodName: "Beverages",
    foodImgUrl: beverages,
  },
];

const Customer = () => {
  const navigate = useNavigate();

  /* ============================================================
     ADDRESS STATE
  ============================================================ */

  const [addresses, setAddresses] = useState([]);

  const [selectedAddressId, setSelectedAddressId] = useState(null);

  const [addressLoading, setAddressLoading] = useState(false);

  const [addressError, setAddressError] = useState("");

  const [addressSelectorOpen, setAddressSelectorOpen] = useState(false);

  /* ============================================================
     CART STATE
  ============================================================ */

  const [cartLoading, setCartLoading] = useState(null);

  const [cartMessage, setCartMessage] = useState("");

  const [cartError, setCartError] = useState("");

  /* ============================================================
     CART REPLACE MODAL STATE
  ============================================================ */

  const [showReplaceModal, setShowReplaceModal] = useState(false);

  const [pendingFood, setPendingFood] = useState(null);

  const [replacingCart, setReplacingCart] = useState(false);

  /* ============================================================
     FOOD STATE
  ============================================================ */

  const [foodItems, setFoodItems] = useState([]);

  const [loading, setLoading] = useState(true);

  const [loadingMore, setLoadingMore] = useState(false);

  const [error, setError] = useState("");

  const [page, setPage] = useState(1);

  const [hasNext, setHasNext] = useState(true);

  /* ============================================================
     SEARCH STATE
  ============================================================ */

  const [searchTerm, setSearchTerm] = useState("");

  /* ============================================================
     SEARCH STATUS
  ============================================================ */

  const hasSearch = searchTerm.trim().length > 0;

  /* ============================================================
     REFS
  ============================================================ */

  const observerRef = useRef(null);

  const loadingMoreRef = useRef(false);

  const requestedPagesRef = useRef(new Set());

  /* ============================================================
     FETCH CUSTOMER ADDRESSES
  ============================================================ */

  const fetchAddresses = async () => {
    try {
      setAddressLoading(true);

      setAddressError("");

      const token = Cookies.get("token");

      if (!token) {
        setAddressError("Please login again.");

        return;
      }

      const response = await api.get("/customers/me/addresses", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const fetchedAddresses = response.data.addresses || [];

      setAddresses(fetchedAddresses);

      /* --------------------------------------------------------
         FIRST ADDRESS AUTOMATICALLY SELECTED
      -------------------------------------------------------- */

      if (fetchedAddresses.length > 0) {
        setSelectedAddressId(fetchedAddresses[0].address_id);
      } else {
        setSelectedAddressId(null);
      }
    } catch (error) {
      console.error("Failed to fetch addresses:", error);

      setAddressError(
        error.response?.data?.message ||
          error.response?.data?.error ||
          "Failed to load addresses",
      );
    } finally {
      setAddressLoading(false);
    }
  };

  /* ============================================================
     LOAD ADDRESSES WHEN PAGE OPENS
  ============================================================ */

  useEffect(() => {
    fetchAddresses();
  }, []);

  /* ============================================================
     SELECT ADDRESS
  ============================================================ */

  const handleAddressSelect = (addressId) => {
    setSelectedAddressId(addressId);

    setAddressSelectorOpen(false);

    setCartMessage("");

    setCartError("");
  };

  /* ============================================================
     GET SELECTED ADDRESS
  ============================================================ */

  const selectedAddress = addresses.find(
    (address) => address.address_id === selectedAddressId,
  );

  /* ============================================================
     ADD FOOD DIRECTLY TO CART
  ============================================================ */

  const addFoodToCart = async (food) => {
    /* ----------------------------------------------------------
       ADDRESS REQUIRED
    ---------------------------------------------------------- */

    if (!selectedAddressId) {
      setCartError(
        "Please select a delivery address before adding food to cart.",
      );

      setAddressSelectorOpen(true);

      return;
    }

    /* ----------------------------------------------------------
       FOOD VALIDATION
    ---------------------------------------------------------- */

    if (!food?.food_id) {
      setCartError("Food ID is missing.");
      return;
    }

    if (!food?.restaurant_id) {
      setCartError("Restaurant ID is missing.");
      return;
    }

    try {
      setCartLoading(food.food_id);

      setCartMessage("");
      setCartError("");

      const token = Cookies.get("token");

      if (!token) {
        setCartError("Please login again.");
        return;
      }

      /* --------------------------------------------------------
         POST /cart/items
      -------------------------------------------------------- */

      const response = await api.post(
        "/cart/items",
        {
          restaurant_id: Number(food.restaurant_id),
          food_id: Number(food.food_id),
          quantity: 1,
          address_id: Number(selectedAddressId),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      setCartMessage(`${food.food_name} added to cart successfully`);
    } catch (error) {
      console.error("Add to cart error:", error);

      setCartError(
        error.response?.data?.error ||
          error.response?.data?.message ||
          error.message ||
          "Failed to add food to cart",
      );

      throw error;
    } finally {
      setCartLoading(null);
    }
  };

  /* ============================================================
     EXTRACT CART ITEMS
  ============================================================ */

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

  /* ============================================================
     GET RESTAURANT ID FROM CURRENT CART
  ============================================================ */

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

  /* ============================================================
     ADD FOOD TO CART

     Flow:
     - Empty cart -> add directly
     - Same restaurant -> add directly
     - Different restaurant -> show replace modal
  ============================================================ */

  const handleAddToCart = async (food) => {
    /* ----------------------------------------------------------
       ADDRESS REQUIRED
    ---------------------------------------------------------- */

    if (!selectedAddressId) {
      setCartError(
        "Please select a delivery address before adding food to cart.",
      );

      setAddressSelectorOpen(true);

      return;
    }

    /* ----------------------------------------------------------
       FOOD VALIDATION
    ---------------------------------------------------------- */

    if (!food?.food_id) {
      setCartError("Food ID is missing.");
      return;
    }

    if (!food?.restaurant_id) {
      setCartError("Restaurant ID is missing.");
      return;
    }

    try {
      setCartLoading(food.food_id);

      setCartMessage("");
      setCartError("");

      /* --------------------------------------------------------
         GET CURRENT CART
      -------------------------------------------------------- */

      const cartResponse = await getCartItems();


      const cartItems = getCartItemsFromResponse(cartResponse);

      /* --------------------------------------------------------
         EMPTY CART
      -------------------------------------------------------- */

      if (cartItems.length === 0) {
        await addFoodToCart(food);
        return;
      }

      /* --------------------------------------------------------
         GET CURRENT CART RESTAURANT
      -------------------------------------------------------- */

      const cartRestaurantId = getCartRestaurantId(cartResponse, cartItems);

      console.log("CART RESTAURANT ID:", cartRestaurantId);

      console.log("CLICKED FOOD RESTAURANT ID:", food.restaurant_id);

      /* --------------------------------------------------------
         IF RESTAURANT ID IS NOT AVAILABLE
      -------------------------------------------------------- */

      if (!cartRestaurantId) {
        console.warn("Cart restaurant ID not found. Adding item directly.");

        await addFoodToCart(food);
        return;
      }

      /* --------------------------------------------------------
         SAME RESTAURANT
      -------------------------------------------------------- */

      if (Number(cartRestaurantId) === Number(food.restaurant_id)) {
        await addFoodToCart(food);
        return;
      }

      /* --------------------------------------------------------
         DIFFERENT RESTAURANT
      -------------------------------------------------------- */

      console.log("Different restaurant detected. Opening replace modal.");

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

  /* ============================================================
     REPLACE CART

     When the user confirms:
     1. Fetch current cart
     2. Delete all existing items
     3. Add the pending food item
  ============================================================ */

  const handleReplaceCart = async () => {
    if (!pendingFood) {
      return;
    }

    try {
      setReplacingCart(true);

      setCartMessage("");
      setCartError("");

      /* --------------------------------------------------------
         GET CURRENT CART AGAIN
      -------------------------------------------------------- */

      const cartResponse = await getCartItems();

      const cartItems = getCartItemsFromResponse(cartResponse);

      console.log("CART ITEMS TO DELETE:", cartItems);

      /* --------------------------------------------------------
         DELETE OLD CART ITEMS
      -------------------------------------------------------- */

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

      /* --------------------------------------------------------
         ADD THE NEW FOOD
      -------------------------------------------------------- */

      await addFoodToCart(pendingFood);

      /* --------------------------------------------------------
         CLOSE MODAL
      -------------------------------------------------------- */

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

  /* ============================================================
     CANCEL REPLACE CART
  ============================================================ */

  const handleCancelReplace = () => {
    if (replacingCart) {
      return;
    }

    setShowReplaceModal(false);
    setPendingFood(null);
  };

  /* ============================================================
     FETCH FOOD ITEMS
  ============================================================ */

  const fetchFoodItems = async (pageNumber) => {
    /* ----------------------------------------------------------
       PREVENT DUPLICATE PAGE REQUEST
    ---------------------------------------------------------- */

    if (requestedPagesRef.current.has(pageNumber)) {
      return;
    }

    requestedPagesRef.current.add(pageNumber);

    try {
      if (pageNumber === 1) {
        setLoading(true);
      } else {
        loadingMoreRef.current = true;

        setLoadingMore(true);
      }

      const token = Cookies.get("token");

      if (!token) {
        setError("Please login again.");

        return;
      }

      const response = await api.get(`/foods?page=${pageNumber}&page_size=12`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = response.data;

      console.log(`Page ${pageNumber}:`, data);

      if (Array.isArray(data?.data)) {
        console.log(
          `Page ${pageNumber} IDs:`,
          data.data.map((food) => food.food_id),
        );
      }

      /* ------------------------------------------------------
         FIRST PAGE
      ------------------------------------------------------ */

      if (pageNumber === 1) {
        setFoodItems(Array.isArray(data?.data) ? data.data : []);
      } else {
        /* ----------------------------------------------------
           NEXT PAGE
        ---------------------------------------------------- */

        setFoodItems((previousFoods) => {
          const nextFoods = Array.isArray(data?.data) ? data.data : [];

          const combined = [...previousFoods, ...nextFoods];

          return Array.from(
            new Map(combined.map((food) => [food.food_id, food])).values(),
          );
        });
      }

      setHasNext(Boolean(data?.pagination?.has_next));

      setPage(pageNumber);
    } catch (error) {
      console.error("Food loading error:", error);

      requestedPagesRef.current.delete(pageNumber);

      setError(
        error.response?.data?.message ||
          error.response?.data?.error ||
          "Failed to load food items",
      );
    } finally {
      setLoading(false);

      setLoadingMore(false);

      loadingMoreRef.current = false;
    }
  };

  /* ============================================================
     INITIAL FOOD LOAD
  ============================================================ */

  useEffect(() => {
    fetchFoodItems(1);
  }, []);

  /* ============================================================
     INFINITE SCROLL
     
     Pagination:
     - Runs when there is NO search text
     - Stops while searching
     - Starts again when search is cleared
  ============================================================ */

  useEffect(() => {
    /* ----------------------------------------------------------
       DO NOT PAGINATE WHILE SEARCHING
    ---------------------------------------------------------- */

    if (hasSearch) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];

        if (!entry.isIntersecting) {
          return;
        }

        if (!hasNext) {
          return;
        }

        if (loading) {
          return;
        }

        if (loadingMoreRef.current) {
          return;
        }

        console.log("Pagination triggered. Loading page:", page + 1);

        fetchFoodItems(page + 1);
      },
      {
        threshold: 0.1,
      },
    );

    const currentTrigger = observerRef.current;

    if (currentTrigger) {
      observer.observe(currentTrigger);
    }

    return () => {
      if (currentTrigger) {
        observer.unobserve(currentTrigger);
      }

      observer.disconnect();
    };
  }, [page, hasNext, loading, hasSearch]);

  /* ============================================================
     FILTER FOOD ITEMS
     
     CASE INSENSITIVE
     
     Searches:
     - Food name
     - Restaurant name
     - Category name
     - Description
  ============================================================ */

  const filteredFoodItems = foodItems.filter((food) => {
    const search = searchTerm.trim().toLowerCase().replace(/\s+/g, " ");

    /* --------------------------------------------------------
         SEARCH IS EMPTY
      -------------------------------------------------------- */

    if (!search) {
      return true;
    }

    /* --------------------------------------------------------
         CREATE SEARCHABLE TEXT
      -------------------------------------------------------- */

    const searchableText = [
      food.food_name,
      food.restaurant_name,
      food.category_name,
      food.description,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase()
      .replace(/\s+/g, " ");

    /* --------------------------------------------------------
         MATCH
      -------------------------------------------------------- */

    return searchableText.includes(search);
  });

  /* ============================================================
     RENDER
  ============================================================ */

  return (
    <div className="customer-page">
      <CustomerNavbar />

      <main className="customer-content">
        {/* ======================================================
            PAGE HEADING
        ====================================================== */}

        <p className="customer-heading">What are you craving today? 🍴</p>

        {/* ======================================================
            SEARCH
        ====================================================== */}

        <div className="search-container">
          <input
            type="text"
            placeholder="Search for food..."
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
          />

          {searchTerm && (
            <button
              type="button"
              className="search-clear-button"
              onClick={() => setSearchTerm("")}
              aria-label="Clear search"
            >
              ×
            </button>
          )}
        </div>

        {/* ======================================================
            DELIVERY ADDRESS
        ====================================================== */}

        <section className="delivery-address-section">
          <div className="delivery-address-header">
            <div>
              <span className="delivery-address-label">Delivery to</span>

              <h2 className="delivery-address-type">
                {selectedAddress
                  ? selectedAddress.address_type
                  : "No address selected"}
              </h2>
            </div>

            <button
              type="button"
              className="manage-address-btn"
              onClick={() => navigate("/customer/profile")}
            >
              + Add / Manage Address
            </button>
          </div>

          {/* ====================================================
              ADDRESS LOADING
          ==================================================== */}

          {addressLoading && (
            <div className="address-loading">Loading delivery addresses...</div>
          )}

          {/* ====================================================
              ADDRESS ERROR
          ==================================================== */}

          {!addressLoading && addressError && (
            <div className="address-error">
              <span>{addressError}</span>

              <button type="button" onClick={fetchAddresses}>
                Retry
              </button>
            </div>
          )}

          {/* ====================================================
              NO ADDRESS
          ==================================================== */}

          {!addressLoading && !addressError && addresses.length === 0 && (
            <div className="no-address">
              <div>
                <strong>No delivery address</strong>

                <p>Add a delivery address before adding food to your cart.</p>
              </div>

              <button
                type="button"
                onClick={() => navigate("/customer/profile")}
              >
                Add Address
              </button>
            </div>
          )}

          {/* ====================================================
              SELECTED ADDRESS
          ==================================================== */}

          {!addressLoading && !addressError && selectedAddress && (
            <div className="selected-address-card">
              <div className="selected-address-content">
                <span className="selected-address-type">
                  {selectedAddress.address_type}
                </span>

                <p className="selected-address-text">
                  {selectedAddress.address_line1}
                  {selectedAddress.address_line2
                    ? `, ${selectedAddress.address_line2}`
                    : ""}
                  {selectedAddress.city
                    ? `, ${selectedAddress.city}`
                    : ""}
                  {selectedAddress.state
                    ? `, ${selectedAddress.state}`
                    : ""}
                  {selectedAddress.postal_code
                    ? ` - ${selectedAddress.postal_code}`
                    : ""}
                  {selectedAddress.landmark
                    ? ` | Landmark: ${selectedAddress.landmark}`
                    : ""}
                </p>
              </div>

              <button
                type="button"
                className="change-address-btn"
                onClick={() => setAddressSelectorOpen(!addressSelectorOpen)}
              >
                Change
              </button>
            </div>
          )}

          {/* ====================================================
              ADDRESS SELECTOR
          ==================================================== */}

          {!addressLoading && addresses.length > 0 && addressSelectorOpen && (
            <div className="address-selector">
              <div className="address-selector-header">
                <strong>Select delivery address</strong>

                <button
                  type="button"
                  onClick={() => setAddressSelectorOpen(false)}
                >
                  ×
                </button>
              </div>

              <div className="address-options">
                {addresses.map((address) => (
                  <button
                    key={address.address_id}
                    type="button"
                    className={`address-option ${
                      selectedAddressId === address.address_id ? "active" : ""
                    }`}
                    onClick={() => handleAddressSelect(address.address_id)}
                  >
                    <div className="address-option-radio">
                      <span
                        className={
                          selectedAddressId === address.address_id
                            ? "radio-dot active"
                            : "radio-dot"
                        }
                      />
                    </div>

                    <div className="address-option-content">
                      <div className="address-option-top">
                        <strong>{address.address_type}</strong>

                        {selectedAddressId === address.address_id && (
                          <span className="current-label">Selected</span>
                        )}
                      </div>

                      <span>{address.address_line1}</span>

                      {address.address_line2 && (
                        <span>{address.address_line2}</span>
                      )}

                      <span>
                        {address.city}, {address.state}
                        {" - "}
                        {address.postal_code}
                      </span>
                    </div>
                  </button>
                ))}
              </div>

              <button
                type="button"
                className="add-new-address-button"
                onClick={() => navigate("/customer/profile")}
              >
                + Add New Address
              </button>
            </div>
          )}
        </section>

        {/* ======================================================
            CART SUCCESS MESSAGE
        ====================================================== */}

        {cartMessage && (
          <div className="cart-success-message">✓ {cartMessage}</div>
        )}

        {/* ======================================================
            CART ERROR MESSAGE
        ====================================================== */}

        {cartError && <div className="cart-error-message">⚠ {cartError}</div>}

        {/* ======================================================
            FOOD ITEMS
        ====================================================== */}

        <section className="food-items-section">
          <h1>
            {hasSearch ? `Search Results for "${searchTerm}"` : "Popular Food"}
          </h1>

          {/* ----------------------------------------------------
              LOADING
          ---------------------------------------------------- */}

          {loading && <p className="food-loading">Loading food items...</p>}

          {/* ----------------------------------------------------
              ERROR
          ---------------------------------------------------- */}

          {error && <p className="food-error">{error}</p>}

          {/* ----------------------------------------------------
              FOOD LIST
          ---------------------------------------------------- */}

          {!loading && !error && (
            <div className="food-items-container">
              {filteredFoodItems.length > 0 ? (
                filteredFoodItems.map((food) => (
                  <div key={food.food_id} className="food-card">
                    <img
                      className="food-card-image"
                      src={food.image_urls?.[0]}
                      alt={food.food_name}
                    />

                    <div className="food-card-content">
                      <h3>{food.food_name}</h3>

                      <p className="food-restaurant-name">
                        {food.restaurant_name}
                      </p>

                      <p>{food.category_name}</p>

                      <p className="food-price">₹{food.price}</p>

                      <p
                        className={`food-type ${
                          food.is_veg ? "veg" : "non-veg"
                        }`}
                      >
                        {food.is_veg ? "Veg" : "Non-Veg"}
                      </p>

                      {/* ==================================================
                              ADD TO CART
                          ================================================== */}

                      <button
                        type="button"
                        className="add-to-cart-button"
                        disabled={
                          !food.is_available ||
                          cartLoading === food.food_id ||
                          addresses.length === 0 ||
                          replacingCart
                        }
                        onClick={() => handleAddToCart(food)}
                      >
                        {cartLoading === food.food_id
                          ? "Adding..."
                          : replacingCart
                            ? "Replacing Cart..."
                            : !food.is_available
                              ? "Unavailable"
                              : addresses.length === 0
                                ? "Add Address First"
                                : "Add to Cart"}
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                /* =================================================
                     NO SEARCH RESULTS
                  ================================================= */

                <div className="no-food-results">
                  <h3>No food items found</h3>

                  <p>
                    {hasSearch
                      ? `No food items match "${searchTerm}"`
                      : "No food items are currently available."}
                  </p>

                  {hasSearch && (
                    <button type="button" onClick={() => setSearchTerm("")}>
                      Clear Search
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ====================================================
              INFINITE SCROLL TRIGGER

              ONLY ACTIVE WHEN SEARCH IS EMPTY
          ==================================================== */}

          {!hasSearch && (
            <div ref={observerRef} className="infinite-scroll-trigger">
              {loadingMore && <p>Loading more food...</p>}

              {!hasNext && !loading && <p>No more food items</p>}
            </div>
          )}
        </section>
      </main>

      {/* ======================================================
          CART REPLACE MODAL
      ====================================================== */}

      <CartReplaceModal
        isOpen={showReplaceModal}
        onCancel={handleCancelReplace}
        onConfirm={handleReplaceCart}
        loading={replacingCart}
      />
    </div>
  );
};

export default Customer;

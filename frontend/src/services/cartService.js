import Cookies from "js-cookie";
import api from "../api/api";

// =====================================================
// GET AUTH HEADERS
// =====================================================

function getAuthHeaders() {
  const token =
    Cookies.get("token") ||
    localStorage.getItem("token") ||
    localStorage.getItem("id_token") ||
    localStorage.getItem("access_token");

  if (!token) {
    throw new Error("Authentication token not found. Please login again.");
  }

  return {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  };
}

// =====================================================
// GET CART ITEMS
// GET /cart
// =====================================================

export async function getCartItems() {
  try {
    const response = await api.get("/cart", getAuthHeaders());

    console.log("Get cart items response:", response.data);

    return response.data;
  } catch (error) {
    console.error(
      "Get cart items error:",
      error.response?.data || error.message,
    );

    throw new Error(
      error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        "Failed to load cart",
    );
  }
}

// =====================================================
// ADD TO CART
// POST /cart/items
// =====================================================

export async function addToCart({
  restaurantId,
  foodId,
  quantity = 1,
  addressId,
}) {
  try {
    // ---------------------------------------------------
    // VALIDATION
    // ---------------------------------------------------

    if (
      restaurantId === undefined ||
      restaurantId === null ||
      Number(restaurantId) <= 0
    ) {
      throw new Error("Restaurant ID is required.");
    }

    if (foodId === undefined || foodId === null || Number(foodId) <= 0) {
      throw new Error("Food ID is required.");
    }

    if (quantity === undefined || quantity === null || Number(quantity) <= 0) {
      throw new Error("Quantity must be greater than 0.");
    }

    if (
      addressId === undefined ||
      addressId === null ||
      Number(addressId) <= 0
    ) {
      throw new Error("Delivery address is required.");
    }

    // ---------------------------------------------------
    // REQUEST
    // ---------------------------------------------------

    const payload = {
      restaurant_id: Number(restaurantId),
      food_id: Number(foodId),
      quantity: Number(quantity),
      address_id: Number(addressId),
    };

    console.log("Add to cart payload:", payload);

    const response = await api.post("/cart/items", payload, getAuthHeaders());

    console.log("Add to cart response:", response.data);

    return response.data;
  } catch (error) {
    console.error("Add to cart error:", error.response?.data || error.message);

    throw new Error(
      error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        "Failed to add food to cart",
    );
  }
}

// =====================================================
// DELETE CART ITEM
// DELETE /cart/items/{orderItemId}
// =====================================================

export async function deleteCartItem({ orderItemId }) {
  try {
    // ---------------------------------------------------
    // VALIDATION
    // ---------------------------------------------------

    if (
      orderItemId === undefined ||
      orderItemId === null ||
      Number(orderItemId) <= 0
    ) {
      throw new Error("Order item ID is required.");
    }

    // ---------------------------------------------------
    // REQUEST
    // ---------------------------------------------------

    const response = await api.delete(
      `/cart/items/${Number(orderItemId)}`,
      getAuthHeaders(),
    );

    console.log("Delete cart item response:", response.data);

    return response.data;
  } catch (error) {
    console.error(
      "Delete cart item error:",
      error.response?.data || error.message,
    );

    throw new Error(
      error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        "Failed to remove item from cart",
    );
  }
}

// =====================================================
// UPDATE CART ITEM QUANTITY
// PUT /cart/items/{orderItemId}
// =====================================================

export async function updateCartItemQuantity(orderItemId, quantity) {
  try {
    // ---------------------------------------------------
    // VALIDATION
    // ---------------------------------------------------

    if (
      orderItemId === undefined ||
      orderItemId === null ||
      Number(orderItemId) <= 0
    ) {
      throw new Error("Order item ID is required.");
    }

    if (quantity === undefined || quantity === null || Number(quantity) <= 0) {
      throw new Error("Quantity must be greater than 0.");
    }

    if (Number(quantity) > 100) {
      throw new Error("Quantity cannot be greater than 100.");
    }

    // ---------------------------------------------------
    // REQUEST
    // ---------------------------------------------------

    const response = await api.put(
      `/cart/items/${Number(orderItemId)}`,
      {
        quantity: Number(quantity),
      },
      getAuthHeaders(),
    );

    console.log("Update cart item response:", response.data);

    return response.data;
  } catch (error) {
    console.error(
      "Update cart item error:",
      error.response?.data || error.message,
    );

    throw new Error(
      error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        "Failed to update cart item",
    );
  }
}

// =====================================================
// UPDATE CART ITEM
// =====================================================

export async function updateCartItem({ orderItemId, quantity }) {
  return updateCartItemQuantity(orderItemId, quantity);
}

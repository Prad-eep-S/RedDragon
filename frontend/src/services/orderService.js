import axios from "axios";
import Cookies from "js-cookie";

const API_BASE_URL =
  "https://j6vt52wv97.execute-api.ap-southeast-2.amazonaws.com/dev";

// =====================================================
// GET JWT TOKEN
// =====================================================

function getToken() {
  // Check cookie first
  const cookieToken = Cookies.get("token");

  if (cookieToken) {
    return cookieToken;
  }

  // Check localStorage
  const localStorageToken =
    localStorage.getItem("token") ||
    localStorage.getItem("id_token") ||
    localStorage.getItem("access_token");

  return localStorageToken;
}

// =====================================================
// AXIOS CONFIG
// =====================================================

function getConfig() {
  const token = getToken();

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
// CREATE DRAFT ORDER
// =====================================================

export async function createDraftOrder(restaurantId, addressId) {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/orders`,
      {
        restaurant_id: Number(restaurantId),
        address_id: Number(addressId),
      },
      getConfig(),
    );

    console.log("Create draft order response:", response.data);

    return response.data;
  } catch (error) {
    console.error(
      "Create draft order error:",
      error.response?.data || error.message,
    );

    throw new Error(
      error.response?.data?.message ||
        error.response?.data?.error ||
        "Failed to create draft order",
    );
  }
}

// =====================================================
// ADD ORDER ITEM
// =====================================================

export async function addOrderItem(orderId, foodId, quantity = 1) {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/orders/${Number(orderId)}/order_items`,
      {
        food_id: Number(foodId),
        quantity: Number(quantity),
      },
      getConfig(),
    );

    console.log("Add order item response:", response.data);

    return response.data;
  } catch (error) {
    console.error(
      "Add order item error:",
      error.response?.data || error.message,
    );

    throw new Error(
      error.response?.data?.message ||
        error.response?.data?.error ||
        "Failed to add order item",
    );
  }
}

// =====================================================
// GET ALL ORDERS
// =====================================================

export async function getOrders() {
  try {
    const response = await axios.get(`${API_BASE_URL}/my-orders`, getConfig());

    console.log("Get orders response:", response.data);

    return response.data;
  } catch (error) {
    console.error("Get orders error:", error.response?.data || error.message);

    throw new Error(
      error.response?.data?.message ||
        error.response?.data?.error ||
        "Failed to load orders",
    );
  }
}

// =====================================================
// GET SINGLE ORDER
// =====================================================

export async function getOrder(orderId) {
  try {
    if (!orderId) {
      throw new Error("Order ID is required.");
    }

    const response = await axios.get(
      `${API_BASE_URL}/orders/${Number(orderId)}`,
      getConfig(),
    );

    console.log("Get order response:", response.data);

    return response.data;
  } catch (error) {
    console.error("Get order error:", error.response?.data || error.message);

    throw new Error(
      error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        "Failed to load order",
    );
  }
}

// =====================================================
// GET ORDER ITEMS
// =====================================================

export async function getOrderItems(orderId) {
  try {
    if (!orderId) {
      throw new Error("Order ID is required.");
    }

    const response = await axios.get(
      `${API_BASE_URL}/my-orders/order_items/${Number(orderId)}`,
      getConfig(),
    );

    console.log("Get order items response:", response.data);

    return response.data;
  } catch (error) {
    console.error(
      "Get order items error:",
      error.response?.data || error.message,
    );

    throw new Error(
      error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        "Failed to load order items",
    );
  }
}
// =====================================================
// UPDATE ORDER ITEM
// =====================================================

export async function updateOrderItem(orderItemId, quantity) {
  try {
    const response = await axios.put(
      `${API_BASE_URL}/order-items/${Number(orderItemId)}`,
      {
        quantity: Number(quantity),
      },
      getConfig(),
    );

    console.log("Update order item response:", response.data);

    return response.data;
  } catch (error) {
    console.error(
      "Update order item error:",
      error.response?.data || error.message,
    );

    throw new Error(
      error.response?.data?.message ||
        error.response?.data?.error ||
        "Failed to update order item",
    );
  }
}

// =====================================================
// DELETE ORDER ITEM
// =====================================================

export async function deleteOrderItem(orderItemId) {
  try {
    const response = await axios.delete(
      `${API_BASE_URL}/order-items/${Number(orderItemId)}`,
      getConfig(),
    );

    console.log("Delete order item response:", response.data);

    return response.data;
  } catch (error) {
    console.error(
      "Delete order item error:",
      error.response?.data || error.message,
    );

    throw new Error(
      error.response?.data?.message ||
        error.response?.data?.error ||
        "Failed to delete order item",
    );
  }
}

// =====================================================
// REPLACE CART
// =====================================================

export async function replaceCart(restaurantId, addressId) {
  try {
    const response = await axios.put(
      `${API_BASE_URL}/orders/replace`,
      {
        restaurant_id: Number(restaurantId),
        address_id: Number(addressId),
      },
      getConfig(),
    );

    console.log("Replace cart response:", response.data);

    return response.data;
  } catch (error) {
    console.error("Replace cart error:", error.response?.data || error.message);

    throw new Error(
      error.response?.data?.message ||
        error.response?.data?.error ||
        "Failed to replace cart",
    );
  }
}

// =====================================================
// PLACE ORDER
// =====================================================

export async function placeOrder(orderId) {
  try {
    if (!orderId) {
      throw new Error("Order ID is required.");
    }

    const response = await axios.post(
      `${API_BASE_URL}/orders/${Number(orderId)}`,
      {},
      getConfig(),
    );

    console.log("Place order response:", response.data);

    return response.data;
  } catch (error) {
    console.error("Place order error:", error.response?.data || error.message);

    throw new Error(
      error.response?.data?.message ||
        error.response?.data?.error ||
        "Failed to place order",
    );
  }
}

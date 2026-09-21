import axios from "axios";
import Cookies from "js-cookie";

const API_URL =
  "https://j6vt52wv97.execute-api.ap-southeast-2.amazonaws.com/dev/my-orders";

// =====================================================
// GET JWT TOKEN
// =====================================================

function getToken() {
  return Cookies.get("token") || localStorage.getItem("token");
}

// =====================================================
// AXIOS CONFIG
// =====================================================

function getConfig() {
  const token = getToken();

  return {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  };
}

// =====================================================
// GET MY ORDERS
// =====================================================

export async function getMyOrders() {
  try {
    const response = await axios.get(API_URL, getConfig());

    console.log("My Orders API response:", response.data);

    return response.data;
  } catch (error) {
    console.error(
      "Get my orders error:",
      error.response?.data || error.message,
    );

    throw new Error(
      error.response?.data?.message ||
        error.response?.data?.error ||
        "Failed to load orders",
    );
  }
}

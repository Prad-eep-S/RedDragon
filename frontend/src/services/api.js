import Cookies from "js-cookie";

const API_URL =
  "https://j6vt52wv97.execute-api.ap-southeast-2.amazonaws.com/dev";

// =====================================================
// AUTH TOKEN
// =====================================================

const getToken = () => {
  const token = Cookies.get("token");

  if (!token) {
    throw new Error("Authentication token not found. Please login again.");
  }

  return token;
};

// =====================================================
// JSON AUTH HEADERS
// =====================================================

const getAuthHeaders = () => {
  const token = getToken();

  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
};

// =====================================================
// MULTIPART AUTH HEADERS
// =====================================================

const getMultipartHeaders = () => {
  const token = getToken();

  return {
    Authorization: `Bearer ${token}`,
  };
};

// =====================================================
// GET RESTAURANT
// =====================================================

export const getRestaurantById = async () => {
  const url = `${API_URL}/restaurant-details`;

  const response = await fetch(url, {
    method: "GET",
    headers: getAuthHeaders(),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.error ||
        data.message ||
        `Failed to get restaurant: ${response.status}`,
    );
  }

  return data;
};

// =====================================================
// UPDATE RESTAURANT
// =====================================================

export const updateRestaurant = async (restaurantData) => {
  const url = `${API_URL}/restaurant-details`;

  console.log("Updating restaurant:", url);
  console.log("Restaurant update data:", restaurantData);

  const response = await fetch(url, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(restaurantData),
  });

  const data = await response.json();

  console.log("Restaurant update response:", data);

  if (!response.ok) {
    throw new Error(
      data.message ||
        data.error ||
        `Failed to update restaurant: ${response.status}`,
    );
  }

  return data;
};
// =====================================================
// UPDATE RESTAURANT STATUS
// =====================================================

export const updateRestaurantStatus = async (isActive) => {
  const url = `${API_URL}/restaurant-details`;

  console.log("Updating restaurant status:", url);
  console.log("New restaurant status:", isActive);

  const response = await fetch(url, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify({
      is_active: isActive,
    }),
  });

  const data = await response.json();

  console.log("Restaurant status response:", data);

  if (!response.ok) {
    throw new Error(
      data.message ||
        data.error ||
        `Failed to update restaurant status: ${response.status}`,
    );
  }

  return data;
};

// =====================================================
// GET ALL FOOD CATEGORIES
//
// GET /restaurant-details/food-categories-details
//
// Restaurant ID comes from JWT:
// JWT sub
//    ↓
// restaurants.cognito_user_id
//    ↓
// restaurant_id
// =====================================================

export const getFoodCategories = async () => {
  const url = `${API_URL}/restaurant-details/food-categories-details`;

  console.log("Getting food categories:", url);

  const response = await fetch(url, {
    method: "GET",
    headers: getAuthHeaders(),
  });

  const data = await response.json();

  console.log("Food Categories Response:", data);

  if (!response.ok) {
    throw new Error(
      data.error ||
        data.message ||
        `Failed to get food categories: ${response.status}`,
    );
  }

  return data;
};

// =====================================================
// ADD FOOD CATEGORY
//
// POST /restaurant-details/food-categories-details
//
// Multipart:
// category_name
// image
// =====================================================

export const addFoodCategory = async (formData) => {
  const url = `${API_URL}/restaurant-details/food-categories-details`;

  console.log("Adding food category:", url);

  const response = await fetch(url, {
    method: "POST",
    headers: getMultipartHeaders(),
    body: formData,
  });

  const data = await response.json();

  console.log("Add Food Category Response:", data);

  if (!response.ok) {
    throw new Error(
      data.error ||
        data.message ||
        `Failed to add food category: ${response.status}`,
    );
  }

  return data;
};

// =====================================================
// GET SINGLE FOOD CATEGORY
//
// GET /restaurant-details/food-categories-details/{categoryid-details}
// =====================================================

export const getFoodCategoryById = async (categoryId) => {
  if (!categoryId) {
    throw new Error("Category ID is required.");
  }

  const url = `${API_URL}/restaurant-details/food-categories-details/${Number(
    categoryId,
  )}`;

  console.log("Getting food category:", url);

  const response = await fetch(url, {
    method: "GET",
    headers: getAuthHeaders(),
  });

  const data = await response.json();

  console.log("Food Category Response:", data);

  if (!response.ok) {
    throw new Error(
      data.error ||
        data.message ||
        `Failed to get food category: ${response.status}`,
    );
  }

  return data;
};

// =====================================================
// UPDATE FOOD CATEGORY
//
// PUT /restaurant-details/food-categories-details/{categoryid-details}
//
// Multipart:
// category_name
// is_active
// image (optional)
// =====================================================

export const updateFoodCategory = async (categoryId, formData) => {
  if (!categoryId) {
    throw new Error("Category ID is required.");
  }

  const url = `${API_URL}/restaurant-details/food-categories-details/${Number(
    categoryId,
  )}`;

  console.log("Updating food category:", url);

  const response = await fetch(url, {
    method: "PUT",
    headers: getMultipartHeaders(),
    body: formData,
  });

  const data = await response.json();

  console.log("Update Food Category Response:", data);

  if (!response.ok) {
    throw new Error(
      data.error ||
        data.message ||
        `Failed to update food category: ${response.status}`,
    );
  }

  return data;
};

// =====================================================
// DELETE FOOD CATEGORY
//
// DELETE /restaurant-details/food-categories-details/{categoryid-details}
// =====================================================

export const deleteFoodCategory = async (categoryId) => {
  if (!categoryId) {
    throw new Error("Category ID is required.");
  }

  const url = `${API_URL}/restaurant-details/food-categories-details/${Number(
    categoryId,
  )}`;

  console.log("Deleting food category:", url);

  const response = await fetch(url, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });

  const data = await response.json();

  console.log("Delete Food Category Response:", data);

  if (!response.ok) {
    throw new Error(
      data.error ||
        data.message ||
        `Failed to delete food category: ${response.status}`,
    );
  }

  return data;
};

// =====================================================
// GET FOOD ITEMS BY CATEGORY
//
// GET
// /restaurant-details/food-categories-details/{categoryid-details}/food-items-details
//
// Restaurant ID comes from JWT.
// =====================================================

export const getFoodItems = async (categoryId) => {
  if (!categoryId) {
    throw new Error("Category ID is required.");
  }

  const url =
    `${API_URL}/restaurant-details/food-categories-details/` +
    `${Number(categoryId)}/food-items-details`;

  console.log("Getting food items:", url);

  const response = await fetch(url, {
    method: "GET",
    headers: getAuthHeaders(),
  });

  const data = await response.json();

  console.log("Food Items Response:", data);

  if (!response.ok) {
    throw new Error(
      data.error ||
        data.message ||
        `Failed to get food items: ${response.status}`,
    );
  }

  return data;
};

// =====================================================
// GET SINGLE FOOD ITEM
//
// GET
// /restaurant-details/food-categories-details/{categoryid-details}
// /food-items-details/{foodid-details}
// =====================================================

export const getFoodItemById = async (categoryId, foodItemId) => {
  if (!categoryId) {
    throw new Error("Category ID is required.");
  }

  if (!foodItemId) {
    throw new Error("Food item ID is required.");
  }

  const url =
    `${API_URL}/restaurant-details/food-categories-details/` +
    `${Number(categoryId)}/food-items-details/${Number(foodItemId)}`;

  console.log("Getting single food item:", url);

  const response = await fetch(url, {
    method: "GET",
    headers: getAuthHeaders(),
  });

  const data = await response.json();

  console.log("Food Item Response:", data);

  if (!response.ok) {
    throw new Error(
      data.error ||
        data.message ||
        `Failed to get food item: ${response.status}`,
    );
  }

  return data;
};

// =====================================================
// ADD FOOD ITEM
//
// POST
// /restaurant-details/food-categories-details/{categoryid-details}
// /food-items-details
//
// Multipart:
// food_name
// description
// price
// image
// is_available
// etc.
//
// Restaurant ID comes from JWT.
// =====================================================

export const addFoodItem = async (categoryId, formData) => {
  if (!categoryId) {
    throw new Error("Category ID is required.");
  }

  const url =
    `${API_URL}/restaurant-details/food-categories-details/` +
    `${Number(categoryId)}/food-items-details`;

  console.log("Adding food item:", url);

  const response = await fetch(url, {
    method: "POST",
    headers: getMultipartHeaders(),
    body: formData,
  });

  const responseText = await response.text();

  console.log("Add Food Item Response:", responseText);

  if (!response.ok) {
    throw new Error(
      `Failed to add food item: ${response.status} - ${responseText}`,
    );
  }

  try {
    return JSON.parse(responseText);
  } catch {
    throw new Error("Food item API returned an invalid response.");
  }
};

// =====================================================
// UPDATE FOOD ITEM
//
// PUT
// /restaurant-details/food-categories-details/{categoryid-details}
// /food-items-details/{foodid-details}
//
// Multipart
// =====================================================

export const updateFoodItem = async (categoryId, foodItemId, formData) => {
  if (!categoryId) {
    throw new Error("Category ID is required.");
  }

  if (!foodItemId) {
    throw new Error("Food item ID is required.");
  }

  const url =
    `${API_URL}/restaurant-details/food-categories-details/` +
    `${Number(categoryId)}/food-items-details/${Number(foodItemId)}`;

  console.log("Updating food item:", url);

  const response = await fetch(url, {
    method: "PUT",
    headers: getMultipartHeaders(),
    body: formData,
  });

  const responseText = await response.text();

  console.log("Update Food Item Response:", responseText);

  if (!response.ok) {
    throw new Error(
      `Failed to update food item: ${response.status} - ${responseText}`,
    );
  }

  try {
    return JSON.parse(responseText);
  } catch {
    throw new Error("Food item API returned an invalid response.");
  }
};

// =====================================================
// UPDATE FOOD ITEM AVAILABILITY
//
// PATCH
// /restaurant-details/food-categories-details/{categoryid-details}
// /food-items-details/{foodid-details}
// =====================================================

export const updateFoodItemAvailability = async (
  categoryId,
  foodItemId,
  isAvailable,
) => {
  if (!categoryId) {
    throw new Error("Category ID is required.");
  }

  if (!foodItemId) {
    throw new Error("Food item ID is required.");
  }

  const url =
    `${API_URL}/restaurant-details/food-categories-details/` +
    `${Number(categoryId)}/food-items-details/${Number(foodItemId)}`;

  console.log("Updating food availability:", url);

  const response = await fetch(url, {
    method: "PATCH",
    headers: getAuthHeaders(),
    body: JSON.stringify({
      is_available: isAvailable,
    }),
  });

  const data = await response.json();

  console.log("Food Availability Response:", data);

  if (!response.ok) {
    throw new Error(
      data.message ||
        data.error ||
        `Failed to update food item availability: ${response.status}`,
    );
  }

  return data;
};

// =====================================================
// DELETE FOOD ITEM
//
// DELETE
// /restaurant-details/food-categories-details/{categoryid-details}
// /food-items-details/{foodid-details}
// =====================================================

export const deleteFoodItem = async (categoryId, foodItemId) => {
  if (!categoryId) {
    throw new Error("Category ID is required.");
  }

  if (!foodItemId) {
    throw new Error("Food item ID is required.");
  }

  const url =
    `${API_URL}/restaurant-details/food-categories-details/` +
    `${Number(categoryId)}/food-items-details/${Number(foodItemId)}`;

  console.log("Deleting food item:", url);

  const response = await fetch(url, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });

  const data = await response.json();

  console.log("Delete Food Item Response:", data);

  if (!response.ok) {
    throw new Error(
      data.error ||
        data.message ||
        `Failed to delete food item: ${response.status}`,
    );
  }

  return data;
};

// =====================================================
// GET RESTAURANT ORDERS
// =====================================================
// Backend:
//
// JWT
//  ↓
// Cognito sub
//  ↓
// restaurants.cognito_user_id
//  ↓
// restaurant_id
//
// Frontend does NOT send restaurant_id.
// =====================================================

export const getRestaurantOrders = async () => {
  const token = Cookies.get("token");

  if (!token) {
    throw new Error("Authentication token not found. Please login again.");
  }

  const url = `${API_URL}/restaurant-orders-details`;

  console.log("Getting restaurant orders:", url);

  const response = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  const responseText = await response.text();

  console.log("Restaurant Orders Response:", responseText);

  let data;

  try {
    data = JSON.parse(responseText);
  } catch {
    throw new Error("Restaurant orders API returned an invalid response.");
  }

  if (!response.ok) {
    throw new Error(
      data.error ||
        data.message ||
        `Failed to retrieve restaurant orders: ${response.status}`,
    );
  }

  return data;
};
// =====================================================
// UPDATE ORDER STATUS
// =====================================================
export const updateOrderStatus = async (orderId, newStatus) => {
  const token = Cookies.get("token");

  if (!token) {
    throw new Error("Authentication token not found. Please login again.");
  }

  const url = `${API_URL}/restaurant-orders-details`;

  console.log("UPDATE ORDER STATUS");
  console.log("URL:", url);
  console.log("ORDER ID:", orderId);
  console.log("NEW STATUS:", newStatus);

  const response = await fetch(url, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      order_id: orderId,
      order_status: newStatus,
    }),
  });

  const responseText = await response.text();

  console.log("STATUS:", response.status);
  console.log("RESPONSE:", responseText);

  let data;

  try {
    data = JSON.parse(responseText);
  } catch {
    throw new Error("Invalid response from order status API.");
  }

  if (!response.ok) {
    throw new Error(
      data?.error ||
        data?.message ||
        `Failed to update order status: ${response.status}`,
    );
  }

  return data;
};

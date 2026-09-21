import axios from "axios";
import Cookies from "js-cookie";

const API_BASE_URL =
  "https://j6vt52wv97.execute-api.ap-southeast-2.amazonaws.com/dev";

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
// 1. GET RESTAURANTS
// =====================================================

export async function getRestaurants() {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/restaurants`,
      getConfig(),
    );

    console.log("Restaurants API:", response.data);

    return (
      response.data.restaurants || response.data.data || response.data || []
    );
  } catch (error) {
    console.error(
      "Get restaurants error:",
      error.response?.data || error.message,
    );

    throw new Error(
      error.response?.data?.message ||
        error.response?.data?.error ||
        "Failed to load restaurants",
    );
  }
}

// =====================================================
// 2. GET FOOD CATEGORIES
// =====================================================

export async function getFoodCategories(restaurantId) {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/restaurants/${restaurantId}/food-categories`,
      getConfig(),
    );

    console.log(`Categories for restaurant ${restaurantId}:`, response.data);

    return (
      response.data.categories || response.data.data || response.data || []
    );
  } catch (error) {
    console.error(
      "Get food categories error:",
      error.response?.data || error.message,
    );

    throw new Error(
      error.response?.data?.message ||
        error.response?.data?.error ||
        "Failed to load food categories",
    );
  }
}

// =====================================================
// 3. GET FOOD ITEMS
// =====================================================

export async function getFoodItems(restaurantId, categoryId) {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/restaurants/${restaurantId}/food-categories/${categoryId}/food-items`,
      getConfig(),
    );

    console.log(
      `Food items for restaurant ${restaurantId}, category ${categoryId}:`,
      response.data,
    );

    return (
      response.data.food_items ||
      response.data.foodItems ||
      response.data.data ||
      response.data ||
      []
    );
  } catch (error) {
    console.error(
      "Get food items error:",
      error.response?.data || error.message,
    );

    throw new Error(
      error.response?.data?.message ||
        error.response?.data?.error ||
        "Failed to load food items",
    );
  }
}

// =====================================================
// 4. GET COMPLETE MENU FOR ONE RESTAURANT
// =====================================================

export async function getRestaurantMenu(restaurant) {
  const restaurantId = restaurant.restaurant_id || restaurant.id;

  const categories = await getFoodCategories(restaurantId);

  const categoriesWithFood = await Promise.all(
    categories.map(async (category) => {
      const foodItems = await getFoodItems(restaurantId, category.category_id);

      return {
        ...category,
        food_items: foodItems,
      };
    }),
  );

  return {
    ...restaurant,
    restaurant_id: restaurantId,
    categories: categoriesWithFood,
  };
}

// =====================================================
// 5. GET ALL RESTAURANT MENUS
// =====================================================

export async function getAllRestaurantMenus() {
  try {
    const restaurantIds = [3, 7];

    const menus = await Promise.all(
      restaurantIds.map(async (restaurantId) => {
        const categories = await getFoodCategories(restaurantId);

        const categoriesWithFood = await Promise.all(
          categories.map(async (category) => {
            const foodItems = await getFoodItems(
              restaurantId,
              category.category_id,
            );

            return {
              ...category,
              food_items: foodItems,
            };
          }),
        );

        return {
          restaurant_id: restaurantId,
          categories: categoriesWithFood,
        };
      }),
    );

    return menus;
  } catch (error) {
    console.error("Get all restaurant menus error:", error);

    throw error;
  }
}

// =====================================================
// DEFAULT EXPORT
// =====================================================

const foodService = {
  getRestaurants,
  getFoodCategories,
  getFoodItems,
  getRestaurantMenu,
  getAllRestaurantMenus,
};

export default foodService;

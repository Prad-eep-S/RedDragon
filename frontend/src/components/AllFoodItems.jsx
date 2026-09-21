import { useEffect, useState } from "react";
import { RefreshCw, Trash2 } from "lucide-react";

import {
  getFoodCategories,
  getFoodItems,
  updateFoodItemAvailability,
  deleteFoodItem,
} from "../services/api";

function AllFoodItems() {
  const [foodItems, setFoodItems] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [updatingId, setUpdatingId] = useState(null);

  const [deletingId, setDeletingId] = useState(null);

  // =====================================================
  // GET IMAGE URL
  // =====================================================

  const getFoodImage = (foodItem) => {
    const image = foodItem?.image_url;

    // image_url = string
    if (typeof image === "string" && image.trim()) {
      return image;
    }

    // image_url = array
    if (Array.isArray(image) && image.length > 0) {
      const firstImage = image[0];

      if (typeof firstImage === "string") {
        return firstImage;
      }

      if (typeof firstImage === "object" && firstImage !== null) {
        return (
          firstImage.url || firstImage.image_url || firstImage.imageUrl || null
        );
      }
    }

    // imageUrl
    if (foodItem?.imageUrl) {
      return foodItem.imageUrl;
    }

    // image
    if (foodItem?.image) {
      return foodItem.image;
    }

    // food_image_url
    if (foodItem?.food_image_url) {
      return foodItem.food_image_url;
    }

    // image_urls
    if (Array.isArray(foodItem?.image_urls)) {
      const firstImage = foodItem.image_urls[0];

      if (typeof firstImage === "string") {
        return firstImage;
      }

      if (typeof firstImage === "object" && firstImage !== null) {
        return (
          firstImage.url || firstImage.image_url || firstImage.imageUrl || null
        );
      }
    }

    // images
    if (Array.isArray(foodItem?.images)) {
      const firstImage = foodItem.images[0];

      if (typeof firstImage === "string") {
        return firstImage;
      }

      if (typeof firstImage === "object" && firstImage !== null) {
        return (
          firstImage.url || firstImage.image_url || firstImage.imageUrl || null
        );
      }
    }

    return null;
  };

  // =====================================================
  // CHECK AVAILABILITY SAFELY
  // =====================================================

  const isFoodAvailable = (value) => {
    return value === true || value === 1 || value === "1" || value === "true";
  };

  // =====================================================
  // EXTRACT CATEGORIES
  // =====================================================

  const extractCategories = (response) => {
    if (Array.isArray(response)) {
      return response;
    }

    if (Array.isArray(response?.categories)) {
      return response.categories;
    }

    if (Array.isArray(response?.data?.categories)) {
      return response.data.categories;
    }

    if (Array.isArray(response?.data)) {
      return response.data;
    }

    return [];
  };

  // =====================================================
  // EXTRACT FOOD ITEMS
  // =====================================================

  const extractFoodItems = (response) => {
    if (Array.isArray(response)) {
      return response;
    }

    if (Array.isArray(response?.food_items)) {
      return response.food_items;
    }

    if (Array.isArray(response?.data?.food_items)) {
      return response.data.food_items;
    }

    if (Array.isArray(response?.data)) {
      return response.data;
    }

    return [];
  };

  // =====================================================
  // LOAD ALL FOOD ITEMS
  //
  // Restaurant ID is NOT passed from frontend.
  //
  // Backend gets restaurant ID from:
  // JWT → Cognito sub → restaurants.cognito_user_id
  //
  // Flow:
  // 1. Get all categories
  // 2. Get food items from every category
  // 3. Combine everything
  // =====================================================

  const loadAllFoodItems = async () => {
    try {
      setLoading(true);
      setError("");

      console.log("=================================");
      console.log("Loading all restaurant food items...");
      console.log("=================================");

      // =================================================
      // STEP 1: GET ALL CATEGORIES
      // =================================================

      const categoryResponse = await getFoodCategories();

      console.log("Category Response:", categoryResponse);

      const categories = extractCategories(categoryResponse);

      console.log("Restaurant Categories:", categories);

      if (categories.length === 0) {
        setFoodItems([]);
        return;
      }

      // =================================================
      // STEP 2: GET FOOD ITEMS FROM EVERY CATEGORY
      // =================================================

      const categoryResults = await Promise.all(
        categories.map(async (category) => {
          const categoryId =
            category.category_id || category.categoryId || category.id;

          const categoryName =
            category.category_name ||
            category.categoryName ||
            category.name ||
            "Unknown Category";

          if (!categoryId) {
            return [];
          }

          try {
            console.log(`Loading food items for category: ${categoryId}`);

            // IMPORTANT:
            // New API only needs categoryId.
            // Restaurant ID comes from JWT.
            const foodResponse = await getFoodItems(categoryId);

            console.log(
              `Food response for category ${categoryId}:`,
              foodResponse,
            );

            const items = extractFoodItems(foodResponse);

            // Add category information to every food item
            return items.map((item) => ({
              ...item,

              category_id: item.category_id || categoryId,

              category_name: item.category_name || categoryName,
            }));
          } catch (categoryError) {
            console.error(
              `Failed to load food items for category ${categoryId}:`,
              categoryError,
            );

            // Do not stop the whole page
            // because one category failed.
            return [];
          }
        }),
      );

      // =================================================
      // STEP 3: FLATTEN ALL CATEGORY RESULTS
      // =================================================

      const allItems = categoryResults.flat();

      console.log("=================================");
      console.log("ALL RESTAURANT FOOD ITEMS:", allItems);
      console.log("TOTAL ITEMS:", allItems.length);
      console.log("=================================");

      setFoodItems(allItems);
    } catch (error) {
      console.error("Failed to load all food items:", error);

      setError(error.message || "Failed to load food items.");
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // LOAD WHEN PAGE OPENS
  // =====================================================

  useEffect(() => {
    loadAllFoodItems();
  }, []);

  // =====================================================
  // TOGGLE AVAILABILITY
  // =====================================================

  const handleAvailabilityToggle = async (foodItem) => {
    const foodId = foodItem.food_id || foodItem.foodId || foodItem.id;

    const categoryId = foodItem.category_id || foodItem.categoryId;

    if (!foodId || !categoryId) {
      console.error("Food ID or Category ID missing:", foodItem);

      alert("Food ID or Category ID is missing.");

      return;
    }

    const currentAvailability = isFoodAvailable(foodItem.is_available);

    const newAvailability = !currentAvailability;

    try {
      setUpdatingId(String(foodId));

      console.log("=================================");
      console.log("Updating food availability...");
      console.log("Category ID:", categoryId);
      console.log("Food ID:", foodId);
      console.log("Old Availability:", currentAvailability);
      console.log("New Availability:", newAvailability);
      console.log("=================================");

      // =================================================
      // UPDATE BACKEND
      //
      // Restaurant ID is NOT sent.
      // JWT identifies restaurant.
      // =================================================

      await updateFoodItemAvailability(categoryId, foodId, newAvailability);

      // =================================================
      // UPDATE UI
      // =================================================

      setFoodItems((previousItems) =>
        previousItems.map((item) => {
          const itemId = item.food_id || item.foodId || item.id;

          if (String(itemId) === String(foodId)) {
            return {
              ...item,
              is_available: newAvailability,
            };
          }

          return item;
        }),
      );

      console.log("Food availability updated successfully.");
    } catch (error) {
      console.error("Failed to update food availability:", error);

      alert(error.message || "Failed to update food availability.");
    } finally {
      setUpdatingId(null);
    }
  };

  // =====================================================
  // DELETE FOOD ITEM
  // =====================================================

  const handleDeleteFoodItem = async (foodItem) => {
    const foodId = foodItem.food_id || foodItem.foodId || foodItem.id;

    const categoryId = foodItem.category_id || foodItem.categoryId;

    if (!foodId || !categoryId) {
      alert("Food ID or Category ID is missing.");

      return;
    }

    const foodName =
      foodItem.food_name ||
      foodItem.foodName ||
      foodItem.name ||
      "this food item";

    const confirmed = window.confirm(
      `Are you sure you want to delete ${foodName}?`,
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(String(foodId));

      console.log("Deleting food item:", {
        categoryId,
        foodId,
      });

      // =================================================
      // DELETE
      //
      // Restaurant ID is NOT sent.
      // =================================================

      await deleteFoodItem(categoryId, foodId);

      // =================================================
      // REMOVE FROM UI
      // =================================================

      setFoodItems((previousItems) =>
        previousItems.filter((item) => {
          const itemId = item.food_id || item.foodId || item.id;

          return String(itemId) !== String(foodId);
        }),
      );

      console.log("Food item deleted successfully.");
    } catch (error) {
      console.error("Failed to delete food item:", error);

      alert(error.message || "Failed to delete food item.");
    } finally {
      setDeletingId(null);
    }
  };

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div className="food-items-loading">
        <RefreshCw className="spin" size={24} />

        <p>Loading all food items...</p>
      </div>
    );
  }

  // =====================================================
  // ERROR
  // =====================================================

  if (error) {
    return (
      <div className="food-items-error">
        <p>{error}</p>

        <button
          type="button"
          onClick={loadAllFoodItems}
          className="refresh-button"
        >
          <RefreshCw size={16} />
          Try Again
        </button>
      </div>
    );
  }

  // =====================================================
  // MAIN UI
  // =====================================================

  return (
    <div className="food-item-page">
      {/* =================================================
          HEADER
      ================================================= */}

      <div className="food-item-page-header">
        <div>
          <h2>All Food Items</h2>

          <p className="food-item-count">
            {foodItems.length} food item
            {foodItems.length !== 1 ? "s" : ""}
          </p>
        </div>

        <div className="food-item-header-actions">
          <button
            type="button"
            onClick={loadAllFoodItems}
            className="refresh-button"
          >
            <RefreshCw size={17} />
            Refresh
          </button>
        </div>
      </div>

      {/* =================================================
          NO FOOD ITEMS
      ================================================= */}

      {foodItems.length === 0 ? (
        <div className="food-items-empty">
          <h3>No Food Items Found</h3>

          <p>This restaurant does not have any food items yet.</p>
        </div>
      ) : (
        <div className="food-items-grid">
          {foodItems.map((foodItem, index) => {
            const foodId =
              foodItem.food_id || foodItem.foodId || foodItem.id || index;

            const foodName =
              foodItem.food_name ||
              foodItem.foodName ||
              foodItem.name ||
              "Food Item";

            const description =
              foodItem.description || foodItem.food_description || "";

            const price = foodItem.price ?? foodItem.food_price ?? "";

            const categoryName = foodItem.category_name || "Unknown Category";

            const imageUrl = getFoodImage(foodItem);

            const available = isFoodAvailable(foodItem.is_available);

            const isUpdating = updatingId === String(foodId);

            const isDeleting = deletingId === String(foodId);

            return (
              <div
                className="food-item-card"
                key={`${foodItem.category_id}-${foodId}`}
              >
                {/* =====================================
                      IMAGE
                  ===================================== */}

                <div className="food-item-image-container">
                  {imageUrl ? (
                    <img
                      src={imageUrl}
                      alt={foodName}
                      className="food-item-image"
                      onError={(event) => {
                        event.currentTarget.style.display = "none";

                        const placeholder =
                          event.currentTarget.nextElementSibling;

                        if (placeholder) {
                          placeholder.style.display = "flex";
                        }
                      }}
                    />
                  ) : null}

                  <div
                    className="food-item-image-placeholder"
                    style={{
                      display: imageUrl ? "none" : "flex",
                    }}
                  >
                    No Image
                  </div>
                </div>

                {/* =====================================
                      DETAILS
                  ===================================== */}

                <div className="food-item-details">
                  {/* FOOD NAME */}

                  <div className="food-item-name-row">
                    <h3 className="food-item-name">{foodName}</h3>
                  </div>

                  {/* CATEGORY */}

                  <div className="food-item-category">{categoryName}</div>

                  {/* DESCRIPTION */}

                  {description && (
                    <p className="food-item-description">{description}</p>
                  )}

                  {/* PRICE */}

                  {price !== "" && (
                    <div className="food-item-price">₹{price}</div>
                  )}

                  {/* AVAILABILITY */}

                  <div className="food-item-availability">
                    <span className="food-item-availability-label">
                      {available ? "Available" : "Unavailable"}
                    </span>

                    <button
                      type="button"
                      className={`availability-toggle ${
                        available ? "active" : ""
                      }`}
                      onClick={() => handleAvailabilityToggle(foodItem)}
                      disabled={isUpdating}
                      aria-label={
                        available
                          ? "Mark food item unavailable"
                          : "Mark food item available"
                      }
                    >
                      <span className="availability-toggle-circle">
                        {isUpdating && (
                          <span className="toggle-loading">...</span>
                        )}
                      </span>
                    </button>
                  </div>

                  {/* DELETE */}

                  <div className="food-item-actions">
                    <button
                      type="button"
                      className="food-item-delete-button"
                      onClick={() => handleDeleteFoodItem(foodItem)}
                      disabled={isDeleting}
                      title="Delete food item"
                      aria-label="Delete food item"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default AllFoodItems;

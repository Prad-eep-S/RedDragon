import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

import { ArrowLeft, Plus, Trash2 } from "lucide-react";

import {
  getFoodItems,
  getFoodCategoryById,
  addFoodItem,
  deleteFoodItem,
  updateFoodItemAvailability,
} from "../services/api";

function FoodItemSection() {
  // =====================================================
  // ROUTER
  // =====================================================

  const { categoryId } = useParams();

  const navigate = useNavigate();

  // =====================================================
  // CATEGORY NAME
  // =====================================================

  const [categoryName, setCategoryName] = useState("");

  // =====================================================
  // FOOD ITEMS
  // =====================================================

  const [foodItems, setFoodItems] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  // =====================================================
  // ADD FOOD ITEM FORM
  // =====================================================

  const [showAddForm, setShowAddForm] = useState(false);

  const [addingFoodItem, setAddingFoodItem] = useState(false);

  const [foodName, setFoodName] = useState("");

  const [description, setDescription] = useState("");

  const [price, setPrice] = useState("");

  const [isVeg, setIsVeg] = useState(true);

  const [isAvailable, setIsAvailable] = useState(true);

  const [foodImage, setFoodImage] = useState(null);

  // =====================================================
  // AVAILABILITY UPDATE
  // =====================================================

  const [updatingFoodId, setUpdatingFoodId] = useState(null);

  // =====================================================
  // BACK TO CATEGORIES
  // =====================================================

  const handleBack = () => {
    navigate("/restaurant/categories");
  };

  // =====================================================
  // LOAD CATEGORY DETAILS
  // =====================================================

  const loadCategoryDetails = async () => {
    try {
      if (!categoryId) {
        return;
      }

      const data = await getFoodCategoryById(categoryId);

      console.log("Category Details Response:", data);

      // Handle possible API response formats
      const name =
        data?.category_name ||
        data?.data?.category_name ||
        data?.category?.category_name ||
        "";

      if (name) {
        setCategoryName(name);
      }
    } catch (err) {
      console.error("Category Details Error:", err);
    }
  };

  // =====================================================
  // LOAD FOOD ITEMS
  // =====================================================

  const loadFoodItems = async () => {
    try {
      setLoading(true);
      setError("");

      console.log("=================================");
      console.log("Loading food items...");
      console.log("Category ID:", categoryId);
      console.log("=================================");

      // =================================================
      // CATEGORY VALIDATION
      // =================================================

      if (!categoryId) {
        throw new Error("Category ID not found");
      }

      // =================================================
      // GET FOOD ITEMS
      //
      // Restaurant ID is NOT required.
      // Backend gets restaurant ID from JWT/Cognito.
      // =================================================

      const data = await getFoodItems(categoryId);

      console.log("Food Items Response:", data);

      // =================================================
      // PROCESS API RESPONSE
      // =================================================

      let items = [];

      // Response:
      // [...]

      if (Array.isArray(data)) {
        items = data;
      }

      // Response:
      // { food_items: [...] }
      else if (Array.isArray(data?.food_items)) {
        items = data.food_items;
      }

      // Response:
      // { data: { food_items: [...] } }
      else if (Array.isArray(data?.data?.food_items)) {
        items = data.data.food_items;
      }

      // Response:
      // { data: [...] }
      else if (Array.isArray(data?.data)) {
        items = data.data;
      }

      console.log("Processed Food Items:", items);

      setFoodItems(items);
    } catch (err) {
      console.error("Food Items Error:", err);

      setError(err.message || "Failed to load food items");
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // LOAD FOOD ITEMS WHEN CATEGORY CHANGES
  // =====================================================

  useEffect(() => {
    if (!categoryId) {
      return;
    }

    const loadPageData = async () => {
      await Promise.all([loadCategoryDetails(), loadFoodItems()]);
    };

    loadPageData();
  }, [categoryId]);

  // =====================================================
  // OPEN ADD FOOD ITEM FORM
  // =====================================================

  const openAddFoodItemForm = () => {
    setFoodName("");
    setDescription("");
    setPrice("");
    setIsVeg(true);
    setIsAvailable(true);
    setFoodImage(null);
    setError("");
    setShowAddForm(true);
  };

  // =====================================================
  // CLOSE ADD FOOD ITEM FORM
  // =====================================================

  const closeAddFoodItemForm = () => {
    if (addingFoodItem) {
      return;
    }

    setShowAddForm(false);
    setFoodName("");
    setDescription("");
    setPrice("");
    setIsVeg(true);
    setIsAvailable(true);
    setFoodImage(null);
  };

  // =====================================================
  // IMAGE VALIDATION
  // =====================================================

  const handleImageChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      setFoodImage(null);
      return;
    }

    // =================================================
    // ALLOWED IMAGE TYPES
    // =================================================

    const allowedTypes = ["image/jpeg", "image/png"];

    if (!allowedTypes.includes(file.type)) {
      alert("Please select a JPG, JPEG, or PNG image.");

      event.target.value = "";

      setFoodImage(null);

      return;
    }

    // =================================================
    // IMAGE SIZE VALIDATION
    // =================================================

    const maxImageSize = 5 * 1024 * 1024;

    if (file.size > maxImageSize) {
      alert("Image must be less than 5 MB.");

      event.target.value = "";

      setFoodImage(null);

      return;
    }

    setFoodImage(file);

    console.log("Valid food image:", {
      name: file.name,
      type: file.type,
      size: file.size,
    });
  };

  // =====================================================
  // ADD FOOD ITEM
  // =====================================================

  const handleAddFoodItem = async (event) => {
    event.preventDefault();

    // =================================================
    // CATEGORY VALIDATION
    // =================================================

    if (!categoryId) {
      alert("Category ID not found.");

      return;
    }

    // =================================================
    // FOOD NAME VALIDATION
    // =================================================

    if (!foodName.trim()) {
      alert("Please enter food name.");

      return;
    }

    // =================================================
    // PRICE VALIDATION
    // =================================================

    if (!price) {
      alert("Please enter food price.");

      return;
    }

    if (Number(price) < 0) {
      alert("Price cannot be negative.");

      return;
    }

    // =================================================
    // IMAGE VALIDATION
    // =================================================

    if (!foodImage) {
      alert("Please select one food image.");

      return;
    }

    try {
      setAddingFoodItem(true);

      // =================================================
      // CREATE FORMDATA
      // =================================================

      const formData = new FormData();

      formData.append("food_name", foodName.trim());

      formData.append("description", description.trim());

      formData.append("price", price);

      formData.append("is_veg", isVeg);

      formData.append("is_available", isAvailable);

      formData.append("images", foodImage);

      // =================================================
      // DEBUG
      // =================================================

      console.log("Adding Food Item");

      console.log("Category ID:", categoryId);

      console.log("Food Name:", foodName);

      console.log("Price:", price);

      console.log("Is Veg:", isVeg);

      console.log("Is Available:", isAvailable);

      console.log("Image:", foodImage.name);

      console.log("Image Type:", foodImage.type);

      console.log("Image Size:", foodImage.size);

      // =================================================
      // SEND API REQUEST
      //
      // Restaurant ID is NOT sent.
      // Backend gets restaurant ID from JWT/Cognito.
      // =================================================

      const result = await addFoodItem(categoryId, formData);

      console.log("Add Food Item Response:", result);

      // =================================================
      // SUCCESS
      // =================================================

      alert("Food item added successfully.");

      // =================================================
      // CLOSE FORM
      // =================================================

      setShowAddForm(false);

      // =================================================
      // CLEAR FORM
      // =================================================

      setFoodName("");
      setDescription("");
      setPrice("");
      setIsVeg(true);
      setIsAvailable(true);
      setFoodImage(null);

      // =================================================
      // RELOAD ITEMS
      // =================================================

      await loadFoodItems();
    } catch (err) {
      console.error("Add Food Item Error:", err);

      alert(err.message || "Failed to add food item.");
    } finally {
      setAddingFoodItem(false);
    }
  };

  // =====================================================
  // UPDATE FOOD ITEM AVAILABILITY
  // =====================================================

  const handleAvailabilityChange = async (foodItem) => {
    const foodItemId = foodItem.food_id;

    // =================================================
    // FOOD ITEM ID VALIDATION
    // =================================================

    if (!foodItemId) {
      alert("Food item ID is missing.");

      return;
    }

    // =================================================
    // CATEGORY ID VALIDATION
    // =================================================

    if (!categoryId) {
      alert("Category ID is missing.");

      return;
    }

    // =================================================
    // PREVENT MULTIPLE CLICKS
    // =================================================

    if (updatingFoodId === foodItemId) {
      return;
    }

    // =================================================
    // CHANGE VALUE
    // =================================================

    const newAvailability = !foodItem.is_available;

    try {
      setUpdatingFoodId(foodItemId);

      console.log("Changing food availability...");

      console.log("Food Item ID:", foodItemId);

      console.log("Category ID:", categoryId);

      console.log("Old Availability:", foodItem.is_available);

      console.log("New Availability:", newAvailability);

      // =================================================
      // UPDATE DATABASE
      //
      // Restaurant ID is NOT sent.
      // =================================================

      await updateFoodItemAvailability(categoryId, foodItemId, newAvailability);

      // =================================================
      // UPDATE FRONTEND
      // =================================================

      setFoodItems((previousItems) =>
        previousItems.map((item) =>
          item.food_id === foodItemId
            ? {
                ...item,
                is_available: newAvailability,
              }
            : item,
        ),
      );

      console.log("Food availability updated successfully.");
    } catch (err) {
      console.error("Update Food Availability Error:", err);

      alert(err.message || "Failed to update food availability.");
    } finally {
      setUpdatingFoodId(null);
    }
  };

  // =====================================================
  // DELETE FOOD ITEM
  // =====================================================

  const handleDelete = async (foodItem) => {
    const foodItemId = foodItem.food_id;

    if (!foodItemId) {
      alert("Food item ID is missing.");

      return;
    }

    if (!categoryId) {
      alert("Category ID is missing.");

      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to delete "${foodItem.food_name}"?`,
    );

    if (!confirmed) {
      return;
    }

    try {
      await deleteFoodItem(categoryId, foodItemId);

      setFoodItems((previousItems) =>
        previousItems.filter((item) => item.food_id !== foodItemId),
      );

      alert("Food item deleted successfully.");
    } catch (err) {
      console.error("Delete Food Item Error:", err);

      alert(err.message || "Failed to delete food item.");
    }
  };

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div className="food-item-page">
        <div className="food-item-page-header">
          <div>
            <button
              type="button"
              className="food-items-back-button"
              onClick={handleBack}
            >
              <ArrowLeft size={18} />
              Back to Categories
            </button>

            <h1>{categoryName}</h1>

            <p>Food items in this category</p>
          </div>
        </div>

        <div className="food-items-loading">Loading food items...</div>
      </div>
    );
  }

  // =====================================================
  // MAIN PAGE
  // =====================================================

  return (
    <div className="food-item-page">
      {/* =================================================
          HEADER
      ================================================= */}

      <div className="food-item-page-header">
        <div>
          {/* BACK */}

          <button
            type="button"
            className="food-items-back-button"
            onClick={handleBack}
          >
            <ArrowLeft size={18} />
            Back to Categories
          </button>

          <h1>{categoryName}</h1>

          <p>Food items in {categoryName}</p>
        </div>

        <div className="food-item-header-actions">
          <div className="food-item-count">{foodItems.length} Items</div>

          <button
            type="button"
            className="primary-button"
            onClick={openAddFoodItemForm}
          >
            <Plus size={19} />
            Add Food Item
          </button>
        </div>
      </div>

      {/* =================================================
          ERROR
      ================================================= */}

      {error && <div className="food-items-error">{error}</div>}

      {/* =================================================
          EMPTY
      ================================================= */}

      {!error && foodItems.length === 0 && (
        <div className="food-items-empty">
          <div className="empty-icon">🍽️</div>

          <h3>No food items found</h3>

          <p>There are no food items in this category.</p>

          <button
            type="button"
            className="primary-button"
            onClick={openAddFoodItemForm}
            style={{
              marginTop: "20px",
            }}
          >
            <Plus size={19} />
            Add Food Item
          </button>
        </div>
      )}

      {/* =================================================
          FOOD ITEMS
      ================================================= */}

      {!error && foodItems.length > 0 && (
        <div className="food-items-grid">
          {foodItems.map((foodItem) => {
            const imageUrl =
              Array.isArray(foodItem.image_urls) &&
              foodItem.image_urls.length > 0
                ? foodItem.image_urls[0]
                : "";

            return (
              <div className="food-item-card" key={foodItem.food_id}>
                {/* =================================
                        IMAGE
                    ================================= */}

                <div className="food-item-image-container">
                  {imageUrl ? (
                    <img
                      src={imageUrl}
                      alt={foodItem.food_name || "Food item"}
                      className="food-item-image"
                      onError={(event) => {
                        console.error("Food image failed:", imageUrl);

                        event.currentTarget.style.display = "none";
                      }}
                    />
                  ) : (
                    <div className="food-item-image-placeholder">
                      <span>🍽️</span>

                      <p>No Image</p>
                    </div>
                  )}
                </div>

                {/* =================================
                        DETAILS
                    ================================= */}

                <div className="food-item-details">
                  {/* =================================
                          NAME + FOOD TYPE
                      ================================= */}

                  <div className="food-item-name-row">
                    <h3>{foodItem.food_name || "Food Item"}</h3>

                    {foodItem.is_veg ? (
                      <span className="veg-badge">VEG</span>
                    ) : (
                      <span className="nonveg-badge">NON-VEG</span>
                    )}
                  </div>

                  {/* =================================
                          DESCRIPTION
                      ================================= */}

                  <p className="food-item-description">
                    {foodItem.description || "No description available"}
                  </p>

                  {/* =================================
                          PRICE
                      ================================= */}

                  <p className="food-item-price">₹{foodItem.price}</p>

                  {/* =================================
                          AVAILABILITY TOGGLE
                      ================================= */}

                  <div className="food-item-availability">
                    <span className="food-item-availability-label">
                      {foodItem.is_available ? "Available" : "Unavailable"}
                    </span>

                    <button
                      type="button"
                      className={`availability-toggle ${
                        foodItem.is_available ? "active" : ""
                      }`}
                      onClick={() => handleAvailabilityChange(foodItem)}
                      disabled={updatingFoodId === foodItem.food_id}
                      aria-label={`${
                        foodItem.is_available
                          ? "Mark unavailable"
                          : "Mark available"
                      } ${foodItem.food_name || "food item"}`}
                    >
                      <span className="availability-toggle-circle"></span>
                    </button>
                  </div>

                  {/* =================================
                          DELETE
                      ================================= */}

                  <div className="food-item-actions">
                    <button
                      type="button"
                      className="food-item-delete-button"
                      onClick={() => handleDelete(foodItem)}
                      title="Delete food item"
                      aria-label={`Delete ${foodItem.food_name || "food item"}`}
                    >
                      <Trash2 size={22} strokeWidth={2.5} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* =================================================
          ADD FOOD ITEM MODAL
      ================================================= */}

      {showAddForm && (
        <div className="category-modal-overlay" onClick={closeAddFoodItemForm}>
          <div
            className="category-modal"
            onClick={(event) => event.stopPropagation()}
          >
            {/* =========================================
                MODAL HEADER
            ========================================== */}

            <div className="category-modal-header">
              <h2>Add Food Item</h2>

              <button
                type="button"
                className="category-modal-close"
                onClick={closeAddFoodItemForm}
                disabled={addingFoodItem}
              >
                ×
              </button>
            </div>

            {/* =========================================
                FORM
            ========================================== */}

            <form className="category-form" onSubmit={handleAddFoodItem}>
              {/* =======================================
                  CATEGORY
              ======================================== */}

              <div className="category-form-group">
                <label>Food Category</label>

                <input
                  type="text"
                  value={categoryName || ""}
                  disabled
                  readOnly
                />
              </div>

              {/* =======================================
                  FOOD NAME
              ======================================== */}

              <div className="category-form-group">
                <label>Food Name</label>

                <input
                  type="text"
                  placeholder="Enter food name"
                  value={foodName}
                  onChange={(event) => setFoodName(event.target.value)}
                  disabled={addingFoodItem}
                />
              </div>

              {/* =======================================
                  DESCRIPTION
              ======================================== */}

              <div className="category-form-group">
                <label>Description</label>

                <textarea
                  placeholder="Enter food description"
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  disabled={addingFoodItem}
                  rows="3"
                />
              </div>

              {/* =======================================
                  PRICE
              ======================================== */}

              <div className="category-form-group">
                <label>Price</label>

                <input
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="Enter price"
                  value={price}
                  onChange={(event) => setPrice(event.target.value)}
                  disabled={addingFoodItem}
                />
              </div>

              {/* =======================================
                  FOOD TYPE
              ======================================== */}

              <div className="category-form-group">
                <label>Food Type</label>

                <div className="food-type-options">
                  {/* VEG */}

                  <label className="food-type-option">
                    <input
                      type="radio"
                      name="foodType"
                      checked={isVeg === true}
                      onChange={() => setIsVeg(true)}
                      disabled={addingFoodItem}
                    />

                    <span>VEG</span>
                  </label>

                  {/* NON VEG */}

                  <label className="food-type-option">
                    <input
                      type="radio"
                      name="foodType"
                      checked={isVeg === false}
                      onChange={() => setIsVeg(false)}
                      disabled={addingFoodItem}
                    />

                    <span>NON-VEG</span>
                  </label>
                </div>
              </div>

              {/* =======================================
                  AVAILABILITY
              ======================================== */}

              <div className="category-form-group">
                <label>Availability</label>

                <select
                  value={isAvailable ? "true" : "false"}
                  onChange={(event) =>
                    setIsAvailable(event.target.value === "true")
                  }
                  disabled={addingFoodItem}
                >
                  <option value="true">Available</option>

                  <option value="false">Unavailable</option>
                </select>
              </div>

              {/* =======================================
                  IMAGE
              ======================================== */}

              <div className="category-form-group">
                <label>Food Image</label>

                <input
                  type="file"
                  accept=".jpg,.jpeg,.png"
                  onChange={handleImageChange}
                  disabled={addingFoodItem}
                />

                <small>
                  Only JPG, JPEG, and PNG images. Maximum size: 5 MB.
                </small>

                {foodImage && (
                  <div className="food-image-selected">
                    <span>Selected:</span>

                    <span>{foodImage.name}</span>
                  </div>
                )}
              </div>

              {/* =======================================
                  BUTTONS
              ======================================== */}

              <div className="category-form-actions">
                <button
                  type="button"
                  className="category-cancel-button"
                  onClick={closeAddFoodItemForm}
                  disabled={addingFoodItem}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="category-submit-button"
                  disabled={addingFoodItem}
                >
                  {addingFoodItem ? "Adding..." : "Add Food Item"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default FoodItemSection;

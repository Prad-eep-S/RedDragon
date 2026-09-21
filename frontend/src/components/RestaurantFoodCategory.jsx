import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { Grid2X2, Plus, Trash2 } from "lucide-react";

import {
  getFoodCategories,
  deleteFoodCategory,
  addFoodCategory,
} from "../services/api";

function RestaurantFoodCategory() {
  // =====================================================
  // NAVIGATION
  // =====================================================

  const navigate = useNavigate();

  // =====================================================
  // STATE
  // =====================================================

  const [categories, setCategories] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  // =====================================================
  // ADD CATEGORY STATE
  // =====================================================

  const [showAddForm, setShowAddForm] = useState(false);

  const [categoryName, setCategoryName] = useState("");

  const [categoryImage, setCategoryImage] = useState(null);

  const [addingCategory, setAddingCategory] = useState(false);

  // =====================================================
  // GET CATEGORIES
  // =====================================================

  const loadCategories = async () => {
    try {
      setLoading(true);
      setError("");

      // Restaurant is identified by JWT in the backend
      const data = await getFoodCategories();

      console.log("Food Categories:", data);

      // =================================================
      // HANDLE API RESPONSE
      // =================================================

      if (Array.isArray(data)) {
        setCategories(data);
      } else if (Array.isArray(data?.categories)) {
        setCategories(data.categories);
      } else if (Array.isArray(data?.data?.categories)) {
        setCategories(data.data.categories);
      } else if (Array.isArray(data?.data)) {
        setCategories(data.data);
      } else {
        setCategories([]);
      }
    } catch (err) {
      console.error("Category Error:", err);

      setError(err.message || "Failed to load food categories");
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // LOAD CATEGORIES
  // =====================================================

  useEffect(() => {
    loadCategories();
  }, []);

  // =====================================================
  // CLICK CATEGORY
  // =====================================================

  const handleCategoryClick = (category) => {
    console.log("Selected Category:", category);

    // =================================================
    // GET CATEGORY ID
    // =================================================

    const categoryId =
      category.category_id || category.categoryId || category.id;

    console.log("Category ID:", categoryId);

    if (!categoryId) {
      console.error("Category ID not found");
      return;
    }

    // =================================================
    // NAVIGATE
    // =================================================

    navigate(`/restaurant/categories/${categoryId}`);
  };

  // =====================================================
  // DELETE CATEGORY
  // =====================================================

  const handleDeleteCategory = async (event, categoryId) => {
    // Stop category click
    event.stopPropagation();

    const confirmDelete = window.confirm(
      "Are you sure you want to delete this category?",
    );

    if (!confirmDelete) {
      return;
    }

    try {
      // Restaurant identified by JWT
      await deleteFoodCategory(categoryId);

      // =================================================
      // REMOVE IMMEDIATELY FROM SCREEN
      // =================================================

      setCategories((previousCategories) =>
        previousCategories.filter((category) => {
          const id = category.category_id || category.categoryId || category.id;

          return id !== categoryId;
        }),
      );
    } catch (err) {
      console.error("Delete Category Error:", err);

      setError(err.message || "Failed to delete category");
    }
  };

  // =====================================================
  // OPEN ADD CATEGORY FORM
  // =====================================================

  const openAddCategoryForm = () => {
    setCategoryName("");
    setCategoryImage(null);
    setError("");
    setShowAddForm(true);
  };

  // =====================================================
  // CLOSE ADD CATEGORY FORM
  // =====================================================

  const closeAddCategoryForm = () => {
    if (addingCategory) {
      return;
    }

    setShowAddForm(false);
    setCategoryName("");
    setCategoryImage(null);
  };

  // =====================================================
  // ADD CATEGORY
  // =====================================================

  const handleAddCategory = async (event) => {
    event.preventDefault();

    // =================================================
    // VALIDATE CATEGORY NAME
    // =================================================

    if (!categoryName.trim()) {
      alert("Please enter category name");
      return;
    }

    // =================================================
    // VALIDATE IMAGE
    // =================================================

    if (!categoryImage) {
      alert("Please select a category image");
      return;
    }

    try {
      setAddingCategory(true);

      // =================================================
      // CREATE FORM DATA
      // =================================================

      const formData = new FormData();

      formData.append("category_name", categoryName.trim());

      formData.append("image", categoryImage);

      // =================================================
      // DEBUG
      // =================================================

      console.log("Adding Category");
      console.log("Category Name:", categoryName.trim());
      console.log("Category Image:", categoryImage);

      // =================================================
      // CALL API
      // =================================================

      // Restaurant identified by JWT
      const response = await addFoodCategory(formData);

      console.log("Add Category Response:", response);

      // =================================================
      // SUCCESS
      // =================================================

      alert("Category added successfully");

      // =================================================
      // CLOSE FORM
      // =================================================

      setShowAddForm(false);

      // =================================================
      // CLEAR FORM
      // =================================================

      setCategoryName("");
      setCategoryImage(null);

      // =================================================
      // RELOAD CATEGORIES
      // =================================================

      await loadCategories();
    } catch (err) {
      console.error("Add Category Error:", err);

      alert(err.message || "Failed to add category");
    } finally {
      setAddingCategory(false);
    }
  };

  // =====================================================
  // HANDLE IMAGE SELECT
  // =====================================================

  const handleImageChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      setCategoryImage(null);
      return;
    }

    // =================================================
    // CHECK IMAGE TYPE
    // =================================================

    if (!file.type.startsWith("image/")) {
      alert("Please select a valid image file");

      event.target.value = "";

      setCategoryImage(null);

      return;
    }

    // =================================================
    // CHECK IMAGE SIZE
    // =================================================

    if (file.size > 5 * 1024 * 1024) {
      alert("Image size must be less than 5 MB");

      event.target.value = "";

      setCategoryImage(null);

      return;
    }

    setCategoryImage(file);
  };

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div className="page-container">
        <div className="loading-state">Loading categories...</div>
      </div>
    );
  }

  // =====================================================
  // PAGE
  // =====================================================

  return (
    <div className="page-container">
      {/* =================================================
          PAGE HEADER
      ================================================= */}

      <div className="page-heading">
        <div>
          <h1>Food Categories</h1>

          <p>Manage your restaurant food categories</p>
        </div>

        <button className="primary-button" onClick={openAddCategoryForm}>
          <Plus size={19} />
          Add Category
        </button>
      </div>

      {/* =================================================
          ERROR
      ================================================= */}

      {error && <div className="dashboard-error">{error}</div>}

      {/* =================================================
          NO CATEGORIES
      ================================================= */}

      {!error && categories.length === 0 && (
        <div className="empty-page-card">
          <div className="empty-state">
            <Grid2X2 size={55} />

            <h3>No Food Categories</h3>

            <p>Add your first food category to get started.</p>

            <button className="primary-button" onClick={openAddCategoryForm}>
              <Plus size={19} />
              Add Category
            </button>
          </div>
        </div>
      )}

      {/* =================================================
          CATEGORY LIST
      ================================================= */}

      {!error && categories.length > 0 && (
        <div className="category-grid">
          {categories.map((category, index) => {
            // =========================================
            // CATEGORY ID
            // =========================================

            const categoryId =
              category.category_id ||
              category.categoryId ||
              category.id ||
              index;

            // =========================================
            // CATEGORY NAME
            // =========================================

            const categoryName =
              category.name ||
              category.category_name ||
              category.categoryName ||
              "Category";

            // =========================================
            // CATEGORY IMAGE
            // =========================================

            const image =
              category.image_url || category.imageUrl || category.image || "";

            return (
              <div
                className="category-card"
                key={categoryId}
                onClick={() => handleCategoryClick(category)}
              >
                {/* =====================================
                        IMAGE
                    ====================================== */}

                <div className="category-image">
                  {image ? (
                    <img src={image} alt={categoryName} />
                  ) : (
                    <Grid2X2 size={45} />
                  )}
                </div>

                {/* =====================================
                        CATEGORY NAME + DELETE
                    ====================================== */}

                <div className="category-content">
                  <h3>{categoryName}</h3>

                  <button
                    type="button"
                    className="delete-category-button"
                    onClick={(event) => handleDeleteCategory(event, categoryId)}
                    title="Delete Category"
                    aria-label={`Delete ${categoryName}`}
                  >
                    <Trash2 size={18} strokeWidth={2} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* =================================================
          ADD CATEGORY MODAL
      ================================================= */}

      {showAddForm && (
        <div className="category-modal-overlay" onClick={closeAddCategoryForm}>
          <div
            className="category-modal"
            onClick={(event) => event.stopPropagation()}
          >
            {/* =============================================
                MODAL HEADER
            ============================================== */}

            <div className="category-modal-header">
              <h2>Add Food Category</h2>

              <button
                type="button"
                className="category-modal-close"
                onClick={closeAddCategoryForm}
                disabled={addingCategory}
              >
                ×
              </button>
            </div>

            {/* =============================================
                FORM
            ============================================== */}

            <form className="category-form" onSubmit={handleAddCategory}>
              {/* ===========================================
                  CATEGORY NAME
              ============================================ */}

              <div className="category-form-group">
                <label>Category Name</label>

                <input
                  type="text"
                  placeholder="Enter category name"
                  value={categoryName}
                  onChange={(event) => setCategoryName(event.target.value)}
                  disabled={addingCategory}
                />
              </div>

              {/* ===========================================
                  CATEGORY IMAGE
              ============================================ */}

              <div className="category-form-group">
                <label>Category Image</label>

                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  disabled={addingCategory}
                />

                {/* Selected file */}

                {categoryImage && (
                  <p
                    style={{
                      marginTop: "8px",
                      fontSize: "13px",
                    }}
                  >
                    Selected: {categoryImage.name}
                  </p>
                )}
              </div>

              {/* ===========================================
                  FORM BUTTONS
              ============================================ */}

              <div className="category-form-actions">
                {/* CANCEL */}

                <button
                  type="button"
                  className="category-cancel-button"
                  onClick={closeAddCategoryForm}
                  disabled={addingCategory}
                >
                  Cancel
                </button>

                {/* ADD */}

                <button
                  type="submit"
                  className="category-submit-button"
                  disabled={addingCategory}
                >
                  {addingCategory ? "Adding..." : "Add Category"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default RestaurantFoodCategory;

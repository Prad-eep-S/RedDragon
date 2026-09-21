import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { ArrowLeft, Edit, Save, X } from "lucide-react";

import { getRestaurantById, updateRestaurant } from "../services/api";

function RestaurantProfile({ restaurantId }) {
  const navigate = useNavigate();

  // =====================================================
  // RESTAURANT DATA
  // =====================================================

  const [restaurant, setRestaurant] = useState(null);

  // =====================================================
  // FORM DATA
  // =====================================================

  const [formData, setFormData] = useState({
    restaurant_name: "",
    phone: "",
    address: "",
    description: "",
  });

  // =====================================================
  // STATES
  // =====================================================

  const [loading, setLoading] = useState(true);

  const [editing, setEditing] = useState(false);

  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");

  const [successMessage, setSuccessMessage] = useState("");

  // =====================================================
  // LOAD RESTAURANT
  // =====================================================

  useEffect(() => {
    const loadRestaurant = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await getRestaurantById(restaurantId);

        console.log("Restaurant Profile Response:", response);

        const restaurantData =
          response?.data?.restaurant || response?.restaurant || response;

        if (!restaurantData) {
          throw new Error("Restaurant details not found.");
        }

        // Store complete restaurant information

        setRestaurant(restaurantData);

        // Store editable information

        setFormData({
          restaurant_name: restaurantData?.restaurant_name || "",

          phone: restaurantData?.phone || "",

          address: restaurantData?.address || "",

          description:
            restaurantData?.description ||
            restaurantData?.restaurant_description ||
            "",
        });
      } catch (error) {
        console.error("Failed to load restaurant:", error);

        setError(error.message || "Failed to load restaurant details.");
      } finally {
        setLoading(false);
      }
    };

    loadRestaurant();
  }, [restaurantId]);

  // =====================================================
  // HANDLE INPUT CHANGE
  // =====================================================

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previousData) => ({
      ...previousData,
      [name]: value,
    }));

    setError("");
    setSuccessMessage("");
  };

  // =====================================================
  // START EDITING
  // =====================================================

  const handleEdit = () => {
    setFormData({
      restaurant_name: restaurant?.restaurant_name || "",

      phone: restaurant?.phone || "",

      address: restaurant?.address || "",

      description:
        restaurant?.description || restaurant?.restaurant_description || "",
    });

    setError("");
    setSuccessMessage("");

    setEditing(true);
  };

  // =====================================================
  // CANCEL EDITING
  // =====================================================

  const handleCancel = () => {
    setFormData({
      restaurant_name: restaurant?.restaurant_name || "",

      phone: restaurant?.phone || "",

      address: restaurant?.address || "",

      description:
        restaurant?.description || restaurant?.restaurant_description || "",
    });

    setError("");
    setSuccessMessage("");

    setEditing(false);
  };

  // =====================================================
  // SAVE CHANGES
  // =====================================================

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      setSaving(true);
      setError("");
      setSuccessMessage("");

      const response = await updateRestaurant(restaurantId, formData);

      console.log("Updated Restaurant Response:", response);

      const updatedRestaurant =
        response?.data?.restaurant || response?.restaurant || response;

      if (!updatedRestaurant) {
        throw new Error("Restaurant update response was empty.");
      }

      // Update displayed restaurant data

      setRestaurant((previousRestaurant) => ({
        ...previousRestaurant,
        ...updatedRestaurant,
      }));

      // Update form data

      setFormData({
        restaurant_name:
          updatedRestaurant?.restaurant_name ?? formData.restaurant_name,

        phone: updatedRestaurant?.phone ?? formData.phone,

        address: updatedRestaurant?.address ?? formData.address,

        description: updatedRestaurant?.description ?? formData.description,
      });

      // Exit edit mode

      setEditing(false);

      setSuccessMessage("Restaurant profile updated successfully.");
    } catch (error) {
      console.error("Failed to update restaurant:", error);

      setError(error.message || "Failed to update restaurant.");
    } finally {
      setSaving(false);
    }
  };

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div className="restaurant-profile-page">
        <div className="restaurant-profile-loading">
          Loading restaurant profile...
        </div>
      </div>
    );
  }

  // =====================================================
  // PAGE
  // =====================================================

  return (
    <div className="restaurant-profile-page">
      {/* =================================================
          HEADER
      ================================================= */}

      <div className="restaurant-profile-header">
        <button
          type="button"
          className="restaurant-profile-back-button"
          onClick={() => navigate("/restaurant/dashboard")}
        >
          <ArrowLeft size={18} />
          Back
        </button>

        <h1>Restaurant Profile</h1>

        <p>View and manage your restaurant information</p>
      </div>

      {/* =================================================
          SUCCESS MESSAGE
      ================================================= */}

      {successMessage && (
        <div className="profile-success-message">{successMessage}</div>
      )}

      {/* =================================================
          ERROR MESSAGE
      ================================================= */}

      {error && <div className="profile-error-message">{error}</div>}

      {/* =================================================
          PROFILE CARD
      ================================================= */}

      <div className="restaurant-profile-card">
        {/* =================================================
            VIEW MODE
        ================================================= */}

        {!editing && (
          <div className="restaurant-profile-view">
            {/* RESTAURANT NAME */}

            <div className="profile-info-row">
              <div className="profile-info-label">Restaurant Name</div>

              <div className="profile-info-value">
                {restaurant?.restaurant_name || "Not available"}
              </div>
            </div>

            {/* PHONE */}

            <div className="profile-info-row">
              <div className="profile-info-label">Phone Number</div>

              <div className="profile-info-value">
                {restaurant?.phone || "Not available"}
              </div>
            </div>

            {/* ADDRESS */}

            <div className="profile-info-row">
              <div className="profile-info-label">Address</div>

              <div className="profile-info-value">
                {restaurant?.address || "Not available"}
              </div>
            </div>

            {/* DESCRIPTION */}

            <div className="profile-info-row">
              <div className="profile-info-label">Description</div>

              <div className="profile-info-value profile-description">
                {restaurant?.description ||
                  restaurant?.restaurant_description ||
                  "Not available"}
              </div>
            </div>

            {/* EDIT BUTTON */}

            <div className="restaurant-profile-actions">
              <button
                type="button"
                className="profile-edit-button"
                onClick={handleEdit}
              >
                <Edit size={18} />
                Edit Profile
              </button>
            </div>
          </div>
        )}

        {/* =================================================
            EDIT MODE
        ================================================= */}

        {editing && (
          <form onSubmit={handleSubmit}>
            {/* RESTAURANT NAME */}

            <div className="profile-form-group">
              <label htmlFor="restaurant_name">Restaurant Name</label>

              <input
                id="restaurant_name"
                name="restaurant_name"
                type="text"
                value={formData.restaurant_name}
                onChange={handleChange}
                placeholder="Enter restaurant name"
                required
              />
            </div>

            {/* PHONE */}

            <div className="profile-form-group">
              <label htmlFor="phone">Phone Number</label>

              <input
                id="phone"
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleChange}
                placeholder="Enter phone number"
              />
            </div>

            {/* ADDRESS */}

            <div className="profile-form-group">
              <label htmlFor="address">Address</label>

              <textarea
                id="address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="Enter restaurant address"
                rows="3"
              />
            </div>

            {/* DESCRIPTION */}

            <div className="profile-form-group">
              <label htmlFor="description">Description</label>

              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Enter restaurant description"
                rows="5"
              />
            </div>

            {/* =================================================
                EDIT ACTIONS
            ================================================= */}

            <div className="restaurant-profile-actions">
              {/* CANCEL */}

              <button
                type="button"
                className="profile-cancel-button"
                onClick={handleCancel}
                disabled={saving}
              >
                <X size={18} />
                Cancel
              </button>

              {/* SAVE */}

              <button
                type="submit"
                className="profile-save-button"
                disabled={saving}
              >
                <Save size={18} />

                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default RestaurantProfile;

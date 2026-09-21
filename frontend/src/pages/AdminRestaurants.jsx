import React, { useEffect, useState } from "react";
import Cookies from "js-cookie";
import api from "../api/api";
import "./AdminRestaurants.css";

const AdminRestaurants = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [error, setError] = useState("");

  const getAuthHeaders = () => {
    const token = Cookies.get("token");

    if (!token) {
      throw new Error("Authentication token not found. Please login again.");
    }

    return {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    };
  };

  // =========================================================
  // GET RESTAURANTS
  // =========================================================

  const fetchRestaurants = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/admin/restaurants", getAuthHeaders());

      console.log("Restaurants response:", response.data);

      setRestaurants(response.data.restaurants || []);
    } catch (error) {
      console.error(
        "Fetch restaurants error:",
        error.response?.data || error.message,
      );

      setError(
        error.response?.data?.message ||
          error.response?.data?.error ||
          error.message ||
          "Failed to load restaurants.",
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // SEARCH
  // =========================================================

  const handleSearch = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get(
        `/admin/restaurants?search=${encodeURIComponent(search.trim())}`,
        getAuthHeaders(),
      );

      console.log("Restaurant search response:", response.data);

      setRestaurants(response.data.restaurants || []);
    } catch (error) {
      console.error(
        "Restaurant search error:",
        error.response?.data || error.message,
      );

      setError(
        error.response?.data?.message ||
          error.response?.data?.error ||
          error.message ||
          "Failed to search restaurants.",
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // SEARCH ON ENTER
  // =========================================================

  const handleSearchKeyDown = (event) => {
    if (event.key === "Enter") {
      handleSearch();
    }
  };

  // =========================================================
  // CLEAR SEARCH
  // =========================================================

  const handleClearSearch = () => {
    setSearch("");
    fetchRestaurants();
  };

  // =========================================================
  // TOGGLE RESTAURANT STATUS
  // =========================================================

  const handleStatusToggle = async (restaurant) => {
    const restaurantId = restaurant.restaurant_id;

    const newStatus = !restaurant.is_active;

    const actionText = newStatus ? "activate" : "deactivate";

    const confirmed = window.confirm(
      `Are you sure you want to ${actionText} ${
        restaurant.restaurant_name || "this restaurant"
      }?`,
    );

    if (!confirmed) {
      return;
    }

    try {
      setActionLoadingId(restaurantId);
      setError("");

      const response = await api.patch(
        `/admin/restaurants/${restaurantId}/status`,
        {
          is_active: newStatus,
        },
        getAuthHeaders(),
      );

      console.log("Restaurant status update response:", response.data);

      setRestaurants((currentRestaurants) =>
        currentRestaurants.map((item) =>
          item.restaurant_id === restaurantId
            ? {
                ...item,
                ...response.data.restaurant,
                is_active: newStatus,
              }
            : item,
        ),
      );
    } catch (error) {
      console.error(
        "Restaurant status update error:",
        error.response?.data || error.message,
      );

      setError(
        error.response?.data?.message ||
          error.response?.data?.error ||
          error.message ||
          "Failed to update restaurant status.",
      );
    } finally {
      setActionLoadingId(null);
    }
  };

  // =========================================================
  // INITIAL LOAD
  // =========================================================

  useEffect(() => {
    fetchRestaurants();
  }, []);

  // =========================================================
  // INITIAL LOADING
  // =========================================================

  if (loading && restaurants.length === 0) {
    return (
      <div className="admin-restaurants-page">
        <div className="admin-restaurants-loading">
          <div className="admin-restaurants-spinner"></div>
          <p>Loading restaurants...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-restaurants-page">
      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="admin-restaurants-header">
        <div>
          <p className="admin-restaurants-eyebrow">ADMIN PANEL</p>

          <h1>Restaurants</h1>

          <p className="admin-restaurants-description">
            View and manage restaurant accounts.
          </p>
        </div>

        <button
          type="button"
          className="admin-restaurants-refresh-btn"
          onClick={fetchRestaurants}
          disabled={loading}
        >
          {loading ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      {/* =====================================================
          ERROR
      ===================================================== */}

      {error && (
        <div className="admin-restaurants-error">
          <span>{error}</span>

          <button type="button" onClick={() => setError("")}>
            ×
          </button>
        </div>
      )}

      {/* =====================================================
          SEARCH
      ===================================================== */}

      <div className="admin-restaurants-toolbar">
        <div className="admin-restaurants-search">
          <input
            type="text"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            onKeyDown={handleSearchKeyDown}
            placeholder="Search by restaurant, email, phone or ID..."
          />

          {search && (
            <button
              type="button"
              className="admin-restaurants-clear-btn"
              onClick={handleClearSearch}
              title="Clear search"
            >
              ×
            </button>
          )}
        </div>

        <button
          type="button"
          className="admin-restaurants-search-btn"
          onClick={handleSearch}
          disabled={loading}
        >
          Search
        </button>
      </div>

      {/* =====================================================
          SUMMARY
      ===================================================== */}

      <div className="admin-restaurants-summary">
        <span>
          {restaurants.length} restaurant
          {restaurants.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* =====================================================
          TABLE
      ===================================================== */}

      <div className="admin-restaurants-table-wrapper">
        <table className="admin-restaurants-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Restaurant</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Status</th>
              <th>Created</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {restaurants.length === 0 ? (
              <tr>
                <td colSpan="7" className="admin-restaurants-empty">
                  No restaurants found.
                </td>
              </tr>
            ) : (
              restaurants.map((restaurant) => {
                const isActive = restaurant.is_active === true;

                const actionLoading =
                  actionLoadingId === restaurant.restaurant_id;

                return (
                  <tr key={restaurant.restaurant_id}>
                    <td>
                      <span className="restaurant-id">
                        #{restaurant.restaurant_id}
                      </span>
                    </td>

                    <td>
                      <div className="restaurant-name-cell">
                        <div className="restaurant-avatar">
                          {(restaurant.restaurant_name || "R")
                            .charAt(0)
                            .toUpperCase()}
                        </div>

                        <div>
                          <div className="restaurant-name">
                            {restaurant.restaurant_name || "—"}
                          </div>

                          <div className="restaurant-subtext">Restaurant</div>
                        </div>
                      </div>
                    </td>

                    <td>
                      <span className="restaurant-email">
                        {restaurant.email || "—"}
                      </span>
                    </td>

                    <td>{restaurant.phone || "—"}</td>

                    <td>
                      <span
                        className={`restaurant-status ${
                          isActive ? "active" : "inactive"
                        }`}
                      >
                        {isActive ? "ACTIVE" : "INACTIVE"}
                      </span>
                    </td>

                    <td>
                      <span className="restaurant-date">
                        {restaurant.created_at
                          ? new Date(restaurant.created_at).toLocaleDateString()
                          : "—"}
                      </span>
                    </td>

                    <td>
                      <button
                        type="button"
                        className={`restaurant-status-btn ${
                          isActive ? "deactivate" : "activate"
                        }`}
                        onClick={() => handleStatusToggle(restaurant)}
                        disabled={actionLoading}
                      >
                        {actionLoading
                          ? "Updating..."
                          : isActive
                            ? "Deactivate"
                            : "Activate"}
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminRestaurants;

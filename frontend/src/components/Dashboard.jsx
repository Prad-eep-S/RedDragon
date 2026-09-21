import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Grid2X2, Utensils, Check, Store, ClipboardList } from "lucide-react";

import {
  getRestaurantById,
  getFoodCategories,
  getFoodItems,
  getRestaurantOrders,
  updateRestaurantStatus,
} from "../services/api";

function Dashboard() {
  const navigate = useNavigate();

  // =====================================================
  // STATE
  // =====================================================

  const [restaurant, setRestaurant] = useState(null);

  const [restaurantId, setRestaurantId] = useState(null);

  const [categoryCount, setCategoryCount] = useState(0);

  const [foodItemCount, setFoodItemCount] = useState(0);

  const [recentOrders, setRecentOrders] = useState([]);

  const [loading, setLoading] = useState(true);

  const [ordersLoading, setOrdersLoading] = useState(true);

  const [updatingStatus, setUpdatingStatus] = useState(false);

  const [error, setError] = useState("");

  // =====================================================
  // LOAD DASHBOARD DATA
  // =====================================================

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setLoading(true);
        setOrdersLoading(true);
        setError("");

        // =================================================
        // GET RESTAURANT USING JWT
        // =================================================

        const restaurantData = await getRestaurantById();

        console.log("Restaurant API Response:", restaurantData);

        const restaurantInfo =
          restaurantData?.data?.restaurant ||
          restaurantData?.restaurant ||
          restaurantData;

        if (!restaurantInfo) {
          throw new Error("Restaurant details not found.");
        }

        setRestaurant(restaurantInfo);

        // =================================================
        // GET RESTAURANT ID FROM API RESPONSE
        // =================================================

        const authenticatedRestaurantId = restaurantInfo?.restaurant_id;

        if (!authenticatedRestaurantId) {
          throw new Error("Restaurant ID was not returned by the server.");
        }

        setRestaurantId(authenticatedRestaurantId);

        console.log("Authenticated Restaurant ID:", authenticatedRestaurantId);

        // =================================================
        // GET FOOD CATEGORIES
        // =================================================

        const categoryData = await getFoodCategories();

        let categories = [];

        if (Array.isArray(categoryData)) {
          categories = categoryData;
        } else if (Array.isArray(categoryData?.categories)) {
          categories = categoryData.categories;
        } else if (Array.isArray(categoryData?.data?.categories)) {
          categories = categoryData.data.categories;
        } else if (Array.isArray(categoryData?.data)) {
          categories = categoryData.data;
        }

        console.log("Restaurant Categories:", categories);

        // =================================================
        // CATEGORY COUNT
        // =================================================

        setCategoryCount(categories.length);

        // =================================================
        // GET FOOD ITEM COUNT
        // =================================================

        let totalFoodItems = 0;

        if (categories.length > 0) {
          const foodItemResults = await Promise.all(
            categories.map(async (category) => {
              const categoryId = category.category_id;

              if (!categoryId) {
                return [];
              }

              const response = await getFoodItems(categoryId);

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
            }),
          );

          totalFoodItems = foodItemResults.reduce((total, categoryItems) => {
            return total + categoryItems.length;
          }, 0);
        }

        console.log("Total Food Items:", totalFoodItems);

        setFoodItemCount(totalFoodItems);

        // =================================================
        // GET RESTAURANT ORDERS
        // =================================================

        const ordersData = await getRestaurantOrders(authenticatedRestaurantId);

        console.log("Restaurant Orders API Response:", ordersData);

        // =================================================
        // LATEST 5 ORDERS
        // =================================================

        const latestFiveOrders = (ordersData?.orders || [])
          .filter((order) => order.order_status !== "DRAFT")
          .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
          .slice(0, 5);

        setRecentOrders(latestFiveOrders);
      } catch (err) {
        console.error("Dashboard Error:", err);

        setError(err.message || "Failed to load dashboard");
      } finally {
        setLoading(false);
        setOrdersLoading(false);
      }
    };

    loadDashboard();
  }, []);

  // =====================================================
  // RESTAURANT NAME
  // =====================================================

  const restaurantName =
    restaurant?.restaurant_name || restaurant?.name || "Restaurant";

  // =====================================================
  // RESTAURANT DESCRIPTION
  // =====================================================

  const restaurantDescription =
    restaurant?.description ||
    restaurant?.restaurant_description ||
    "Welcome to your restaurant dashboard.";

  // =====================================================
  // RESTAURANT AVAILABILITY
  // =====================================================

  const isRestaurantAvailable = (() => {
    const status = restaurant?.is_available;

    if (typeof status === "string") {
      return status.toLowerCase() === "true" || status === "1";
    }

    return status === true || status === 1;
  })();

  const restaurantStatus = isRestaurantAvailable
    ? "AVAILABLE"
    : "NOT AVAILABLE";

  // =====================================================
  // UPDATE RESTAURANT AVAILABILITY
  // =====================================================

  const handleStatusToggle = async () => {
    if (!restaurant) {
      return;
    }

    const newStatus = !isRestaurantAvailable;

    try {
      setUpdatingStatus(true);
      setError("");

      console.log("Changing restaurant availability to:", newStatus);

      const response = await updateRestaurantStatus(newStatus);

      console.log("Restaurant availability update response:", response);

      const updatedRestaurant =
        response?.data?.restaurant || response?.restaurant || response;

      setRestaurant((previousRestaurant) => ({
        ...previousRestaurant,
        ...updatedRestaurant,
        is_available: newStatus,
      }));
    } catch (error) {
      console.error("Restaurant availability update error:", error);

      setError(error.message || "Failed to update restaurant availability.");
    } finally {
      setUpdatingStatus(false);
    }
  };

  // =====================================================
  // FORMAT ORDER DATE
  // =====================================================

  const formatOrderDate = (dateString) => {
    if (!dateString) {
      return "Date not available";
    }

    const date = new Date(dateString);

    if (Number.isNaN(date.getTime())) {
      return "Date not available";
    }

    return date.toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // =====================================================
  // GET ORDER ITEM COUNT
  // =====================================================

  const getItemCount = (order) => {
    if (!order.items || !Array.isArray(order.items)) {
      return 0;
    }

    return order.items.reduce(
      (total, item) => total + Number(item.quantity || 0),
      0,
    );
  };

  // =====================================================
  // GET ORDER AMOUNT
  // =====================================================

  const getOrderAmount = (order) => {
    if (
      order.payment &&
      order.payment.amount !== null &&
      order.payment.amount !== undefined
    ) {
      return Number(order.payment.amount).toFixed(2);
    }

    if (!order.items || !Array.isArray(order.items)) {
      return "0.00";
    }

    const total = order.items.reduce(
      (sum, item) =>
        sum +
        Number(item.price_at_the_time_of_order) * Number(item.quantity || 0),
      0,
    );

    return total.toFixed(2);
  };

  // =====================================================
  // PAGE
  // =====================================================

  return (
    <div className="dashboard-page">
      {/* =================================================
          PAGE TITLE
      ================================================= */}

      <div className="dashboard-title">
        <h1>{restaurantName}</h1>

        <p>{restaurantDescription}!</p>
      </div>

      {/* =================================================
          ERROR
      ================================================= */}

      {error && <div className="dashboard-error">{error}</div>}

      {/* =================================================
          DASHBOARD CARDS
      ================================================= */}

      <div className="dashboard-cards">
        {/* =================================================
            FOOD CATEGORIES
        ================================================= */}

        <div className="dashboard-card">
          <div className="dashboard-card-icon">
            <Grid2X2 size={32} />
          </div>

          <h2>Food Categories</h2>

          <div className="dashboard-card-number">
            {loading ? "..." : categoryCount}
          </div>

          <button
            className="dashboard-link"
            onClick={() => navigate("/restaurant/categories")}
          >
            View Categories
          </button>
        </div>

        {/* =================================================
            FOOD ITEMS
        ================================================= */}

        <div className="dashboard-card">
          <div className="dashboard-card-icon">
            <Utensils size={32} />
          </div>

          <h2>Food Items</h2>

          <div className="dashboard-card-number">
            {loading ? "..." : foodItemCount}
          </div>

          <button
            className="dashboard-link"
            onClick={() => navigate("/restaurant/fooditems")}
          >
            View Food Items
          </button>
        </div>

        {/* =================================================
            RESTAURANT STATUS
        ================================================= */}

        <div className="dashboard-card">
          <div className="dashboard-card-icon">
            <Check size={32} />
          </div>

          {/* =================================================
              STATUS HEADING + TOGGLE
          ================================================= */}

          <div className="restaurant-status-heading">
            <h2>Restaurant Status</h2>

            <button
              type="button"
              className={`status-toggle ${
                isRestaurantAvailable ? "active" : ""
              }`}
              onClick={handleStatusToggle}
              disabled={updatingStatus || loading}
              aria-label={
                isRestaurantAvailable
                  ? "Make restaurant unavailable"
                  : "Make restaurant available"
              }
            >
              <span className="status-toggle-circle"></span>
            </button>
          </div>

          {/* =================================================
              STATUS TEXT
          ================================================= */}

          <div
            className={
              isRestaurantAvailable
                ? "restaurant-status-active"
                : "restaurant-status-inactive"
            }
          >
            {restaurantStatus}
          </div>

          {/* =================================================
              STATUS DESCRIPTION
          ================================================= */}

          <p className="restaurant-status-text">
            {isRestaurantAvailable
              ? "Your restaurant is available"
              : "Your restaurant is not available"}
          </p>
        </div>
      </div>

      {/* =================================================
          RESTAURANT INFORMATION
      ================================================= */}

      <div className="restaurant-info-card">
        <div className="restaurant-info-left">
          <div className="restaurant-icon">
            <Store size={42} />
          </div>

          <div className="restaurant-details">
            <h2>{restaurantName}</h2>

            <p className="restaurant-status-line">
              Status:
              <span
                className={
                  isRestaurantAvailable
                    ? "restaurant-active-text"
                    : "restaurant-inactive-text"
                }
              >
                {restaurantStatus}
              </span>
            </p>
          </div>
        </div>

        <div
          className={
            isRestaurantAvailable ? "restaurant-open" : "restaurant-closed"
          }
        >
          <span className="open-dot"></span>

          <span>
            {isRestaurantAvailable
              ? "Your restaurant is available."
              : "Your restaurant is not available."}
          </span>
        </div>
      </div>

      {/* =================================================
          RECENT ORDERS
      ================================================= */}

      <div className="recent-orders-card">
        <div className="recent-orders-header">
          <div>
            <h2>Recent Orders</h2>

            <p>Latest 5 customer orders</p>
          </div>

          <button
            className="view-orders-button"
            onClick={() => navigate("/restaurant/orders")}
          >
            View All Orders
          </button>
        </div>

        {/* =================================================
            LOADING
        ================================================= */}

        {ordersLoading ? (
          <div className="recent-orders-empty">
            <ClipboardList size={45} />

            <h3>Loading Recent Orders</h3>

            <p>Please wait while we load your latest orders.</p>
          </div>
        ) : recentOrders.length === 0 ? (
          /* =================================================
              NO ORDERS
          ================================================= */

          <div className="recent-orders-empty">
            <ClipboardList size={45} />

            <h3>No Recent Orders</h3>

            <p>Your latest customer orders will appear here.</p>
          </div>
        ) : (
          /* =================================================
              ORDERS
          ================================================= */

          <div className="recent-orders-list">
            {recentOrders.map((order) => (
              <div className="recent-order-row" key={order.order_id}>
                <div className="recent-order-info">
                  <strong>Order #{order.order_id}</strong>

                  <span>{getItemCount(order)} item(s)</span>
                </div>

                <div className="recent-order-status-container">
                  <span
                    className={`recent-order-status ${String(
                      order.order_status || "",
                    ).toLowerCase()}`}
                  >
                    {order.order_status}
                  </span>
                </div>

                <div className="recent-order-amount">
                  <strong>₹{getOrderAmount(order)}</strong>
                </div>

                <div className="recent-order-date">
                  {formatOrderDate(order.created_at)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;

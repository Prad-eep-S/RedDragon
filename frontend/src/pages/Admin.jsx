import React, { useEffect, useState } from "react";
import Cookies from "js-cookie";
import api from "../api/api";
import "./Admin.css";

const Admin = () => {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
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

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/admin/dashboard", getAuthHeaders());

      console.log("Admin dashboard response:", response.data);

      setDashboard(response.data.dashboard);
    } catch (error) {
      console.error("Restaurant status update error:", {
        status: error.response?.status,
        data: error.response?.data,
        headers: error.response?.headers,
        message: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="admin-page">
        <div className="admin-loading">
          <div className="admin-spinner"></div>
          <p>Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-page">
        <div className="admin-error">
          <h2>Unable to load dashboard</h2>

          <p>{error}</p>

          <button
            type="button"
            className="admin-retry-button"
            onClick={fetchDashboard}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const customers = dashboard?.customers || {};
  const restaurants = dashboard?.restaurants || {};
  const orders = dashboard?.orders || {};

  return (
    <div className="admin-page">
      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="admin-page-header">
        <div>
          <p className="admin-eyebrow">ADMIN PANEL</p>

          <h1>Dashboard</h1>

          <p className="admin-page-description">
            Monitor customers, restaurants and orders from one place.
          </p>
        </div>

        <button
          type="button"
          className="admin-refresh-button"
          onClick={fetchDashboard}
        >
          Refresh
        </button>
      </div>

      {/* =====================================================
          CUSTOMER SECTION
      ===================================================== */}

      <section className="admin-section">
        <div className="admin-section-header">
          <h2>Customers</h2>
        </div>

        <div className="admin-card-grid">
          <div className="admin-stat-card">
            <div className="admin-stat-label">Total Customers</div>

            <div className="admin-stat-value">
              {customers.total_customers || 0}
            </div>
          </div>

          <div className="admin-stat-card active">
            <div className="admin-stat-label">Active Customers</div>

            <div className="admin-stat-value">
              {customers.active_customers || 0}
            </div>
          </div>

          <div className="admin-stat-card inactive">
            <div className="admin-stat-label">Inactive Customers</div>

            <div className="admin-stat-value">
              {customers.inactive_customers || 0}
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          RESTAURANT SECTION
      ===================================================== */}

      <section className="admin-section">
        <div className="admin-section-header">
          <h2>Restaurants</h2>
        </div>

        <div className="admin-card-grid">
          <div className="admin-stat-card">
            <div className="admin-stat-label">Total Restaurants</div>

            <div className="admin-stat-value">
              {restaurants.total_restaurants || 0}
            </div>
          </div>

          <div className="admin-stat-card active">
            <div className="admin-stat-label">Active Restaurants</div>

            <div className="admin-stat-value">
              {restaurants.active_restaurants || 0}
            </div>
          </div>

          <div className="admin-stat-card inactive">
            <div className="admin-stat-label">Inactive Restaurants</div>

            <div className="admin-stat-value">
              {restaurants.inactive_restaurants || 0}
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          ORDERS SECTION
      ===================================================== */}

      <section className="admin-section">
        <div className="admin-section-header">
          <h2>Orders</h2>
        </div>

        <div className="admin-card-grid">
          <div className="admin-stat-card">
            <div className="admin-stat-label">Total Orders</div>

            <div className="admin-stat-value">{orders.total_orders || 0}</div>
          </div>

          <div className="admin-stat-card">
            <div className="admin-stat-label">Placed</div>

            <div className="admin-stat-value">{orders.placed_orders || 0}</div>
          </div>

          <div className="admin-stat-card">
            <div className="admin-stat-label">Confirmed</div>

            <div className="admin-stat-value">
              {orders.confirmed_orders || 0}
            </div>
          </div>

          <div className="admin-stat-card">
            <div className="admin-stat-label">Accepted</div>

            <div className="admin-stat-value">
              {orders.accepted_orders || 0}
            </div>
          </div>

          <div className="admin-stat-card">
            <div className="admin-stat-label">Preparing</div>

            <div className="admin-stat-value">
              {orders.preparing_orders || 0}
            </div>
          </div>

          <div className="admin-stat-card">
            <div className="admin-stat-label">Ready</div>

            <div className="admin-stat-value">{orders.ready_orders || 0}</div>
          </div>

          <div className="admin-stat-card">
            <div className="admin-stat-label">Out for Delivery</div>

            <div className="admin-stat-value">
              {orders.out_for_delivery_orders || 0}
            </div>
          </div>

          <div className="admin-stat-card active">
            <div className="admin-stat-label">Delivered</div>

            <div className="admin-stat-value">
              {orders.delivered_orders || 0}
            </div>
          </div>

          <div className="admin-stat-card inactive">
            <div className="admin-stat-label">Cancelled</div>

            <div className="admin-stat-value">
              {orders.cancelled_orders || 0}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Admin;

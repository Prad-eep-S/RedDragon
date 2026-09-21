import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  Outlet,
} from "react-router-dom";

import "./App.css";

// =====================================================
// CUSTOMER PAGES
// =====================================================

import Login from "./pages/Login";
import Register from "./pages/Register";
import VerifyEmail from "./pages/VerifyEmail";
import Customer from "./pages/Customer";
import RestaurantsMenu from "./pages/RestaurantsMenu";
import RestaurantDetails from "./pages/RestaurantDetails";
import CustomerProfile from "./pages/CustomerProfile";
import Cart from "./pages/Cart";
import OrderConfirmation from "./pages/OrderConfirmation";
import Checkout from "./pages/Checkout";
import OrderDetails from "./pages/OrderDetails";
import MyOrders from "./pages/MyOrders";

// =====================================================
// CUSTOMER PROTECTION
// =====================================================

import ProtectedRouteCustomer from "./components/ProtectedRouteCustomer";
//restaurant protection

import ProtectedRouteRestaurant from "./components/ProtectedRouteRestaurant";
import ProtectedRouteAdmin from "./components/ProtectedRouteAdmin";
// =====================================================
// ADMIN
// =====================================================

import Admin from "./pages/Admin";

// =====================================================
// RESTAURANT COMPONENTS
// =====================================================

import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import Dashboard from "./components/Dashboard";
import RestaurantFoodCategory from "./components/RestaurantFoodCategory";
import FoodItemSection from "./components/FoodItemSection";
import AllFoodItems from "./components/AllFoodItems";
import Orders from "./components/Orders";
import RestaurantProfile from "./components/RestaurantProfile";
import AdminCustomers from "./pages/AdminCustomers";
import AdminRestaurants from "./pages/AdminRestaurants";
import AdminOrderDetails from "./pages/AdminOrderDetails";
import AdminLayout from "./pages/AdminLayout";
import AdminOrders from "./pages/AdminOrders";

// =====================================================
// RESTAURANT LAYOUT
// =====================================================

function RestaurantLayout() {
  return (
    <div className="app">
      {/* =================================================
          RESTAURANT HEADER
      ================================================= */}

      <Header />

      {/* =================================================
          RESTAURANT BODY
      ================================================= */}

      <div className="app-body">
        {/* =================================================
            RESTAURANT SIDEBAR
        ================================================= */}

        <Sidebar />

        {/* =================================================
            RESTAURANT MAIN CONTENT
        ================================================= */}

        <main className="main-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

// =====================================================
// APP
// =====================================================

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* =================================================
            AUTHENTICATION
        ================================================= */}

        <Route path="/login" element={<Login />} />

        <Route path="/register" element={<Register />} />

        <Route path="/verify-email" element={<VerifyEmail />} />

        {/* =================================================
            CUSTOMER APPLICATION
        ================================================= */}

        <Route element={<ProtectedRouteCustomer />}>
          {/* Customer Home */}
          <Route path="/" element={<Customer />} />

          {/* Restaurants */}
          <Route path="/restaurants-menu" element={<RestaurantsMenu />} />

          <Route
            path="/restaurants/:restaurantId"
            element={<RestaurantDetails />}
          />

          {/* Customer Profile */}
          <Route path="/customer/profile" element={<CustomerProfile />} />

          {/* Cart */}
          <Route path="/cart" element={<Cart />} />

          {/* Order Confirmation */}
          <Route
            path="/order-confirmation/:orderId"
            element={<OrderConfirmation />}
          />

          {/* Checkout */}
          <Route path="/checkout/:orderId" element={<Checkout />} />

          {/* Order Details */}
          <Route path="/orders/:orderId" element={<OrderDetails />} />

          {/* My Orders */}
          <Route path="/my-orders" element={<MyOrders />} />
        </Route>

        {/* =================================================
            ADMIN
        ================================================= */}

        <Route element={<ProtectedRouteAdmin />}>
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Admin />} />

            <Route path="customers" element={<AdminCustomers />} />

            <Route path="restaurants" element={<AdminRestaurants />} />

            <Route path="orders" element={<AdminOrders />} />

            <Route path="orders/:orderId" element={<AdminOrderDetails />} />
          </Route>
        </Route>

        {/* =================================================
            RESTAURANT APPLICATION
        ================================================= */}

        <Route element={<ProtectedRouteRestaurant />}>
          <Route path="/restaurant" element={<RestaurantLayout />}>
            {/* =================================================
              RESTAURANT DEFAULT
              /restaurant
              → /restaurant/dashboard
          ================================================= */}

            <Route
              index
              element={<Navigate to="/restaurant/dashboard" replace />}
            />

            {/* =================================================
              RESTAURANT DASHBOARD
              /restaurant/dashboard
          ================================================= */}

            <Route path="dashboard" element={<Dashboard />} />

            {/* =================================================
              RESTAURANT FOOD CATEGORIES
              /restaurant/categories
          ================================================= */}

            <Route path="categories" element={<RestaurantFoodCategory />} />

            {/* =================================================
              CATEGORY FOOD ITEMS
              /restaurant/categories/:categoryId
          ================================================= */}

            <Route
              path="categories/:categoryId"
              element={<FoodItemSection />}
            />

            {/* =================================================
              ALL FOOD ITEMS
              /restaurant/fooditems
          ================================================= */}

            <Route path="fooditems" element={<AllFoodItems />} />

            {/* =================================================
              RESTAURANT ORDERS
              /restaurant/orders
          ================================================= */}

            <Route path="orders" element={<Orders />} />

            {/* =================================================
              RESTAURANT PROFILE
              /restaurant/profile
          ================================================= */}

            <Route path="profile" element={<RestaurantProfile />} />
          </Route>

          {/* =================================================
            INVALID ROUTES
        ================================================= */}

          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;

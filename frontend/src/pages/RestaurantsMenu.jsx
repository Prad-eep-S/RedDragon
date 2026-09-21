import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import CustomerNavbar from "../components/CustomerNavbar";
import RestaurantCard from "../components/RestaurantCard";
import api from "../api/api";
import "./RestaurantsMenu.css";

const RestaurantsMenu = () => {
  const [restaurantsData, setRestaurantsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const restaurantDetails = async () => {
      try {
        const token = Cookies.get("token");

        const response = await api.get("/restaurants", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        console.log("RESTAURANTS RESPONSE:", response.data);

        setRestaurantsData(response.data.data);
      } catch (error) {
        console.error("RESTAURANTS ERROR:", error);

        setError(error.response?.data?.message || "Failed to load restaurants");
      } finally {
        setLoading(false);
      }
    };

    restaurantDetails();
  }, []);

  return (
    <div className="restaurants-page">
      <CustomerNavbar />

      <main className="restaurants-content">
        <h1>Explore Restaurants</h1>

        <p className="restaurants-subtitle">
          Discover restaurants and explore their menus
        </p>

        {loading && (
          <p className="restaurants-status">Loading restaurants...</p>
        )}

        {error && <p className="restaurants-error">{error}</p>}

        {!loading && !error && restaurantsData.length === 0 && (
          <p className="restaurants-status">No restaurants found.</p>
        )}

        {!loading && !error && restaurantsData.length > 0 && (
          <div className="restaurants-grid">
            {restaurantsData.map((restaurant) => (
              <RestaurantCard
                key={restaurant.restaurant_id}
                restaurant={restaurant}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default RestaurantsMenu;

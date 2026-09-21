import React, { useEffect, useState } from "react";
import api from "../api/api";
import Cookies from "js-cookie";
import "./CustomerAddresses.css";
import CustomerNavbar from "../components/CustomerNavbar";

const emptyForm = {
  address_type: "HOME",
  address_line1: "",
  address_line2: "",
  city: "",
  state: "",
  postal_code: "",
  landmark: "",
};

const CustomerAddresses = () => {
  const [addresses, setAddresses] = useState([]);
  const [form, setForm] = useState(emptyForm);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState(null);

  const [deleteId, setDeleteId] = useState(null);

  // =====================================================
  // GET ALL ADDRESSES
  // =====================================================

  const fetchAddresses = async () => {
    try {
      setLoading(true);
      setError("");
      const token = Cookies.get("token");

      const response = await api.get("/customers/me/addresses", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setAddresses(response.data.addresses || []);
    } catch (err) {
      console.error("Error fetching addresses:", err);

      setError(err.response?.data?.message || "Failed to load addresses");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, []);

  // =====================================================
  // INPUT CHANGE
  // =====================================================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // =====================================================
  // OPEN ADD MODAL
  // =====================================================

  const openAddModal = () => {
    setForm(emptyForm);
    setEditingAddressId(null);
    setError("");
    setSuccess("");
    setShowModal(true);
  };

  // =====================================================
  // OPEN EDIT MODAL
  // =====================================================

  const openEditModal = async (addressId) => {
    try {
      setError("");
      setSuccess("");
      const token = Cookies.get("token");

      const response = await api.get(`/customers/me/addresses/${addressId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const address = response.data.address;

      setForm({
        address_type: address.address_type || "HOME",
        address_line1: address.address_line1 || "",
        address_line2: address.address_line2 || "",
        city: address.city || "",
        state: address.state || "",
        postal_code: address.postal_code || "",
        landmark: address.landmark || "",
      });

      setEditingAddressId(addressId);
      setShowModal(true);
    } catch (err) {
      console.error("Error fetching address:", err);

      setError(err.response?.data?.message || "Failed to load address");
    }
  };

  // =====================================================
  // SAVE ADDRESS
  // =====================================================

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = Cookies.get("token");

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      let response;

      if (editingAddressId) {
        // UPDATE
        response = await api.put(
          `/customers/me/addresses/${editingAddressId}`,
          form,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );
      } else {
        // ADD
        response = await api.post("/customers/me/addresses", form, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      }

      setSuccess(response.data.message || "Address saved successfully");

      setShowModal(false);
      setForm(emptyForm);
      setEditingAddressId(null);

      await fetchAddresses();
    } catch (err) {
      console.error("Error saving address:", err);

      setError(err.response?.data?.message || "Failed to save address");
    } finally {
      setSaving(false);
    }
  };

  // =====================================================
  // DELETE ADDRESS
  // =====================================================

  const handleDelete = async () => {
    if (!deleteId) return;
    const token = Cookies.get("token");

    try {
      setError("");
      setSuccess("");

      const response = await api.delete(`/customers/me/addresses/${deleteId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setSuccess(response.data.message || "Address deleted successfully");

      setDeleteId(null);

      await fetchAddresses();
    } catch (err) {
      console.error("Error deleting address:", err);

      setError(err.response?.data?.message || "Failed to delete address");

      setDeleteId(null);
    }
  };

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div className="addresses-page">
        <div className="addresses-header">
          <h2>My Addresses</h2>
          <p>Manage your delivery addresses</p>
        </div>

        <div className="address-loading">
          <div className="spinner"></div>
          <p>Loading addresses...</p>
        </div>
      </div>
    );
  }

  // =====================================================
  // UI
  // =====================================================

  return (
    <>
      <div className="addresses-page">
        <div className="addresses-header">
          <div>
            <h2>My Addresses</h2>
            <p>Manage your delivery addresses</p>
          </div>

          <button className="add-address-btn" onClick={openAddModal}>
            <span>+</span>
            Add Address
          </button>
        </div>

        {/* SUCCESS */}
        {success && <div className="success-message">✓ {success}</div>}

        {/* ERROR */}
        {error && <div className="error-message">⚠ {error}</div>}

        {/* EMPTY STATE */}
        {addresses.length === 0 ? (
          <div className="empty-address">
            <div className="empty-icon">📍</div>

            <h3>No addresses yet</h3>

            <p>Add an address to make your food delivery faster and easier.</p>

            <button className="empty-add-btn" onClick={openAddModal}>
              + Add Your First Address
            </button>
          </div>
        ) : (
          /* ADDRESS GRID */
          <div className="address-grid">
            {addresses.map((address) => (
              <div className="address-card" key={address.address_id}>
                {/* CARD HEADER */}
                <div className="address-card-header">
                  <div className="address-type">
                    <span className="address-icon">
                      {address.address_type === "HOME"
                        ? "🏠"
                        : address.address_type === "WORK"
                          ? "💼"
                          : "📍"}
                    </span>

                    <span>{address.address_type}</span>
                  </div>
                </div>

                {/* ADDRESS */}
                <div className="address-content">
                  <p className="address-line">{address.address_line1}</p>

                  {address.address_line2 && (
                    <p className="address-line">{address.address_line2}</p>
                  )}

                  <p className="address-location">
                    {address.city}, {address.state}
                  </p>

                  <p className="address-postal">{address.postal_code}</p>

                  {address.landmark && (
                    <p className="address-landmark">
                      <strong>Landmark:</strong> {address.landmark}
                    </p>
                  )}
                </div>

                {/* ACTIONS */}
                <div className="address-actions">
                  <button
                    className="edit-btn"
                    onClick={() => openEditModal(address.address_id)}
                  >
                    ✏ Edit
                  </button>

                  <button
                    className="delete-btn"
                    onClick={() => setDeleteId(address.address_id)}
                  >
                    🗑 Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* =================================================
          ADD / EDIT MODAL
      ================================================= */}

        {showModal && (
          <div className="modal-overlay">
            <div className="address-modal">
              {/* MODAL HEADER */}
              <div className="modal-header">
                <div>
                  <h3>
                    {editingAddressId ? "Edit Address" : "Add New Address"}
                  </h3>

                  <p>Enter your delivery address</p>
                </div>

                <button
                  className="close-btn"
                  onClick={() => setShowModal(false)}
                >
                  ×
                </button>
              </div>

              {/* FORM */}
              <form className="address-form" onSubmit={handleSubmit}>
                {/* ADDRESS TYPE */}
                <div className="form-group">
                  <label>Address Type</label>

                  <select
                    name="address_type"
                    value={form.address_type}
                    onChange={handleChange}
                    required
                  >
                    <option value="HOME">Home</option>

                    <option value="WORK">Work</option>

                    <option value="OTHER">Other</option>
                  </select>
                </div>

                {/* ADDRESS LINE 1 */}
                <div className="form-group">
                  <label>Address Line 1</label>

                  <input
                    type="text"
                    name="address_line1"
                    value={form.address_line1}
                    onChange={handleChange}
                    placeholder="House / Flat / Street"
                    required
                  />
                </div>

                {/* ADDRESS LINE 2 */}
                <div className="form-group">
                  <label>
                    Address Line 2<span>Optional</span>
                  </label>

                  <input
                    type="text"
                    name="address_line2"
                    value={form.address_line2}
                    onChange={handleChange}
                    placeholder="Apartment, Floor, Area"
                  />
                </div>

                {/* CITY + STATE */}
                <div className="form-row">
                  <div className="form-group">
                    <label>City</label>

                    <input
                      type="text"
                      name="city"
                      value={form.city}
                      onChange={handleChange}
                      placeholder="City"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>State</label>

                    <input
                      type="text"
                      name="state"
                      value={form.state}
                      onChange={handleChange}
                      placeholder="State"
                      required
                    />
                  </div>
                </div>

                {/* POSTAL CODE */}
                <div className="form-group">
                  <label>Postal Code</label>

                  <input
                    type="text"
                    name="postal_code"
                    value={form.postal_code}
                    onChange={handleChange}
                    placeholder="6-digit PIN code"
                    maxLength="10"
                    required
                  />
                </div>

                {/* LANDMARK */}
                <div className="form-group">
                  <label>
                    Landmark
                    <span>Optional</span>
                  </label>

                  <input
                    type="text"
                    name="landmark"
                    value={form.landmark}
                    onChange={handleChange}
                    placeholder="Nearby landmark"
                  />
                </div>

                {/* BUTTONS */}
                <div className="modal-actions">
                  <button
                    type="button"
                    className="cancel-btn"
                    onClick={() => setShowModal(false)}
                    disabled={saving}
                  >
                    Cancel
                  </button>

                  <button type="submit" className="save-btn" disabled={saving}>
                    {saving
                      ? "Saving..."
                      : editingAddressId
                        ? "Update Address"
                        : "Save Address"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* =================================================
          DELETE CONFIRMATION
      ================================================= */}

        {deleteId && (
          <div className="modal-overlay">
            <div className="delete-modal">
              <div className="delete-icon">🗑</div>

              <h3>Delete this address?</h3>

              <p>This address will no longer be available for delivery.</p>

              <div className="delete-actions">
                <button
                  className="cancel-btn"
                  onClick={() => setDeleteId(null)}
                >
                  Cancel
                </button>

                <button className="confirm-delete-btn" onClick={handleDelete}>
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default CustomerAddresses;

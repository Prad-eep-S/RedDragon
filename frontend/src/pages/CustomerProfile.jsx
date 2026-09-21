import React, { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { User, Mail, Phone, Edit3, Save, X } from "lucide-react";

import CustomerAddresses from "./CustomerAddresses";
import api from "../api/api";

import "./CustomerProfile.css";
import CustomerNavbar from "../components/CustomerNavbar";

const CustomerProfile = () => {
  // =====================================================
  // PROFILE STATE
  // =====================================================

  const [profile, setProfile] = useState({
    name: "",
    email: "",
    phone: "",
  });

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
  });

  // =====================================================
  // UI STATE
  // =====================================================

  const [loading, setLoading] = useState(true);

  const [saving, setSaving] = useState(false);

  const [editing, setEditing] = useState(false);

  const [error, setError] = useState("");

  const [success, setSuccess] = useState("");

  // =====================================================
  // GET TOKEN
  // =====================================================

  const getToken = () => {
    const token = Cookies.get("token");

    if (!token) {
      throw new Error("Authentication token not found. Please login again.");
    }

    return token;
  };

  // =====================================================
  // FETCH PROFILE
  // =====================================================

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError("");

      const token = getToken();

      const response = await api.get("/customers/me/profile", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const customer = response.data?.data || {};

      const updatedProfile = {
        name: customer.name || "",
        email: customer.email || "",
        phone: customer.phone || "",
      };

      setProfile(updatedProfile);

      setFormData({
        name: updatedProfile.name,
        phone: updatedProfile.phone,
      });
    } catch (err) {
      console.error("Failed to fetch customer profile:", err);

      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          err.message ||
          "Failed to load profile",
      );
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // LOAD PROFILE
  // =====================================================

  useEffect(() => {
    fetchProfile();
  }, []);

  // =====================================================
  // HANDLE INPUT
  // =====================================================

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    setError("");
    setSuccess("");
  };

  // =====================================================
  // START EDIT
  // =====================================================

  const handleEdit = () => {
    setFormData({
      name: profile.name,
      phone: profile.phone,
    });

    setEditing(true);

    setError("");
    setSuccess("");
  };

  // =====================================================
  // CANCEL EDIT
  // =====================================================

  const handleCancel = () => {
    setFormData({
      name: profile.name,
      phone: profile.phone,
    });

    setEditing(false);

    setError("");
    setSuccess("");
  };

  // =====================================================
  // VALIDATE FORM
  // =====================================================

  const validateForm = () => {
    const name = formData.name.trim();
    const phone = formData.phone.trim();

    if (!name) {
      return "Name is required.";
    }

    if (name.length < 2) {
      return "Name must contain at least 2 characters.";
    }

    if (name.length > 100) {
      return "Name must not exceed 100 characters.";
    }

    if (!phone) {
      return "Phone number is required.";
    }

    const cleanedPhone = phone.replace(/\s+/g, "").replace(/-/g, "");

    const phonePattern = /^\+?[0-9]{10,15}$/;

    if (!phonePattern.test(cleanedPhone)) {
      return "Please enter a valid phone number.";
    }

    return null;
  };

  // =====================================================
  // UPDATE PROFILE
  // =====================================================

  const handleSave = async (event) => {
    event.preventDefault();

    const validationError = validateForm();

    if (validationError) {
      setError(validationError);
      setSuccess("");
      return;
    }

    try {
      setSaving(true);

      setError("");
      setSuccess("");

      const token = getToken();

      const cleanedPhone = formData.phone
        .trim()
        .replace(/\s+/g, "")
        .replace(/-/g, "");

      const payload = {
        name: formData.name.trim(),
        phone: cleanedPhone,
      };

      const response = await api.patch("/customers/me/profile", payload, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const customer = response.data?.data || {};

      const updatedProfile = {
        name: customer.name ?? payload.name,

        email: customer.email ?? profile.email,

        phone: customer.phone ?? payload.phone,
      };

      setProfile(updatedProfile);

      setFormData({
        name: updatedProfile.name,
        phone: updatedProfile.phone,
      });

      setEditing(false);

      setSuccess("Profile updated successfully.");
    } catch (err) {
      console.error("Failed to update profile:", err);

      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          err.message ||
          "Failed to update profile.",
      );

      setSuccess("");
    } finally {
      setSaving(false);
    }
  };

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div className="customer-profile-page">
        <div className="customer-profile-loading">
          <div className="profile-spinner"></div>
          <p>Loading your profile...</p>
        </div>
      </div>
    );
  }

  // =====================================================
  // PAGE
  // =====================================================

  return (
    <>
      <CustomerNavbar />
      <div className="customer-profile-page">
        {/* =================================================
          PROFILE HEADER
      ================================================= */}

        <div className="customer-profile-header">
          <div>
            <span className="profile-subtitle">Account</span>

            <h1>My Profile</h1>

            <p>Manage your personal information and delivery addresses.</p>
          </div>
        </div>

        {/* =================================================
          MESSAGES
      ================================================= */}

        {error && <div className="profile-message profile-error">{error}</div>}

        {success && (
          <div className="profile-message profile-success">{success}</div>
        )}

        {/* =================================================
          PROFILE CARD
      ================================================= */}

        <section className="customer-profile-card">
          {/* =================================================
            CARD HEADER
        ================================================= */}

          <div className="profile-card-header">
            <div className="profile-card-title">
              <div className="profile-icon">
                <User size={22} />
              </div>

              <div>
                <h2>Personal Information</h2>

                <p>Update your name and phone number</p>
              </div>
            </div>

            {!editing && (
              <button
                type="button"
                className="profile-edit-button"
                onClick={handleEdit}
              >
                <Edit3 size={17} />
                Edit Profile
              </button>
            )}
          </div>

          {/* =================================================
            PROFILE FORM
        ================================================= */}

          <form className="profile-form" onSubmit={handleSave}>
            {/* =================================================
              NAME
          ================================================= */}

            <div className="profile-form-group">
              <label htmlFor="profile-name">Full Name</label>

              <div className="profile-input-wrapper">
                <User size={18} />

                <input
                  id="profile-name"
                  type="text"
                  name="name"
                  value={editing ? formData.name : profile.name}
                  onChange={handleChange}
                  disabled={!editing || saving}
                  placeholder="Enter your name"
                />
              </div>
            </div>

            {/* =================================================
              EMAIL
          ================================================= */}

            <div className="profile-form-group">
              <label htmlFor="profile-email">Email Address</label>

              <div className="profile-input-wrapper">
                <Mail size={18} />

                <input
                  id="profile-email"
                  type="email"
                  value={profile.email}
                  disabled
                  readOnly
                />
              </div>

              <small className="profile-field-note">
                Email address cannot be changed here.
              </small>
            </div>

            {/* =================================================
              PHONE
          ================================================= */}

            <div className="profile-form-group">
              <label htmlFor="profile-phone">Phone Number</label>

              <div className="profile-input-wrapper">
                <Phone size={18} />

                <input
                  id="profile-phone"
                  type="tel"
                  name="phone"
                  value={editing ? formData.phone : profile.phone}
                  onChange={handleChange}
                  disabled={!editing || saving}
                  placeholder="Enter phone number"
                />
              </div>
            </div>

            {/* =================================================
              EDIT ACTIONS
          ================================================= */}

            {editing && (
              <div className="profile-form-actions">
                <button
                  type="button"
                  className="profile-cancel-button"
                  onClick={handleCancel}
                  disabled={saving}
                >
                  <X size={17} />
                  Cancel
                </button>

                <button
                  type="submit"
                  className="profile-save-button"
                  disabled={saving}
                >
                  <Save size={17} />

                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            )}
          </form>
        </section>

        {/* =================================================
          CUSTOMER ADDRESSES
      ================================================= */}

        <section className="customer-addresses-section">
          <div className="customer-addresses-heading">
            <div>
              <span className="profile-subtitle">Delivery</span>

              <h2>My Addresses</h2>

              <p>Add, edit, or remove your delivery addresses.</p>
            </div>
          </div>

          <CustomerAddresses />
        </section>
      </div>
    </>
  );
};

export default CustomerProfile;

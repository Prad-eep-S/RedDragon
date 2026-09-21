import React from "react";
import "./CartReplaceModal.css";

const CartReplaceModal = ({ isOpen, onCancel, onConfirm, loading = false }) => {
  if (!isOpen) return null;

  return (
    <div className="cart-modal-overlay" role="dialog" aria-modal="true">
      <div className="cart-replace-modal">
        <div className="cart-modal-icon">🍽️</div>

        <h3 className="cart-modal-title">Replace cart?</h3>

        <p className="cart-modal-message">
          Your cart contains items from another restaurant. Would you like to replace your current cart?
        </p>

        <div className="cart-modal-actions">
          <button
            type="button"
            className="cart-modal-cancel-btn"
            onClick={onCancel}
            disabled={loading}
          >
            Cancel
          </button>

          <button
            type="button"
            className="cart-modal-replace-btn"
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? "Replacing..." : "Replace Cart"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CartReplaceModal;

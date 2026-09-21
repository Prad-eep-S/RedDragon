import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../api/api";
import "./VerifyEmail.css";

const VerifyEmail = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [otp, setOtp] = useState("");

  const { email, role, requiresVerification } = location.state || {};

  // =========================================
  // VERIFY OTP / COMPLETE ACCOUNT SETUP
  // =========================================

  const handleVerify = async (e) => {
    e.preventDefault();

    setError("");
    setMessage("");

    // OTP is required only for unconfirmed users
    if (requiresVerification && !otp.trim()) {
      setError("Please enter the OTP");
      return;
    }

    try {
      setLoading(true);

      const response = await api.post("/auth/verify", {
        email,
        role,

        // Send OTP only when verification is required
        ...(requiresVerification && {
          otp: otp.trim(),
        }),
      });

      console.log("VERIFY RESPONSE:", response.data);

      setMessage(response.data.message || "Account setup successful");

      // Go to login after successful verification
      setTimeout(() => {
        navigate("/login");
      }, 1000);
    } catch (error) {
      console.error("VERIFY ERROR:", error);

      if (error.response) {
        setError(error.response.data?.message || "Verification failed");
      } else {
        setError("Network error. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  // =========================================
  // RESEND OTP
  // =========================================

  const handleResendOtp = async () => {
    setError("");
    setMessage("");

    try {
      setResending(true);

      const response = await api.post("/auth/resend-otp", {
        email,
      });

      console.log("RESEND OTP RESPONSE:", response.data);

      setMessage(response.data.message || "OTP sent successfully");
    } catch (error) {
      console.error("RESEND OTP ERROR:", error);

      if (error.response) {
        setError(error.response.data?.message || "Failed to resend OTP");
      } else {
        setError("Network error. Please try again.");
      }
    } finally {
      setResending(false);
    }
  };

  // =========================================
  // UI
  // =========================================

  return (
    <div className="verify-page">
      <div className="verify-card">
        <form onSubmit={handleVerify}>
          {/* =====================================
              NEW / UNCONFIRMED USER
             ===================================== */}

          {requiresVerification ? (
            <>
              <h1>Verify your email</h1>

              <p>Enter the verification code sent to:</p>

              <strong>{email}</strong>

              <div className="form-group">
                <label htmlFor="otp">Verification Code</label>

                <input
                  id="otp"
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="Enter 6-digit OTP"
                  maxLength={6}
                  inputMode="numeric"
                  autoComplete="one-time-code"
                />
              </div>

              <button type="submit" disabled={loading}>
                {loading ? "Verifying..." : "Verify Email"}
              </button>

              <button
                type="button"
                onClick={handleResendOtp}
                disabled={resending}
              >
                {resending ? "Sending..." : "Resend OTP"}
              </button>
            </>
          ) : (
            /* =====================================
               ALREADY CONFIRMED USER
               ===================================== */

            <>
              <h1>Email is already verified</h1>

              <p>Your email is already verified.</p>

              <button type="submit" disabled={loading}>
                {loading ? "Setting up..." : "Continue"}
              </button>
            </>
          )}

          {/* =====================================
              ERROR / SUCCESS
             ===================================== */}

          {error && <p className="error-message">{error}</p>}

          {message && <p className="success-message">{message}</p>}
        </form>
      </div>
    </div>
  );
};

export default VerifyEmail;

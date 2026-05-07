import React, { useState, useEffect } from "react";
import api from "../utils/api";
import { AuthContext } from "../context/AuthContext";
const UserDashboard = () => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [isTracking, setIsTracking] = useState(false);
  const { userInfo } = React.useContext(AuthContext);
  // Grab the mode from the user profile, default to Geo-Fenced
  const mode = userInfo?.user?.trackingMode || "Geo-Fenced";

  useEffect(() => {
    let intervalId;

    if (mode === "Remote" && isTracking) {
      // 10 minutes (Change to 10000 for 10 seconds if you want to test it quickly!)
      const PING_INTERVAL = 10 * 60 * 1000;

      const sendSilentPing = () => {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            try {
              await api.post("/attendance/ping", {
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
              });
              console.log(
                `📍 Silent Ping Sent: ${new Date().toLocaleTimeString()}`,
              );
            } catch (error) {
              console.error("Failed to send ping", error);
            }
          },
          (error) => console.error("GPS Error", error),
          { enableHighAccuracy: true },
        );
      };

      // Fire immediately on start, then loop
      sendSilentPing();
      intervalId = setInterval(sendSilentPing, PING_INTERVAL);
    }

    // Cleanup timer if they hit stop or close the page
    return () => clearInterval(intervalId);
  }, [mode, isTracking]);

  const handlePunch = async (action) => {
    setLoading(true);
    setMessage(null);
    if (!navigator.geolocation) {
      setMessage({
        type: "error",
        text: "Geolocation is not supported by your browser.",
      });
      setLoading(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const { data } = await api.post("/attendance/punch", {
            latitude: latitude,
            longitude: longitude,
            action: action,
          });
          setMessage({ type: "success", text: data.message });
        } catch (error) {
          const errMsg =
            error.response?.data?.message ||
            "An error occurred while punching.";
          setMessage({ type: "error", text: errMsg });
        } finally {
          setLoading(false);
        }
      },
      (error) => {
        setMessage({
          type: "error",
          text: "Unable to retrieve your location. Please allow location access and try again.",
        });
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 },
    );
  };
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] bg-slate-50">
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 text-center max-w-md w-full">
        {/* Universal Message Display */}
        {message && (
          <div
            className={`p-4 rounded-lg mb-6 text-sm font-medium ${
              message.type === "success"
                ? "bg-green-100 text-green-800"
                : "bg-red-100 text-red-800"
            }`}
          >
            {message.text}
          </div>
        )}

        {/* Dynamic UI Rendering based on Mode */}
        {mode === "Geo-Fenced" ? (
          <>
            {/* --- MODE A: Geo-Fenced UI --- */}
            <h1 className="text-2xl font-bold mb-2">Field Attendance</h1>
            <p className="text-slate-500 mb-8">
              We will verify your location against assigned zones.
            </p>

            <div className="flex flex-col gap-4">
              <button
                onClick={() => handlePunch("Punch In")}
                disabled={loading}
                className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all disabled:opacity-50"
              >
                {loading ? "Verifying Location..." : "Punch In"}
              </button>

              <button
                onClick={() => handlePunch("Punch Out")}
                disabled={loading}
                className="w-full py-4 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-xl transition-all disabled:opacity-50"
              >
                {loading ? "Verifying Location..." : "Punch Out"}
              </button>
            </div>
          </>
        ) : (
          <>
            {/* --- MODE B: Remote Tracking UI --- */}
            <h1 className="text-2xl font-bold mb-2">Remote Route Tracking</h1>
            <p className="text-slate-500 mb-8">
              Keep this window open. Your location will update automatically.
            </p>

            {isTracking ? (
              <div className="flex flex-col items-center gap-6">
                <div className="w-20 h-20 bg-green-500 rounded-full animate-pulse flex items-center justify-center text-white font-bold border-4 border-green-200">
                  LIVE
                </div>
                <button
                  onClick={() => setIsTracking(false)}
                  className="w-full py-4 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl"
                >
                  End Shift (Stop Tracking)
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsTracking(true)}
                className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl"
              >
                Start Shift & Tracking
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default UserDashboard;

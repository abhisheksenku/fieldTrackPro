import React, { useState } from "react";

import api from "../utils/api";

import toast from "react-hot-toast";

const ConsentGate = ({ children }) => {
  // CHECK LOCAL CONSENT
  const [hasConsented, setHasConsented] = useState(
    localStorage.getItem("fieldtrack_consent") === "true",
  );

  const handleAgree = async () => {
    try {
      // SAVE CONSENT TO BACKEND
      await api.post("/consent");

      // SAVE LOCALLY
      localStorage.setItem("fieldtrack_consent", "true");

      setHasConsented(true);

      toast.success("Consent recorded");
    } catch (error) {
      console.error(error);

      toast.error(error.response?.data?.message || "Failed to record consent");
    }
  };

  // BLOCK APP UNTIL CONSENT
  if (!hasConsented) {
    return (
      <div className="fixed inset-0 bg-slate-900 text-white p-10 flex flex-col justify-center z-[9999]">
        <div className="max-w-md mx-auto">
          {/* ICON */}
          <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-blue-500/20">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-8 w-8"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
              />

              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
          </div>

          {/* TITLE */}
          <h2 className="text-3xl font-bold mb-4">Location Privacy Consent</h2>

          {/* DESCRIPTION */}
          <div className="space-y-4 text-slate-300 mb-10">
            <p>
              FieldTrack Pro requires access to your location to provide
              automated attendance verification and operational route tracking.
            </p>

            <p className="bg-slate-800/50 p-4 rounded-lg border border-slate-700 text-sm">
              <span className="text-blue-400 font-bold">Important:</span> To
              support remote monitoring and attendance validation, this
              application may collect location data even when the application is
              minimized or running in the background.
            </p>
          </div>

          {/* ACTION */}
          <button
            onClick={handleAgree}
            className="w-full bg-blue-600 hover:bg-blue-700 py-4 rounded-xl font-bold text-lg transition-all active:scale-95 shadow-lg shadow-blue-600/30"
          >
            I Agree & Continue
          </button>

          {/* FOOTNOTE */}
          <p className="text-center text-slate-500 text-xs mt-6">
            You can revoke this permission anytime from your browser or device
            settings.
          </p>
        </div>
      </div>
    );
  }

  // ALLOW ACCESS AFTER CONSENT
  return <>{children}</>;
};

export default ConsentGate;

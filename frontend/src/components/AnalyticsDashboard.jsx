import React, { useState, useEffect } from "react";
import api from "../utils/api";
import toast from "react-hot-toast";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
} from "chart.js";

import { Bar, Doughnut } from "react-chartjs-2";

import { io } from "socket.io-client";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
);

const AnalyticsDashboard = () => {
  const [summary, setSummary] = useState(null);

  const [hourlyData, setHourlyData] = useState(null);

  const [zoneData, setZoneData] = useState(null);

  const [staleAnalytics, setStaleAnalytics] = useState(null);

  const [auditLogs, setAuditLogs] = useState([]);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);

        // SUMMARY
        const summaryRes = await api.get("/analytics/summary");

        setSummary(summaryRes.data);

        // HOURLY
        const hourlyRes = await api.get("/analytics/hourly");

        setHourlyData(hourlyRes.data);

        // ZONE ANALYTICS
        const zoneRes = await api.get("/analytics/zones");

        setZoneData(zoneRes.data);

        // STALE USERS
        const staleRes = await api.get("/analytics/stale-users");

        setStaleAnalytics(staleRes.data);

        // AUDIT LOGS
        const auditRes = await api.get("/audit-logs");

        setAuditLogs(auditRes.data);
      } catch (error) {
        console.error("Failed to fetch analytics", error);
        toast.error("Failed to fetch analytics");
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();

    // SOCKET CONNECTION
    const userInfo = JSON.parse(localStorage.getItem("userInfo"));

    const socket = io(
      import.meta.env.VITE_SOCKET_URL || "http://localhost:5000",
      {
        auth: {
          token: userInfo?.token,
        },
      },
    );

    socket.on("staleUserDetected", (data) => {
      console.log("Stale User:", data);

      setStaleAnalytics((prev) => {
        if (!prev) return prev;

        const exists = prev.users.some((u) => u._id === data.userId);

        if (exists) return prev;

        return {
          ...prev,

          count: prev.count + 1,

          users: [data, ...prev.users],
        };
      });
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  // EXPORT CSV
  const exportAnalyticsCSV = async () => {
    try {
      const response = await api.get("/attendance/export/csv", {
        responseType: "blob",
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));

      const link = document.createElement("a");

      link.href = url;

      link.setAttribute("download", `analytics-${Date.now()}.csv`);

      document.body.appendChild(link);

      link.click();

      link.remove();
      toast.success("Analytics exported successfully");
    } catch (error) {
      console.error(error);
      toast.error("Failed to export analytics");
    }
  };

  return (
    <div className="p-8 bg-slate-50 min-h-screen">
      <h1 className="text-3xl font-bold text-slate-800 mb-2">
        Analytics & Insights
      </h1>

      <p className="text-slate-500 mb-8">
        Macro-level overview of field compliance and operational timing.
      </p>

      {/* ACTIONS */}
      <div className="flex flex-wrap gap-4 mb-8">
        <button
          onClick={exportAnalyticsCSV}
          className="bg-green-600 text-white px-4 py-2 rounded-lg"
        >
          Export Analytics
        </button>
      </div>

      {loading ? (
        <div className="text-center text-slate-500 mt-20">
          Crunching the numbers...
        </div>
      ) : (
        <>
          {/* KPI CARDS */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
            {/* TOTAL EVENTS */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 border-l-4 border-l-blue-500">
              <h3 className="text-slate-500 text-sm font-bold uppercase tracking-wider mb-1">
                Total Events
              </h3>

              <div className="text-4xl font-black text-slate-800">
                {summary?.totalPunches || 0}
              </div>
            </div>

            {/* FAILURES */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 border-l-4 border-l-red-500">
              <h3 className="text-slate-500 text-sm font-bold uppercase tracking-wider mb-1">
                Total Failures
              </h3>

              <div className="text-4xl font-black text-slate-800">
                {summary?.failedPunches || 0}
              </div>
            </div>

            {/* COMPLIANCE */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 border-l-4 border-l-green-500">
              <h3 className="text-slate-500 text-sm font-bold uppercase tracking-wider mb-1">
                Compliance Rate
              </h3>

              <div className="text-4xl font-black text-slate-800">
                {summary?.complianceRate || 0}%
              </div>
            </div>

            {/* STALE USERS */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 border-l-4 border-l-yellow-500">
              <h3 className="text-slate-500 text-sm font-bold uppercase tracking-wider mb-1">
                Stale Users
              </h3>

              <div className="text-4xl font-black text-slate-800">
                {staleAnalytics?.count || 0}
              </div>
            </div>

            {/* AUDIT EVENTS */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 border-l-4 border-l-purple-500">
              <h3 className="text-slate-500 text-sm font-bold uppercase tracking-wider mb-1">
                Audit Events
              </h3>

              <div className="text-4xl font-black text-slate-800">
                {auditLogs?.logs?.length || 0}
              </div>
            </div>
          </div>

          {/* CHARTS */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* HOURLY CHART */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
              <h2 className="text-xl font-bold text-slate-800 mb-4">
                Hourly Punch Volume
              </h2>

              <div className="h-[300px]">
                <Bar
                  data={{
                    labels: hourlyData?.labels || [],

                    datasets: [
                      {
                        label: "Total Punches",

                        data: hourlyData?.data || [],

                        backgroundColor: "rgba(59, 130, 246, 0.8)",

                        borderRadius: 4,
                      },
                    ],
                  }}
                  options={{
                    responsive: true,

                    maintainAspectRatio: false,

                    plugins: {
                      legend: {
                        display: false,
                      },
                    },

                    scales: {
                      y: {
                        beginAtZero: true,

                        ticks: {
                          precision: 0,
                        },
                      },
                    },
                  }}
                />
              </div>
            </div>

            {/* ZONE COMPLIANCE */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
              <h2 className="text-xl font-bold text-slate-800 mb-4">
                Compliance by Zone
              </h2>

              <div className="h-[300px] flex justify-center">
                <Doughnut
                  data={{
                    labels: zoneData ? Object.keys(zoneData) : [],

                    datasets: [
                      {
                        label: "Successful",

                        data: zoneData
                          ? Object.values(zoneData).map((z) => z.success)
                          : [],

                        backgroundColor: "rgba(16, 185, 129, 0.8)",
                      },

                      {
                        label: "Failed",

                        data: zoneData
                          ? Object.values(zoneData).map((z) => z.failed)
                          : [],

                        backgroundColor: "rgba(239, 68, 68, 0.8)",
                      },
                    ],
                  }}
                  options={{
                    responsive: true,

                    maintainAspectRatio: false,

                    plugins: {
                      legend: {
                        position: "right",
                      },
                    },
                  }}
                />
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AnalyticsDashboard;

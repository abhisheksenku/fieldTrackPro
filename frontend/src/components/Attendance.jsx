import React, { useState, useEffect } from "react";
import api from "../utils/api";
import toast from "react-hot-toast";
const Attendance = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);

  const [totalPages, setTotalPages] = useState(1);

  const [statusFilter, setStatusFilter] = useState("");

  const [actionFilter, setActionFilter] = useState("");

  // --- MANUAL FIX STATE ---
  const [selectedLog, setSelectedLog] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editFormData, setEditFormData] = useState({ action: "", status: "" });

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        setLoading(true);

        const { data } = await api.get("/attendance/logs", {
          params: {
            page,
            limit: 10,
            search: searchTerm,
            status: statusFilter,
            action: actionFilter,
          },
        });

        setLogs(data.logs);

        setTotalPages(data.totalPages);
      } catch (error) {
        console.error("Failed to fetch logs", error);
        toast.error("Failed to load attendance logs");
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, [page, searchTerm, statusFilter, actionFilter]);

  // --- MANUAL FIX LOGIC ---
  const openEditModal = (log) => {
    setSelectedLog(log);
    setEditFormData({ action: log.action, status: log.status });
    setShowEditModal(true);
  };

  const handleManualUpdate = async (e) => {
    e.preventDefault();
    try {
      const { data } = await api.put(
        `/attendance/logs/${selectedLog._id}`,
        editFormData,
      );
      // Update local state to reflect the fix
      setLogs(logs.map((l) => (l._id === data._id ? data : l)));
      setShowEditModal(false);
      toast.success("Log updated successfully");
    } catch (error) {
      console.error("Manual correction failed", error);
      toast.error("Failed to update log. Ensure you have Editor permissions.");
    }
  };

  // --- CSV EXPORT LOGIC ---
  const exportToCSV = async () => {
    try {
      const response = await api.get("/attendance/export/csv", {
        responseType: "blob",
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));

      const link = document.createElement("a");

      link.href = url;

      link.setAttribute("download", `attendance-logs-${Date.now()}.csv`);

      document.body.appendChild(link);

      link.click();

      link.remove();
      toast.success("CSV exported successfully");
    } catch (error) {
      console.error(error);

      toast.error("CSV export failed");
    }
  };

  return (
    <div className="p-8 bg-slate-50 min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Attendance Logs</h1>
          <p className="text-slate-500 mt-1">
            Immutable record of all field attendance events.
          </p>
        </div>
        <button
          onClick={exportToCSV}
          className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-bold shadow-sm flex items-center gap-2 transition-colors"
        >
          ⬇ Export to CSV
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex flex-col md:flex-row gap-4">
          <input
            type="text"
            placeholder="Search employee..."
            value={searchTerm}
            onChange={(e) => {
              setPage(1);
              setSearchTerm(e.target.value);
            }}
            className="w-full md:w-1/3 px-4 py-2 border rounded-lg"
          />

          <select
            value={statusFilter}
            onChange={(e) => {
              setPage(1);
              setStatusFilter(e.target.value);
            }}
            className="px-4 py-2 border rounded-lg"
          >
            <option value="">All Status</option>
            <option value="Success">Success</option>
            <option value="Failed">Failed</option>
          </select>

          <select
            value={actionFilter}
            onChange={(e) => {
              setPage(1);
              setActionFilter(e.target.value);
            }}
            className="px-4 py-2 border rounded-lg"
          >
            <option value="">All Actions</option>
            <option value="Punch In">Punch In</option>
            <option value="Punch Out">Punch Out</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-100 text-slate-600 text-sm uppercase tracking-wider">
                <th className="p-4 border-b font-semibold">Timestamp</th>
                <th className="p-4 border-b font-semibold">Employee</th>
                <th className="p-4 border-b font-semibold">Action</th>
                <th className="p-4 border-b font-semibold">Zone</th>
                <th className="p-4 border-b font-semibold">Validation</th>
                <th className="p-4 border-b font-semibold">Coordinates</th>
                <th className="p-4 border-b font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="7" className="p-8 text-center text-slate-500">
                    Loading logs...
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan="7" className="p-8 text-center text-slate-500">
                    No records found.
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr
                    key={log._id}
                    className="hover:bg-slate-50 transition-colors"
                  >
                    <td className="p-4">
                      <div className="font-medium text-slate-800">
                        {new Date(log.createdAt).toLocaleDateString()}
                      </div>
                      <div className="text-sm text-slate-500">
                        {new Date(log.createdAt).toLocaleTimeString()}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="font-bold text-slate-800">
                        {log.user?.name || "Deleted User"}
                      </div>
                      <div className="text-sm text-slate-500">
                        {log.user?.email}
                      </div>
                    </td>
                    <td className="p-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold ${log.action === "Punch In" ? "bg-blue-100 text-blue-800" : "bg-slate-200 text-slate-800"}`}
                      >
                        {log.action}
                      </span>
                      {log.isEdited && (
                        <span className="ml-2 text-[10px] bg-amber-100 text-amber-700 px-1 rounded border border-amber-200 font-bold">
                          EDITED
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-slate-800">
                      {log.nearestZone?.name || "N/A"}
                    </td>
                    <td className="p-4">
                      <div className="flex flex-col">
                        <span
                          className={`font-bold ${log.status === "Success" ? "text-green-600" : "text-red-600"}`}
                        >
                          {log.status === "Success" ? "✓ Verified" : "✗ Failed"}
                        </span>
                        <span className="text-xs text-slate-500 font-mono">
                          {log.distanceMeters !== null &&
                          log.distanceMeters !== undefined
                            ? `${log.distanceMeters}m from center`
                            : "Remote Mode"}
                        </span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="text-xs font-mono text-slate-500 bg-slate-100 p-2 rounded">
                        {log.recordedLocation?.latitude?.toFixed(5)},{" "}
                        {log.recordedLocation?.longitude?.toFixed(5)}
                      </div>
                    </td>
                    <td className="p-4">
                      <button
                        onClick={() => openEditModal(log)}
                        className="bg-blue-50 text-blue-600 hover:bg-blue-100 px-3 py-1 rounded border border-blue-200 transition-colors text-xs font-bold"
                      >
                        Manual Fix
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="flex justify-center items-center gap-4 p-4">
          <button
            disabled={page === 1}
            onClick={() => setPage((prev) => prev - 1)}
            className="px-4 py-2 border rounded disabled:opacity-50"
          >
            Previous
          </button>

          <span className="font-medium">
            Page {page} of {totalPages}
          </span>

          <button
            disabled={page === totalPages}
            onClick={() => setPage((prev) => prev + 1)}
            className="px-4 py-2 border rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>

      {/* --- MANUAL FIX MODAL --- */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-xl w-full max-w-md shadow-2xl">
            <h2 className="text-2xl font-bold text-slate-800 mb-2">
              Manual Correction
            </h2>
            <p className="text-sm text-slate-500 mb-6 font-mono">
              Log ID: {selectedLog?._id}
            </p>

            <form onSubmit={handleManualUpdate} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">
                  Punch Type
                </label>
                <select
                  className="w-full border rounded-lg p-2"
                  value={editFormData.action}
                  onChange={(e) =>
                    setEditFormData({ ...editFormData, action: e.target.value })
                  }
                >
                  <option value="Punch In">Punch In</option>
                  <option value="Punch Out">Punch Out</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">
                  Status Override
                </label>
                <select
                  className="w-full border rounded-lg p-2"
                  value={editFormData.status}
                  onChange={(e) =>
                    setEditFormData({ ...editFormData, status: e.target.value })
                  }
                >
                  <option value="Success">Success (Verified)</option>
                  <option value="Failed">Failed (Out of Zone)</option>
                </select>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="w-full py-2 border rounded-lg font-bold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-full py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700"
                >
                  Save Fix
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Attendance;
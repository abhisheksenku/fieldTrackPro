import React, { useState, useEffect, useContext } from "react";

import api from "../utils/api";
import toast from "react-hot-toast";
import { AuthContext } from "../context/AuthContext";

const UserManagement = () => {
  const { userInfo } = useContext(AuthContext);

  const [users, setUsers] = useState([]);

  const [zones, setZones] = useState([]);

  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState("");

  const [page, setPage] = useState(1);

  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch users
        const userRes = await api.get("/users", {
          params: {
            page,
            limit: 10,
            search: searchTerm,
          },
        });

        // Handle paginated or non-paginated backend
        if (userRes.data.users) {
          setUsers(userRes.data.users);

          setTotalPages(userRes.data.totalPages);
        } else {
          setUsers(userRes.data);
        }

        // Fetch zones
        const zoneRes = await api.get("/zones");

        // Handle both:
        // { zones: [...] }
        // or direct array
        setZones(zoneRes.data.zones || zoneRes.data);
      } catch (error) {
        console.error("Failed to fetch users/zones", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [page, searchTerm]);

  // ROLE UPDATE
  const handleRoleChange = async (userId, newRole) => {
    try {
      await api.put(`/users/${userId}/role`, {
        role: newRole,
      });

      setUsers(
        users.map((u) =>
          u._id === userId
            ? {
                ...u,
                role: newRole,
              }
            : u,
        ),
      );

      toast.success("Role updated successfully!");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update role");
    }
  };

  // ZONE ASSIGNMENT
  const handleAssignZone = async (userId, zoneId) => {
    try {
      await api.put(`/users/${userId}/zone`, {
        assignedZone: zoneId || null,
      });

      setUsers(
        users.map((u) =>
          u._id === userId
            ? {
                ...u,
                assignedZone: zoneId
                  ? {
                      _id: zoneId,
                    }
                  : null,
              }
            : u,
        ),
      );

      toast.success("Zone assigned successfully!");
    } catch (error) {
      console.error(error);

      toast.error(error.response?.data?.message || "Failed to assign zone");
    }
  };

  // DELETE USER
  const handleDeleteUser = async (userId) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to permanently delete this user?",
    );

    if (!confirmDelete) return;

    try {
      await api.delete(`/users/${userId}`);

      setUsers(users.filter((u) => u._id !== userId));

      toast.success("User deleted successfully!");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete user");
    }
  };
  const handleTrackingModeChange = async (userId, trackingMode) => {
    try {
      await api.put(`/users/${userId}/tracking-mode`, {
        trackingMode,
      });

      setUsers(
        users.map((u) =>
          u._id === userId
            ? {
                ...u,
                trackingMode,

                assignedZone: trackingMode === "Remote" ? null : u.assignedZone,
              }
            : u,
        ),
      );

      toast.success("Tracking mode updated successfully!");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update tracking mode");
    }
  };
  return (
    <div className="p-8 bg-slate-50 min-h-screen">
      {/* HEADER */}
      <h1 className="text-3xl font-bold text-slate-800 mb-2">
        User Management
      </h1>

      <p className="text-slate-500 mb-8">
        Manage team access, assign roles, assign zones, and remove personnel.
      </p>

      {/* SEARCH */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50">
          <input
            type="text"
            placeholder="Search by Name or Email..."
            value={searchTerm}
            onChange={(e) => {
              setPage(1);

              setSearchTerm(e.target.value);
            }}
            className="w-full max-w-md px-4 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
          />
        </div>

        {/* TABLE */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-100 text-slate-600 text-sm uppercase tracking-wider">
                <th className="p-4 border-b font-semibold">Name</th>

                <th className="p-4 border-b font-semibold">Email</th>

                <th className="p-4 border-b font-semibold">Joined Date</th>

                <th className="p-4 border-b font-semibold">System Role</th>

                <th className="p-4 border-b font-semibold">Assigned Zone</th>
                <th className="p-4 border-b font-semibold">Tracking Mode</th>
                <th className="p-4 border-b font-semibold">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="7" className="p-8 text-center text-slate-500">
                    Loading users...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan="7" className="p-8 text-center text-slate-500">
                    No users found.
                  </td>
                </tr>
              ) : (
                users.map((user) => {
                  const isSelf = user._id === userInfo.user._id;

                  return (
                    <tr
                      key={user._id}
                      className="hover:bg-slate-50 transition-colors"
                    >
                      {/* NAME */}
                      <td className="p-4 font-bold text-slate-800">
                        {user.name}

                        {isSelf && (
                          <span className="text-xs font-normal bg-blue-100 text-blue-800 px-2 py-1 rounded ml-2">
                            You
                          </span>
                        )}
                      </td>

                      {/* EMAIL */}
                      <td className="p-4 text-slate-600 font-mono text-sm">
                        {user.email}
                      </td>

                      {/* DATE */}
                      <td className="p-4 text-slate-600 text-sm">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>

                      {/* ROLE */}
                      <td className="p-4">
                        <select
                          value={user.role}
                          onChange={(e) =>
                            handleRoleChange(user._id, e.target.value)
                          }
                          disabled={isSelf}
                          className={`border rounded p-1 text-sm font-semibold outline-none focus:ring-2 focus:ring-blue-500 ${
                            isSelf
                              ? "bg-slate-100 cursor-not-allowed"
                              : "bg-white cursor-pointer"
                          } ${
                            user.role === "Admin"
                              ? "text-red-600"
                              : user.role === "Editor"
                                ? "text-amber-600"
                                : "text-green-600"
                          }`}
                        >
                          <option value="Admin">Admin</option>

                          <option value="Editor">Editor</option>

                          <option value="User">User</option>
                        </select>
                      </td>

                      {/* ZONE */}
                      <td className="p-4">
                        <select
                          value={user.assignedZone?._id || ""}
                          onChange={(e) =>
                            handleAssignZone(user._id, e.target.value)
                          }
                          className="border rounded p-1 text-sm"
                        >
                          <option value="">No Zone (Remote)</option>

                          {zones.map((zone) => (
                            <option key={zone._id} value={zone._id}>
                              {zone.name}
                            </option>
                          ))}
                        </select>
                      </td>
                      {/* Tracking Mode */}
                      <td className="p-4">
                        <select
                          value={user.trackingMode || "Geo-Fenced"}
                          onChange={(e) =>
                            handleTrackingModeChange(user._id, e.target.value)
                          }
                          className="border rounded p-1 text-sm"
                        >
                          <option value="Geo-Fenced">Geo-Fenced</option>

                          <option value="Remote">Remote</option>
                        </select>
                      </td>
                      {/* DELETE */}
                      <td className="p-4">
                        <button
                          onClick={() => handleDeleteUser(user._id)}
                          disabled={isSelf}
                          className={`text-sm font-bold ${
                            isSelf
                              ? "text-slate-300 cursor-not-allowed"
                              : "text-red-500 hover:text-red-700"
                          }`}
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINATION */}
        <div className="flex justify-center items-center gap-4 p-4 border-t">
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
    </div>
  );
};

export default UserManagement;

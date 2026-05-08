import React, { useState, useEffect } from "react";
import { io } from "socket.io-client";
import api from "../utils/api";
import toast from "react-hot-toast";
import {
  MapContainer,
  TileLayer,
  Circle,
  Marker,
  Popup,
  Tooltip,
  useMap,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});
const FlyToZone = ({ selectedZone }) => {
  const map = useMap();

  useEffect(() => {
    if (selectedZone) {
      map.flyTo(
        [selectedZone.latitude, selectedZone.longitude],

        14,

        {
          duration: 1.5,
        },
      );
    }
  }, [selectedZone, map]);

  return null;
};
const successIcon = new L.Icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png",

  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",

  iconSize: [25, 41],

  iconAnchor: [12, 41],
});

const failedIcon = new L.Icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png",

  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",

  iconSize: [25, 41],

  iconAnchor: [12, 41],
});
const AdminDashboard = () => {
  const [zones, setZones] = useState([]);
  const [liveFeed, setLiveFeed] = useState([]);
  const [staleUsers, setStaleUsers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [newZoneData, setNewZoneData] = useState({
    name: "",
    latitude: "",
    longitude: "",
    radius: 200,
  });
  const [editingZone, setEditingZone] = useState(null);
  const [selectedZone, setSelectedZone] = useState(null);
  useEffect(() => {
    // Fetch zones for display
    const fetchZones = async () => {
      try {
        const res = await api.get("/zones");
        console.log(res.data);
        setZones(res.data.zones);
        if (res.data.zones.length > 0) {
          setSelectedZone(res.data.zones[0]);
        }
        const staleRes = await api.get("/attendance/stale-users");

        setStaleUsers(staleRes.data.users || []);
      } catch (error) {
        console.error("Error fetching zones:", error);
      }
    };
    fetchZones();
    // Setup Socket.IO connection for live feed
    const userInfo = JSON.parse(localStorage.getItem("userInfo"));

    const socket = io(
      import.meta.env.VITE_SOCKET_URL || "http://localhost:5000",
      {
        auth: {
          token: userInfo?.token,
        },
      },
    );
    socket.on("newAttendanceLog", (log) => {
      console.log("New attendance log received:", log);
      setLiveFeed((prev) => [log, ...prev].slice(0, 50));
    });
    socket.on("liveLocationUpdate", (data) => {
      console.log(`Live update from Remote Worker ${data.name}!`);
      // You can push this to a 'liveDrivers' state array and draw them on the map!
    });
    socket.on("staleUserDetected", (data) => {
      setStaleUsers((prev) => {
        const exists = prev.some((u) => (u._id||u.userId) === data.userId);

        if (exists) return prev;

        return [data, ...prev];
      });
    });
    return () => socket.disconnect();
  }, []);
  const handleAddZone = async (e) => {
    e.preventDefault();
    try {
      const { data } = await api.post("/zones", newZoneData);
      setZones([data.zone, ...zones]);
      setShowModal(false);
      setNewZoneData({ name: "", latitude: "", longitude: "", radius: 200 });
      toast.success("Zone added successfully");
    } catch (error) {
      console.error("Error adding zone:", error);
      toast.error(
        error.response?.data?.message ||
          "Failed to add zone. Please try again.",
      );
    }
  };
  const handleEditZone = async (e) => {
    e.preventDefault();

    try {
      const { data } = await api.put(
        `/zones/${editingZone._id}`,

        newZoneData,
      );

      setZones(zones.map((z) => (z._id === editingZone._id ? data.zone : z)));

      setShowModal(false);

      setEditingZone(null);

      setNewZoneData({
        name: "",

        latitude: "",

        longitude: "",

        radius: 200,
      });
      toast.success("Zone updated successfully");
    } catch (error) {
      console.error("Error updating zone:", error);

      toast.error(error.response?.data?.message || "Failed to update zone.");
    }
  };
  const handleDeleteZone = async (zoneId) => {
    if (!window.confirm("Are you sure you want to delete this zone?")) return;
    try {
      await api.delete(`/zones/${zoneId}`);
      setZones(zones.filter((z) => z._id !== zoneId));
      toast.success("Zone deleted successfully");
    } catch (error) {
      console.error("Error deleting zone:", error);
      toast.error(
        error.response?.data?.message ||
          "Failed to delete zone. Please try again.",
      );
    }
  };

  return (
    <div className="p-8 bg-slate-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-slate-800">
          Operations Command Center
        </h1>
        <button
          onClick={() => {
            setEditingZone(null);

            setNewZoneData({
              name: "",
              latitude: "",
              longitude: "",
              radius: 200,
            });

            setShowModal(true);
          }}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold"
        >
          + Add New Zone
        </button>
      </div>

      {/* --- TOP SECTION: THE MAP --- */}
      <div className="bg-white p-2 rounded-xl shadow-sm border border-slate-200 mb-8 z-0 relative h-[400px]">
        {/* Jodhpur roughly centered: [26.2389, 73.0243] */}
        <MapContainer
          center={[26.2389, 73.0243]}
          zoom={11}
          className="h-full w-full rounded-lg"
        >
          <TileLayer
            attribution='&copy; <a href="https://carto.com/">CartoDB</a>'
            url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          />
          <FlyToZone selectedZone={selectedZone} />
          {/* Draw the Geo-Fences */}
          {zones.map((zone) => (
            <Circle
              key={zone._id}
              center={[zone.latitude, zone.longitude]}
              radius={zone.radius}
              pathOptions={{
                color: selectedZone?._id === zone._id ? "#f97316" : "#3b82f6",

                fillColor:
                  selectedZone?._id === zone._id ? "#f97316" : "#3b82f6",

                fillOpacity: selectedZone?._id === zone._id ? 0.35 : 0.2,
              }}
            >
              <Popup>
                <b>{zone.name}</b>
                <br />
                Radius: {zone.radius}m
              </Popup>
              <Tooltip permanent direction="top">
                {zone.name}
              </Tooltip>
            </Circle>
          ))}

          {/* Draw the Live Punches */}
          {liveFeed.map((log) => {
            if (!log.recordedLocation) return null;
            return (
              <Marker
                key={log._id || `${log.user?._id}-${log.createdAt}`}
                position={[
                  log.recordedLocation.latitude,
                  log.recordedLocation.longitude,
                ]}
                icon={log.status === "Success" ? successIcon : failedIcon}
              >
                <Popup>
                  <b>{log.user?.name}</b>
                  <br />
                  {log.action}
                  <br />
                  Status:{" "}
                  <span
                    style={{
                      color: log.status === "Success" ? "green" : "red",
                    }}
                  >
                    {log.status}
                  </span>
                  <br />
                  Zone: {log.nearestZone?.name || "Unknown"}
                  <br />
                  {log.distanceMeters !== null && (
                    <>Distance: {log.distanceMeters}m</>
                  )}
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* --- BOTTOM LEFT: ZONE MANAGER --- */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h2 className="text-xl font-semibold mb-4">Active Zones</h2>
          {zones.length === 0 ? (
            <p className="text-slate-500">No zones configured.</p>
          ) : (
            <ul className="space-y-3">
              {zones.map((zone) => (
                <li
                  key={zone._id}
                  onClick={() => setSelectedZone(zone)}
                  className={`

                          p-4
                          border
                          rounded-lg
                          flex
                          justify-between
                          items-center
                          cursor-pointer
                          transition-all

                          ${
                            selectedZone?._id === zone._id
                              ? "border-blue-500 bg-blue-50"
                              : "hover:bg-slate-50"
                          }

                        `}
                >
                  <div>
                    <div className="font-bold text-slate-800">{zone.name}</div>
                    <div className="text-sm text-slate-500 font-mono">
                      {zone.latitude.toFixed(4)}, {zone.longitude.toFixed(4)} •
                      r: {zone.radius}m
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingZone(zone);

                        setNewZoneData({
                          name: zone.name,

                          latitude: zone.latitude,

                          longitude: zone.longitude,

                          radius: zone.radius,
                        });

                        setShowModal(true);
                      }}
                      className="text-blue-500 hover:text-blue-700 text-sm font-bold"
                    >
                      Edit
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteZone(zone._id);
                      }}
                      className="text-red-500 hover:text-red-700 text-sm font-bold"
                    >
                      Delete
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
        {/* --- STALE USERS --- */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-red-200">
          <h2 className="text-xl font-semibold mb-4 text-red-600 flex items-center gap-2">
            <span className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></span>
            Stale Users
          </h2>

          <div className="space-y-3 max-h-[300px] overflow-y-auto">
            {staleUsers.length === 0 ? (
              <p className="text-slate-500">No stale users detected.</p>
            ) : (
              staleUsers.map((user) => (
                <div
                  key={user._id||user.userId}
                  className="p-4 rounded-lg border border-red-200 bg-red-50"
                >
                  <div className="font-bold text-slate-800">{user.name}</div>

                  <div className="text-sm text-slate-600">{user.email}</div>

                  <div className="text-sm text-red-700 font-mono mt-1">
                    Last Ping: {new Date(user.lastPing).toLocaleString()}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
        {/* --- SELECTED ZONE DETAILS --- */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-blue-200">
          <h2 className="text-xl font-semibold mb-4 text-blue-600">
            Zone Details
          </h2>

          {!selectedZone ? (
            <p className="text-slate-500">Select a zone to view details.</p>
          ) : (
            <div className="space-y-4">
              <div>
                <div className="text-sm text-slate-500">Zone Name</div>

                <div className="text-lg font-bold text-slate-800">
                  {selectedZone.name}
                </div>
              </div>

              <div>
                <div className="text-sm text-slate-500">Coordinates</div>

                <div className="font-mono text-sm">
                  {selectedZone.latitude.toFixed(5)},{" "}
                  {selectedZone.longitude.toFixed(5)}
                </div>
              </div>

              <div>
                <div className="text-sm text-slate-500">Radius</div>

                <div className="font-bold">{selectedZone.radius} meters</div>
              </div>

              <div className="pt-2 border-t">
                <div className="text-sm text-slate-500 mb-2">
                  Recent Activity Nearby
                </div>

                <div className="space-y-2 max-h-[120px] overflow-y-auto">
                  {liveFeed
                    .filter((log) => log.nearestZone?._id === selectedZone._id)
                    .slice(0, 5)
                    .map((log) => (
                      <div
                        key={log._id || `${log.user?._id}-${log.createdAt}`}
                        className="text-sm p-2 rounded bg-slate-50 border"
                      >
                        <span className="font-bold">{log.user?.name}</span>

                        {" — "}

                        {log.action}
                      </div>
                    ))}
                </div>
              </div>
            </div>
          )}
        </div>
        {/* --- BOTTOM RIGHT: LIVE FEED --- */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h2 className="text-xl font-semibold mb-4 text-green-600 flex items-center gap-2">
            <span className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></span>{" "}
            Live Activity Feed
          </h2>
          <div className="h-[300px] overflow-y-auto space-y-3 pr-2">
            {liveFeed.length === 0 ? (
              <p className="text-slate-500">Waiting for field activity...</p>
            ) : (
              liveFeed.map((log) => (
                <div
                  key={log._id || `${log.user?._id}-${log.createdAt}`}
                  className={`p-4 rounded-lg border ${log.status === "Success" ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}`}
                >
                  <div className="font-bold text-slate-800">
                    {log.user?.name} punched {log.action.split(" ")[1]}
                  </div>
                  <div className="text-sm text-slate-600">
                    Assigned Zone: {log.nearestZone?.name || "Unknown"}
                  </div>
                  <div
                    className={`text-sm font-mono mt-1 ${
                      log.status === "Success"
                        ? "text-green-700"
                        : "text-red-700"
                    }`}
                  >
                    Status: {log.status}
                    {log.distanceMeters !== null &&
                      log.distanceMeters !== undefined && (
                        <> ({log.distanceMeters}m away)</>
                      )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* --- MODAL: ADD ZONE --- */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-xl w-full max-w-md">
            <h2 className="text-2xl font-bold mb-4">
              {editingZone ? "Edit Zone" : "Add New Zone"}
            </h2>
            <form
              onSubmit={editingZone ? handleEditZone : handleAddZone}
              className="space-y-4"
            >
              <div>
                <label className="block text-sm font-bold mb-1">
                  Zone Name
                </label>
                <input
                  type="text"
                  required
                  value={newZoneData.name}
                  onChange={(e) =>
                    setNewZoneData({ ...newZoneData, name: e.target.value })
                  }
                  className="w-full border p-2 rounded"
                  placeholder="e.g. Jodhpur Factory"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold mb-1">
                    Latitude
                  </label>
                  <input
                    type="number"
                    step="any"
                    required
                    value={newZoneData.latitude}
                    onChange={(e) =>
                      setNewZoneData({
                        ...newZoneData,
                        latitude: e.target.value,
                      })
                    }
                    className="w-full border p-2 rounded"
                    placeholder="26.2389"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold mb-1">
                    Longitude
                  </label>
                  <input
                    type="number"
                    step="any"
                    required
                    value={newZoneData.longitude}
                    onChange={(e) =>
                      setNewZoneData({
                        ...newZoneData,
                        longitude: e.target.value,
                      })
                    }
                    className="w-full border p-2 rounded"
                    placeholder="73.0243"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold mb-1">
                  Radius (Meters)
                </label>
                <input
                  type="number"
                  required
                  value={newZoneData.radius}
                  onChange={(e) =>
                    setNewZoneData({ ...newZoneData, radius: e.target.value })
                  }
                  className="w-full border p-2 rounded"
                />
              </div>
              <div className="flex gap-4 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);

                    setEditingZone(null);

                    setNewZoneData({
                      name: "",

                      latitude: "",

                      longitude: "",

                      radius: 200,
                    });
                  }}
                  className="w-full py-2 border rounded font-bold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-full py-2 bg-blue-600 text-white rounded font-bold hover:bg-blue-700"
                >
                  {editingZone ? "Update Zone" : "Save Zone"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;

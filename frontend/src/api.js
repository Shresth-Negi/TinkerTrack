const BASE_URL = "http://localhost:8000";

// Helper to make API calls
async function request(endpoint, options = {}) {
  const token = localStorage.getItem("token");

  const headers = {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.detail || "Something went wrong");
  }

  return data;
}

// Auth
export const registerUser = (name, email, password) =>
  request("/users/register", {
    method: "POST",
    body: JSON.stringify({ name, email, password }),
  });

export const loginUser = (email, password) =>
  request("/users/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });

export const getMe = () => request("/users/me");

// Resources
export const getResources = () => request("/resources/");
export const getResource = (id) => request(`/resources/${id}`);
export const createResource = (data) =>
  request("/resources/", { method: "POST", body: JSON.stringify(data) });
export const deleteResource = (id) =>
  request(`/resources/${id}`, { method: "DELETE" });
export const toggleAvailability = (id) =>
  request(`/resources/${id}/toggle-availability`, { method: "PATCH" });

// Bookings
export const createBooking = (data) =>
  request("/bookings/", { method: "POST", body: JSON.stringify(data) });
export const getMyBookings = () => request("/bookings/my");
export const cancelBooking = (id) =>
  request(`/bookings/${id}`, { method: "DELETE" });
export const getAllBookings = () => request("/bookings/all");

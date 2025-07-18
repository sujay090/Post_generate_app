import axios from "axios";

// Base API URL from environment variable or fallback
const API_URL = "https://marketing.gs3solution.us/api" 
// "https://marketing.gs3solution.us"
// "https://69.62.76.142:5000/api"
//  "https://post-generate-app.onrender.com/api"
// "https://poster-generetorapp-backend.onrender.com/api";
// Create Axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});


// Public endpoints that don’t require a token
const publicEndpoints = ["/auth/register", "/auth/login"];

// Request Interceptor for Authorization token
api.interceptors.request.use((config) => {
  if (!config.url) return config;

  const isPublic = publicEndpoints.some(
    (endpoint) => config.url.endsWith(endpoint) || config.url.includes(endpoint)
  );

  if (!isPublic) {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }

  return config;
});

// ===================== Poster APIs =====================

export const posterAPI = {
  uploadPoster: (formData) =>
    api.post("/posters/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),

  getByCategory: (category, customerId) =>
    api.post("/posters/generate", { category, customerId }),
};

// ===================== Auth APIs =====================
export const authAPI = {
  register: (data) => api.post("/auth/register", data),
  login: (data) => api.post("/auth/login", data),
  getProfile: () => api.get("/auth/profile"),
  logout: () => api.post("/auth/logout"),
};

// ===================== 👤 Customer APIs =====================
export const customerAPI = {
  add: (formData) =>
    api.post("/customers/add", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),

  getCustomers: () => api.get("/customers/"),

  getCustomer: (id) => api.get(`/customers/${id}`),

  update: (id, formData) =>
    api.put(`/customers/edit/${id}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),

  delete: (id) => api.delete(`/customers/${id}`),
};

// ===================== 🗓 Schedule APIs =====================
// export const scheduleAPI = {
//   create: (data) => api.post('/schedules/create', data),
//   getByCustomer: (customerId) => api.get(`/schedules/customer/${customerId}`),
// };
export const scheduleAPI = {
  create: (data) => api.post("/schedules/create", data),
  getByCustomer: (customerId) => api.get(`/schedules/customer/${customerId}`),
  getAll: () => api.get("/schedules/"), // Added method to get all schedules
  deleteSchedule: (id) => api.delete(`/schedules/${id}`), // Added method to delete schedule
};

// ===================== 📊 Dashboard APIs =====================
export const dashboardAPI = {
  getMetrics: () => api.get("/dashboard/"),
};

export default api;

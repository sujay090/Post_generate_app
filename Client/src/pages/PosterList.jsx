import { useEffect, useState } from "react";
import { posterAPI, customerAPI } from "../services/api";
import { toast } from "react-toastify";

const PosterList = () => {
  const [customerId, setCustomerId] = useState("");
  const [category, setCategory] = useState("");
  const [posters, setPosters] = useState([]);
  const [loading, setLoading] = useState(false);
  const [customers, setCustomers] = useState([]);
  const categories = ["Offers", "Events", "Festivals"];

  const baseUrl = "http://localhost:5000/api";

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const res = await customerAPI.getCustomers();
        setCustomers(res.data);
      } catch (err) {
        toast.error("Failed to fetch customers");
      }
    };
    fetchCustomers();
  }, []);

  const fetchPosters = async () => {
    if (!customerId || !category) {
      toast.warn("Please select both customer and category");
      return;
    }

    setLoading(true);
    try {
      const res = await posterAPI.getByCategory(
        category.toLowerCase(),
        customerId
      );
      const data = res.data;

      if (Array.isArray(data)) {
        setPosters(data);
      } else if (Array.isArray(data.posters)) {
        setPosters(data.posters);
      } else {
        setPosters([]);
        toast.error("Unexpected API response format");
      }
    } catch (err) {
      toast.error("Failed to fetch posters");
      setPosters([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (posterId) => {
    if (!window.confirm("Are you sure you want to delete this poster?")) return;

    try {
      await posterAPI.deletePoster(posterId);
      toast.success("Poster deleted successfully");
      fetchPosters(); // Refresh posters
    } catch (err) {
      toast.error("Failed to delete poster");
    }
  };
  return (
    <div className="container mx-auto mt-10 px-4">
      <h2 className="text-3xl font-bold mb-8 text-gray-800">
        📸 View Uploaded Posters
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <select
          className="border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring focus:ring-blue-200"
          value={customerId}
          onChange={(e) => setCustomerId(e.target.value)}
        >
          <option value="">Select Customer</option>
          {customers.map((cust) => (
            <option key={cust._id} value={cust._id}>
              {cust.companyName}
            </option>
          ))}
        </select>

        <select
          className="border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring focus:ring-blue-200"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          <option value="">Select Category</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>

        <button
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-md"
          onClick={fetchPosters}
          disabled={loading}
        >
          {loading ? "Loading..." : "Fetch Posters"}
        </button>
      </div>

      {Array.isArray(posters) && posters.length === 0 && !loading && (
        <p className="text-gray-500 text-center">No posters found.</p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {Array.isArray(posters) &&
          posters.map((poster) => {
            let imageUrl = poster.imageUrl.replace(/\\/g, "/");
            if (
              !imageUrl.startsWith("http://") &&
              !imageUrl.startsWith("https://")
            ) {
              imageUrl = baseUrl + imageUrl;
            }
            return (
              <div
                key={poster._id}
                className="bg-white rounded-xl overflow-hidden shadow-lg relative hover:shadow-xl transition-shadow duration-300"
              >
                <img
                  src={imageUrl}
                  alt="Poster"
                  className="w-full h-96 object-cover"
                  onError={(e) =>
                    (e.target.src =
                      "https://dummyimage.com/250x250/cccccc/000000&text=No+Image")
                  }
                />
                <div className="p-4">
                  <h5 className="text-xl font-semibold text-blue-700 mb-3">
                    {poster.category}
                  </h5>
                  {poster.customizedData && (
                    <ul className="text-gray-700 text-sm space-y-1">
                      {Object.entries(poster.customizedData).map(
                        ([key, value]) => (
                          <li
                            key={key}
                            className="pl-2 border-l-4 border-blue-500"
                          >
                            {value.value}
                          </li>
                        )
                      )}
                    </ul>
                  )}
                </div>

                <button
                  onClick={() => handleDelete(poster._id)}
                  className="absolute top-3 right-3 bg-red-500 hover:bg-red-600 text-white p-2 rounded-full shadow-md transition"
                  title="Delete Poster"
                >
                  🗑️
                </button>
              </div>
            );
          })}
      </div>
    </div>
  );
};

export default PosterList;

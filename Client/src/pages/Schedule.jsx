import { useState, useEffect } from "react";
import { redirect, useNavigate } from "react-router-dom";
import { scheduleAPI, customerAPI, posterAPI } from "../services/api";
import { toast } from "react-toastify";
import PosterViewer from "../components/PosterViewer";

const Schedule = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    customerId: "",
    schedules: [
      {
        category: "",
        posters: [],
        selectedPosterIds: [],
        date:"",
        selectedPosterUrls: [
          "https://cdn.pixabay.com/photo/2015/04/23/22/00/new-year-background-736885_1280.jpg",
        ],
      },
    ],
    customerPhoneNumber: "",
  });

  const [loading, setLoading] = useState(false);
  const [customers, setCustomers] = useState([]);
  const [selectCustomer, setselectCustomer] = useState("");
  const categories = ["Offers", "Events", "Festivals"];
  // const baseUrl = "https://poster-generetorapp-backend.onrender.com/";
  const baseUrl="https://marketing.gs3solution.us/api"

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const res = await customerAPI.getCustomers();
        setCustomers(res.data || []);
        console.log(res.data);
      } catch (error) {
        toast.error("Failed to fetch customers", { autoClose: 3000 });
      }
    };
    fetchCustomers();
  }, []);

  const handleCustomerChange = (e) => {
    const { value } = e.target;

    let _value = JSON.parse(value);
    console.log("ABC", _value);
    setselectCustomer(value);
    setFormData((prev) => ({
      ...prev,
      customerId: _value?._id,
      customerPhoneNumber: `91${_value?.whatsapp}`,
      schedules: prev.schedules.map((s) => ({
        ...s,
        posters: [],
        selectedPosterIds: [],
      })),
    }));
  };

  const handleScheduleChange = (index, field, value) => {
    const newSchedules = [...formData.schedules];
    newSchedules[index][field] = value;
    setFormData((prev) => ({ ...prev, schedules: newSchedules }));
  };

  const handlePosterSelect = (scheduleIndex, posterId) => {
    const newSchedules = [...formData.schedules];
    const selected = newSchedules[scheduleIndex].selectedPosterIds;
    const isSelected = selected.includes(posterId);

    newSchedules[scheduleIndex].selectedPosterIds = isSelected
      ? selected.filter((id) => id !== posterId)
      : [...selected, posterId];

    setFormData((prev) => ({ ...prev, schedules: newSchedules }));
  };

  const generatePosters = async (index) => {
    const sched = formData.schedules[index];
    if (!formData.customerId || !sched.category) {
      console.log("Error", formData);
      toast.warn("Please select customer and category first", {
        autoClose: 3000,
      });
      return;
    }

    const customer = customers.find((c) => c._id === formData.customerId);
    if (!customer) {
      toast.error("Customer not found.", { autoClose: 3000 });
      return;
    }

    try {
      const res = await posterAPI.getByCategory(
        sched.category.toLowerCase(),
        formData.customerId
      );
      const posters = Array.isArray(res.data.posters) ? res.data.posters : [];

      const postersWithPlaceholders = posters.map((poster) => {
        const populatedPoster = { ...poster };

        if (poster.placeholders && Array.isArray(poster.placeholders)) {
          populatedPoster.placeholders = poster.placeholders.map(
            (placeholder) => {
              const value = customer[placeholder.key] || placeholder.text || "";
              return {
                ...placeholder,
                text: value,
              };
            }
          );
        }

        return populatedPoster;
      });

      const newSchedules = [...formData.schedules];
      newSchedules[index].posters = postersWithPlaceholders;
      newSchedules[index].selectedPosterIds = [];

      setFormData((prev) => ({ ...prev, schedules: newSchedules }));
    } catch (err) {
      toast.error("Failed to fetch posters", { autoClose: 3000 });
    }
  };

  const downloadPoster = (url) => {
    const link = document.createElement("a");
    link.href = /^https?:\/\//.test(url)
      ? url
      : baseUrl + url.replace(/\\/g, "/");
    link.download = "poster.jpg";
    link.target = "_blank";
    link.click();
  };

  const addScheduleRow = () => {
    setFormData((prev) => ({
      ...prev,
      schedules: [
        ...prev.schedules,
        { category: "", posters: [], selectedPosterIds: [], date: "" },
      ],
    }));
  };

  const removeScheduleRow = (index) => {
    if (formData.schedules.length === 1) return;
    const newSchedules = formData.schedules.filter((_, i) => i !== index);
    setFormData((prev) => ({ ...prev, schedules: newSchedules }));
  };

  const validateForm = () => {
    const today = new Date().toISOString().split("T")[0];
    for (let i = 0; i < formData.schedules.length; i++) {
      const sched = formData.schedules[i];
      if (
        !sched.category ||
        !sched.date ||
        sched.selectedPosterIds.length === 0
      ) {
        toast.error(
          `Please complete all fields and select posters in schedule ${i + 1}`,
          { autoClose: 3000 }
        );
        return false;
      }
      if (sched.date < today) {
        toast.error(`Schedule date must be in the future (Row ${i + 1})`, {
          autoClose: 3000,
        });
        return false;
      }
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    const data = {
      customerId: formData.customerId,
      customerPhoneNumber: formData.customerPhoneNumber,
      schedules: formData.schedules.flatMap((s) =>
        s.selectedPosterIds.map((posterId) => ({
          posterId,
          categories: [s.category],
          dates: [s.date],
          selectedPosterUrls: s.selectedPosterUrls,
        }))
      ),
    };

    try {
      await scheduleAPI.create(data);
      toast.success("Schedule created successfully!", { autoClose: 2000 });
      navigate("/dashboard");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create schedule", {
        autoClose: 3000,
      });
    } finally {
      setLoading(false);
    }
  };
  console.log("FROM DATA", formData);
  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-bold text-primary">
          <i className="bi bi-calendar-plus text-primary mr-2" />
          Create Schedule
        </h2>
        <button
          type="button"
          onClick={addScheduleRow}
          className="text-primary hover:text-primary/80 flex items-center gap-2"
        >
          <i className="bi bi-plus-circle text-lg" />
          Add Schedule
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Customer Selector */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Customer
          </label>
          <select
            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
            value={selectCustomer}
            onChange={handleCustomerChange}
            required
          >
            <option value="">-- Select --</option>
            {customers.map((c) => (
              <option key={c._id} value={JSON.stringify(c)}>
                {c.companyName}
              </option>
            ))}
          </select>
        </div>

        {/* Schedule Rows */}
        {formData.schedules.map((sched, index) => (
          <div
            key={index}
            className="bg-white p-6 rounded-lg shadow-sm border border-gray-200"
          >
            <div className="flex justify-between items-center mb-6">
              <h4 className="font-semibold text-gray-700">
                Schedule {index + 1}
              </h4>
              {formData.schedules.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeScheduleRow(index)}
                  className="text-red-500 hover:text-red-600 hover:bg-red-50 px-2 py-1 rounded-full transition-colors"
                >
                  <i className="bi bi-trash text-sm" />
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <select
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                  value={sched.category}
                  onChange={(e) =>
                    handleScheduleChange(index, "category", e.target.value)
                  }
                  required
                >
                  <option value="">-- Select Category --</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date
                </label>
                <input
                  type="datetime-local"
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                  value={sched.date}
                  onChange={(e) =>
                    handleScheduleChange(index, "date", e.target.value)
                  }
                  required
                />
              </div>
            </div>

            <div className="flex justify-end gap-4 mt-6">
              <button
                type="button"
                onClick={() => generatePosters(index)}
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
              >
                <i className="bi bi-image text-sm mr-2" />
                Generate Posters
              </button>
            </div>

            {/* Poster Grid */}
            {sched.posters.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 mt-6">
                {sched.posters.map((poster) => {
                  let imageUrl = poster.imageUrl.replace(/\\/g, "/");
                  if (!/^https?:\/\//.test(imageUrl)) {
                    imageUrl = baseUrl + imageUrl;
                  }
                  const isSelected = sched.selectedPosterIds.includes(
                    poster._id
                  );

                  return (
                    <div
                      key={poster._id}
                      className={`relative border-2 rounded-lg overflow-hidden shadow transition-all duration-200 ${
                        isSelected ? "border-green-500" : "border-gray-200"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handlePosterSelect(index, poster._id)}
                        className="absolute top-2 left-2 w-5 h-5 accent-green-600 z-10"
                      />
                      <PosterViewer
                        poster={poster}
                        customer={customers.find(
                          (c) => c._id === formData.customerId
                        )}
                      />
                      <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 bg-black/60 text-white text-xs px-2 py-1 rounded">
                        <button
                          type="button"
                          onClick={() => downloadPoster(poster.imageUrl)}
                        >
                          ⬇ Download
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ))}

        <div className="text-center pt-6">
          <button
            type="submit"
            disabled={loading || !formData.customerId}
            className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:bg-blue-300"
          >
            {loading ? "Submitting..." : "Create Schedule"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Schedule;

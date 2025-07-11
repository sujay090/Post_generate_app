import React, { useEffect, useState } from 'react';
import { scheduleAPI } from '../services/api';
import { toast } from 'react-toastify';

const ScheduleList = () => {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [searchName, setSearchName] = useState('');

  const fetchSchedules = async () => {
    setLoading(true);
    try {
      const res = await scheduleAPI.getAll();
      setSchedules(res.data);
    } catch (error) {
      toast.error('Failed to fetch schedules');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchedules();
  }, []);

  const getStatus = (date) => {
    const today = new Date().toISOString().split('T')[0];
    if (date === today) return 'Live';
    return date > today ? 'Upcoming' : 'Expired';
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'Live':
        return 'bg-green-100 text-green-800';
      case 'Upcoming':
        return 'bg-blue-100 text-blue-800';
      case 'Expired':
        return 'bg-gray-200 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this schedule?')) return;
    try {
      await scheduleAPI.deleteSchedule(id);
      toast.success('Schedule deleted successfully');
      fetchSchedules();
    } catch (error) {
      toast.error('Failed to delete schedule');
    }
  };

  const filteredSchedules = schedules.filter((schedule) => {
    const scheduleDate = new Date(schedule.date).toISOString().split('T')[0];
    const matchesName = schedule.customerId?.companyName?.toLowerCase().includes(searchName.toLowerCase());
    const withinRange =
      (!fromDate || scheduleDate >= fromDate) &&
      (!toDate || scheduleDate <= toDate);
    return matchesName && withinRange;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Header with title and filters */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-6">
        {/* Title with icon */}
        <div className="flex items-center space-x-3">
          <div className="bg-blue-600 rounded-full p-3 text-white shadow-lg">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2v-7H3v7a2 2 0 002 2z"
              />
            </svg>
          </div>
          <h1 className="text-[10px] font-semibold text-gray-900">Poster Schedules</h1>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:space-x-4 w-full md:w-auto">
          <div className="flex flex-col flex-1 min-w-[180px]">
            <label htmlFor="searchName" className="mb-1 font-medium text-gray-700">
              Search Customer
            </label>
            <input
              id="searchName"
              type="text"
              placeholder="Enter customer name..."
              className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
              value={searchName}
              onChange={(e) => setSearchName(e.target.value)}
            />
          </div>

          <div className="flex flex-col min-w-[140px]">
            <label htmlFor="fromDate" className="mb-1 font-medium text-gray-700">
              From Date
            </label>
            <input
              id="fromDate"
              type="date"
              className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
            />
          </div>

          <div className="flex flex-col min-w-[140px]">
            <label htmlFor="toDate" className="mb-1 font-medium text-gray-700">
              To Date
            </label>
            <input
              id="toDate"
              type="date"
              className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
            />
          </div>

          <button
            className="bg-gray-600 text-white rounded-md px-5 py-2 hover:bg-gray-700 transition mt-4 sm:mt-0"
            onClick={() => {
              setFromDate('');
              setToDate('');
              setSearchName('');
            }}
          >
            Reset
          </button>
        </div>
      </div>

      {/* Table Section */}
      {loading ? (
        <div className="text-center py-10">
          <div className="w-8 h-8 border-4 border-blue-500 border-dashed rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading schedules...</p>
        </div>
      ) : filteredSchedules.length === 0 ? (
        <p className="text-gray-500">No schedules found for the selected criteria.</p>
      ) : (
        <div className="overflow-x-auto shadow rounded-lg border border-gray-200">
          <table className="w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-blue-600 text-white">
              <tr>
                <th className="px-4 py-3 text-left font-semibold">Customer</th>
                <th className="px-4 py-3 text-left font-semibold">Category</th>
                <th className="px-4 py-3 text-left font-semibold">Date</th>
                <th className="px-4 py-3 text-left font-semibold">Poster</th>
                <th className="px-4 py-3 text-left font-semibold">Status</th>
                <th className="px-4 py-3 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {filteredSchedules.map((schedule) => {
                const status = getStatus(schedule.date);
                return (
                  <tr key={schedule._id}>
                    <td className="px-4 py-2">{schedule.customerId?.companyName || 'N/A'}</td>
                    <td className="px-4 py-2">{schedule.category}</td>
                    <td className="px-4 py-2">{schedule.date.toLocaleString()}</td>
                    <td className="px-4 py-2">{schedule.posterId?.title || 'N/A'}</td>
                    <td className="px-4 py-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusClass(status)}`}>
                        {status}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-right">
                      <button
                        className="text-red-600 hover:underline text-sm"
                        onClick={() => handleDelete(schedule._id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ScheduleList;

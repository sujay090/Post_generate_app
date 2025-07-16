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
        return 'bg-green-100 text-green-800 border-green-200';
      case 'Upcoming':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Expired':
        return 'bg-gray-100 text-gray-600 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-600 border-gray-200';
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 py-4 sm:py-6 lg:py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="bg-gradient-to-br from-slate-800/90 via-blue-900/50 to-slate-700/90 backdrop-blur-sm rounded-xl sm:rounded-2xl shadow-2xl border border-blue-500/30 p-3 sm:p-4 lg:p-6 mb-4 lg:mb-6">
          <div className="flex flex-col space-y-4 lg:flex-row lg:items-center lg:justify-between lg:space-y-0 lg:gap-6">
            {/* Title with icon */}
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg sm:rounded-xl p-2 sm:p-3 text-white shadow-md flex-shrink-0">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 sm:h-6 sm:w-6"
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
              <div className="min-w-0 flex-1">
                <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-white truncate">Schedules</h1>
                <p className="text-xs sm:text-sm text-gray-300 hidden sm:block">Manage campaigns</p>
              </div>
            </div>

            {/* Filters */}
            <div className="w-full lg:w-auto">
              {/* Mobile filters - stacked layout */}
              <div className="space-y-3 lg:hidden">
                <div className="flex flex-col">
                  <label htmlFor="searchName" className="mb-1 text-xs font-medium text-gray-300 flex items-center">
                    <svg className="h-3 w-3 mr-1 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    Search
                  </label>
                  <input
                    id="searchName"
                    type="text"
                    placeholder="Customer name..."
                    className="border border-blue-400/30 bg-slate-800/50 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-400 transition-all duration-200 shadow-sm w-full text-sm placeholder-gray-400"
                    value={searchName}
                    onChange={(e) => setSearchName(e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="flex flex-col">
                    <label htmlFor="fromDate" className="mb-1 text-xs font-medium text-gray-300 flex items-center">
                      <svg className="h-3 w-3 mr-1 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2v-7H3v7a2 2 0 002 2z" />
                      </svg>
                      From
                    </label>
                    <input
                      id="fromDate"
                      type="date"
                      className="border border-blue-400/30 bg-slate-800/50 text-white rounded-lg px-2 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-400 transition-all duration-200 shadow-sm text-xs"
                      value={fromDate}
                      onChange={(e) => setFromDate(e.target.value)}
                    />
                  </div>

                  <div className="flex flex-col">
                    <label htmlFor="toDate" className="mb-1 text-xs font-medium text-gray-300 flex items-center">
                      <svg className="h-3 w-3 mr-1 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2v-7H3v7a2 2 0 002 2z" />
                      </svg>
                      To
                    </label>
                    <input
                      id="toDate"
                      type="date"
                      className="border border-blue-400/30 bg-slate-800/50 text-white rounded-lg px-2 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-400 transition-all duration-200 shadow-sm text-xs"
                      value={toDate}
                      onChange={(e) => setToDate(e.target.value)}
                    />
                  </div>
                </div>

                {/* Mobile Reset Button */}
                <button
                  className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-lg px-4 py-2 font-medium transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center space-x-2 text-sm w-full"
                  onClick={() => {
                    setFromDate('');
                    setToDate('');
                    setSearchName('');
                  }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  <span>Reset</span>
                </button>
              </div>

              {/* Desktop filters - horizontal layout */}
              <div className="hidden lg:flex lg:items-end lg:space-x-3">
                <div className="flex flex-col flex-1 min-w-[180px]">
                  <label htmlFor="searchNameDesktop" className="mb-1 text-sm font-medium text-gray-300 flex items-center">
                    <svg className="h-4 w-4 mr-1 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    Search
                  </label>
                  <input
                    id="searchNameDesktop"
                    type="text"
                    placeholder="Customer name..."
                    className="border border-blue-400/30 bg-slate-800/50 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-400 transition-all duration-200 shadow-sm text-sm placeholder-gray-400"
                    value={searchName}
                    onChange={(e) => setSearchName(e.target.value)}
                  />
                </div>

                <div className="flex flex-col min-w-[130px]">
                  <label htmlFor="fromDateDesktop" className="mb-1 text-sm font-medium text-gray-300 flex items-center">
                    <svg className="h-4 w-4 mr-1 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2v-7H3v7a2 2 0 002 2z" />
                    </svg>
                    From
                  </label>
                  <input
                    id="fromDateDesktop"
                    type="date"
                    className="border border-blue-400/30 bg-slate-800/50 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-400 transition-all duration-200 shadow-sm text-sm"
                    value={fromDate}
                    onChange={(e) => setFromDate(e.target.value)}
                  />
                </div>

                <div className="flex flex-col min-w-[130px]">
                  <label htmlFor="toDateDesktop" className="mb-1 text-sm font-medium text-gray-300 flex items-center">
                    <svg className="h-4 w-4 mr-1 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2v-7H3v7a2 2 0 002 2z" />
                    </svg>
                    To
                  </label>
                  <input
                    id="toDateDesktop"
                    type="date"
                    className="border border-blue-400/30 bg-slate-800/50 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-400 transition-all duration-200 shadow-sm text-sm"
                    value={toDate}
                    onChange={(e) => setToDate(e.target.value)}
                  />
                </div>

                {/* Desktop Reset Button */}
                <button
                  className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-lg px-4 py-2 font-medium transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center space-x-2 text-sm self-end"
                  onClick={() => {
                    setFromDate('');
                    setToDate('');
                    setSearchName('');
                  }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  <span>Reset</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Table Section */}
        {loading ? (
          <div className="bg-gradient-to-br from-slate-800/90 via-purple-900/50 to-slate-700/90 backdrop-blur-sm rounded-2xl shadow-2xl border border-purple-500/30 p-8 sm:p-12">
            <div className="text-center">
              <div className="relative mx-auto mb-6">
                <div className="w-12 h-12 sm:w-16 sm:h-16 border-4 border-blue-400/30 border-t-purple-400 rounded-full animate-spin"></div>
                <div className="absolute inset-0 w-12 h-12 sm:w-16 sm:h-16 border-4 border-transparent border-r-indigo-400 rounded-full animate-spin animation-delay-150"></div>
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-white mb-2">Loading Schedules</h3>
              <p className="text-sm sm:text-base text-gray-300">Fetching your scheduled campaigns...</p>
            </div>
          </div>
        ) : filteredSchedules.length === 0 ? (
          <div className="bg-gradient-to-br from-slate-800/90 via-purple-900/50 to-slate-700/90 backdrop-blur-sm rounded-2xl shadow-2xl border border-purple-500/30 p-8 sm:p-12">
            <div className="text-center">
              <div className="bg-purple-900/30 rounded-full p-4 sm:p-6 w-16 h-16 sm:w-24 sm:h-24 mx-auto mb-6 flex items-center justify-center border border-blue-400/30">
                <svg className="w-8 h-8 sm:w-12 sm:h-12 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2v-7H3v7a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-white mb-2">No schedules found</h3>
              <p className="text-sm sm:text-base text-gray-300 mb-6">No schedules match the selected criteria. Try adjusting your filters or create a new schedule.</p>
              <button className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-xl font-medium hover:from-purple-700 hover:to-indigo-700 transition-all duration-200 text-sm sm:text-base shadow-lg hover:shadow-xl">
                Create Schedule
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-gradient-to-br from-slate-800/90 via-purple-900/50 to-slate-700/90 backdrop-blur-sm rounded-2xl shadow-2xl border border-purple-500/30 overflow-hidden">
            {/* Table Stats */}
            <div className="bg-gradient-to-r from-purple-900/50 to-indigo-900/50 px-4 sm:px-6 py-3 sm:py-4 border-b border-purple-500/30">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
                <div className="flex items-center space-x-3 sm:space-x-4">
                  <div className="bg-purple-600 rounded-lg p-2 text-white flex-shrink-0">
                    <svg className="h-4 w-4 sm:h-5 sm:w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-white text-sm sm:text-base">Schedule Overview</h3>
                    <p className="text-xs sm:text-sm text-gray-300">{filteredSchedules.length} schedule(s) found</p>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs sm:text-sm">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 sm:w-3 sm:h-3 bg-green-500 rounded-full"></div>
                    <span className="text-gray-300">Live: {filteredSchedules.filter(s => getStatus(s.date) === 'Live').length}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 sm:w-3 sm:h-3 bg-blue-500 rounded-full"></div>
                    <span className="text-gray-300">Upcoming: {filteredSchedules.filter(s => getStatus(s.date) === 'Upcoming').length}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 sm:w-3 sm:h-3 bg-gray-400 rounded-full"></div>
                    <span className="text-gray-300">Expired: {filteredSchedules.filter(s => getStatus(s.date) === 'Expired').length}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Mobile Cards View */}
            <div className="lg:hidden divide-y divide-purple-500/20">
              {filteredSchedules.map((schedule, index) => {
                const status = getStatus(schedule.date);
                return (
                  <div key={schedule._id} className="p-4 hover:bg-purple-900/20 transition-all duration-200">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-3 flex-1 min-w-0">
                        <div className="flex-shrink-0 h-10 w-10 bg-gradient-to-br from-purple-600/30 to-indigo-600/30 rounded-xl flex items-center justify-center border border-blue-400/30">
                          <span className="text-purple-200 font-bold text-sm">
                            {schedule.customerId?.companyName?.charAt(0)?.toUpperCase() || 'N'}
                          </span>
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="text-sm font-medium text-white truncate">{schedule.customerId?.companyName || 'N/A'}</div>
                          <div className="text-xs text-gray-400">Customer</div>
                        </div>
                      </div>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold border ${getStatusClass(status)} flex-shrink-0`}>
                        {status === 'Live' && (
                          <div className="w-1.5 h-1.5 bg-green-600 rounded-full mr-1 animate-pulse"></div>
                        )}
                        {status === 'Upcoming' && (
                          <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mr-1"></div>
                        )}
                        {status === 'Expired' && (
                          <div className="w-1.5 h-1.5 bg-gray-500 rounded-full mr-1"></div>
                        )}
                        {status}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3 mb-3">
                      <div>
                        <div className="text-xs text-gray-400 mb-1">Category</div>
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-purple-600/20 to-indigo-600/20 text-purple-200 border border-blue-400/30">
                          {schedule.category === 'Offers' && '🎯'} 
                          {schedule.category === 'Events' && '🎪'} 
                          {schedule.category === 'Festivals' && '🎉'} 
                          {schedule.category}
                        </span>
                      </div>
                      <div>
                        <div className="text-xs text-gray-400 mb-1">Date</div>
                        <div className="text-sm text-white">
                          {new Date(schedule.date).toLocaleDateString('en-US', { 
                            month: 'short', 
                            day: 'numeric'
                          })}
                        </div>
                      </div>
                    </div>

                    <div className="mb-3">
                      <div className="text-xs text-gray-400 mb-1">Poster</div>
                      <div className="text-sm text-white truncate">{schedule.posterId?.title || 'N/A'}</div>
                    </div>

                    <div className="flex justify-end">
                      <button
                        className="text-red-400 hover:text-red-300 font-medium hover:bg-red-900/20 px-3 py-2 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-slate-900 text-sm border border-red-500/30 hover:border-red-400/50"
                        onClick={() => handleDelete(schedule._id)}
                      >
                        <svg className="h-4 w-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        Delete
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Desktop Table View */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full divide-y divide-purple-500/30">
                <thead className="bg-gradient-to-r from-purple-800 to-indigo-800">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-white tracking-wider">Customer</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-white tracking-wider">Category</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-white tracking-wider">Date & Time</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-white tracking-wider">Poster</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-white tracking-wider">Status</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-white tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-gradient-to-br from-slate-800/60 to-purple-900/40 divide-y divide-purple-500/20">
                  {filteredSchedules.map((schedule, index) => {
                    const status = getStatus(schedule.date);
                    return (
                      <tr key={schedule._id} className={`hover:bg-purple-800/30 transition-all duration-200 ${index % 2 === 0 ? 'bg-slate-800/40' : 'bg-purple-900/20'}`}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10 bg-gradient-to-br from-purple-600/30 to-indigo-600/30 rounded-xl flex items-center justify-center mr-4 border border-blue-400/30">
                              <span className="text-purple-200 font-bold text-sm">
                                {schedule.customerId?.companyName?.charAt(0)?.toUpperCase() || 'N'}
                              </span>
                            </div>
                            <div>
                              <div className="text-sm font-medium text-white">{schedule.customerId?.companyName || 'N/A'}</div>
                              <div className="text-sm text-gray-400">Customer</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-purple-600/20 to-indigo-600/20 text-purple-200 border border-blue-400/30">
                            {schedule.category === 'Offers' && '🎯'} 
                            {schedule.category === 'Events' && '🎪'} 
                            {schedule.category === 'Festivals' && '🎉'} 
                            {schedule.category}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-white">
                            {new Date(schedule.date).toLocaleDateString('en-US', { 
                              year: 'numeric', 
                              month: 'short', 
                              day: 'numeric'
                            })}
                          </div>
                          <div className="text-sm text-gray-400">
                            {new Date(schedule.date).toLocaleTimeString('en-US', { 
                              hour: '2-digit', 
                              minute: '2-digit'
                            })}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                          {schedule.posterId?.title || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${getStatusClass(status)}`}>
                            {status === 'Live' && (
                              <div className="w-2 h-2 bg-green-600 rounded-full mr-2 animate-pulse"></div>
                            )}
                            {status === 'Upcoming' && (
                              <div className="w-2 h-2 bg-blue-600 rounded-full mr-2"></div>
                            )}
                            {status === 'Expired' && (
                              <div className="w-2 h-2 bg-gray-500 rounded-full mr-2"></div>
                            )}
                            {schedule.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                          <button
                            className="text-red-400 hover:text-red-300 font-medium hover:bg-red-900/20 px-3 py-2 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-slate-900 border border-red-500/30 hover:border-red-400/50"
                            onClick={() => handleDelete(schedule._id)}
                          >
                            <svg className="h-4 w-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            Delete
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ScheduleList;

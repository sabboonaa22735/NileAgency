import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiSearch, FiFilter, FiDownload, FiChevronLeft, FiChevronRight,
  FiChevronUp, FiChevronDown, FiEdit, FiTrash2, FiEye, FiMoreVertical,
  FiCheck, FiX, FiClock, FiAlertCircle
} from 'react-icons/fi';

export default function DataTable({ 
  data = [], 
  columns = [],
  darkMode = true,
  onView,
  onEdit,
  onDelete,
  searchable = true,
  pagination = true,
  actions = true,
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [selectedRows, setSelectedRows] = useState(new Set());
  const [filterOpen, setFilterOpen] = useState(false);

  const textPrimary = darkMode ? 'text-slate-100' : 'text-slate-900';
  const textSecondary = darkMode ? 'text-slate-400' : 'text-slate-600';
  const textMuted = darkMode ? 'text-slate-500' : 'text-slate-400';
  const bgCard = darkMode ? 'bg-slate-800/50' : 'bg-white';
  const bgCardHover = darkMode ? 'hover:bg-slate-700/30' : 'hover:bg-slate-50';
  const borderColor = darkMode ? 'border-slate-700/50' : 'border-slate-200';
  const borderSubtle = darkMode ? 'border-slate-800' : 'border-slate-100';

  const filteredData = data.filter(item => {
    if (!searchQuery) return true;
    return Object.values(item).some(val => 
      String(val).toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const sortedData = [...filteredData].sort((a, b) => {
    if (!sortConfig.key) return 0;
    const aVal = a[sortConfig.key];
    const bVal = b[sortConfig.key];
    if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
    if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
    return 0;
  });

  const totalPages = Math.ceil(sortedData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = sortedData.slice(startIndex, startIndex + itemsPerPage);

  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const toggleSelectAll = () => {
    if (selectedRows.size === paginatedData.length) {
      setSelectedRows(new Set());
    } else {
      setSelectedRows(new Set(paginatedData.map((_, i) => startIndex + i)));
    }
  };

  const toggleSelectRow = (index) => {
    const newSelected = new Set(selectedRows);
    if (newSelected.has(index)) {
      newSelected.delete(index);
    } else {
      newSelected.add(index);
    }
    setSelectedRows(newSelected);
  };

  const getStatusBadge = (status) => {
    const styles = {
      active: darkMode ? 'bg-emerald-500/20 text-emerald-400' : 'bg-emerald-100 text-emerald-700',
      pending: darkMode ? 'bg-amber-500/20 text-amber-400' : 'bg-amber-100 text-amber-700',
      approved: darkMode ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-100 text-blue-700',
      rejected: darkMode ? 'bg-red-500/20 text-red-400' : 'bg-red-100 text-red-700',
      inactive: darkMode ? 'bg-slate-500/20 text-slate-400' : 'bg-slate-100 text-slate-700',
    };
    const style = styles[status?.toLowerCase()] || styles.pending;
    return (
      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${style}`}>
        {status || 'N/A'}
      </span>
    );
  };

  const getRoleBadge = (role) => {
    const styles = {
      admin: darkMode ? 'bg-purple-500/20 text-purple-400' : 'bg-purple-100 text-purple-700',
      recruiter: darkMode ? 'bg-emerald-500/20 text-emerald-400' : 'bg-emerald-100 text-emerald-700',
      employee: darkMode ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-100 text-blue-700',
    };
    const style = styles[role?.toLowerCase()] || styles.employee;
    return (
      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${style}`}>
        {role || 'unverified'}
      </span>
    );
  };

  const displayColumns = columns.length > 0 ? columns : [
    { key: 'email', label: 'Email', sortable: true },
    { key: 'role', label: 'Role', sortable: true, render: getRoleBadge },
    { key: 'registrationStatus', label: 'Status', sortable: true, render: getStatusBadge },
    { key: 'createdAt', label: 'Created', sortable: true, render: (val) => new Date(val).toLocaleDateString() },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={`rounded-2xl border ${borderColor} ${bgCard} backdrop-blur-xl overflow-hidden`}
    >
      <div className={`p-4 border-b ${borderColor} flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4`}>
        <div className="flex items-center gap-3">
          {searchable && (
            <div className={`relative ${darkMode ? 'bg-slate-700/50' : 'bg-slate-100'} rounded-xl overflow-hidden`}>
              <FiSearch className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${textMuted}`} />
              <input 
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className={`h-10 pl-10 pr-4 bg-transparent outline-none ${textPrimary} placeholder:${textMuted} w-48 sm:w-64`}
              />
            </div>
          )}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setFilterOpen(!filterOpen)}
            className={`p-2.5 rounded-xl ${darkMode ? 'hover:bg-slate-700' : 'hover:bg-slate-100'} transition`}
          >
            <FiFilter className={`w-5 h-5 ${textSecondary}`} />
          </motion.button>
        </div>
        
        <div className="flex items-center gap-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl ${
              darkMode ? 'hover:bg-slate-700 text-slate-300' : 'hover:bg-slate-100 text-slate-600'
            } transition`}
          >
            <FiDownload className="w-4 h-4" />
            <span className="text-sm font-medium">Export</span>
          </motion.button>
          
          {selectedRows.size > 0 && (
            <motion.button
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl ${
                darkMode ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30' : 'bg-red-100 text-red-600 hover:bg-red-200'
              } transition`}
            >
              <FiTrash2 className="w-4 h-4" />
              <span className="text-sm font-medium">Delete ({selectedRows.size})</span>
            </motion.button>
          )}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className={`border-b ${borderColor}`}>
              <th className="p-4 text-left">
                <input 
                  type="checkbox"
                  checked={selectedRows.size === paginatedData.length && paginatedData.length > 0}
                  onChange={toggleSelectAll}
                  className={`w-4 h-4 rounded ${darkMode ? 'accent-indigo-500' : 'accent-indigo-600'}`}
                />
              </th>
              {displayColumns.map((col) => (
                <th 
                  key={col.key}
                  className={`p-4 text-left cursor-pointer select-none ${textSecondary} text-sm font-medium`}
                  onClick={() => col.sortable && handleSort(col.key)}
                >
                  <div className="flex items-center gap-1">
                    {col.label}
                    {col.sortable && (
                      <span className="text-xs">
                        {sortConfig.key === col.key ? (
                          sortConfig.direction === 'asc' ? <FiChevronUp /> : <FiChevronDown />
                        ) : (
                          <FiChevronUp className="opacity-30" />
                        )}
                      </span>
                    )}
                  </div>
                </th>
              ))}
              {actions && (
                <th className={`p-4 text-right ${textSecondary} text-sm font-medium`}>
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {paginatedData.length === 0 ? (
              <tr>
                <td colSpan={displayColumns.length + 2} className="p-8 text-center">
                  <div className={`${textMuted}`}>No data found</div>
                </td>
              </tr>
            ) : (
              paginatedData.map((item, index) => (
                <motion.tr
                  key={item._id || index}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.03 }}
                  className={`border-b ${borderSubtle} ${bgCardHover} transition`}
                >
                  <td className="p-4">
                    <input 
                      type="checkbox"
                      checked={selectedRows.has(startIndex + index)}
                      onChange={() => toggleSelectRow(startIndex + index)}
                      className={`w-4 h-4 rounded ${darkMode ? 'accent-indigo-500' : 'accent-indigo-600'}`}
                    />
                  </td>
                  {displayColumns.map((col) => (
                    <td key={col.key} className="p-4">
                      {col.render ? col.render(item[col.key], item) : (
                        <span className={textPrimary}>{item[col.key] || '-'}</span>
                      )}
                    </td>
                  ))}
                  {actions && (
                    <td className="p-4">
                      <div className="flex items-center justify-end gap-1">
                        {onView && (
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => onView(item)}
                            className={`p-2 rounded-lg ${darkMode ? 'hover:bg-slate-700 text-blue-400' : 'hover:bg-indigo-50 text-indigo-600'} transition`}
                            title="View"
                          >
                            <FiEye className="w-4 h-4" />
                          </motion.button>
                        )}
                        {onEdit && (
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => onEdit(item)}
                            className={`p-2 rounded-lg ${darkMode ? 'hover:bg-slate-700 text-amber-400' : 'hover:bg-amber-50 text-amber-600'} transition`}
                            title="Edit"
                          >
                            <FiEdit className="w-4 h-4" />
                          </motion.button>
                        )}
                        {onDelete && (
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => onDelete(item._id)}
                            className={`p-2 rounded-lg ${darkMode ? 'hover:bg-slate-700 text-red-400' : 'hover:bg-red-50 text-red-600'} transition`}
                            title="Delete"
                          >
                            <FiTrash2 className="w-4 h-4" />
                          </motion.button>
                        )}
                      </div>
                    </td>
                  )}
                </motion.tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {pagination && totalPages > 1 && (
        <div className={`p-4 border-t ${borderColor} flex flex-col sm:flex-row items-center justify-between gap-4`}>
          <div className={`text-sm ${textMuted}`}>
            Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, sortedData.length)} of {sortedData.length} results
          </div>
          <div className="flex items-center gap-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className={`p-2 rounded-lg ${darkMode ? 'hover:bg-slate-700 disabled:opacity-50' : 'hover:bg-slate-100 disabled:opacity-50'} transition`}
            >
              <FiChevronLeft className={`w-4 h-4 ${textSecondary}`} />
            </motion.button>
            
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let page;
              if (totalPages <= 5) {
                page = i + 1;
              } else if (currentPage <= 3) {
                page = i + 1;
              } else if (currentPage >= totalPages - 2) {
                page = totalPages - 4 + i;
              } else {
                page = currentPage - 2 + i;
              }
              return (
                <motion.button
                  key={page}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setCurrentPage(page)}
                  className={`w-8 h-8 rounded-lg text-sm font-medium transition ${
                    currentPage === page 
                      ? darkMode ? 'bg-indigo-600 text-white' : 'bg-indigo-600 text-white'
                      : darkMode ? 'hover:bg-slate-700 text-slate-400' : 'hover:bg-slate-100 text-slate-600'
                  }`}
                >
                  {page}
                </motion.button>
              );
            })}
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className={`p-2 rounded-lg ${darkMode ? 'hover:bg-slate-700 disabled:opacity-50' : 'hover:bg-slate-100 disabled:opacity-50'} transition`}
            >
              <FiChevronRight className={`w-4 h-4 ${textSecondary}`} />
            </motion.button>
          </div>
        </div>
      )}
    </motion.div>
  );
}
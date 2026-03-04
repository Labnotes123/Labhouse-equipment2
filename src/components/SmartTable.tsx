"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import {
  Search,
  Download,
  Settings,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  GripVertical,
} from "lucide-react";

export interface Column<T> {
  key: keyof T | string;
  label: string;
  width?: number;
  minWidth?: number;
  sortable?: boolean;
  filterable?: boolean;
  render?: (item: T) => React.ReactNode;
  dateFilter?: boolean;
}

interface SmartTableProps<T> {
  data: T[];
  columns: Column<T>[];
  keyField: keyof T;
  pageSizeOptions?: number[];
  defaultPageSize?: number;
  onExport?: (data: T[]) => void;
  showSettings?: boolean;
  settingsKey?: string;
}

export function SmartTable<T>({
  data,
  columns,
  keyField,
  pageSizeOptions = [5, 10, 15, 20],
  defaultPageSize = 10,
  onExport,
  showSettings = true,
  settingsKey,
}: SmartTableProps<T>) {
  // Column visibility and order
  const [columnConfig, setColumnConfig] = useState<{ key: string; visible: boolean; order: number }[]>(() => {
    if (settingsKey) {
      const saved = localStorage.getItem(`table_settings_${settingsKey}`);
      if (saved) {
        try {
          const savedConfig = JSON.parse(saved) as { key: string; visible: boolean; order: number }[];
          // Merge saved config with current columns to ensure all columns are present
          const savedKeys = new Set(savedConfig.map(c => c.key));
          const mergedConfig = [...savedConfig];
          columns.forEach((col, idx) => {
            if (!savedKeys.has(String(col.key))) {
              mergedConfig.push({ key: String(col.key), visible: true, order: idx });
            }
          });
          return mergedConfig;
        } catch {
          // ignore
        }
      }
    }
    return columns.map((col, idx) => ({
      key: String(col.key),
      visible: true,
      order: idx,
    }));
  });

  // Save column config when changed
  useEffect(() => {
    if (settingsKey) {
      localStorage.setItem(`table_settings_${settingsKey}`, JSON.stringify(columnConfig));
    }
  }, [columnConfig, settingsKey]);

  // Filter values
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [dateRange, setDateRange] = useState<Record<string, { start: string; end: string }>>({});

  // Sorting
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(defaultPageSize);

  // Settings panel
  const [showSettingsPanel, setShowSettingsPanel] = useState(false);

  // Column resize
  const [resizingColumn, setResizingColumn] = useState<string | null>(null);
  const [columnWidths, setColumnWidths] = useState<Record<string, number>>({});
  const tableRef = useRef<HTMLDivElement>(null);

  // Get visible columns with order
  const visibleColumns = useMemo(() => {
    const configMap = new Map(columnConfig.map((c) => [c.key, c]));
    return columns
      .map((col) => ({
        ...col,
        config: configMap.get(String(col.key)),
      }))
      .filter((col) => col.config?.visible)
      .sort((a, b) => (a.config?.order ?? 0) - (b.config?.order ?? 0));
  }, [columns, columnConfig]);

  // Filter and sort data
  const filteredData = useMemo(() => {
    let result = [...data];

    // Apply filters
    Object.entries(filters).forEach(([key, value]) => {
      if (value && key !== "_all_") {
        result = result.filter((item) => {
          const val = (item as Record<string, unknown>)[key];
          if (val == null) return false;
          return String(val).toLowerCase().includes(value.toLowerCase());
        });
      }
    });

    // Apply global search
    if (filters["_all_"]) {
      const searchTerm = filters["_all_"].toLowerCase();
      result = result.filter((item) => {
        return Object.values(item as Record<string, unknown>).some((val) => {
          if (val == null) return false;
          return String(val).toLowerCase().includes(searchTerm);
        });
      });
    }

    // Apply date range filters
    Object.entries(dateRange).forEach(([key, range]) => {
      if (range.start || range.end) {
        result = result.filter((item) => {
          const val = (item as Record<string, unknown>)[key];
          if (!val) return false;
          const itemDate = new Date(String(val));
          if (isNaN(itemDate.getTime())) return true;
          if (range.start && itemDate < new Date(range.start)) return false;
          if (range.end && itemDate > new Date(range.end)) return false;
          return true;
        });
      }
    });

    // Apply sorting
    if (sortKey) {
      result.sort((a, b) => {
        const aVal = (a as Record<string, unknown>)[sortKey];
        const bVal = (b as Record<string, unknown>)[sortKey];

        if (aVal == null && bVal == null) return 0;
        if (aVal == null) return 1;
        if (bVal == null) return -1;

        let comparison = 0;
        if (typeof aVal === "string" && typeof bVal === "string") {
          comparison = aVal.localeCompare(bVal);
        } else if (typeof aVal === "number" && typeof bVal === "number") {
          comparison = aVal - bVal;
        } else {
          comparison = String(aVal).localeCompare(String(bVal));
        }

        return sortOrder === "asc" ? comparison : -comparison;
      });
    }

    return result;
  }, [data, filters, dateRange, sortKey, sortOrder]);

  // Paginate
  const totalPages = Math.ceil(filteredData.length / pageSize);
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredData.slice(start, start + pageSize);
  }, [filteredData, currentPage, pageSize]);

  // Reset page when filters change
  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect */
    if (currentPage !== 1) {
      setCurrentPage(1);
    }
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [filters, dateRange, pageSize, sortKey, sortOrder, currentPage]);

  // Handle sort
  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortOrder("asc");
    }
  };

  // Handle column resize
  const handleMouseDown = (e: React.MouseEvent, key: string) => {
    e.preventDefault();
    setResizingColumn(key);
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (resizingColumn && tableRef.current) {
        const rect = tableRef.current.getBoundingClientRect();
        const headerRow = tableRef.current.querySelector("thead");
        if (!headerRow) return;
        
        const headers = Array.from(headerRow.querySelectorAll("th"));
        const targetIndex = visibleColumns.findIndex(c => String(c.key) === resizingColumn);
        if (targetIndex === -1 || targetIndex >= headers.length) return;
        
        const targetHeader = headers[targetIndex];
        const headerRect = targetHeader.getBoundingClientRect();
        const newWidth = e.clientX - headerRect.left;
        
        if (newWidth > 50) {
          setColumnWidths((prev) => ({ ...prev, [resizingColumn]: newWidth }));
        }
      }
    };

    const handleMouseUp = () => {
      setResizingColumn(null);
    };

    if (resizingColumn) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [resizingColumn, visibleColumns]);

  // Handle export
  const handleExport = () => {
    if (onExport) {
      onExport(filteredData);
    } else {
      // Default CSV export
      const headers = visibleColumns.map((col) => col.label);
      const rows = filteredData.map((item) =>
        visibleColumns.map((col) => {
          const val = (item as Record<string, unknown>)[String(col.key)];
          return val != null ? String(val) : "";
        })
      );

      const csvContent = [
        headers.join(","),
        ...rows.map((row) => row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(",")),
      ].join("\n");

      const blob = new Blob(["\ufeff" + csvContent], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `export_${new Date().toISOString().split("T")[0]}.csv`;
      link.click();
    }
  };

  // Toggle column visibility
  const toggleColumn = (key: string) => {
    setColumnConfig((prev) =>
      prev.map((c) => (c.key === key ? { ...c, visible: !c.visible } : c))
    );
  };

  // Drag and drop column reordering
  const [draggedColumn, setDraggedColumn] = useState<string | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<string | null>(null);

  const handleDragStart = (e: React.DragEvent, key: string) => {
    setDraggedColumn(key);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent, key: string) => {
    e.preventDefault();
    setDragOverColumn(key);
  };

  const handleDragEnd = () => {
    if (draggedColumn && dragOverColumn && draggedColumn !== dragOverColumn) {
      const draggedOrder = columnConfig.find((c) => c.key === draggedColumn)?.order ?? 0;
      const dropOrder = columnConfig.find((c) => c.key === dragOverColumn)?.order ?? 0;

      setColumnConfig((prev) =>
        prev.map((c) => {
          if (c.key === draggedColumn) {
            return { ...c, order: dropOrder };
          }
          if (c.key === dragOverColumn) {
            return { ...c, order: draggedOrder };
          }
          // Shift others
          if (draggedOrder < dropOrder) {
            if (c.order > draggedOrder && c.order <= dropOrder) {
              return { ...c, order: c.order - 1 };
            }
          } else {
            if (c.order >= dropOrder && c.order < draggedOrder) {
              return { ...c, order: c.order + 1 };
            }
          }
          return c;
        })
      );
    }
    setDraggedColumn(null);
    setDragOverColumn(null);
  };

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Tìm kiếm..."
            value={filters["_all_"] || ""}
            onChange={(e) => setFilters((prev) => ({ ...prev, "_all_": e.target.value }))}
            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm"
          />
        </div>
        <div className="flex items-center gap-2">
          {showSettings && (
            <div className="relative">
              <button
                onClick={() => setShowSettingsPanel(!showSettingsPanel)}
                className="px-3 py-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 flex items-center gap-2"
              >
                <Settings size={16} />
                <span className="text-sm">Cấu hình</span>
              </button>

              {showSettingsPanel && (
                <div className="absolute right-0 top-full mt-2 w-72 bg-white rounded-xl border border-slate-200 shadow-lg z-50">
                  <div className="p-3 border-b border-slate-100">
                    <h3 className="font-medium text-slate-800">Cấu hình cột</h3>
                    <p className="text-xs text-slate-500">Kéo thả để sắp xếp</p>
                  </div>
                  <div className="p-2 max-h-64 overflow-y-auto">
                    {columnConfig.map((col) => {
                      const column = columns.find((c) => String(c.key) === col.key);
                      return (
                        <div
                          key={col.key}
                          draggable
                          onDragStart={(e) => handleDragStart(e, col.key)}
                          onDragOver={(e) => handleDragOver(e, col.key)}
                          onDragEnd={handleDragEnd}
                          className={`flex items-center gap-2 p-2 rounded-lg cursor-move hover:bg-slate-50 ${
                            dragOverColumn === col.key ? "bg-purple-50 border border-purple-200" : ""
                          }`}
                        >
                          <GripVertical size={14} className="text-slate-400" />
                          <input
                            type="checkbox"
                            checked={col.visible}
                            onChange={() => toggleColumn(col.key)}
                            className="rounded border-slate-300"
                          />
                          <span className="text-sm text-slate-700 flex-1">
                            {column?.label || col.key}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
          <button
            onClick={handleExport}
            className="px-3 py-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 flex items-center gap-2"
          >
            <Download size={16} />
            <span className="text-sm">Xuất Excel</span>
          </button>
        </div>
      </div>

      {/* Table */}
      <div ref={tableRef} className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                {visibleColumns.map((col) => (
                  <th
                    key={String(col.key)}
                    className={`px-4 py-3 text-left text-sm font-semibold text-slate-700 border-b border-slate-200 relative ${
                      col.sortable !== false ? "cursor-pointer select-none hover:bg-slate-100" : ""
                    }`}
                    style={{
                      width: columnWidths[String(col.key)] || col.width || "auto",
                      minWidth: col.minWidth || 100,
                    }}
                    onClick={() => col.sortable !== false && handleSort(String(col.key))}
                  >
                    <div className="flex items-center gap-2">
                      {col.sortable !== false && sortKey === String(col.key) && (
                        <span className="text-purple-600">
                          {sortOrder === "asc" ? "↑" : "↓"}
                        </span>
                      )}
                      <span>{col.label}</span>
                    </div>
                    {/* Resize handle */}
                    <div
                      className="absolute right-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-purple-300"
                      onMouseDown={(e) => handleMouseDown(e, String(col.key))}
                    />
                  </th>
                ))}
              </tr>
              {/* Filter row */}
              <tr className="bg-slate-50/50">
                {visibleColumns.map((col) => (
                  <th key={`filter-${String(col.key)}`} className="px-4 py-2 border-b border-slate-200">
                    {col.filterable !== false && (
                      col.dateFilter ? (
                        <div className="flex items-center gap-1">
                          <input
                            type="date"
                            value={dateRange[String(col.key)]?.start || ""}
                            onChange={(e) =>
                              setDateRange((prev) => ({
                                ...prev,
                                [String(col.key)]: {
                                  ...prev[String(col.key)],
                                  start: e.target.value,
                                },
                              }))
                            }
                            className="w-full px-2 py-1 text-xs border border-slate-200 rounded"
                            placeholder="Từ ngày"
                          />
                          <span className="text-slate-400">-</span>
                          <input
                            type="date"
                            value={dateRange[String(col.key)]?.end || ""}
                            onChange={(e) =>
                              setDateRange((prev) => ({
                                ...prev,
                                [String(col.key)]: {
                                  ...prev[String(col.key)],
                                  end: e.target.value,
                                },
                              }))
                            }
                            className="w-full px-2 py-1 text-xs border border-slate-200 rounded"
                            placeholder="Đến ngày"
                          />
                        </div>
                      ) : (
                        <input
                          type="text"
                          placeholder={`Lọc ${col.label}...`}
                          value={filters[String(col.key)] || ""}
                          onChange={(e) =>
                            setFilters((prev) => ({
                              ...prev,
                              [String(col.key)]: e.target.value,
                            }))
                          }
                          className="w-full px-2 py-1 text-xs border border-slate-200 rounded"
                        />
                      )
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedData.map((item) => (
                <tr key={String(item[keyField])} className="hover:bg-slate-50">
                  {visibleColumns.map((col) => (
                    <td
                      key={String(col.key)}
                      className="px-4 py-3 text-sm text-slate-700"
                      style={{
                        width: columnWidths[String(col.key)] || col.width || "auto",
                      }}
                    >
                      {col.render
                        ? col.render(item)
                        : String((item as Record<string, unknown>)[String(col.key)] ?? "")}
                    </td>
                  ))}
                </tr>
              ))}
              {paginatedData.length === 0 && (
                <tr>
                  <td
                    colSpan={visibleColumns.length}
                    className="px-4 py-12 text-center text-slate-500"
                  >
                    Không có dữ liệu
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-4 py-3 border-t border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-600">Hiển thị</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="px-2 py-1 border border-slate-200 rounded text-sm"
            >
              {pageSizeOptions.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
            <span className="text-sm text-slate-600">/ {filteredData.length} dòng</span>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
              className="p-1.5 rounded hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronsLeft size={16} />
            </button>
            <button
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 1}
              className="p-1.5 rounded hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft size={16} />
            </button>

            <span className="px-3 text-sm text-slate-600">
              Trang {currentPage} / {totalPages || 1}
            </span>

            <button
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage === totalPages || totalPages === 0}
              className="p-1.5 rounded hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight size={16} />
            </button>
            <button
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage === totalPages || totalPages === 0}
              className="p-1.5 rounded hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronsRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Close settings panel when clicking outside */}
      {showSettingsPanel && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowSettingsPanel(false)}
        />
      )}
    </div>
  );
}

import re

with open("src/components/tabs/TrainingModal.tsx", "r", encoding="utf-8") as f:
    text = f.read()

# 1. Imports
text = text.replace("import type { Device, TrainingPlan, TrainingDocument, TrainingResult, TrainingTrainee, UserProfile, AttachedFile } from \"@/lib/mockData\";", "import type { Device, TrainingPlan, TrainingDocument, TrainingResult, TrainingTrainee, UserProfile, AttachedFile } from \"@/lib/mockData\";\nimport { SmartTable, Column } from \"@/components/SmartTable\";\nimport { useToast } from \"@/contexts/ToastContext\";")

# 2. Add toast to props
toast_str = """
  const handleEditPlan = (plan: TrainingPlan) => {
"""
toast_rep = """
  const { success } = useToast();
  const handleEditPlan = (plan: TrainingPlan) => {
"""
text = text.replace(toast_str, toast_rep)

# 3. Columns for plans
columns_def = """  const filteredPlans = useMemo(() => {
    let filtered = trainingPlans.filter((p) => p.deviceId === device.id);
"""
columns_rep = """
  const planColumns: Column<TrainingPlan>[] = [
    { key: "planCode", label: "Mã PDT", filterable: true, sortable: true },
    { key: "title", label: "Tên chương trình", filterable: true, sortable: true },
    { key: "type", label: "Loại đào tạo", filterable: true, sortable: true },
    { 
      key: "startDate", 
      label: "Thời gian", 
      filterable: true, 
      sortable: true,
      render: (item) => `${item.startDate} - ${item.endDate}`
    },
    { key: "instructor", label: "Giảng viên", filterable: true, sortable: true },
    { 
      key: "status", 
      label: "Trạng thái", 
      filterable: true, 
      sortable: true,
      render: (item) => {
        let badgeClass = "bg-slate-100 text-slate-700";
        if (item.status === "Chờ duyệt") badgeClass = "bg-amber-100 text-amber-700";
        if (item.status === "Đã duyệt") badgeClass = "bg-blue-100 text-blue-700";
        if (item.status === "Hoàn thành") badgeClass = "bg-emerald-100 text-emerald-700";
        if (item.status === "Hủy") badgeClass = "bg-red-100 text-red-700";
        return <span className={`px-2 py-1 rounded-full text-xs font-medium ${badgeClass}`}>{item.status}</span>;
      }
    },
    {
      key: "actions",
      label: "Thao tác",
      width: 140,
      render: (item) => (
        <div className="flex justify-center gap-2">
          {item.status === "Nháp" && (
            <button
              onClick={() => handleEditPlan(item)}
              className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"
              title="Chỉnh sửa"
            >
              <Edit size={16} />
            </button>
          )}
          <button
            onClick={() => handleViewPlan(item)}
            className="p-1.5 text-purple-600 hover:bg-purple-50 rounded"
            title="Xem chi tiết"
          >
            <Eye size={16} />
          </button>
          {item.status === "Chờ duyệt" && (
            <button
              onClick={() => {
                const updated = trainingPlans.map(p => p.id === item.id ? { ...p, status: "Đã duyệt" as const } : p);
                onPlansChange(updated);
                success("Đã phê duyệt kế hoạch đào tạo. Đã gửi email thông báo cho học viên.");
              }}
              className="p-1.5 text-green-600 hover:bg-green-50 rounded"
              title="Phê duyệt"
            >
              <Check size={16} />
            </button>
          )}
        </div>
      )
    }
  ];

  const docColumns: Column<TrainingDocument>[] = [
    { key: "documentCode", label: "Mã tài liệu", filterable: true, sortable: true },
    { key: "documentName", label: "Tên tài liệu", filterable: true, sortable: true },
    { 
       key: "documentType", 
       label: "Loại", 
       filterable: true, 
       sortable: true,
       render: (item) => (
          <span className="px-2 py-1 bg-slate-100 text-slate-700 text-xs font-medium rounded-full">{item.documentType}</span>
       )
    },
    { key: "uploadedBy", label: "Người báo cáo", filterable: true, sortable: true },
    { key: "uploadDate", label: "Ngày tải", filterable: true, sortable: true },
    {
      key: "actions",
      label: "Thao tác",
      width: 120,
      render: (item) => (
        <div className="flex justify-center gap-2">
          <button
            onClick={() => {
               setViewingDoc(item);
               setShowDocViewer(true);
            }}
            className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded"
            title="Xem đính kèm"
          >
            <Eye size={16} />
          </button>
          <a
            href={item.file.url}
            download={item.file.name}
            className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded"
            title="Tải đính kèm"
          >
            <Download size={16} />
          </a>
        </div>
      )
    }
  ];
  
  const filteredPlans = useMemo(() => {
    let filtered = trainingPlans.filter((p) => p.deviceId === device.id);
"""
text = text.replace(columns_def, columns_rep)

# Smart Table Replace List Plan
old_table_plan = """<div className="overflow-x-auto border border-slate-200 rounded-xl">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="px-4 py-3 text-left font-medium text-slate-700">Mã PDT</th>
                      <th className="px-4 py-3 text-left font-medium text-slate-700">Tên chương trình</th>
                      <th className="px-4 py-3 text-left font-medium text-slate-700">Loại đào tạo</th>
                      <th className="px-4 py-3 text-left font-medium text-slate-700">Thời gian</th>
                      <th className="px-4 py-3 text-left font-medium text-slate-700">Giảng viên</th>
                      <th className="px-4 py-3 text-left font-medium text-slate-700">Trạng thái</th>
                      <th className="px-4 py-3 text-right font-medium text-slate-700">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {paginatedPlans.length > 0 ? (
                      paginatedPlans.map((plan) => (
                        <tr key={plan.id} className="hover:bg-slate-50 transition-colors">
                          <td className="px-4 py-3 font-medium text-indigo-600">{plan.planCode}</td>
                          <td className="px-4 py-3 text-slate-800">{plan.title}</td>
                          <td className="px-4 py-3 text-slate-600">{plan.type}</td>
                          <td className="px-4 py-3 text-slate-600">
                            {plan.startDate} {plan.endDate ? `đến ${plan.endDate}` : ""}
                          </td>
                          <td className="px-4 py-3 text-slate-600">{plan.instructor}</td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              plan.status === "Nháp" ? "bg-slate-100 text-slate-700" :
                              plan.status === "Chờ duyệt" ? "bg-amber-100 text-amber-700" :
                              plan.status === "Đã duyệt" ? "bg-blue-100 text-blue-700" :
                              plan.status === "Hoàn thành" ? "bg-emerald-100 text-emerald-700" :
                              "bg-red-100 text-red-700"
                            }`}>
                              {plan.status}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <div className="flex items-center justify-end gap-2">
                              {plan.status === "Nháp" && (
                                <button onClick={() => handleEditPlan(plan)} className="p-1 hover:bg-slate-200 rounded text-slate-600" title="Chỉnh sửa">
                                  <Edit size={16} />
                                </button>
                              )}
                              <button onClick={() => handleViewPlan(plan)} className="p-1 hover:bg-slate-200 rounded text-slate-600" title="Xem chi tiết">
                                <Eye size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={7} className="px-4 py-8 text-center text-slate-500">
                          Không tìm thấy kế hoạch đào tạo nào
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-slate-600">Hiển thị</span>
                  <select
                    value={pagination.pageSize}
                    onChange={(e) => setPagination((prev) => ({ ...prev, pageSize: Number(e.target.value), page: 1 }))}
                    className="px-2 py-1 border border-slate-200 rounded-lg text-sm"
                  >
                    {[5, 10, 20, 50].map(size => (
                      <option key={size} value={size}>{size} dòng</option>
                    ))}
                  </select>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setPagination(prev => ({ ...prev, page: 1 }))}
                    disabled={pagination.page === 1}
                    className="p-1 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-50"
                  >
                    <ChevronLeft size={16} />
                    <ChevronLeft size={16} className="-ml-3" />
                  </button>
                  <button
                    onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                    disabled={pagination.page === 1}
                    className="p-1 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-50"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <span className="text-sm text-slate-600 px-2">
                    Trang {pagination.page} / {Math.max(1, totalPages)}
                  </span>
                  <button
                    onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                    disabled={pagination.page >= totalPages}
                    className="p-1 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-50"
                  >
                    <ChevronRight size={16} />
                  </button>
                  <button
                    onClick={() => setPagination(prev => ({ ...prev, page: totalPages }))}
                    disabled={pagination.page >= totalPages}
                    className="p-1 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-50"
                  >
                    <ChevronRight size={16} />
                    <ChevronRight size={16} className="-ml-3" />
                  </button>
                </div>
              </div>"""

new_table_plan = """<div className="overflow-x-auto border border-slate-200 rounded-xl">
                <SmartTable
                    data={filteredPlans}
                    columns={planColumns}
                    keyField="id"
                    settingsKey={`device_${device.id}_training_plans`}
                    defaultPageSize={10}
                  />
              </div>"""

text = text.replace(old_table_plan, new_table_plan)

# Smart Table Replace Docs
old_table_docs = """<div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium text-slate-700">Mã tài liệu</th>
                    <th className="px-4 py-3 text-left font-medium text-slate-700">Tên tài liệu</th>
                    <th className="px-4 py-3 text-left font-medium text-slate-700">Loại</th>
                    <th className="px-4 py-3 text-left font-medium text-slate-700">Mô tả</th>
                    <th className="px-4 py-3 text-left font-medium text-slate-700">Người tải lên</th>
                    <th className="px-4 py-3 text-left font-medium text-slate-700">Ngày tải</th>
                    <th className="px-4 py-3 text-right font-medium text-slate-700">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredDocs.length > 0 ? (
                    filteredDocs.map((doc) => (
                      <tr key={doc.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-4 py-3 font-medium text-indigo-600">{doc.documentCode}</td>
                        <td className="px-4 py-3 text-slate-800">{doc.documentName}</td>
                        <td className="px-4 py-3">
                          <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded-lg text-xs font-medium border border-slate-200">
                            {doc.documentType}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-slate-600 truncate max-w-xs" title={doc.description}>{doc.description}</td>
                        <td className="px-4 py-3 text-slate-600">{doc.uploadedBy}</td>
                        <td className="px-4 py-3 text-slate-600">{doc.uploadDate}</td>
                        <td className="px-4 py-3 text-right flex items-center justify-end gap-2">
                          <button onClick={() => { setViewingDoc(doc); setShowDocViewer(true); }} className="p-1 hover:bg-slate-200 rounded text-slate-600" title="Xem đính kèm">
                            <Eye size={16} />
                          </button>
                          <a href={doc.file.url} download={doc.file.name} className="p-1 hover:bg-slate-200 rounded text-slate-600" title="Tải đính kèm">
                            <Download size={16} />
                          </a>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr><td colSpan={7} className="px-4 py-8 text-center text-slate-500">Chưa có tài liệu nào</td></tr>
                  )}
                </tbody>
              </table>
            </div>"""

new_table_docs = """<div className="overflow-x-auto">
               <SmartTable
                  data={filteredDocs}
                  columns={docColumns}
                  keyField="id"
                  settingsKey={`device_${device.id}_training_docs`}
                  defaultPageSize={10}
               />
            </div>"""

text = text.replace(old_table_docs, new_table_docs)

# Add class changes
text = text.replace("max-w-6xl", "max-w-[98vw] xl:max-w-[1600px]")
text = text.replace("min-h-[80vh]", "min-h-[90vh]")
text = text.replace('alert("Đã lưu kết quả đào tạo!");', 'success(`Thiết bị ${device.name} đã đủ điều kiện và sẵn sàng phục vụ Xét nghiệm! Các nhân viên "Đạt" đã được cấp quyền.`);\n      setTimeout(() => {\n           success(`Thiết bị ${device.name} đã sẵn sàng`);\n      }, 300);')
text = text.replace('alert(`Gửi đề xuất đào tạo ${code} thành công!`);', 'success(`Gửi đề xuất đào tạo ${code} thành công! Trạng thái: Chờ duyệt.`);\n')

with open("src/components/tabs/TrainingModal.tsx", "w", encoding="utf-8") as f:
    f.write(text)


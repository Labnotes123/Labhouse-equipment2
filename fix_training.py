import re

with open("src/components/tabs/TrainingModal.tsx", "r", encoding="utf-8") as f:
    text = f.read()

# Make backup
with open("src/components/tabs/TrainingModal.tsx.bak", "w", encoding="utf-8") as f:
    f.write(text)

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

# 3. Size of modal
text = text.replace("max-w-6xl", "max-w-[98vw] xl:max-w-[1600px]")
text = text.replace("min-h-[80vh]", "min-h-[90vh]")

# 4. Columns for plans
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

# 5. Smart table overrides

# Plan Table Override
plan_table_pattern = r'<div className="overflow-x-auto border border-slate-200 rounded-xl">[\s\S]*?(?:</div>\s*</div>|{/\* List Mode \*/})'
plan_replacement = """<div className="px-4 pb-4">
                  <SmartTable
                    data={filteredPlans}
                    columns={planColumns}
                    keyField="id"
                    settingsKey={`device_${device.id}_training_plans`}
                    defaultPageSize={10}
                  />
                </div>
              </div>
"""
text = re.sub(r'<div className="overflow-x-auto border border-slate-200 rounded-xl">.*?<table className="w-full text-sm">.*?(?:<div className="flex items-center justify-between mt-4 text-sm text-slate-500">.*?</div>|<div className="flex items-center justify-between text-sm mt-4">.*?</div>)?.*?</div>', plan_replacement, text, count=1, flags=re.DOTALL)


# Fix Toast missing in save
text = text.replace('alert("Đã lưu kết quả đào tạo!");', 'success(`Thiết bị ${device.name} đã đủ điều kiện và sẵn sàng phục vụ Xét nghiệm! Các nhân viên "Đạt" đã được cấp quyền.`);')
text = text.replace('alert(`Gửi đề xuất đào tạo ${code} thành công!`);', 'success(`Gửi đề xuất đào tạo ${code} thành công! Trạng thái: Chờ duyệt.`);\n')

# Doc Table override
doc_table_pattern = r'<table className="w-full text-sm">[\s\S]*?</table>'
doc_table_replacement = """
<SmartTable
   data={filteredDocs}
   columns={docColumns}
   keyField="id"
   settingsKey={`device_${device.id}_training_docs`}
   defaultPageSize={10}
/>
"""

if "Tên tài liệu" in text:
    text = re.sub(doc_table_pattern, doc_table_replacement, text, count=1)


with open("src/components/tabs/TrainingModal.tsx", "w", encoding="utf-8") as f:
    f.write(text)


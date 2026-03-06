import re

with open("src/components/tabs/CalibrationModal.tsx", "r", encoding="utf-8") as f:
    content = f.read()

# 1. Add import
if "import { SmartTable" not in content:
    content = content.replace(
        'import { Device, MOCK_USERS_LIST, AttachedFile } from "@/lib/mockData";',
        'import { Device, MOCK_USERS_LIST, AttachedFile } from "@/lib/mockData";\nimport { SmartTable, Column } from "@/components/SmartTable";'
    )

# 2. Add columns definition right before return (
cols_def = """  // Define columns for SmartTable

  const requestColumns: Column<CalibrationRequest>[] = [
    { key: "requestCode", label: "Mã yêu cầu", sortable: true, filterable: true, render: (item) => <span className="font-mono text-purple-600">{item.requestCode}</span> },
    { key: "deviceName", label: "Tên thiết bị", sortable: true, filterable: true },
    { key: "deviceCode", label: "Mã thiết bị", sortable: true, filterable: true },
    { key: "serialNumber", label: "Serial", sortable: true, filterable: true },
    { key: "content", label: "Nội dung", sortable: true, filterable: true },
    {
      key: "status",
      label: "Trạng thái",
      sortable: true,
      filterable: true,
      render: (item) => (
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${
            item.status === "Hoàn thành"
              ? "bg-green-100 text-green-700"
              : item.status === "Chờ duyệt"
              ? "bg-yellow-100 text-yellow-700"
              : item.status === "Đã duyệt"
              ? "bg-blue-100 text-blue-700"
              : "bg-slate-100 text-slate-700"
          }`}
        >
          {item.status}
        </span>
      ),
    },
    {
      key: "actions",
      label: "Thao tác",
      sortable: false,
      filterable: false,
      render: (item) => (
        <div className="flex justify-center gap-2">
          <button className="p-1.5 text-purple-600 hover:bg-purple-50 rounded" title="Xem chi tiết">
            <Eye size={16} />
          </button>
          <button className="p-1.5 text-red-600 hover:bg-red-50 rounded" title="Xuất PDF">
            <FileText size={16} />
          </button>
          {item.status === "Chờ duyệt" && (
            <button className="p-1.5 text-green-600 hover:bg-green-50 rounded" title="Phê duyệt">
              <CheckCircle2 size={16} />
            </button>
          )}
        </div>
      ),
    },
  ];

  const scheduleColumns: Column<CalibrationSchedule>[] = [
    { key: "deviceCode", label: "Mã thiết bị", sortable: true, filterable: true },
    { key: "type", label: "Nội dung", sortable: true, filterable: true },
    { key: "scheduledDate", label: "Ngày dự kiến", sortable: true, filterable: true, dateFilter: true },
    { key: "assignedTo", label: "Người phụ trách", sortable: true, filterable: true },
    {
      key: "status",
      label: "Trạng thái",
      sortable: true,
      filterable: true,
      render: (item) => (
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${
            item.status === "Đã hoàn thành"
              ? "bg-green-100 text-green-700"
              : item.status === "Quá hạn"
              ? "bg-red-100 text-red-700"
              : "bg-yellow-100 text-yellow-700"
          }`}
        >
          {item.status}
        </span>
      ),
    },
    {
      key: "actions",
      label: "Thao tác",
      sortable: false,
      filterable: false,
      render: (item) => (
        <div className="flex justify-center gap-2">
          <button className="p-1.5 text-blue-600 hover:bg-blue-50 rounded">
            <Eye size={16} />
          </button>
        </div>
      ),
    },
  ];

  const resultColumns: Column<CalibrationResult>[] = [
    { key: "resultCode", label: "Mã kết quả", sortable: true, filterable: true, render: (item) => <span className="font-mono text-purple-600">{item.resultCode}</span> },
    { key: "deviceCode", label: "Mã thiết bị", sortable: true, filterable: true },
    { key: "executionUnit", label: "Đơn vị thực hiện", sortable: true, filterable: true },
    { key: "executionDate", label: "Ngày thực hiện", sortable: true, filterable: true, dateFilter: true },
    {
      key: "conclusion",
      label: "Kết quả",
      sortable: true,
      filterable: true,
      render: (item) => (
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${
            item.conclusion === "Đạt" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
          }`}
        >
          {item.conclusion}
        </span>
      ),
    },
    {
      key: "actions",
      label: "Thao tác",
      sortable: false,
      filterable: false,
      render: (item) => (
        <div className="flex justify-center gap-2">
          <button className="p-1.5 text-blue-600 hover:bg-blue-50 rounded">
            <Eye size={16} />
          </button>
        </div>
      ),
    },
  ];

  if (!show || !device) return null;"""

content = content.replace("  if (!show || !device) return null;", cols_def)

# 3. Replace tables with SmartTable
import re

# Request table
req_table_pattern = re.compile(r'<div className="overflow-x-auto border border-slate-200 rounded-xl">.*?</button>\s*</div>\s*</td>\s*</tr>\s*\)\)\s*\)\}\s*</tbody>\s*</table>\s*</div>', re.DOTALL)
req_smart_table = """<div className="mt-4">
                    <SmartTable
                      data={calibrationRequests.filter((r) => r.deviceId === device.id)}
                      columns={requestColumns}
                      keyField="id"
                      settingsKey={`device_${device.id}_cal_requests`}
                      defaultPageSize={5}
                    />
                  </div>"""

content = req_table_pattern.sub(req_smart_table, content)

# Schedule table
sched_table_pattern = re.compile(r'<div className="overflow-x-auto border border-slate-200 rounded-xl">.*?</button>\s*</td>\s*</tr>\s*\)\)\}\s*</tbody>\s*</table>\s*</div>', re.DOTALL)

sched_smart_table = """<div className="mt-4">
                  <SmartTable
                    data={calibrationSchedules.filter((s) => s.deviceId === device.id)}
                    columns={scheduleColumns}
                    keyField="id"
                    settingsKey={`device_${device.id}_cal_schedules`}
                    defaultPageSize={5}
                  />
                </div>"""

# Replace ONLY the FIRST occurrence mathematically which is Schedule, but the text is identical so wait..
# Actually the regex will match the first DIV overflow.
# But I can do exact string replacements if regex is too risky. Let me save the script and test that it works.

with open("src/components/tabs/CalibrationModal.tsx", "w", encoding="utf-8") as f:
    f.write(content)


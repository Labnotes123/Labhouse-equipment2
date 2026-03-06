import re

with open("src/components/tabs/CalibrationModal.tsx", "r", encoding="utf-8") as f:
    text = f.read()

# Replace Request Table (around line 542 - 608)
req_start = '<div className="overflow-x-auto border border-slate-200 rounded-xl">'
req_end = '</table>\n                  </div>'
req_idx1 = text.find(req_start)
req_idx2 = text.find(req_end, req_idx1) + len(req_end)

req_replacement = """<div className="mt-4">
                    <SmartTable
                      data={calibrationRequests.filter((r) => r.deviceId === device.id)}
                      columns={requestColumns}
                      keyField="id"
                      settingsKey={`device_${device.id}_cal_requests`}
                      defaultPageSize={5}
                    />
                  </div>"""

if req_idx1 != -1 and req_idx2 != -1:
    text = text[:req_idx1] + req_replacement + text[req_idx2:]

# Now replace Schedule Table (around line 942)
sched_start = '<div className="overflow-x-auto border border-slate-200 rounded-xl">'
sched_idx1 = text.find(sched_start) # this will be the currently first one since req_start was replaced
sched_end = '</table>\n                </div>'
sched_idx2 = text.find(sched_end, sched_idx1) + len(sched_end)

sched_replacement = """<div className="mt-4">
                  <SmartTable
                    data={calibrationSchedules.filter((s) => s.deviceId === device.id)}
                    columns={scheduleColumns}
                    keyField="id"
                    settingsKey={`device_${device.id}_cal_schedules`}
                    defaultPageSize={5}
                  />
                </div>"""

if sched_idx1 != -1 and sched_idx2 != -1:
    text = text[:sched_idx1] + sched_replacement + text[sched_idx2:]

# Now replace Result Table
res_start = '<div className="overflow-x-auto border border-slate-200 rounded-xl">'
res_idx1 = text.find(res_start)
res_end = '</table>\n                </div>'
res_idx2 = text.find(res_end, res_idx1) + len(res_end)

res_replacement = """<div className="mt-4">
                  <SmartTable
                    data={calibrationResults.filter((r) => r.deviceId === device.id)}
                    columns={resultColumns}
                    keyField="id"
                    settingsKey={`device_${device.id}_cal_results`}
                    defaultPageSize={5}
                  />
                </div>"""

if res_idx1 != -1 and res_idx2 != -1:
    text = text[:res_idx1] + res_replacement + text[res_idx2:]

with open("src/components/tabs/CalibrationModal.tsx", "w", encoding="utf-8") as f:
    f.write(text)


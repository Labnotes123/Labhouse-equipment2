import re

with open("src/components/tabs/CalibrationModal.tsx", "r", encoding="utf-8") as f:
    text = f.read()

# Replace Schedule Table
sched_start_text = '<div className="overflow-x-auto">\n                  <table className="w-full text-sm">'
sched_idx1 = text.find(sched_start_text)

if sched_idx1 != -1:
    # Need to find the end of this div block
    # It ends with:
    #                         ))}
    #                     </tbody>
    #                   </table>
    #                 </div>
    sched_end_text = '</table>\n                </div>'
    sched_idx2 = text.find(sched_end_text, sched_idx1) + len(sched_end_text)
    
    sched_replacement = """<div className="mt-4">
                  <SmartTable
                    data={calibrationSchedules.filter((s) => s.deviceId === device.id)}
                    columns={scheduleColumns}
                    keyField="id"
                    settingsKey={`device_${device.id}_cal_schedules`}
                    defaultPageSize={10}
                  />
                </div>"""
                
    text = text[:sched_idx1] + sched_replacement + text[sched_idx2:]


# Replace Result Table
res_start_text = '<div className="overflow-x-auto">\n                  <table className="w-full text-sm">'
res_idx1 = text.find(res_start_text)

if res_idx1 != -1:
    res_end_text = '</table>\n                </div>'
    res_idx2 = text.find(res_end_text, res_idx1) + len(res_end_text)
    
    res_replacement = """<div className="mt-4">
                  <SmartTable
                    data={calibrationResults.filter((r) => r.deviceId === device.id)}
                    columns={resultColumns}
                    keyField="id"
                    settingsKey={`device_${device.id}_cal_results`}
                    defaultPageSize={10}
                  />
                </div>"""
                
    text = text[:res_idx1] + res_replacement + text[res_idx2:]

with open("src/components/tabs/CalibrationModal.tsx", "w", encoding="utf-8") as f:
    f.write(text)

print("Tables replaced")

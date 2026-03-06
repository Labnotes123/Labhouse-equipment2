import re

with open("src/components/tabs/CalibrationModal.tsx", "r", encoding="utf-8") as f:
    text = f.read()

# I will replace the inside of "calibrationModalTab === 'schedule'" and "calibrationModalTab === 'result'"

schedule_block_start = '          {calibrationModalTab === "schedule" && (\n            <div className="space-y-4">'
schedule_block_end = '          )}\n\n          {/* Result Tab */}'

res_idx1 = text.find(schedule_block_start)
res_idx2 = text.find(schedule_block_end, res_idx1)

schedule_new_content = """          {calibrationModalTab === "schedule" && (
            <div className="space-y-4">
              {!showScheduleForm ? (
                <>
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-slate-800">Lịch hiệu chuẩn - BM.08.QL.TC.018</h3>
                      <p className="text-sm text-slate-500">{device.name} - {device.code}</p>
                    </div>
                    <button
                      onClick={() => setShowScheduleForm(true)}
                      className="px-3 py-1.5 bg-purple-500 text-white text-sm rounded-lg hover:bg-purple-600 flex items-center gap-1"
                    >
                      <Plus size={16} /> Lên lịch
                    </button>
                  </div>

                  {calibrationSchedules.filter((s) => s.deviceId === device.id).length === 0 ? (
                    <div className="text-center py-8 text-slate-500">
                      <Calendar className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                      <p>Chưa có lịch hiệu chuẩn nào</p>
                      <p className="text-sm text-slate-400 mt-1">Lịch hiệu chuẩn sẽ hiển thị sau khi yêu cầu được phê duyệt</p>
                    </div>
                  ) : (
                    <div className="mt-4">
                      <SmartTable
                        data={calibrationSchedules.filter((s) => s.deviceId === device.id)}
                        columns={scheduleColumns}
                        keyField="id"
                        settingsKey={`device_${device.id}_cal_schedules`}
                        defaultPageSize={10}
                      />
                    </div>
                  )}
                </>
              ) : (
                <>
                  <button
                    onClick={() => setShowScheduleForm(false)}
                    className="flex items-center gap-2 text-slate-600 hover:text-slate-800 mb-4"
                  >
                    <ChevronRight className="rotate-180" size={20} />
                    Quay lại danh sách
                  </button>
                  <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                    <div className="px-6 py-4 border-b border-slate-100 bg-slate-50">
                      <h3 className="font-semibold text-slate-800">Tạo lịch hiệu chuẩn</h3>
                    </div>
                    <div className="p-6 space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">Ngày hiệu chuẩn thực tế</label>
                          <input type="date" value={scheduleForm.scheduledDate} onChange={(e) => setScheduleForm({...scheduleForm, scheduledDate: e.target.value})} className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">Thời gian</label>
                          <input type="time" value={scheduleForm.scheduledTime} onChange={(e) => setScheduleForm({...scheduleForm, scheduledTime: e.target.value})} className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm" />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Nội dung hiệu chuẩn</label>
                        <textarea value={scheduleForm.content} onChange={(e) => setScheduleForm({...scheduleForm, content: e.target.value})} className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm" rows={3}></textarea>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">Người liên quan</label>
                          <input type="text" placeholder="Thêm người liên quan..." className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">Nhắc hẹn trước (ngày)</label>
                          <select value={scheduleForm.reminderDays} onChange={(e) => setScheduleForm({...scheduleForm, reminderDays: parseInt(e.target.value)})} className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm">
                            <option value={1}>1 ngày</option>
                            <option value={3}>3 ngày</option>
                            <option value={5}>5 ngày</option>
                            <option value={7}>7 ngày</option>
                          </select>
                        </div>
                      </div>
                      <div className="pt-4 flex justify-end gap-3 border-t border-slate-100">
                        <button onClick={() => setShowScheduleForm(false)} className="px-4 py-2 border border-slate-200 rounded-lg text-sm text-slate-600 hover:bg-slate-50">Hủy</button>
                        <button onClick={() => {
                          // TODO: push to list
                          setCalibrationSchedules([...calibrationSchedules, {
                            id: `sch-${Date.now()}`,
                            deviceId: device.id,
                            deviceName: device.name,
                            deviceCode: device.code,
                            type: scheduleForm.content || "Hiệu chuẩn định kỳ",
                            scheduledDate: scheduleForm.scheduledDate,
                            assignedTo: "KTV Lab",
                            status: "Đang chờ",
                            notes: "",
                            executionDate: ""
                          }]);
                          setShowScheduleForm(false);
                          setScheduleForm({scheduledDate: "", scheduledTime: "", reminderDays: 3, content: "", relatedUsers: []});
                        }} className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm hover:bg-purple-700 flex items-center gap-2">
                          <Save size={16} /> Lưu lịch
                        </button>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>"""

if res_idx1 != -1 and res_idx2 != -1:
    text = text[:res_idx1] + schedule_new_content + "\n" + text[res_idx2:]

result_block_start = '          {/* Result Tab */}\n          {calibrationModalTab === "result" && (\n            <div className="space-y-4">'
result_block_end = '          )}\n        </div>\n      </div>\n    </div>\n  );\n}'

r_idx1 = text.find(result_block_start)
r_idx2 = text.find(result_block_end, r_idx1)

result_new_content = """          {/* Result Tab */}
          {calibrationModalTab === "result" && (
            <div className="space-y-4">
              {!showResultForm ? (
                <>
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-slate-800">Kết quả hiệu chuẩn - BM.09.QL.TC.018</h3>
                      <p className="text-sm text-slate-500">{device.name} - {device.code}</p>
                    </div>
                    <button
                      onClick={() => setShowResultForm(true)}
                      className="px-3 py-1.5 bg-purple-500 text-white text-sm rounded-lg hover:bg-purple-600 flex items-center gap-1"
                    >
                      <Plus size={16} /> Xem xét kết quả hiệu chuẩn
                    </button>
                  </div>

                  {calibrationResults.filter((r) => r.deviceId === device.id).length === 0 ? (
                    <div className="text-center py-8 text-slate-500">
                      <FileText className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                      <p>Chưa có kết quả hiệu chuẩn nào</p>
                      <p className="text-sm text-slate-400 mt-1">Kết quả hiệu chuẩn sẽ hiển thị sau khi thực hiện hiệu chuẩn</p>
                    </div>
                  ) : (
                    <div className="mt-4">
                      <SmartTable
                        data={calibrationResults.filter((r) => r.deviceId === device.id)}
                        columns={resultColumns}
                        keyField="id"
                        settingsKey={`device_${device.id}_cal_results`}
                        defaultPageSize={10}
                      />
                    </div>
                  )}
                </>
              ) : (
                <>
                  <button
                    onClick={() => setShowResultForm(false)}
                    className="flex items-center gap-2 text-slate-600 hover:text-slate-800 mb-4"
                  >
                    <ChevronRight className="rotate-180" size={20} />
                    Quay lại danh sách
                  </button>
                  <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                    <div className="px-6 py-4 border-b border-slate-100 bg-slate-50">
                      <h3 className="font-semibold text-slate-800">Biểu mẫu BM.09.QL.TC.018</h3>
                    </div>
                    <div className="p-6 space-y-4">
                      <div className="bg-purple-50 rounded-xl p-4 border border-purple-100">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                          <div><span className="text-purple-500">Tên thiết bị:</span> <span className="font-medium">{device.name}</span></div>
                          <div><span className="text-purple-500">Mã thiết bị:</span> <span className="font-medium">{device.code}</span></div>
                          <div><span className="text-purple-500">Model:</span> <span className="font-medium">{device.model}</span></div>
                          <div><span className="text-purple-500">Serial:</span> <span className="font-medium">{device.serial}</span></div>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">Ngày thực hiện</label>
                          <input type="date" value={resultForm.executionDate} onChange={(e) => setResultForm({...resultForm, executionDate: e.target.value})} className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">Nội dung</label>
                          <input type="text" value={resultForm.content} onChange={(e) => setResultForm({...resultForm, content: e.target.value})} className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">Đơn vị thực hiện</label>
                          <input type="text" value={resultForm.unit} onChange={(e) => setResultForm({...resultForm, unit: e.target.value})} className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">Tiêu chuẩn</label>
                          <input type="text" value={resultForm.standard} onChange={(e) => setResultForm({...resultForm, standard: e.target.value})} className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm" />
                        </div>
                        <div className="col-span-1 md:col-span-2">
                          <label className="block text-sm font-medium text-slate-700 mb-1">Kết quả đo chi tiết</label>
                          <input type="text" value={resultForm.result} onChange={(e) => setResultForm({...resultForm, result: e.target.value})} className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm" placeholder="VD: Độ lệch 0.01%, Nằm trong giới hạn cho phép..." />
                        </div>
                        <div className="col-span-1 md:col-span-2 border-t border-slate-100 pt-4 mt-2">
                          <label className="block text-lg font-semibold text-slate-800 mb-3">Kết luận</label>
                          <div className="flex gap-6">
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input type="radio" checked={resultForm.conclusion === "Đạt"} onChange={() => setResultForm({...resultForm, conclusion: "Đạt"})} name="conclusion" className="w-5 h-5 text-green-600 focus:ring-green-500" />
                              <span className="font-medium text-green-700">Đạt</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input type="radio" checked={resultForm.conclusion === "Không đạt"} onChange={() => setResultForm({...resultForm, conclusion: "Không đạt"})} name="conclusion" className="w-5 h-5 text-red-600 focus:ring-red-500" />
                              <span className="font-medium text-red-700">Không đạt</span>
                            </label>
                          </div>
                        </div>
                        <div className="col-span-1 md:col-span-2 pt-2">
                          <label className="block text-sm font-medium text-slate-700 mb-2">Đính kèm Chứng nhận (Bản Scan)</label>
                          <div className="flex items-center gap-4">
                            <button className="flex items-center gap-2 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm border border-slate-200">
                              <Upload size={16} /> Chọn File PDF
                            </button>
                            <span className="text-xs text-slate-500">Chưa có file nào được chọn</span>
                          </div>
                   {/* Quy tắc 3 nút Đính kèm */}
                          <div className="mt-3 bg-white border border-slate-200 rounded-lg p-3 flex items-center justify-between">
                             <div className="flex items-center gap-3">
                               <File size={20} className="text-red-500" />
                               <div>
                                 <p className="text-sm font-medium text-slate-700">ChungNhanHieuChuan_2026.pdf</p>
                                 <p className="text-xs text-slate-500">2.4 MB</p>
                               </div>
                             </div>
                             <div className="flex gap-2">
                               <button className="p-1.5 text-blue-600 hover:bg-blue-50 rounded" title="Xem trực tiếp"><Eye size={18}/></button>
                               <button className="p-1.5 text-green-600 hover:bg-green-50 rounded" title="Tải xuống"><Download size={18}/></button>
                             </div>
                          </div>
                        </div>
                      </div>
                      <div className="pt-4 flex justify-end gap-3 border-t border-slate-100">
                        <button onClick={() => setShowResultForm(false)} className="px-4 py-2 border border-slate-200 rounded-lg text-sm text-slate-600 hover:bg-slate-50">Hủy</button>
                        <button onClick={() => {
                          setCalibrationResults([...calibrationResults, {
                            id: `res-${Date.now()}`,
                            resultCode: `KQ-${Date.now().toString().slice(-4)}`,
                            deviceId: device.id,
                            deviceName: device.name,
                            deviceCode: device.code,
                            serialNumber: device.serial,
                            manufacturer: device.manufacturer,
                            executionDate: resultForm.executionDate || "2026-03-06",
                            content: resultForm.content || "Hiệu chuẩn",
                            executionUnit: resultForm.unit || "Trung tâm",
                            result: resultForm.result || "Tốt",
                            standard: resultForm.standard || "ISO",
                            conclusion: resultForm.conclusion || "Đạt",
                          }]);
                          setShowResultForm(false);
                          setResultForm({
                            id: "", resultCode: "", deviceId: "", deviceName: "", deviceCode: "", serialNumber: "", manufacturer: "", executionDate: "", content: "", unit: "", result: "", standard: "", conclusion: "", executionUnit: ""
                          });
                        }} className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm hover:bg-purple-700 flex items-center gap-2">
                          <Save size={16} /> Hoàn tất
                        </button>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>"""

if r_idx1 != -1 and r_idx2 != -1:
    text = text[:r_idx1] + result_new_content + "\n" + text[r_idx2:]

with open("src/components/tabs/CalibrationModal.tsx", "w", encoding="utf-8") as f:
    f.write(text)

print("Forms added")

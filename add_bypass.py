import re

with open("src/components/tabs/CalibrationModal.tsx", "r", encoding="utf-8") as f:
    text = f.read()

# Add states for Bypass incident
idx_state = text.find("const [calibrationResults")
state_injection = """  const [showIncidentBypass, setShowIncidentBypass] = useState(false);\n"""
text = text[:idx_state] + state_injection + text[idx_state:]

# Also replace the setResultResults onClick to handle "Không đạt"
old_onclick = """setCalibrationResults([...calibrationResults, {
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
                          });"""

new_onclick = """
                          const newResult = {
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
                          };
                          setCalibrationResults([...calibrationResults, newResult]);
                          setShowResultForm(false);
                          
                          if (newResult.conclusion === "Không đạt") {
                            setShowIncidentBypass(true);
                          } else {
                            addToast({ title: "Thành công", message: "Đã lưu kết quả hiệu chuẩn", type: "success" });
                          }
                          
                          setResultForm({
                            id: "", resultCode: "", deviceId: "", deviceName: "", deviceCode: "", serialNumber: "", manufacturer: "", executionDate: "", content: "", unit: "", result: "", standard: "", conclusion: "", executionUnit: ""
                          });
"""
text = text.replace(old_onclick, new_onclick)

# Now, add the bypass modal to the end of the return statement, right before the last closing div of the Modal
# Let's search for "        </div>\n      </div>\n    </div>\n  );\n}"
end_pattern = "        </div>\n      </div>\n    </div>"
bypass_modal = """
      {/* Bypass to Incident Report Modal */}
      {showIncidentBypass && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[70] flex items-center justify-center p-4" onClick={() => setShowIncidentBypass(false)}>
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center animate-in fade-in zoom-in duration-300" onClick={e => e.stopPropagation()}>
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
              <span className="text-4xl text-red-600">⚠️</span>
            </div>
            <h3 className="text-2xl font-bold text-slate-800 mb-2">Quy trình bắt buộc</h3>
            <p className="text-slate-600 mb-6">Thiết bị <strong>{device.name}</strong> không đạt hiệu chuẩn. Thông số nằm ngoài giới hạn an toàn. Bạn cần phải tạm dừng sử dụng và báo cáo sự cố ngay lập tức!</p>
            <div className="flex flex-col gap-3">
              <button 
                onClick={() => {
                  setShowIncidentBypass(false);
                  onClose();
                  // In a real app we'd trigger the MainApp to open incident modal
                  // For now, emit a custom event or show a toast
                  const event = new CustomEvent('openIncidentReport', { detail: { deviceId: device.id } });
                  window.dispatchEvent(event);
                }}
                className="w-full py-4 px-4 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold text-lg flex items-center justify-center gap-2 shadow-lg shadow-red-200 transition-all hover:scale-105 active:scale-95"
              >
                🚨 BÁO CÁO SỰ CỐ NGAY
              </button>
              <button onClick={() => setShowIncidentBypass(false)} className="py-2 px-4 text-slate-500 hover:text-slate-700 font-medium">
                Để sau
              </button>
            </div>
          </div>
        </div>
      )}
"""
text = text.replace(end_pattern, bypass_modal + "\n" + end_pattern)

with open("src/components/tabs/CalibrationModal.tsx", "w", encoding="utf-8") as f:
    f.write(text)

print("Bypass logic added")

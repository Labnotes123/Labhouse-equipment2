with open("src/components/tabs/CalibrationModal.tsx", "r", encoding="utf-8") as f:
    text = f.read()

# Revert specific bad replacements
bad_1 = 'onClick={() => { setShowScheduleForm(false); success("Đã lên lịch hiệu chuẩn thành công"); }} className="flex items-center'
good_1 = 'onClick={() => setShowScheduleForm(false)} className="flex items-center'
text = text.replace(bad_1, good_1)

bad_2 = 'onClick={() => { setShowScheduleForm(false); success("Đã lên lịch hiệu chuẩn thành công"); }} className="px-4 py-2 border border-slate-200 rounded-lg text-sm text-slate-600 hover:bg-slate-50">Hủy'
good_2 = 'onClick={() => setShowScheduleForm(false)} className="px-4 py-2 border border-slate-200 rounded-lg text-sm text-slate-600 hover:bg-slate-50">Hủy'
text = text.replace(bad_2, good_2)

with open("src/components/tabs/CalibrationModal.tsx", "w", encoding="utf-8") as f:
    f.write(text)


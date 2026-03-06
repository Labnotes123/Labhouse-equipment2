"use client";

import { useState, useRef, useCallback } from "react";
import { Calendar, Clock } from "lucide-react";

function getDaysInMonth(month: number, year: number): number {
  return new Date(year, month, 0).getDate();
}

function pad(n: number, len = 2): string {
  return String(n).padStart(len, "0");
}

/* ───── WheelColumn ───── */
function WheelColumn({
  items,
  selectedValue,
  onValueChange,
  infinite = false,
  width = 68,
  label,
}: {
  items: { value: number; label: string }[];
  selectedValue: number;
  onValueChange: (v: number) => void;
  infinite?: boolean;
  width?: number;
  label?: string;
}) {
  const ITEM_H = 40;
  const HALF = 3;
  const [editing, setEditing] = useState(false);
  const [editText, setEditText] = useState("");
  const touchYRef = useRef(0);
  const touchAccRef = useRef(0);

  const curIdx = Math.max(0, items.findIndex(i => i.value === selectedValue));

  const move = useCallback(
    (delta: number) => {
      let ni = curIdx + delta;
      if (infinite) {
        ni = ((ni % items.length) + items.length) % items.length;
      } else {
        ni = Math.max(0, Math.min(items.length - 1, ni));
      }
      onValueChange(items[ni].value);
    },
    [curIdx, items, infinite, onValueChange],
  );

  const getAt = (offset: number) => {
    let i = curIdx + offset;
    if (infinite) i = ((i % items.length) + items.length) % items.length;
    if (i < 0 || i >= items.length) return null;
    return items[i];
  };

  const handleWheel = useCallback(
    (e: React.WheelEvent) => {
      e.preventDefault();
      e.stopPropagation();
      move(e.deltaY > 0 ? 1 : -1);
    },
    [move],
  );

  const handleTouchStart = (e: React.TouchEvent) => {
    touchYRef.current = e.touches[0].clientY;
    touchAccRef.current = 0;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    const dy = touchYRef.current - e.touches[0].clientY;
    touchAccRef.current += dy;
    touchYRef.current = e.touches[0].clientY;
    if (Math.abs(touchAccRef.current) >= ITEM_H * 0.5) {
      move(touchAccRef.current > 0 ? 1 : -1);
      touchAccRef.current = 0;
    }
  };

  const confirmEdit = () => {
    setEditing(false);
    const num = parseInt(editText);
    if (!isNaN(num)) {
      const found = items.findIndex(i => i.value === num);
      if (found >= 0) onValueChange(items[found].value);
    }
  };

  return (
    <div className="flex flex-col items-center">
      {label && (
        <div className="text-[10px] font-semibold text-slate-400 mb-1 uppercase tracking-wider">
          {label}
        </div>
      )}
      <div
        className="relative overflow-hidden select-none"
        style={{ height: ITEM_H * (HALF * 2 + 1), width }}
        onWheel={handleWheel}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
      >
        {/* centre highlight bar */}
        <div
          className="absolute left-0.5 right-0.5 pointer-events-none z-10 rounded-lg"
          style={{
            top: ITEM_H * HALF,
            height: ITEM_H,
            background:
              "linear-gradient(135deg, rgba(124,58,237,0.1), rgba(99,102,241,0.1))",
            borderTop: "2px solid rgba(124,58,237,0.25)",
            borderBottom: "2px solid rgba(124,58,237,0.25)",
          }}
        />
        {/* fade top / bottom */}
        <div className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-white via-white/80 to-transparent pointer-events-none z-20" />
        <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-white via-white/80 to-transparent pointer-events-none z-20" />

        <div className="flex flex-col">
          {Array.from({ length: HALF * 2 + 1 }, (_, i) => i - HALF).map(
            (offset) => {
              const item = getAt(offset);
              if (!item)
                return <div key={offset} style={{ height: ITEM_H }} />;

              const abs = Math.abs(offset);
              const scale = 1 - abs * 0.08;
              const opacity =
                offset === 0 ? 1 : Math.max(0.15, 1 - abs * 0.28);
              const rotateX = offset * 22;
              const isCtr = offset === 0;

              return (
                <div
                  key={offset}
                  className="flex items-center justify-center cursor-pointer"
                  style={{
                    height: ITEM_H,
                    transform: `perspective(200px) rotateX(${rotateX}deg) scale(${scale})`,
                    opacity,
                    transition: "all 0.18s ease-out",
                    fontWeight: isCtr ? 700 : 400,
                    fontSize: isCtr ? 18 : 14,
                    color: isCtr ? "#312e81" : "#94a3b8",
                  }}
                  onClick={() => {
                    if (offset !== 0) move(offset);
                  }}
                  onDoubleClick={() => {
                    if (isCtr) {
                      setEditing(true);
                      setEditText(item.label);
                    }
                  }}
                >
                  {isCtr && editing ? (
                    <input
                      autoFocus
                      type="text"
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      onBlur={confirmEdit}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") confirmEdit();
                        if (e.key === "Escape") setEditing(false);
                      }}
                      className="w-14 text-center bg-white border-2 border-violet-400 rounded-lg text-lg font-bold outline-none py-0.5"
                    />
                  ) : (
                    item.label
                  )}
                </div>
              );
            },
          )}
        </div>
      </div>
    </div>
  );
}

/* ───── Main picker ───── */
export default function WheelDateTimePicker({
  mode,
  value,
  onChange,
  className,
  placeholder,
}: {
  mode: "date" | "time" | "datetime";
  value: string;
  onChange: (value: string) => void;
  className?: string;
  placeholder?: string;
}) {
  const [open, setOpen] = useState(false);
  const [sel, setSel] = useState({
    day: 1,
    month: 1,
    year: new Date().getFullYear(),
    hour: 0,
    minute: 0,
  });

  const showDate = mode !== "time";
  const showTime = mode !== "date";

  /* parse an external value string into {day,month,year,hour,minute} */
  const parseValue = (v: string) => {
    const now = new Date();
    let d = now.getDate(),
      m = now.getMonth() + 1,
      y = now.getFullYear(),
      h = now.getHours(),
      mi = now.getMinutes();
    if (v) {
      if (mode === "date" || mode === "datetime") {
        const dp = v.split("T")[0];
        const parts = dp.split("-").map(Number);
        if (parts[0]) y = parts[0];
        if (parts[1]) m = parts[1];
        if (parts[2]) d = parts[2];
      }
      if (mode === "time") {
        const parts = v.split(":").map(Number);
        if (!isNaN(parts[0])) h = parts[0];
        if (!isNaN(parts[1])) mi = parts[1];
      }
      if (mode === "datetime" && v.includes("T")) {
        const tp = v.split("T")[1];
        if (tp) {
          const parts = tp.split(":").map(Number);
          if (!isNaN(parts[0])) h = parts[0];
          if (!isNaN(parts[1])) mi = parts[1];
        }
      }
    }
    return { day: d, month: m, year: y, hour: h, minute: mi };
  };

  const openPicker = () => {
    setSel(parseValue(value));
    setOpen(true);
  };

  /* item lists */
  const daysInMonth = getDaysInMonth(sel.month, sel.year);
  const dayItems = Array.from({ length: daysInMonth }, (_, i) => ({
    value: i + 1,
    label: pad(i + 1),
  }));
  const monthItems = Array.from({ length: 12 }, (_, i) => ({
    value: i + 1,
    label: pad(i + 1),
  }));
  const curYear = new Date().getFullYear();
  const yearItems = Array.from({ length: 51 }, (_, i) => ({
    value: curYear - 25 + i,
    label: String(curYear - 25 + i),
  }));
  const hourItems = Array.from({ length: 24 }, (_, i) => ({
    value: i,
    label: pad(i),
  }));
  const minuteItems = Array.from({ length: 60 }, (_, i) => ({
    value: i,
    label: pad(i),
  }));

  const setField = (field: string, val: number) => {
    setSel((prev) => {
      const next = { ...prev, [field]: val };
      if (field === "month" || field === "year") {
        const maxD = getDaysInMonth(next.month, next.year);
        if (next.day > maxD) next.day = maxD;
      }
      return next;
    });
  };

  const confirm = () => {
    let r = "";
    if (mode === "date")
      r = `${sel.year}-${pad(sel.month)}-${pad(sel.day)}`;
    else if (mode === "time") r = `${pad(sel.hour)}:${pad(sel.minute)}`;
    else
      r = `${sel.year}-${pad(sel.month)}-${pad(sel.day)}T${pad(sel.hour)}:${pad(sel.minute)}`;
    onChange(r);
    setOpen(false);
  };

  /* formatted display */
  const display = () => {
    if (!value) return null;
    if (mode === "date") {
      const parts = value.split("-");
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    if (mode === "time") return value;
    if (mode === "datetime" && value.includes("T")) {
      const [dp, tp] = value.split("T");
      const parts = dp.split("-");
      return `${parts[2]}/${parts[1]}/${parts[0]}  ${tp}`;
    }
    return value;
  };

  return (
    <>
      <button
        type="button"
        onClick={openPicker}
        className={
          className ||
          "w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-purple-500 text-left flex items-center gap-2 bg-white hover:border-slate-300 transition-colors"
        }
      >
        {showDate && <Calendar size={15} className="text-slate-400 shrink-0" />}
        {!showDate && showTime && (
          <Clock size={15} className="text-slate-400 shrink-0" />
        )}
        <span className={value ? "text-slate-800" : "text-slate-400"}>
          {display() ||
            placeholder ||
            (mode === "date"
              ? "Chọn ngày..."
              : mode === "time"
                ? "Chọn giờ..."
                : "Chọn ngày giờ...")}
        </span>
      </button>

      {open && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[9999]"
          onClick={() => setOpen(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* header */}
            <div className="px-5 pt-5 pb-2 text-center text-sm font-bold text-slate-700">
              {mode === "date"
                ? "Chọn ngày"
                : mode === "time"
                  ? "Chọn giờ"
                  : "Chọn ngày và giờ"}
            </div>

            {/* wheels */}
            <div className="flex items-start justify-center gap-0.5 px-4">
              {showDate && (
                <>
                  <WheelColumn
                    items={dayItems}
                    selectedValue={sel.day}
                    onValueChange={(v) => setField("day", v)}
                    label="Ngày"
                  />
                  <WheelColumn
                    items={monthItems}
                    selectedValue={sel.month}
                    onValueChange={(v) => setField("month", v)}
                    label="Tháng"
                  />
                  <WheelColumn
                    items={yearItems}
                    selectedValue={sel.year}
                    onValueChange={(v) => setField("year", v)}
                    label="Năm"
                    width={80}
                  />
                </>
              )}
              {showDate && showTime && (
                <div className="self-center mt-6 px-1 text-slate-300 text-xl font-bold select-none">
                  |
                </div>
              )}
              {showTime && (
                <>
                  <WheelColumn
                    items={hourItems}
                    selectedValue={sel.hour}
                    onValueChange={(v) => setField("hour", v)}
                    infinite
                    label="Giờ"
                  />
                  <div className="self-center mt-6 text-slate-400 text-xl font-bold select-none">
                    :
                  </div>
                  <WheelColumn
                    items={minuteItems}
                    selectedValue={sel.minute}
                    onValueChange={(v) => setField("minute", v)}
                    infinite
                    label="Phút"
                  />
                </>
              )}
            </div>

            {/* footer */}
            <div className="flex justify-end gap-2 p-4 pt-2">
              <button
                onClick={() => setOpen(false)}
                className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-500 hover:bg-slate-100 transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={confirm}
                className="px-4 py-2 rounded-xl text-sm font-semibold text-white shadow-md hover:shadow-lg transition-all"
                style={{
                  background: "linear-gradient(135deg, #7c3aed, #6366f1)",
                }}
              >
                Xác nhận
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

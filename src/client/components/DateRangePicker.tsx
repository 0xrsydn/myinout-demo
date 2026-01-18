import React, { useState } from "react";
import { getDatePresets } from "../lib/formatters";

interface DateRangePickerProps {
  startDate?: string;
  endDate?: string;
  onDateChange: (startDate?: string, endDate?: string) => void;
  datasetStartDate?: string;
  datasetEndDate?: string;
}

export function DateRangePicker({
  startDate,
  endDate,
  onDateChange,
  datasetStartDate,
  datasetEndDate,
}: DateRangePickerProps) {
  const [localStartDate, setLocalStartDate] = useState(startDate || "");
  const [localEndDate, setLocalEndDate] = useState(endDate || "");
  const [isOpen, setIsOpen] = useState(false);

  const presets = getDatePresets(datasetEndDate);

  const handleApply = () => {
    onDateChange(localStartDate || undefined, localEndDate || undefined);
    setIsOpen(false);
  };

  const handlePresetClick = (preset: { startDate?: string; endDate?: string }) => {
    setLocalStartDate(preset.startDate || "");
    setLocalEndDate(preset.endDate || "");
    onDateChange(preset.startDate, preset.endDate);
    setIsOpen(false);
  };

  const formatDisplayDate = () => {
    if (!startDate && !endDate) return "All Time";
    if (startDate && endDate) {
      return `${startDate} to ${endDate}`;
    }
    return startDate || endDate || "Select dates";
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5 text-gray-400"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
            clipRule="evenodd"
          />
        </svg>
        {formatDisplayDate()}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className={`h-4 w-4 text-gray-400 transition-transform ${isOpen ? "rotate-180" : ""}`}
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          ></div>

          {/* Dropdown */}
          <div className="absolute right-0 z-20 mt-2 w-80 rounded-xl border border-gray-200 bg-white p-4 shadow-lg">
            {/* Presets */}
            <div className="mb-4">
              <p className="mb-2 text-xs font-medium uppercase tracking-wider text-gray-500">
                Quick Select
              </p>
              <div className="flex flex-wrap gap-2">
                {Object.entries(presets).map(([key, preset]) => (
                  <button
                    key={key}
                    onClick={() => handlePresetClick(preset)}
                    className="rounded-full border border-gray-200 px-3 py-1 text-sm text-gray-700 transition-colors hover:border-blue-500 hover:bg-blue-50 hover:text-blue-700"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Range */}
            <div className="border-t border-gray-200 pt-4">
              <p className="mb-2 text-xs font-medium uppercase tracking-wider text-gray-500">
                Custom Range
              </p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs text-gray-600">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={localStartDate}
                    onChange={(e) => setLocalStartDate(e.target.value)}
                    min={datasetStartDate}
                    max={datasetEndDate}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-gray-600">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={localEndDate}
                    onChange={(e) => setLocalEndDate(e.target.value)}
                    min={datasetStartDate}
                    max={datasetEndDate}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>
              <button
                onClick={handleApply}
                className="mt-3 w-full rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
              >
                Apply
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default DateRangePicker;

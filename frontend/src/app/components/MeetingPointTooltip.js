"use client";

export default function MeetingPointTooltip({ label, tooltip }) {
  const displayLabel = label || "Not specified";
  const tooltipText = tooltip || displayLabel;

  return (
    <span className="acc-tooltip-wrap">
      <span className="acc-tooltip-label">{displayLabel}</span>
      {tooltipText && (
        <span className="acc-tooltip-panel" role="tooltip">
          {tooltipText}
        </span>
      )}
    </span>
  );
}

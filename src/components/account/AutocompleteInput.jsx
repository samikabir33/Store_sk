"use client";
import { useEffect, useRef, useState } from "react";

// Plain-text input with a filter-as-you-type suggestion list. Used for the
// District and Thana fields on the Addresses form — still a normal text
// field underneath (so an unusual/unlisted spelling can still be typed and
// saved), the dropdown is just a shortcut for picking a known name.
export default function AutocompleteInput({ label, value, onChange, options, placeholder, disabled, required }) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);

  useEffect(() => {
    function onClickOutside(e) {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  const q = value.trim().toLowerCase();
  const matches = (q ? options.filter((o) => o.toLowerCase().includes(q)) : options).slice(0, 8);

  return (
    <div className="relative" ref={wrapRef}>
      {label && <label className="label">{label}</label>}
      <input
        className="input"
        value={value}
        disabled={disabled}
        required={required}
        placeholder={placeholder}
        autoComplete="off"
        onChange={(e) => {
          onChange(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
      />
      {open && !disabled && matches.length > 0 && (
        <ul className="absolute z-20 mt-1 w-full bg-white border border-line rounded-lg shadow-md max-h-52 overflow-y-auto">
          {matches.map((m) => (
            <li
              key={m}
              // onMouseDown (not onClick) so this fires before the input's
              // onBlur would otherwise close the list first.
              onMouseDown={() => {
                onChange(m);
                setOpen(false);
              }}
              className="px-3 py-2 text-sm cursor-pointer hover:bg-pink-lighter"
            >
              {m}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

import { useState, useEffect, useRef } from "react";

interface Option {
  label: string;
  value: string;
}

interface CustomSelectProps {
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export default function CustomSelect({
  options,
  value,
  onChange,
  placeholder = "Choose one...",
}: CustomSelectProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const selectedOption = options.find((opt) => opt.value === value);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={ref} className="custom-select">
      <div
        tabIndex={0}
        role="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        className={`custom-select__trigger ${open ? "open" : ""}`}
        onClick={() => setOpen(!open)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            setOpen(!open);
            e.preventDefault();
          }
          if (e.key === "Escape") {
            setOpen(false);
          }
        }}
      >
        {selectedOption?.label || placeholder}
        <span className="arrow" />
      </div>
      {open && (
        <ul
          className="custom-options"
          role="listbox"
          tabIndex={-1}
          aria-activedescendant={value}
        >
          {options.map((opt) => (
            <li
              id={opt.value}
              key={opt.value}
              role="option"
              aria-selected={value === opt.value}
              onClick={() => {
                onChange(opt.value);
                setOpen(false);
              }}
              className={`custom-option ${value === opt.value ? "selected" : ""}`}
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  onChange(opt.value);
                  setOpen(false);
                }
              }}
            >
              {opt.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

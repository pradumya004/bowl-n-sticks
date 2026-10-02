// Admin action icons. Drawn here rather than pulled from an icon pack so there
// is no licensing question and the stroke weight matches the menu's 2px look.
// All inherit the button's colour via currentColor.
function Svg({ children }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

export function PencilIcon() {
  return (
    <Svg>
      <path d="M4 20l1-4.2L15.8 5l3.2 3.2L8.2 19 4 20z" />
    </Svg>
  );
}

export function EyeIcon() {
  return (
    <Svg>
      <path d="M2.5 12S6 6.5 12 6.5 21.5 12 21.5 12 18 17.5 12 17.5 2.5 12 2.5 12z" />
      <circle cx="12" cy="12" r="2.6" />
    </Svg>
  );
}

export function EyeOffIcon() {
  return (
    <Svg>
      <path d="M2.5 12S6 6.5 12 6.5 21.5 12 21.5 12 18 17.5 12 17.5 2.5 12 2.5 12z" />
      <circle cx="12" cy="12" r="2.6" />
      <path d="M4 4l16 16" />
    </Svg>
  );
}

export function TrashIcon() {
  return (
    <Svg>
      <path d="M4 7h16" />
      <path d="M9.5 7V4h5v3" />
      <path d="M6.5 7l.9 13h9.2l.9-13" />
    </Svg>
  );
}

export function GripIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      {[8, 12, 16].map((y) => (
        <g key={y}>
          <circle cx="9" cy={y} r="1.6" />
          <circle cx="15" cy={y} r="1.6" />
        </g>
      ))}
    </svg>
  );
}

export function MenuIcon() {
  return (
    <Svg>
      <path d="M4 7h16" />
      <path d="M4 12h16" />
      <path d="M4 17h16" />
    </Svg>
  );
}

export function CloseIcon() {
  return (
    <Svg>
      <path d="M6 6l12 12" />
      <path d="M18 6L6 18" />
    </Svg>
  );
}

export function SlidersIcon() {
  return (
    <Svg>
      <path d="M4 8h9" />
      <path d="M19 8h1" />
      <circle cx="16" cy="8" r="2.2" />
      <path d="M4 16h3" />
      <path d="M13 16h7" />
      <circle cx="10" cy="16" r="2.2" />
    </Svg>
  );
}

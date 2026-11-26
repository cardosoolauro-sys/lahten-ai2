export default function BrandMark({ size = 24 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <rect
        x="1"
        y="1"
        width="22"
        height="22"
        rx="5"
        stroke="currentColor"
        strokeOpacity="0.4"
      />
      <path
        d="M8 5v14h9"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="square"
      />
      <circle cx="16" cy="8" r="1.6" fill="#c8a96a" />
    </svg>
  );
}

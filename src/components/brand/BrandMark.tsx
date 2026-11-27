export default function BrandMark({ size = 24 }: { size?: number }) {
  return (
    <svg
      width={Math.round(size * 0.75)}
      height={size}
      viewBox="0 0 24 32"
      fill="none"
      aria-hidden="true"
      stroke="#c8a96a"
      strokeWidth="1.3"
      strokeLinejoin="round"
    >
      <path d="M3 30V9l9-6v27" />
      <path d="M12 30V12l9-5v23" />
      <path d="M9.5 15v15M15 18v12" strokeOpacity="0.55" />
    </svg>
  );
}

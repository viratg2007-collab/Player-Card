// Cricket-ball mark: a circle with a seam and stitches. Monochrome via
// currentColor so it adapts to wherever it's placed.
export default function Logo({ className = '', size = 18 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      className={className}
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="8.5" />
      {/* seam */}
      <path d="M9 4.2c2.6 4.4 2.6 11.2 0 15.6" />
      {/* stitches across the seam */}
      <path d="M8.5 7.2l1.9.5M8 10.4l2 .3M8 13.6l2-.3M8.5 16.8l1.9-.5" />
    </svg>
  )
}

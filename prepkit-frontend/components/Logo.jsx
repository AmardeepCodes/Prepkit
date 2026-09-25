export default function Logo({ className = "h-8 w-8" }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 48 48"
      width="48"
      height="48"
      fill="none"
    >
      <rect width="48" height="48" rx="12" fill="#4F46E5" />
      <path
        d="M14 16C14 14.8954 14.8954 14 16 14H26L34 22V32C34 33.1046 33.1046 34 32 34H16C14.8954 34 14 33.1046 14 32V16Z"
        fill="#FFFFFF"
        fillOpacity="0.2"
      />
      <path
        d="M25 14V21C25 21.5523 25.4477 22 26 22H33"
        stroke="#FFFFFF"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M19 25H29M19 29H25"
        stroke="#FFFFFF"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <circle cx="33" cy="15" r="4" fill="#6366F1" />
      <path
        d="M33 13V17M31 15H35"
        stroke="#FFFFFF"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

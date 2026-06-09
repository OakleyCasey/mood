import { Atmosphere } from "../domain/mood";

type IllustrationProps = {
  atmosphere: Atmosphere;
};

export function Illustration({ atmosphere }: IllustrationProps) {
  const isNegative = atmosphere === "negative";
  const isBalanced = atmosphere === "balanced";

  return (
    <div className="illustration" aria-hidden="true">
      <svg viewBox="0 0 220 180" role="img">
        <defs>
          <linearGradient id="hill" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={isNegative ? "#C9C9C5" : "#EFCB9E"} />
            <stop offset="100%" stopColor={isNegative ? "#92959A" : "#DFA46A"} />
          </linearGradient>
        </defs>
        <path
          d="M31 134c24-37 48-42 72-15 27 30 48 21 76-18 14-20 30-18 36 9 4 18-6 38-28 48H56c-27-4-35-12-25-24Z"
          fill="url(#hill)"
          opacity="0.62"
        />
        <circle
          cx={isNegative ? "58" : "158"}
          cy={isNegative ? "52" : "45"}
          r={isBalanced ? "20" : "26"}
          fill={isNegative ? "#A7A8A5" : "#F2B36D"}
          opacity="0.86"
        />
        <path
          d="M76 105c15-18 31-18 47 0"
          fill="none"
          stroke={isNegative ? "#777A7D" : "#B97943"}
          strokeWidth="7"
          strokeLinecap="round"
          opacity="0.55"
        />
        <path
          d={isNegative ? "M147 72c18 4 29 15 34 34" : "M38 81c24-22 47-27 70-15"}
          fill="none"
          stroke={isNegative ? "#7E8184" : "#D58E53"}
          strokeWidth="6"
          strokeLinecap="round"
          opacity="0.38"
        />
        <circle cx="93" cy="132" r="8" fill={isNegative ? "#55575B" : "#E9A15F"} opacity="0.7" />
        <circle cx="128" cy="124" r="5" fill={isNegative ? "#686A6D" : "#F0C08C"} opacity="0.8" />
        <circle cx="145" cy="145" r="11" fill={isNegative ? "#414247" : "#D87947"} opacity="0.64" />
      </svg>
    </div>
  );
}

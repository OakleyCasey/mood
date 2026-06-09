import { CSSProperties } from "react";
import { MoodEntry, SubjectPreference } from "../domain/mood";

type MoodPoolProps = {
  entries: MoodEntry[];
  preference: SubjectPreference;
};

const sizeClass = {
  small: "ball-sm",
  medium: "ball-md",
  large: "ball-lg",
};

export function MoodPool({ entries, preference }: MoodPoolProps) {
  const visibleEntries = entries.slice(0, 36);

  return (
    <div className="pool-shell" aria-label="情绪球池">
      {visibleEntries.length === 0 ? (
        <div className="empty-pool">
          <span>还没有投球</span>
        </div>
      ) : null}
      {visibleEntries.map((entry, index) => {
        const color =
          entry.kind === "positive" ? preference.positiveColor : preference.negativeColor;
        const column = index % 7;
        const row = Math.floor(index / 7);
        const left = 6 + column * 13 + ((index * 3) % 5);
        const bottom = 8 + row * 25 + ((index * 2) % 4);

        return (
          <span
            className={`mood-ball ${sizeClass[entry.size]} ${entry.kind}`}
            key={entry.id}
            style={{
              "--ball-color": color,
              left: `${left}%`,
              bottom: `${bottom}px`,
              "--gravity-x": "0px",
              "--gravity-y": "0px",
              animationDelay: `${Math.min(index, 10) * 45}ms`,
            } as CSSProperties}
            title={entry.note || `${entry.kind} ${entry.value}`}
          />
        );
      })}
    </div>
  );
}

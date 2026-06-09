import { useMemo } from "react";
import {
  BALL_SIZE_LABELS,
  KIND_LABELS,
  MoodEntry,
  MoodKind,
  SubjectPreference,
} from "../domain/mood";

type RecordListProps = {
  entries: MoodEntry[];
  preference: SubjectPreference;
  filter: RecordFilter;
};

export type RecordFilter = "all" | MoodKind;

export function RecordList({ entries, preference, filter }: RecordListProps) {
  const filteredEntries = useMemo(() => {
    if (filter === "all") return entries;
    return entries.filter((entry) => entry.kind === filter);
  }, [entries, filter]);

  return (
    <div className="record-list records-panel">
      {filteredEntries.length === 0 ? (
        <p className="muted">这里还没有记录。</p>
      ) : (
        filteredEntries.map((entry) => {
          const color =
            entry.kind === "positive" ? preference.positiveColor : preference.negativeColor;

          return (
            <article className="record-item" key={entry.id}>
              <span className="record-dot" style={{ background: color }} />
              <div>
                <strong>
                  {KIND_LABELS[entry.kind]} · {BALL_SIZE_LABELS[entry.size]}球 · {entry.value}
                </strong>
                <p>{entry.note || "没有备注"}</p>
                <time dateTime={entry.createdAt}>
                  {new Intl.DateTimeFormat("zh-CN", {
                    month: "2-digit",
                    day: "2-digit",
                    hour: "2-digit",
                    minute: "2-digit",
                  }).format(new Date(entry.createdAt))}
                </time>
              </div>
            </article>
          );
        })
      )}
    </div>
  );
}

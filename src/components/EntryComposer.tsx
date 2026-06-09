import { CSSProperties, FormEvent, useEffect, useState } from "react";
import { BALL_SIZE_LABELS, BALL_VALUES, BallSize, MoodKind } from "../domain/mood";

type EntryComposerProps = {
  onAddEntry: (kind: MoodKind, size: BallSize, note: string) => Promise<void>;
  positiveColor: string;
  negativeColor: string;
};

const sizes: BallSize[] = ["small", "medium", "large"];

export function EntryComposer({ onAddEntry, positiveColor, negativeColor }: EntryComposerProps) {
  const [kind, setKind] = useState<MoodKind>("positive");
  const [size, setSize] = useState<BallSize>("medium");
  const [note, setNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [celebration, setCelebration] = useState(0);

  useEffect(() => {
    if (!celebration) return;

    const timer = window.setTimeout(() => setCelebration(0), 760);
    return () => window.clearTimeout(timer);
  }, [celebration]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setIsSubmitting(true);
    try {
      await onAddEntry(kind, size, note);
      setNote("");
      setCelebration((count) => count + 1);
    } finally {
      setIsSubmitting(false);
    }
  }

  const activeColor = kind === "positive" ? positiveColor : negativeColor;

  return (
    <form
      className={`composer ${celebration ? "composer-celebrating" : ""}`}
      onSubmit={handleSubmit}
      style={{ "--active-ball-color": activeColor } as CSSProperties}
    >
      {celebration ? (
        <div className={`throw-feedback throw-${kind} throw-${size}`} aria-hidden="true">
          <span className="flying-ball" />
          <span className="spark spark-one" />
          <span className="spark spark-two" />
          <span className="spark spark-three" />
        </div>
      ) : null}

      <div className="segmented" aria-label="情绪类型">
        <button
          className={kind === "positive" ? "active" : ""}
          type="button"
          onClick={() => setKind("positive")}
        >
          开心球
        </button>
        <button
          className={kind === "negative" ? "active" : ""}
          type="button"
          onClick={() => setKind("negative")}
        >
          难过球
        </button>
      </div>

      <div className="size-row" aria-label="球大小">
        {sizes.map((item) => (
          <button
            className={size === item ? "size-choice active" : "size-choice"}
            key={item}
            type="button"
            onClick={() => setSize(item)}
          >
            <span>{BALL_SIZE_LABELS[item]}</span>
            <small>{BALL_VALUES[item]}</small>
          </button>
        ))}
      </div>

      <textarea
        aria-label="记录备注"
        placeholder="发生了什么？可以只写一句。"
        rows={2}
        value={note}
        onChange={(event) => setNote(event.target.value)}
      />

      <button className="primary-button" type="submit" disabled={isSubmitting}>
        {isSubmitting ? "投放中" : kind === "positive" ? "投一颗开心球" : "投一颗难过球"}
      </button>
    </form>
  );
}

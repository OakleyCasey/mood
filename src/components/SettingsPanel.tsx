import { FormEvent, useEffect, useState } from "react";
import { SubjectPreference } from "../domain/mood";

type SettingsPanelProps = {
  preference: SubjectPreference;
  onUpdate: (positiveColor: string, negativeColor: string) => Promise<void>;
};

export function SettingsPanel({ preference, onUpdate }: SettingsPanelProps) {
  const [positiveColor, setPositiveColor] = useState(preference.positiveColor);
  const [negativeColor, setNegativeColor] = useState(preference.negativeColor);
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setPositiveColor(preference.positiveColor);
    setNegativeColor(preference.negativeColor);
  }, [preference]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const colorPattern = /^#[0-9a-fA-F]{6}$/;

    if (!colorPattern.test(positiveColor) || !colorPattern.test(negativeColor)) {
      setError("请输入 #RRGGBB 格式的颜色。");
      return;
    }

    setIsSaving(true);
    setError("");
    try {
      await onUpdate(positiveColor, negativeColor);
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <section className="panel">
      <h2>颜色</h2>
      <form className="settings-form" onSubmit={handleSubmit}>
        <label>
          <span>积极球</span>
          <span className="color-field">
            <input
              aria-label="积极球色板"
              type="color"
              value={positiveColor}
              onChange={(event) => setPositiveColor(event.target.value)}
            />
            <input
              aria-label="积极球颜色"
              maxLength={7}
              value={positiveColor}
              onChange={(event) => setPositiveColor(event.target.value)}
            />
          </span>
        </label>
        <label>
          <span>消极球</span>
          <span className="color-field">
            <input
              aria-label="消极球色板"
              type="color"
              value={negativeColor}
              onChange={(event) => setNegativeColor(event.target.value)}
            />
            <input
              aria-label="消极球颜色"
              maxLength={7}
              value={negativeColor}
              onChange={(event) => setNegativeColor(event.target.value)}
            />
          </span>
        </label>
        {error ? <p className="form-error">{error}</p> : null}
        <button className="primary-button subtle" type="submit" disabled={isSaving}>
          {isSaving ? "保存中" : "保存颜色"}
        </button>
      </form>
    </section>
  );
}

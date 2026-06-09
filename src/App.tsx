import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown, ChevronLeft, History, Plus, Settings } from "lucide-react";
import { AuthPanel } from "./components/AuthPanel";
import { EntryComposer } from "./components/EntryComposer";
import { Illustration } from "./components/Illustration";
import { MoodPool } from "./components/MoodPool";
import { RecordFilter, RecordList } from "./components/RecordList";
import { SettingsPanel } from "./components/SettingsPanel";
import { SubjectManager } from "./components/SubjectManager";
import { KIND_LABELS, getAtmosphere, getNetScore, getTotals } from "./domain/mood";
import { useMoodData } from "./hooks/useMoodData";

type View = "pool" | "records" | "settings";

function App() {
  const [view, setView] = useState<View>("pool");
  const [isSubjectMenuOpen, setIsSubjectMenuOpen] = useState(false);
  const [newSubjectName, setNewSubjectName] = useState("");
  const [recordFilter, setRecordFilter] = useState<RecordFilter>("all");
  const subpageContentRef = useRef<HTMLDivElement | null>(null);
  const mood = useMoodData();

  const totals = useMemo(() => getTotals(mood.selectedEntries), [mood.selectedEntries]);
  const netScore = useMemo(() => getNetScore(mood.selectedEntries), [mood.selectedEntries]);
  const atmosphere = getAtmosphere(netScore);

  const appClass = `app-shell atmosphere-${atmosphere}`;

  async function handleCreateSubject() {
    if (!newSubjectName.trim()) return;

    await mood.addSubject(newSubjectName);
    setNewSubjectName("");
    setIsSubjectMenuOpen(false);
  }

  useEffect(() => {
    subpageContentRef.current?.scrollTo({ top: 0 });
  }, [view, mood.selectedSubjectId, recordFilter]);

  if (mood.isLoading || !mood.selectedSubject || !mood.selectedPreference) {
    return (
      <main className="app-shell atmosphere-balanced">
        <div className="phone-frame loading-screen">
          <p>正在整理你的情绪池...</p>
        </div>
      </main>
    );
  }

  return (
    <main
      className={appClass}
      style={
        {
          "--positive-color": mood.selectedPreference.positiveColor,
          "--negative-color": mood.selectedPreference.negativeColor,
        } as React.CSSProperties
      }
    >
      <div className={`phone-frame ${view === "pool" ? "home-frame" : "subpage-frame"}`}>
        <header className="topbar">
          <div className="title-block">
            {view === "pool" ? (
              <button
                className="subject-title-button"
                type="button"
                aria-expanded={isSubjectMenuOpen}
                onClick={() => setIsSubjectMenuOpen((open) => !open)}
              >
                <span>{mood.selectedSubject.name}</span>
                <ChevronDown aria-hidden="true" size={18} strokeWidth={1.8} />
              </button>
            ) : (
              <h1>{mood.selectedSubject.name}</h1>
            )}
          </div>
          {view === "pool" ? (
            <div className="corner-actions" aria-label="页面入口">
              <button
                type="button"
                aria-label="查看记录"
                onClick={() => {
                  setIsSubjectMenuOpen(false);
                  setView("records");
                }}
              >
                <History aria-hidden="true" size={18} strokeWidth={1.9} />
              </button>
              <button
                type="button"
                aria-label="打开设置"
                onClick={() => {
                  setIsSubjectMenuOpen(false);
                  setView("settings");
                }}
              >
                <Settings aria-hidden="true" size={18} strokeWidth={1.9} />
              </button>
            </div>
          ) : (
            <button
              className="back-button"
              type="button"
              aria-label="返回首页"
              onClick={() => {
                setIsSubjectMenuOpen(false);
                setView("pool");
              }}
            >
              <ChevronLeft aria-hidden="true" size={20} strokeWidth={1.9} />
            </button>
          )}
        </header>

        {view === "records" ? (
          <div className="subpage-controls">
            <div className="mini-tabs record-filter" aria-label="记录筛选">
              {(["all", "positive", "negative"] as RecordFilter[]).map((item) => (
                <button
                  className={recordFilter === item ? "active" : ""}
                  key={item}
                  type="button"
                  onClick={() => setRecordFilter(item)}
                >
                  {item === "all" ? "全部" : KIND_LABELS[item]}
                </button>
              ))}
            </div>
          </div>
        ) : null}

        {mood.error ? <p className="error-banner">{mood.error}</p> : null}

        {view === "pool" && isSubjectMenuOpen ? (
          <section className="subject-menu" aria-label="切换评估对象">
            <div className="subject-menu-list">
              {mood.subjects.map((subject) => (
                <button
                  className={
                    subject.id === mood.selectedSubjectId ? "subject-menu-item active" : "subject-menu-item"
                  }
                  key={subject.id}
                  type="button"
                  onClick={() => {
                    mood.setSelectedSubjectId(subject.id);
                    setIsSubjectMenuOpen(false);
                  }}
                >
                  {subject.name}
                </button>
              ))}
            </div>
            <form
              className="subject-menu-form"
              onSubmit={(event) => {
                event.preventDefault();
                void handleCreateSubject();
              }}
            >
              <input
                aria-label="新对象名称"
                maxLength={40}
                placeholder="新增对象"
                value={newSubjectName}
                onChange={(event) => setNewSubjectName(event.target.value)}
              />
              <button type="submit" aria-label="添加对象">
                <Plus aria-hidden="true" size={17} strokeWidth={2} />
              </button>
            </form>
          </section>
        ) : null}

        {view === "pool" ? (
          <>
            <section className="hero-area">
              <div className="score-copy">
                <span>
                  {atmosphere === "balanced" ? "暂时平衡" : netScore > 0 ? "温暖更多" : "沉重更多"}
                </span>
                <strong>{Math.abs(netScore)}</strong>
                <p>
                  开心 {totals.positive} · 难过 {totals.negative}
                </p>
              </div>
              <Illustration atmosphere={atmosphere} />
            </section>

            <MoodPool entries={mood.selectedEntries} preference={mood.selectedPreference} />

            <EntryComposer
              onAddEntry={mood.addEntry}
              positiveColor={mood.selectedPreference.positiveColor}
              negativeColor={mood.selectedPreference.negativeColor}
            />
          </>
        ) : null}

        {view === "records" ? (
          <div className="subpage-content" ref={subpageContentRef}>
            <RecordList
              entries={mood.selectedEntries}
              preference={mood.selectedPreference}
              filter={recordFilter}
            />
          </div>
        ) : null}

        {view === "settings" ? (
          <div className="subpage-content" ref={subpageContentRef}>
            <AuthPanel
              isSupabaseConfigured={mood.isSupabaseConfigured}
              userEmail={mood.user?.email}
              onSignIn={mood.signIn}
              onSignOut={mood.signOut}
            />
            <SubjectManager
              subjects={mood.subjects}
              selectedSubjectId={mood.selectedSubjectId}
              onRename={mood.updateSubjectName}
            />
            <SettingsPanel preference={mood.selectedPreference} onUpdate={mood.updatePreference} />
          </div>
        ) : null}
      </div>
    </main>
  );
}

export default App;

import { FormEvent, useState } from "react";
import { Subject } from "../domain/mood";

type SubjectManagerProps = {
  subjects: Subject[];
  selectedSubjectId: string;
  onRename: (subjectId: string, name: string) => Promise<void>;
};

export function SubjectManager({
  subjects,
  selectedSubjectId,
  onRename,
}: SubjectManagerProps) {
  const [editingName, setEditingName] = useState("");
  const selectedSubject = subjects.find((subject) => subject.id === selectedSubjectId);

  async function handleRename(event: FormEvent) {
    event.preventDefault();
    if (!selectedSubject || !editingName.trim()) return;

    await onRename(selectedSubject.id, editingName);
    setEditingName("");
  }

  return (
    <section className="panel">
      {selectedSubject ? (
        <form className="inline-form" onSubmit={handleRename}>
          <input
            aria-label="重命名对象"
            maxLength={40}
            placeholder="输入新名称"
            value={editingName}
            onChange={(event) => setEditingName(event.target.value)}
          />
          <button className="ghost-button" type="submit">
            保存
          </button>
        </form>
      ) : null}
    </section>
  );
}

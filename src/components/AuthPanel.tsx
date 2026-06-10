import { FormEvent, useEffect, useMemo, useState } from "react";

type AuthPanelProps = {
  isSupabaseConfigured: boolean;
  userEmail?: string;
  onSignIn: (email: string) => Promise<void>;
  onSignOut: () => Promise<void>;
};

export function AuthPanel({
  isSupabaseConfigured,
  userEmail,
  onSignIn,
  onSignOut,
}: AuthPanelProps) {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [messageKind, setMessageKind] = useState<"success" | "error" | "info">("info");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const trimmedEmail = email.trim();
  const canSubmit = useMemo(() => /\S+@\S+\.\S+/.test(trimmedEmail), [trimmedEmail]);

  useEffect(() => {
    if (userEmail) {
      setEmail(userEmail);
      setMessage("");
    }
  }, [userEmail]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!canSubmit) {
      setMessageKind("error");
      setMessage("请输入完整的邮箱地址。");
      return;
    }

    setIsSubmitting(true);
    setMessage("");

    try {
      await onSignIn(trimmedEmail);
      setMessageKind("success");
      setMessage("登录链接已发送。请在同一台设备上打开邮件里的链接。");
    } catch (error) {
      setMessageKind("error");
      setMessage(error instanceof Error ? error.message : "发送失败，请稍后再试。");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!isSupabaseConfigured) {
    return (
      <section className="auth-panel" aria-label="云端同步">
        <div className="auth-panel-head">
          <div>
            <h2>云端同步</h2>
            <p>当前数据只保存在这台设备。</p>
          </div>
          <span className="auth-status">本地</span>
        </div>
      </section>
    );
  }

  if (userEmail) {
    return (
      <section className="auth-panel" aria-label="云端同步">
        <div className="auth-panel-head">
          <div>
            <h2>云端同步</h2>
            <p>你的记录会保存在 Supabase。</p>
          </div>
          <span className="auth-status active">已登录</span>
        </div>
        <div className="auth-account">
          <span>{userEmail}</span>
          <button className="ghost-button compact" type="button" onClick={onSignOut}>
            退出
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="auth-panel" aria-label="云端同步">
      <div className="auth-panel-head">
        <div>
          <h2>云端同步</h2>
          <p>邮箱登录后，刷新和换设备都能保留记录。</p>
        </div>
        <span className="auth-status">未登录</span>
      </div>
      <form className="auth-form" onSubmit={handleSubmit}>
        <input
          aria-label="邮箱"
          autoComplete="email"
          inputMode="email"
          placeholder="输入邮箱"
          type="email"
          value={email}
          onChange={(event) => {
            setEmail(event.target.value);
            if (messageKind === "error") setMessage("");
          }}
        />
        <button className="ghost-button compact" type="submit" disabled={isSubmitting}>
          {isSubmitting ? "发送中" : messageKind === "success" ? "重新发送" : "发送登录链接"}
        </button>
      </form>
      {message ? <p className={`auth-message ${messageKind}`}>{message}</p> : null}
      {messageKind === "success" ? <p className="auth-hint">没有收到的话，可以检查垃圾邮件或稍后重发。</p> : null}
    </section>
  );
}

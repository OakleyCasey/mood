import { FormEvent, useState } from "react";

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
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!email.trim()) return;

    setIsSubmitting(true);
    setMessage("");

    try {
      await onSignIn(email.trim());
      setMessage("登录链接已发送，请查看邮箱。");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "发送失败，请稍后再试。");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!isSupabaseConfigured) {
    return <p className="auth-note">本地体验模式</p>;
  }

  if (userEmail) {
    return (
      <button className="ghost-button compact" type="button" onClick={onSignOut}>
        退出
      </button>
    );
  }

  return (
    <form className="auth-form" onSubmit={handleSubmit}>
      <input
        aria-label="邮箱"
        placeholder="邮箱登录"
        type="email"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
      />
      <button className="ghost-button compact" type="submit" disabled={isSubmitting}>
        {isSubmitting ? "发送中" : "发送"}
      </button>
      {message ? <span className="auth-message">{message}</span> : null}
    </form>
  );
}

# Mood Pool

一个 C 端 Web H5 情绪评估池：为工作、朋友或任何评估对象投下积极/消极情绪球，用大小表达强度，并通过正负抵消看到当前关系或事件的整体感受。

## 本地运行

```bash
npm install
npm run dev
```

没有配置 Supabase 环境变量时，应用会自动使用浏览器本地存储，方便先体验完整流程。

## Supabase 云端同步

1. 在 Supabase 创建项目。
2. 在 SQL Editor 执行 `supabase/schema.sql`。
3. 复制 `.env.example` 为 `.env`，填入：

```bash
VITE_SUPABASE_URL=你的项目 URL
VITE_SUPABASE_ANON_KEY=你的 anon public key
```

4. 重新启动开发服务。

配置 Supabase 后，应用会使用 magic link 邮箱登录，并按用户隔离数据。

## 部署

推荐 Vercel：

- Build command: `npm run build`
- Output directory: `dist`
- 环境变量：`VITE_SUPABASE_URL`、`VITE_SUPABASE_ANON_KEY`

如果需要我协助部署到 Vercel，需要准备：

- GitHub 仓库地址，或允许我把当前项目推到你的 GitHub 仓库。
- Vercel 账号权限，通常是把该 GitHub 仓库授权给 Vercel。
- Supabase 项目的 `Project URL` 和 `anon public key`。
- Supabase Auth 的站点 URL/回调 URL，部署后需要把 Vercel 域名加入 Supabase Auth URL 配置。
- 可选：自定义域名。如果暂时没有，可以先使用 Vercel 自动生成的 `*.vercel.app` 域名。

## 数据模型

- `subjects`：评估对象
- `mood_entries`：积极/消极球记录
- `subject_preferences`：每个对象的正负球颜色偏好

小程序 v2 可以复用 `src/domain` 里的核心模型和数值规则。

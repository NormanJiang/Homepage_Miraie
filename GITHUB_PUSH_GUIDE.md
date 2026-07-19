# GitHub 上传与发布教程

本地项目已经整理为一个 Git 仓库，默认分支为 `main`，并已连接到：

```text
https://github.com/NormanJiang/NormanJiang.github.io.git
```

原远程仓库是一套独立的 Astro 网站。它的历史已合并进当前仓库，原网站提交也保存在本地分支 `archive/github-site-before-migration`。因此后续可以使用普通 `git push`，不需要强制推送。

## 重要隐私提醒

当前网站是纯静态站点。主页中的 Payroll 访问密码会随前端代码一起发布，Payroll 数据也会进入最终网站文件，因此这个密码只能阻止普通点击，不能阻止有技术经验的人读取数据。公开 GitHub 仓库也会直接公开源码中的数据。

如果工资数据必须真正保密，请在上传前把仓库设为 Private，并且不要把敏感数据部署到公开 GitHub Pages；后续应改用 Cloudflare Access 或带服务端验证的方案。

## 首次上传当前网站

在项目根目录打开 PowerShell，执行：

```powershell
git push -u origin main
```

这会把 `NormanJiang.github.io` 的 `main` 分支更新为当前网站，并触发 GitHub Actions。旧站历史不会被删除。

## 检查远程连接

```powershell
git remote -v
git status
```

应当看到远程地址为 `NormanJiang/NormanJiang.github.io`，当前分支为 `main`。

## 恢复迁移前的旧网站

迁移前的远程网站保存在：

```text
archive/github-site-before-migration
```

如需恢复，请先联系 Codex检查差异。不要自行使用 `git push --force`。

## 启用自动发布

推送成功后：

1. 打开 GitHub 仓库的 `Settings`。
2. 进入 `Pages`。
3. 在 `Build and deployment` 中将 Source 设为 `GitHub Actions`。
4. 打开仓库的 `Actions` 页面，等待 `Deploy homepage` 完成。

成功后，自动部署会运行完整构建，并生成主页、Payroll、Codex Token Usage、Gallery 和 Writing 页面。

## 以后更新网站

在项目根目录执行：

```powershell
git status
git add .
git commit -m "Update website"
git push
```

推送后，GitHub Actions 会自动重新构建和发布网站。

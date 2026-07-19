# GitHub 上传与发布教程

本地项目已经整理为一个 Git 仓库，默认分支为 `main`，并已连接到：

```text
https://github.com/NormanJiang/Homepage_Miraie.git
```

原远程仓库保存的是之前直接上传的静态网站文件。它的历史已合并进当前源码仓库，迁移前的提交也保存在本地分支 `archive/homepage-before-source-migration`。因此后续可以使用普通 `git push`，不需要强制推送。

## 重要隐私提醒

当前网站是纯静态站点。主页中的 Payroll 访问密码会随前端代码一起发布，Payroll 数据也会进入最终网站文件，因此这个密码只能阻止普通点击，不能阻止有技术经验的人读取数据。公开 GitHub 仓库也会直接公开源码中的数据。

如果工资数据必须真正保密，请在上传前把仓库设为 Private，并且不要把敏感数据部署到公开 GitHub Pages；后续应改用 Cloudflare Access 或带服务端验证的方案。

## 首次上传当前网站

在项目根目录打开 PowerShell，执行：

```powershell
git push -u origin main
```

这会把 `Homepage_Miraie` 的 `main` 分支更新为当前源码项目，并触发 GitHub Actions。旧站历史不会被删除。

## 检查远程连接

```powershell
git remote -v
git status
```

应当看到远程地址为 `NormanJiang/Homepage_Miraie`，当前分支为 `main`。

## 恢复迁移前的旧网站

迁移前的远程网站保存在：

```text
archive/homepage-before-source-migration
```

如需恢复，请先联系 Codex 检查差异。不要自行使用 `git push --force`。

## 启用自动发布

GitHub 不会因为仓库中存在 workflow 就自动把 Pages Source 改成 Actions。首次迁移必须手动切换一次：

1. 打开 [Homepage_Miraie 的 Pages 设置](https://github.com/NormanJiang/Homepage_Miraie/settings/pages)。
2. 找到 `Build and deployment`。
3. 打开 `Source` 下拉菜单。
4. 把 `Deploy from a branch` 改成 `GitHub Actions`。不要继续选择 `main` 分支。
5. 打开 [Deploy homepage 工作流](https://github.com/NormanJiang/Homepage_Miraie/actions/workflows/deploy.yml)。
6. 点击右侧 `Run workflow`，分支选择 `main`，再点击绿色的 `Run workflow`。
7. 等待工作流显示绿色勾号后，再访问网站。

成功后，自动部署会运行完整构建，并生成主页、Payroll、Codex Token Usage、Gallery 和 Writing 页面。

## 白屏排查

如果 `https://normanjiang.github.io/Homepage_Miraie/` 打开后是白色页面，检查 Pages 设置中的 Source。只要它仍显示 `Deploy from a branch` 和 `main`，GitHub 就是在直接发布 Vite 源码，而不是发布构建后的 `dist`，页面必然无法正常运行。

切换到 `GitHub Actions` 并重新运行 `Deploy homepage` 后，白屏才会消失。

## 恢复自定义域名

Actions 部署正常后，在同一个 Pages 设置页面的 `Custom domain` 中输入：

```text
norman-jiang.com
```

点击 `Save`，等待 DNS 检查完成。当前域名返回 GitHub Pages 404，说明它尚未正确关联到这个仓库的 Pages 部署。Cloudflare 中原有 DNS 可以先保持不变；若 GitHub 的 DNS 检查失败，再检查 Cloudflare 记录。

## 以后更新网站

在项目根目录执行：

```powershell
git status
git add .
git commit -m "Update website"
git push
```

推送后，GitHub Actions 会自动重新构建和发布网站。

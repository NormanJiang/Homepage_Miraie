# GitHub 上传与发布教程

本地项目已经整理为一个 Git 仓库，默认分支为 `main`。日常修改后，只需要在项目根目录提交并推送。

## 重要隐私提醒

当前网站是纯静态站点。主页中的 Payroll 访问密码会随前端代码一起发布，Payroll 数据也会进入最终网站文件，因此这个密码只能阻止普通点击，不能阻止有技术经验的人读取数据。公开 GitHub 仓库也会直接公开源码中的数据。

如果工资数据必须真正保密，请在上传前把仓库设为 Private，并且不要把敏感数据部署到公开 GitHub Pages；后续应改用 Cloudflare Access 或带服务端验证的方案。

## 方法一：连接一个新的空仓库（推荐）

1. 登录 GitHub，点击右上角 `+`，选择 `New repository`。
2. 输入仓库名称，例如 `Homepage_Miraie`。
3. 根据隐私需求选择 `Private` 或 `Public`。
4. 不要勾选 README、`.gitignore` 或 License，创建空仓库。
5. 复制仓库的 HTTPS 地址，例如：

```text
https://github.com/YOUR_NAME/Homepage_Miraie.git
```

6. 在此项目根目录打开 PowerShell，执行：

```powershell
git remote add origin https://github.com/YOUR_NAME/Homepage_Miraie.git
git push -u origin main
```

## 方法二：替换现有的 GitHub Pages 仓库

现有仓库已经有旧网页历史，不能直接当作空仓库推送。先在 GitHub 页面为旧版本创建一个备份分支，然后把仓库 HTTPS 地址发给 Codex，由 Codex 安全连接、检查并处理历史差异。不要自行使用 `git push --force`，否则可能覆盖无法恢复的提交。

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

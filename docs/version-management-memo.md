# 购物中心收益测算工具版本管理备忘录

日期：2026-05-29

## 1. 当前状态

本项目已经完成第一版，并推送到 GitHub 仓库：

- 仓库地址：https://github.com/byrandna/codex-test
- 主分支：main
- 第一版提交：Initial shopping center ROI calculator
- 第一版内容：
  - index.html：页面结构
  - styles.css：页面样式
  - app.js：收益测算逻辑
  - research/roi-cost-ai-software-research.md：产品调研与定义文档

以后只要项目文件发生变化，都应该通过 Git 提交并推送到 GitHub。这样每一次更新都会留下记录，未来可以查看、比较、恢复。

## 2. 核心原则

### 2.1 GitHub 不是自动同步盘

GitHub 不会自动上传本地改动。每次更新后，需要主动执行：

1. 查看改了什么；
2. 暂存要保存的文件；
3. 写一条提交说明；
4. 推送到 GitHub。

只有完成 `git push` 之后，GitHub 上才会出现最新版本。

### 2.2 每次提交应该代表一个清楚的工作成果

建议不要把很多无关改动混在一个提交里。比如：

- 调整页面样式，可以单独提交；
- 修改收益计算公式，可以单独提交；
- 增加一份调研文档，可以单独提交；
- 修复一个 bug，可以单独提交。

这样以后回溯时，能快速知道每一次改动的原因和范围。

### 2.3 GitHub 是正式版本备份，本地是工作区

本地电脑可以随时改，但 GitHub 上的 `main` 分支应当尽量保持可运行、可展示、可回溯。

## 3. 标准更新流程

每次完成一轮改动后，按下面流程操作。

### 3.1 查看当前状态

```bash
git status
```

用途：

- 看哪些文件被修改；
- 看哪些文件是新文件；
- 确认有没有不该提交的内容。

### 3.2 查看具体改动

```bash
git diff
```

用途：

- 检查代码和文档改动；
- 避免把临时内容、错误内容、敏感信息提交上去。

如果文件已经暂存，可以看：

```bash
git diff --staged
```

### 3.3 暂存本次要保存的文件

如果确认所有改动都要保存：

```bash
git add .
```

如果只保存某几个文件：

```bash
git add index.html styles.css app.js
```

建议优先只添加本次相关文件，避免把无关内容一起提交。

### 3.4 创建提交

```bash
git commit -m "简短说明本次改动"
```

例如：

```bash
git commit -m "Improve ROI calculation assumptions"
git commit -m "Add shopping mall renovation cost inputs"
git commit -m "Update product research notes"
```

### 3.5 推送到 GitHub

```bash
git push
```

推送成功后，GitHub 仓库就是最新备份。

## 4. 命名规则

### 4.1 提交信息命名

提交信息建议使用英文短句，格式：

```text
动作 + 对象/范围
```

常用动作：

- Add：新增
- Update：更新
- Improve：优化
- Fix：修复
- Refactor：整理代码结构，不改变功能
- Document：补充文档

示例：

- Add sensitivity analysis panel
- Update mall rent assumptions
- Improve payback period calculation
- Fix occupancy rate input validation
- Document version management workflow

### 4.2 文件命名

文件名建议使用小写英文和连字符：

```text
mall-roi-model.md
renovation-cost-notes.md
version-management-memo.md
```

原则：

- 不使用空格；
- 不使用含义模糊的名字，如 `new.md`、`final.md`、`test2.js`；
- 文件名尽量说明内容；
- 文档放在 `docs/` 或 `research/` 目录；
- 页面和代码文件保留在项目根目录，除非后续重构。

### 4.3 版本标签命名

如果以后需要标记重要版本，可以使用 Git tag。

建议格式：

```text
v主版本.次版本.修订版本
```

示例：

- v1.0.0：第一版可展示原型
- v1.1.0：新增重要功能
- v1.1.1：修复小问题
- v2.0.0：产品结构或计算模型大改

创建标签：

```bash
git tag v1.0.0
git push origin v1.0.0
```

## 5. 备份原则

### 5.1 每个重要节点都要提交

建议在以下节点提交：

- 完成一个可运行页面；
- 完成一组计算公式；
- 完成一份重要文档；
- 完成一次视觉或交互调整；
- 修复一个明确问题；
- 准备给别人查看之前。

### 5.2 不要只存在本地

本地 commit 还不等于云端备份。必须 `git push` 后，GitHub 才有这次版本。

推荐习惯：

```bash
git status
git add .
git commit -m "..."
git push
```

### 5.3 不提交敏感信息

不要提交：

- 密码；
- API key；
- 私钥；
- 客户真实机密数据；
- 未脱敏的财务或交易信息。

如果将来需要配置密钥，应使用 `.env` 文件，并把 `.env` 加入 `.gitignore`。

### 5.4 重要版本使用 tag

当某个版本值得长期保存，例如给投资人、合作方或团队演示，可以打 tag：

```bash
git tag v1.0.0
git push origin v1.0.0
```

这样即使以后项目继续变化，也能快速回到当时的正式版本。

## 6. 回溯方法

### 6.1 查看历史

```bash
git log --oneline
```

用途：

- 查看每次提交；
- 找到某个版本的提交编号。

### 6.2 查看某次提交改了什么

```bash
git show 提交编号
```

例如：

```bash
git show 6d9d8f1
```

### 6.3 对比两个版本

```bash
git diff 旧提交编号 新提交编号
```

### 6.4 临时查看旧版本

```bash
git checkout 提交编号
```

查看完后回到主分支：

```bash
git checkout main
```

### 6.5 恢复某个文件到旧版本

```bash
git restore --source=提交编号 文件名
```

例如：

```bash
git restore --source=6d9d8f1 app.js
```

恢复后需要重新提交：

```bash
git add app.js
git commit -m "Restore app.js from initial version"
git push
```

## 7. 建议的日常协作方式

### 7.1 小改动

适合直接在 `main` 上提交：

- 改文案；
- 调样式；
- 修小 bug；
- 补充文档。

流程：

```bash
git status
git add .
git commit -m "Update interface copy"
git push
```

### 7.2 大改动

适合新建分支：

- 重做计算模型；
- 改页面结构；
- 新增复杂功能；
- 尝试不确定的产品方向。

流程：

```bash
git checkout -b feature/new-calculation-model
```

完成后提交：

```bash
git add .
git commit -m "Add new calculation model"
git push -u origin feature/new-calculation-model
```

确认没问题后，再合并回 `main`。

### 7.3 分支命名

建议格式：

```text
类型/简短说明
```

示例：

- feature/sensitivity-analysis
- feature/cost-estimation-v2
- fix/rentable-ratio-validation
- docs/product-positioning

## 8. 本项目推荐节奏

### 第一阶段：原型验证

目标：让页面能演示，计算逻辑能解释。

建议提交频率：

- 每完成一个页面模块提交一次；
- 每完成一组计算逻辑提交一次；
- 每次演示前打一个 tag。

### 第二阶段：计算模型完善

目标：让收益、成本、NOI、回收期更可信。

建议重点记录：

- 每次公式变化；
- 每次参数假设变化；
- 每次数据来源变化；
- 每次输出口径变化。

### 第三阶段：产品化

目标：让工具可以给真实用户试用。

建议增加：

- README.md；
- 使用说明；
- 示例项目；
- 版本标签；
- changelog。

## 9. 最短记忆版

每次更新后记住四步：

```bash
git status
git add .
git commit -m "说明这次改了什么"
git push
```

如果是重要可展示版本，再加：

```bash
git tag v1.0.0
git push origin v1.0.0
```

一句话原则：

本地是工作区，commit 是存档，push 是云端备份，tag 是正式版本。

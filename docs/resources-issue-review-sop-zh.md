# 资源更新议题审核与处置 SOP（中文）

## 目的

本流程用于处理 `railmapgen/rmp-gallery` 中的资源更新议题，确保：

- 同城市、同类型的更新议题按时间先后顺序处理。
- 在同城市、同类型的更新链中，若同一用户提交多个议题，只保留最新的那个，较早议题直接按重复关闭。
- 审核默认以当前官方线路图为准，但允许较早 issue 按其更新范围先通过。
- 只有在同城市更早议题已经合入主线后，后续议题才强制重建 `issuebot` 产物。
- 每处理完一个议题，都先向人工汇报结果并准备好 `gh` CLI 操作，只有在获得明确许可后才执行合并、关闭、删分支等动作。

## 项目现状约束

当前仓库的 `.github/workflows/issuebot.yml` 有以下关键行为：

- `issuebot` 只在 `issues.opened` 和 `issues.edited` 时触发。
- `issuebot` 会创建分支 `bot-<issue_number>`。
- `issuebot` 会创建从 `bot-<issue_number>` 指向 `main` 的 PR。
- PR 标题默认与 issue 标题一致。
- 缩略图会写入 `public/resources/thumbnails/<city>.png`。
- 若 `sanity check` 失败，workflow 会给 issue 打上 `need fixing` 并自动关闭 issue。

这意味着：

- 仅仅关闭 PR、删除分支，不会自动触发重新生成。
- 如果要让 `issuebot` 重新创建分支和 PR，必须再对 issue 做一次“编辑”。
- 被 `issuebot` 因 `sanity check` 失败而自动关闭的 issue，默认不再进入本 SOP 的人工审核链，除非需要复核 bot 判定。

## 适用范围

本 SOP 适用于标题形如以下模式的资源创建或更新议题：

- `Resources: New work of <city>`
- `Resources: Update work of <city>`

其中：

- `Resources: Update work of <city>` 默认适用本 SOP 的完整链式队列、`范围通过`、重建 `issuebot` 产物等规则。
- `Resources: New work of <city>` 默认只做单议题审核，不套用“范围通过”与“更早议题合入后重建”规则；只有在出现同城市重复新建投稿时，才按重复或更优版本处理。

不默认适用于：

- `Donation:*`
- 不同城市之间的议题联动

## 关键定义

### 同名同城市

按以下顺序确定议题所属城市：

1. issue 正文中的 `details[repo="rmp-gallery"]` 对应 `city="<city>"`
2. 若正文中没有结构化 `city` 字段，则使用标题中的 `<city>`
3. 若标题也不足以稳定判定，则回退到现有 bot PR、bot 分支生成的资源路径、`metadata` 文件名或更新图文件名中的城市名

对 `Resources: Update work of <city>`，满足以下两项即视为同一条更新链：

- 标题归一化后同为 `Resources: Update work of <city>`
- 按上述顺序归一化后的 `city` 一致

若标题和正文城市不一致，以正文中的 `city` 字段为准，并在汇报中注明异常。
若按上述顺序仍无法确定城市，则视为元数据异常，按无效处理。

### 更早议题

默认按以下顺序判定“更早”：

1. `createdAt` 更早
2. 若时间相同，则 issue 编号更小

### 同一用户较新议题优先

在同城市、同类型的同一更新链中，若同一用户提交多个议题：

- 只保留该用户最新的那个议题进入后续审核
- 该用户较早的议题不再继续审核内容，直接按重复关闭
- 关闭较早议题时，应打上 `duplicate` 标签，并在回复中明确指向该用户最新的议题编号

### 完美符合

某个议题的更新图满足以下条件时，可判定为“完美符合当前官方图片”：

- 车站名称与数量一致
- 线路名称与数量一致
- 线路颜色与走向大致符合
- 未开通、停运等线路只有在官方图明确标识时才被接受

一旦某个议题在当前审核链中被判定为“完美符合”，则其后续同城市、同类型、较新的更新议题可直接按“冗余”关闭，无需继续逐个审核内容。

### 更新范围

在同城市更新队列中，较早 issue 的审核范围不是“必须一次性补齐当前官方图上的全部新变化”，而是“它本次打算更新的那部分内容是否正确”。

更新范围可由以下信息综合判定：

- issue 的提交时间在同城市队列中的先后顺序
- issue 正文、`metadata.justification`、描述文字中的更新意图
- 当前 issue 相对于当时主线内容的实际增量
- 后续同城市 issue 是否明显承接了更晚的官方变化

### 范围通过

若满足以下条件，则当前较早 issue 可以判定为“范围通过”：

- 它本次修改的内容与官方图一致
- 它没有引入错误内容
- 它与当前官方图之间的剩余差异，明显属于更晚发生的官方变化
- 这些更晚变化将由后续同城市 issue 继续承接

典型例子：

- 某城市原有 1/2 号线
- 3 号线开通后，议题 1 被创建
- 随后 4 号线开通，议题 2 被创建
- 议题 2 同时包含 3 号线和 4 号线内容

此时：

- 议题 1 只要其涉及的 3 号线更新没有错误，就应先通过并合入
- 合入后，再重建议题 2 的 bot 产物
- 议题 2 基于最新主线重建后，再审核其是否覆盖 4 号线等后续变化

### 审核状态标签

每次执行最终的 `gh` 处置操作前，都要先给 issue 同步一个审核状态标签。

标签含义如下：

- `ready for merge`：内容审核通过，已准备进入合并流程
- `need fixing`：内容存在与官方图不符的错误
- `invalid content`：城市不存在、参考链接不合规、引用材料不足以支撑提交内容等非格式问题
- `invalid format`：issue 元数据结构异常、附件格式错误、无法正常生成 bot 产物等格式问题
- `better version exists`：当前 issue 已被同城市更早且更优的版本覆盖
- `duplicate`：同一用户在同城市、同类型更新链中提交了较新的议题，当前较早议题直接按重复关闭

执行要求：

- 常规审核结论下，任一 issue 在执行最终 `gh` 处置动作前，应只保留 `ready for merge`、`need fixing`、`invalid content`、`invalid format`、`better version exists` 五者中的一个状态标签
- 设置常规状态标签时，应同时移除另外四个常规状态标签，避免并存
- 若按“同一用户较早议题重复”关闭，则使用 `duplicate` 标签，不强制再叠加上述五个常规状态标签
- `resources` 标签可与上述状态标签并存，不需要移除

### 需要重建 bot 产物

只有满足以下条件时，当前议题才需要重建 bot 产物：

- 同城市、更早的更新议题已经合并到 `main`
- 因该次合并，当前议题原有的 bot 分支、PR、缩略图已经不是基于最新主线生成

不满足上述条件时：

- 不需要先删 PR / 删分支 / 重跑 `issuebot`
- 可以直接使用当前已存在的 bot 分支、PR 和更新图进行审核
- 如果同城市更早议题只是被判定为 `need fixing`、`invalid content` 或 `invalid format` 后关闭，而未合入 `main`，则后续议题不触发重建，继续直接审核现有 bot 产物

换言之，是否需要重建，取决于“当前议题生成后，`main` 是否因为同城市更早议题的合入而发生变化”，而不是取决于“是否进入审核队列”本身。

## 总流程

### 第 1 步：输入一个 issue 后，先建立处理队列

收到一个 issue 编号后，不直接处理该 issue，而是先查找同城市、同类型的更早更新议题。

处理原则：

1. 找出同城市的所有未关闭更新议题。
2. 先在该队列内按用户分组；若同一用户提交了多个议题，则只保留该用户最新的那个，较早议题全部按 `duplicate` 关闭。
3. 对剩余议题按“从旧到新”排序。
4. 从最早的开始处理。
5. 只有当前一个议题处理完，才进入下一个。
6. 如果某个议题已经完美符合官方图，则后续较新的同城市更新议题全部改为“冗余关闭”。
7. 如果某个较早议题只是“范围通过”，则先合入它，再重建并继续审核下一个议题。

查队列时的实现要求：

- 优先使用只返回 issue 的搜索方式，不要把 PR 混入队列。
- 如果使用 GitHub REST 的 `/issues` 接口，必须显式排除包含 `pull_request` 字段的结果。

### 第 2 步：判断当前议题是否需要重建 bot 产物

对当前要审核的 issue，先执行以下判断：

1. 查找该 issue 对应的 PR。
2. 查找该 issue 对应的远端分支 `bot-<issue_number>`。
3. 判断在当前处理链中，是否已有同城市更早议题被合并到 `main`。
4. 如果没有，则直接使用当前现有 bot 产物进入审核。
5. 如果有，则准备关闭 PR、删除远端分支、编辑 issue 以触发 `issuebot` 重建。
6. 等人工确认后再执行这些命令。
7. 删除并编辑 issue 后，等待 `issuebot` 重新创建分支和 PR。
8. 重新读取该分支中的更新图，再进入审核。

注意：

- 只有当同城市更早议题已经合入主线时，才不要基于旧 PR 或旧缩略图直接审。
- 不要在未获得人工许可前执行合并、关闭或删除操作。

### 第 3 步：收集审核材料

每次正式审核前，至少收集以下材料：

- 当前 issue 正文
- 当前 issue 的参考链接
- 官方线路图
- 当前议题更新后的线路图
- 对应 PR 链接
- 对应分支名
- 同城市更早 issue 是否已经合入 `main`
- 当前 issue 属于“完整覆盖”还是“承接链中的局部更新”

图像来源要求：

- 官方图优先使用 issue 中参考链接指向的官网内容
- 若参考链接不是线路图页面，需继续补找官网的实际线路图页面
- 若官网无线路图或明显过时，可退而使用维基百科或官方社交媒体博文
- 更新图优先使用 PR 分支中现成的 `public/resources/thumbnails/<city>.png`
- 若同城市更早议题已合入主线，则必须先重建当前议题的 bot 产物，再读取更新图

### 第 4 步：执行人工审核

审核时只做以下判断：

- 车站名称和数量是否与官方图一致
- 线路数量和名称是否与官方图一致
- 线路颜色和走向是否大致一致
- 未开通、停运等线路是否有官方图明确标识
- 本次提交是否实际包含了修正或新增内容，而不只是单纯调整版式布局

同时增加一层顺序判断：

- 如果当前是同城市队列中的较早 issue，要先判断它与当前官方图的差异，是否只是因为官方后来又新增了变化
- 若差异仅属于更晚变化，而当前 issue 本次修改内容本身正确，则应判定为“范围通过”
- 只有当当前 issue 自己修改的内容就已经与官方不符时，才判定为“不通过”
- 如果当前 issue 只是更新了布局，但没有任何修正或新增内容，则直接判定为“不通过”

输出规则：

- 正确无误时，结论写“通过”
- 有错误时，只指出一处最明确、最可复核的错误

回复文案规则：

- 无论通过或拒绝，issue 回复开头都必须先写：`嗨，感谢您的支持与贡献！`
- 通过时，后续固定接：`您的作品已被合入并即将上线`
- 不通过、无效或冗余关闭时，后续直接接对应的不一致理由或关闭原因
- 同一用户较早议题按重复关闭时，后续直接说明该议题已被该用户更新提交的最新议题替代，并指向最新议题编号

通过可再细分为：

- `范围通过`：当前 issue 的更新范围正确，但当前官方图还有更晚变化待后续 issue 处理
- `完全通过`：当前 issue 已经与当前官方图完全一致

错误示例：

- 漏站
- 多站
- 站名拼写错误
- 线路数量不一致
- 线路名称不一致
- 非官方标识的规划线被擅自加入
- 仅调整布局、字号、标注位置等版式表现，但没有任何实质性修正或新增

### 第 5 步：根据结论处理队列

#### 情况 A：当前议题不通过

处理方式：

1. 回复一处明确错误
2. 将 issue 状态标签设为 `need fixing`
3. 准备关闭该 issue、对应 PR 并删除分支
4. 视人工确认，关闭该 issue
5. 继续处理同城市更新链中的下一个议题

说明：

- 当前议题不通过本身，不会触发后续议题的重建条件
- 只有“更早议题已合入主线”才会触发后续议题需要重建

#### 情况 B：当前议题无效

适用场景：

- 城市不存在
- 参考链接不属于官网、维基百科或可接受的官方社交媒体来源
- issue 元数据结构异常，导致无法进入正常内容审核

处理方式：

1. 回复一条明确的元数据问题
2. 按原因将 issue 状态标签设为 `invalid content` 或 `invalid format`
3. 准备关闭该 issue 对应 PR 和分支
4. 视人工确认，关闭该 issue
5. 继续处理同城市更新链中的下一个议题

#### 情况 C：当前议题通过

处理方式：

1. 回复 `嗨，感谢您的支持与贡献！您的作品已被合入并即将上线`
2. 将 issue 状态标签设为 `ready for merge`
3. 准备合并当前 PR
4. 获得人工许可后执行合并
5. 若为“范围通过”，则当前 PR 合并到 `main` 后，继续处理下一个较新的同城市 issue
6. 若为“范围通过”，则下一个 issue 因更早议题已合入主线，进入“需要先判断是否重建”的状态
7. 若为“完全通过”，则当前 PR 合并到 `main` 后，后续同城市较新的更新议题全部作为“冗余”关闭

#### 情况 D：同一用户较早议题重复

当同城市、同类型更新链中，同一用户提交了多个议题时，较早议题不再审核内容，直接按重复处理。

处理方式：

1. 给较早议题打上 `duplicate` 标签
2. 回复 `嗨，感谢您的支持与贡献！该议题已被您后续提交的较新议题 #<latest> 替代，本议题按重复关闭。`
3. 若该较早议题已有 PR 和分支，则一并准备关闭其 PR、删除其分支
4. 获得人工许可后执行关闭

#### 情况 E：后续议题冗余

当某个更早议题已经完美符合当前官方图时，其后的同城市更新议题不再审核内容，直接按冗余处理。

处理方式：

1. 回复 `嗨，感谢您的支持与贡献！该更新已被更早且已符合官方图的议题覆盖。`
2. 将 issue 状态标签设为 `better version exists`
3. 准备关闭其 PR、删除其分支、关闭其 issue
4. 获得人工许可后执行

## 每个议题处理后的汇报格式

每处理完一个议题，都应先回复以下内容，再等待人工批准：

- 汇报中必须同时给出官方线路图和当前议题更新后的线路图，优先提供可直接打开的图片链接；若使用本地文件，则提供明确路径。

```text
议题：#<issue_number> <issue_title>
城市：<city>
队列位置：第 <i>/<n> 个
官方线路图：<official_map_url_or_path>
当前议题更新后的线路图：<updated_map_url_or_path>
结论：通过 / 不通过 / 无效 / 重复关闭 / 冗余关闭
通过类型：范围通过 / 完全通过 / 不适用
标签：ready for merge / need fixing / invalid content / invalid format / better version exists / duplicate
说明：<完全通过时写“与当前官方图一致”；范围通过时写“本次更新范围正确，剩余差异属于后续官方变化”；不通过时只写一处错误；无效时写一处内容或格式问题；重复关闭时写被该用户哪个较新议题替代；冗余时写被哪个更早议题覆盖>

待执行 gh CLI：
1. <命令 1>
2. <命令 2>
3. <命令 3>

执行状态：等待你的确认
```

## `gh` CLI 操作模板

以下命令默认在 PowerShell 下执行。

### 0. 统一变量

```powershell
$repo = "railmapgen/rmp-gallery"
$issue = 3482
$branch = "bot-$issue"
```

### 0.1 同步状态标签

将 issue 状态标签切换为 `ready for merge`：

```powershell
gh issue edit $issue -R $repo --add-label "ready for merge" --remove-label "need fixing" --remove-label "invalid content" --remove-label "invalid format" --remove-label "better version exists"
```

将 issue 状态标签切换为 `need fixing`：

```powershell
gh issue edit $issue -R $repo --add-label "need fixing" --remove-label "ready for merge" --remove-label "invalid content" --remove-label "invalid format" --remove-label "better version exists"
```

将 issue 状态标签切换为 `invalid content`：

```powershell
gh issue edit $issue -R $repo --add-label "invalid content" --remove-label "ready for merge" --remove-label "need fixing" --remove-label "invalid format" --remove-label "better version exists"
```

将 issue 状态标签切换为 `invalid format`：

```powershell
gh issue edit $issue -R $repo --add-label "invalid format" --remove-label "ready for merge" --remove-label "need fixing" --remove-label "invalid content" --remove-label "better version exists"
```

将 issue 状态标签切换为 `better version exists`：

```powershell
gh issue edit $issue -R $repo --add-label "better version exists" --remove-label "ready for merge" --remove-label "need fixing" --remove-label "invalid content" --remove-label "invalid format"
```

### 0.2 用文件写评论正文

为避免 PowerShell 下中文、引号和换行导致参数拆分，所有 `gh issue comment` / `gh pr comment` 示例默认使用 `--body-file`：

```powershell
$tmp = ".tmp"
New-Item -ItemType Directory -Force -Path $tmp | Out-Null
$commentFile = Join-Path $tmp "issue-$issue-comment.md"
@'
嗨，感谢您的支持与贡献！您的作品已被合入并即将上线
'@ | Set-Content $commentFile -Encoding utf8
gh issue comment $issue -R $repo --body-file $commentFile
```

### 1. 查找同城市、更早的未关闭更新议题

先看当前 issue：

```powershell
gh issue view $issue -R $repo --json number,title,createdAt,body,url
```

再按标题先查同城市未关闭更新议题：

```powershell
$city = "nanning"
gh search issues "`"Resources: Update work of $city`"" --repo $repo --state open --match title --json number,title,createdAt,url
```

再逐条用 `gh issue view`、bot PR、资源路径或更新图文件名校对城市归属。

若需要识别“同一用户较新议题优先”，可补查作者：

```powershell
gh issue view $issue -R $repo --json number,author,createdAt,title,url
```

如果需要包含已关闭议题一起看历史：

```powershell
gh search issues "`"Resources: Update work of $city`"" --repo $repo --match title --json number,title,createdAt,state,url
```

### 2. 查找当前 issue 的 PR

```powershell
gh pr list -R $repo --head $branch --state all --json number,title,state,url,headRefName,baseRefName
```

### 3. 查找当前 issue 的远端分支

```powershell
git ls-remote --heads origin $branch
```

### 4. 在需要重建时，关闭当前 issue 对应的 PR

```powershell
$pr = 3483
$tmp = ".tmp"
New-Item -ItemType Directory -Force -Path $tmp | Out-Null
$prCommentFile = Join-Path $tmp "pr-$pr-comment.md"
@'
Closing stale bot PR for re-generation before review.
'@ | Set-Content $prCommentFile -Encoding utf8
gh pr comment $pr -R $repo --body-file $prCommentFile
gh pr close $pr -R $repo
```

### 5. 在需要重建时，删除当前 issue 对应的远端分支

```powershell
gh api -X DELETE repos/railmapgen/rmp-gallery/git/refs/heads/$branch
```

### 6. 在需要重建时，重新触发 issuebot

因为 workflow 仅监听 `issues.edited`，所以需要编辑 issue 正文。

安全做法：

```powershell
$tmp = ".tmp"
New-Item -ItemType Directory -Force -Path $tmp | Out-Null
$bodyFile = Join-Path $tmp "issue-$issue-body.md"
$body = gh issue view $issue -R $repo --json body --jq .body
$stamp = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")
$body = $body + "`n<!-- retrigger issuebot: $stamp -->`n"
$body | Set-Content $bodyFile -Encoding utf8
gh issue edit $issue -R $repo --body-file $bodyFile
```

### 7. 在需要重建时，查看 issuebot 是否已重跑

```powershell
gh run list -R $repo --workflow issuebot.yml --limit 20 --json databaseId,displayTitle,status,conclusion,createdAt,event,url
```

### 8. 在需要重建时，等待 PR 重新出现

```powershell
gh pr list -R $repo --head $branch --state open --json number,title,url
```

### 9. 通过时准备合并 PR

```powershell
$pr = 3483
gh issue edit $issue -R $repo --add-label "ready for merge" --remove-label "need fixing" --remove-label "invalid content" --remove-label "invalid format" --remove-label "better version exists"
gh pr merge $pr -R $repo --merge --delete-branch
```

如果需要先留言再合并：

```powershell
gh issue edit $issue -R $repo --add-label "ready for merge" --remove-label "need fixing" --remove-label "invalid content" --remove-label "invalid format" --remove-label "better version exists"
$tmp = ".tmp"
New-Item -ItemType Directory -Force -Path $tmp | Out-Null
$commentFile = Join-Path $tmp "issue-$issue-comment.md"
@'
嗨，感谢您的支持与贡献！您的作品已被合入并即将上线
'@ | Set-Content $commentFile -Encoding utf8
gh issue comment $issue -R $repo --body-file $commentFile
gh pr merge $pr -R $repo --merge --delete-branch
```

### 10. 不通过时准备关闭 issue

```powershell
gh issue edit $issue -R $repo --add-label "need fixing" --remove-label "ready for merge" --remove-label "invalid content" --remove-label "invalid format" --remove-label "better version exists"
$tmp = ".tmp"
New-Item -ItemType Directory -Force -Path $tmp | Out-Null
$commentFile = Join-Path $tmp "issue-$issue-comment.md"
@'
嗨，感谢您的支持与贡献！<只写一处明确错误>
'@ | Set-Content $commentFile -Encoding utf8
gh issue comment $issue -R $repo --body-file $commentFile
gh issue close $issue -R $repo
```

### 11. 内容无效时准备关闭 issue

```powershell
gh issue edit $issue -R $repo --add-label "invalid content" --remove-label "ready for merge" --remove-label "need fixing" --remove-label "invalid format" --remove-label "better version exists"
$tmp = ".tmp"
New-Item -ItemType Directory -Force -Path $tmp | Out-Null
$commentFile = Join-Path $tmp "issue-$issue-comment.md"
@'
嗨，感谢您的支持与贡献！<只写一处内容或参考资料问题>
'@ | Set-Content $commentFile -Encoding utf8
gh issue comment $issue -R $repo --body-file $commentFile
gh issue close $issue -R $repo
```

### 11.1 格式无效时准备关闭 issue

```powershell
gh issue edit $issue -R $repo --add-label "invalid format" --remove-label "ready for merge" --remove-label "need fixing" --remove-label "invalid content" --remove-label "better version exists"
$tmp = ".tmp"
New-Item -ItemType Directory -Force -Path $tmp | Out-Null
$commentFile = Join-Path $tmp "issue-$issue-comment.md"
@'
嗨，感谢您的支持与贡献！<只写一处格式或元数据结构问题>
'@ | Set-Content $commentFile -Encoding utf8
gh issue comment $issue -R $repo --body-file $commentFile
gh issue close $issue -R $repo
```

### 12. 同一用户较早议题按重复关闭

```powershell
$latest = 3491
$older = 3482
gh issue edit $older -R $repo --add-label "duplicate"
$tmp = ".tmp"
New-Item -ItemType Directory -Force -Path $tmp | Out-Null
$commentFile = Join-Path $tmp "issue-$older-comment.md"
@"
嗨，感谢您的支持与贡献！该议题已被您后续提交的较新议题 #$latest 替代，本议题按重复关闭。
"@ | Set-Content $commentFile -Encoding utf8
gh issue comment $older -R $repo --body-file $commentFile
gh issue close $older -R $repo
```

如果较早议题也已有 PR 和分支：

```powershell
$latest = 3491
$older = 3482
$olderBranch = "bot-$older"
$olderPr = 3483
gh issue edit $older -R $repo --add-label "duplicate"
$tmp = ".tmp"
New-Item -ItemType Directory -Force -Path $tmp | Out-Null
$prCommentFile = Join-Path $tmp "pr-$olderPr-comment.md"
@"
Closing duplicate bot PR because issue #$older is superseded by the same contributor's newer issue #$latest.
"@ | Set-Content $prCommentFile -Encoding utf8
gh pr comment $olderPr -R $repo --body-file $prCommentFile
gh pr close $olderPr -R $repo
gh api -X DELETE repos/railmapgen/rmp-gallery/git/refs/heads/$olderBranch
$issueCommentFile = Join-Path $tmp "issue-$older-comment.md"
@"
嗨，感谢您的支持与贡献！该议题已被您后续提交的较新议题 #$latest 替代，本议题按重复关闭。
"@ | Set-Content $issueCommentFile -Encoding utf8
gh issue comment $older -R $repo --body-file $issueCommentFile
gh issue close $older -R $repo
```

### 13. 冗余关闭较新的 issue

```powershell
$older = 3482
$newer = 3491
gh issue edit $newer -R $repo --add-label "better version exists" --remove-label "ready for merge" --remove-label "need fixing" --remove-label "invalid content" --remove-label "invalid format"
$tmp = ".tmp"
New-Item -ItemType Directory -Force -Path $tmp | Out-Null
$commentFile = Join-Path $tmp "issue-$newer-comment.md"
@"
嗨，感谢您的支持与贡献！该更新已被更早且已符合官方图的 #$older 覆盖。
"@ | Set-Content $commentFile -Encoding utf8
gh issue comment $newer -R $repo --body-file $commentFile
gh issue close $newer -R $repo
```

如果较新的 issue 也已有 PR 和分支：

```powershell
$newer = 3491
$newerBranch = "bot-$newer"
$newerPr = 3492
gh issue edit $newer -R $repo --add-label "better version exists" --remove-label "ready for merge" --remove-label "need fixing" --remove-label "invalid content" --remove-label "invalid format"
$tmp = ".tmp"
New-Item -ItemType Directory -Force -Path $tmp | Out-Null
$prCommentFile = Join-Path $tmp "pr-$newerPr-comment.md"
@"
Closing redundant bot PR because issue #$newer is superseded by an earlier approved update.
"@ | Set-Content $prCommentFile -Encoding utf8
gh pr comment $newerPr -R $repo --body-file $prCommentFile
gh pr close $newerPr -R $repo
gh api -X DELETE repos/railmapgen/rmp-gallery/git/refs/heads/$newerBranch
$issueCommentFile = Join-Path $tmp "issue-$newer-comment.md"
@'
嗨，感谢您的支持与贡献！该更新已被更早且已符合官方图的议题覆盖。
'@ | Set-Content $issueCommentFile -Encoding utf8
gh issue comment $newer -R $repo --body-file $issueCommentFile
gh issue close $newer -R $repo
```

## 推荐执行顺序

针对一条同城市更新链，推荐严格使用以下顺序：

1. 建立队列，从旧到新排序
2. 先在同一更新链内识别同一用户的多个议题，只保留其最新议题，其余较早议题按 `duplicate` 准备关闭
3. 对剩余议题从旧到新排序
4. 取最早 issue
5. 查 PR、查分支
6. 判断是否已有同城市更早议题在本轮处理中合入 `main`
7. 若没有，则直接读取官方图和当前更新图
8. 先判断当前 issue 是“范围通过候选”还是“完全通过候选”
9. 若有同城市更早议题已合入 `main`，则准备关闭 PR / 删除分支 / 编辑 issue 触发重建的命令
10. 向人工汇报，等待许可
11. 只有在需要重建且获得许可时，才执行关闭 PR / 删除分支 / 编辑 issue
12. 若执行了重建，则等待新 PR 和新分支生成
13. 读取官方图和更新图
14. 给出审核结论：不通过 / 无效 / 范围通过 / 完全通过 / 同一用户较早议题重复关闭 / 冗余关闭
15. 再次向人工汇报并准备 `gh` 操作
16. 只有在获得许可后，才执行 merge / close
17. 若该 issue 不通过、无效或按重复关闭，则进入下一个 issue
18. 若该 issue 为范围通过并已合入 `main`，则继续重建并审核下一个同城市 issue
19. 若该 issue 为完全通过，则关闭其后的同城市较新 issue

## 停止条件

满足以下任一条件即可停止本轮链式处理：

- 当前议题通过，后续同城市较新议题全部已按冗余关闭
- 当前议题处理后，队列已空
- `issuebot` 未能重建分支或 PR，形成阻塞，需要人工介入
- 官方图来源不明确，无法形成稳定结论

## 实操注意事项

- 审核时优先看图，不优先信 issue 描述中的“规划说明”
- 官方参考链接不是线路图页面时，要主动补找实际官方图
- 只有在同城市更早议题已经合入主线时，才需要删除旧 PR / 分支并重建 bot 产物
- 删除 PR / 分支前必须先准备好可回显给人工确认的 `gh` 命令
- 较早 issue 不应因为“当前官方图后来又增加了新变化”而被直接拒绝；若其本次更新范围正确，可先按范围通过
- 如果提交仅仅改了布局、没有修正或新增内容，不予通过
- 每次执行最终 `gh` 处置动作前，先同步 issue 的状态标签为 `ready for merge`、`need fixing`、`invalid content`、`invalid format` 或 `better version exists` 之一
- 同一用户在同城市、同类型更新链中重复投稿时，直接关闭其较早议题，只保留最新议题继续审核；较早议题需打上 `duplicate` 标签并指向最新议题
- issue 回复文案必须统一以 `嗨，感谢您的支持与贡献！` 开头；通过时固定接 `您的作品已被合入并即将上线`
- 任何 merge、close、delete 动作都必须等人工明确批准
- 回复“不通过”时，只指出一处错误，避免一次塞入多条审稿意见
- 一旦出现“更早 issue 已完全符合官方图”，后续 issue 不再做重复审核

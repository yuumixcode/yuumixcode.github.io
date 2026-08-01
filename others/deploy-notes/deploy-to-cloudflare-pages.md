# 部署到 Cloudflare Pages(私有仓库方案)

> 把当前的 GitHub Pages 部署迁到 Cloudflare Pages,让仓库保持 **Private**,同时站点对访问者保持公开可用。
> 适用:任何用 Zensical/Hugo/MkDocs/Jekyll 等静态站生成器 + GitHub Pages 的项目。

---

## 1. 为什么从 GitHub Pages 迁出来

| 维度 | GitHub Pages (免费) | Cloudflare Pages (免费) |
| --- | --- | --- |
| 仓库可见性 | ❌ **必须 Public** | ✅ 完美支持 Private |
| 带宽 | 100GB/月(软限制) | **无限** |
| 构建次数 | 无限 | 500 次/月 |
| 国内访问 | ⚠️ 经常抽风/被墙 | ⭐ 可用,延迟 ~200ms |
| 自定义域名 + SSL | ✅ | ✅(自动) |
| 部署方式 | GitHub Actions(自己写) | Cloudflare 直接监听 GitHub webhook(不用 Action) |

**核心理由**:
- GitHub Pages 免费账号**强制 Public 仓库**,源码里如果有未公开内容(草稿、私人笔记、未发布插件代码)就不行
- Cloudflare Pages 连私有仓库后,部署完全不影响公开访问——**站点是公开的,源码是私密的**
- 国内访问体验好一档

---

## 2. ⚠️ 关键决策:域名怎么办

**`yuumixcode.github.io` 是 GitHub Pages 专属子域名,迁到 Cloudflare Pages 就用不了了**。
你必须在下面三个方案里选一个:

### 方案 A:用 `xxx.pages.dev` 子域名(最简单,5 分钟搞定)
- Cloudflare 自动分配 `yuumixcode.pages.dev`
- 缺点:地址变了,所有外链失效
- `site_url` 必须改

### 方案 B:绑定自己的域名(推荐,长期方案)
- 你需要有一个**已注册的域名**(比如 `yuumixcode.com` / `yuumix.dev`)
- 在 Cloudflare 配自定义域,自动 SSL 证书
- 缺点:域名要钱(年费 50-100 元),但国内 Cloudflare 节点 + 优选 IP 后速度极快
- 流程多一步:改 NS / 加 CNAME

### 方案 C:保留 `yuumixcode.github.io`(❌ 不可行)
- 这个域名只能在 GitHub Pages 上用,Cloudflare 接不进来
- 别想了,放弃

**我的建议**:如果你有自己的域名 → 选 B;如果只想白嫖 → 选 A,接受地址变更。
本教程**按方案 A 写**;如果选 B,差别只在「第 7 节:绑定自定义域名」。

---

## 3. 准备工作清单

开始之前确认你已经有了:

- ✅ GitHub 账号 + 仓库 `yuumixcode/yuumixcode.github.io`
- ✅ Cloudflare 账号(去 [dash.cloudflare.com](https://dash.cloudflare.com/sign-up) 注册,免费)
- ✅ 当前 `site/` 目录能正常构建(本地跑 `source .venv/bin/activate && zensical build --clean` 不报错)
- ✅ 域名决策(已选 A 或 B)

---

## 4. 迁移步骤总览

```
1. GitHub 端:仓库改 Private + 删除 workflow
2. Cloudflare 端:绑 GitHub + 配构建 + 首次部署
3. 修改 site_url
4. 验证
5. (可选) 绑定自定义域名
```

预计耗时:**15-20 分钟**(包括 Cloudflare 第一次构建等 2-3 分钟)。

---

## 5. GitHub 端操作

### 5.1 仓库改 Private

1. 打开 `github.com/yuumixcode/yuumixcode.github.io` → **Settings** → **General**
2. 滚到最底下 **Danger Zone** → **Change repository visibility**
3. 选 **Make private** → 确认 → 输入仓库名二次确认

> ⚠️ 改 Private 后,**GitHub Pages 会自动停止服务**。这是正常的,等 Cloudflare 接上就好了。

### 5.2 删除 GitHub Actions workflow

Cloudflare Pages 部署**不需要** GitHub Actions——它直接监听 GitHub 的 push 事件,自己跑 build。
原 `.github/workflows/docs.yml` 可以直接删掉,留着也不会运行(没 trigger)。

```bash
# 本地仓库里
rm .github/workflows/docs.yml
git add -A
git commit -m "chore: remove GitHub Pages workflow, migrate to Cloudflare Pages"
git push origin main
```

> 💡 如果你以后想用 GitHub Actions 跑别的 CI(测试、lighthouse 审计),新建别的 yml 即可,不要和 Cloudflare 构建冲突。

---

## 6. Cloudflare 端操作(主流程)

### 6.1 创建 Pages 项目

1. 登录 [dash.cloudflare.com](https://dash.cloudflare.com)
2. 左侧栏 **Workers & Pages** → **Create application**
3. 选 **Pages** 标签 → **Connect to Git**

### 6.2 授权 GitHub 并选仓库

1. 点 **GitHub** → **Connect GitHub account**(第一次会跳 GitHub 授权)
2. 授权时**只勾选 `yuumixcode`**(最小权限原则,不要选 All repositories)
3. 回到 Cloudflare → 选 **yuumixcode/yuumixcode.github.io** → **Begin setup**

### 6.3 配置构建(关键!对照你现在的 `docs.yml`)

| 字段 | 你的值 | 说明 |
| --- | --- | --- |
| **Project name** | `yuumixcode` | 决定 `xxx.pages.dev` 子域名前缀 |
| **Production branch** | `main` | 跟你 git push 的默认分支一致 |
| **Build command** | `pip install zensical && zensical build --clean` | **等价于你现在的 `pip install zensical` + `zensical build --clean`** |
| **Build output directory** | `site` | 等价于你现在的 `path: site` |
| **Root directory(可选)** | `(留空)` | 如果你的 zensical.toml 在仓库根目录,留空;如果嵌套了,填相对路径 |
| **Environment variables** | 见下表 | 模拟 GitHub Action 的环境 |

#### Environment variables(可选,但推荐加)

点 **Add variable** 加:

| Variable name | Value | 用途 |
| --- | --- | --- |
| `PYTHON_VERSION` | `3.12` | 固定 Python 版本,避免 Cloudflare 默认版本变动 |
| `PIP_NO_CACHE_DIR` | `1` | 减少磁盘占用 |

> Cloudflare Pages 默认有 Python 3.x 环境,不需要像 Actions 那样 `actions/setup-python@v5`。但固定版本号能让 build 稳定。

### 6.4 首次部署

点 **Save and Deploy**。Cloudflare 会:
1. clone 你的私有仓库
2. 跑 `pip install zensical && zensical build --clean`
3. 把 `site/` 部署到 `yuumixcode.pages.dev`

过程大概 2-3 分钟。在 **Deployments** 标签看日志,失败的话日志里会写清楚哪一步错了。

成功后访问 `https://yuumixcode.pages.dev` 应该能看到你的站点。

---

## 7. 修改 `site_url`(必做!)

Cloudflare 部署完,站是出来了,但**站内链接会全错**——因为 `zensical.toml` 里 `site_url = "https://yuumixcode.github.io/"`,Zensical 用它生成绝对 URL(canonical、sitemap、og:tags 等)。

打开 `zensical.toml`:

```toml
# 方案 A:用 pages.dev 子域名
site_url = "https://yuumixcode.pages.dev/"

# 方案 B:用自己的域名(见下一节)
# site_url = "https://你的域名/"
```

改完提交:

```bash
git add zensical.toml
git commit -m "chore: update site_url for Cloudflare Pages deployment"
git push origin main
```

Cloudflare 会在 1-2 分钟内自动重新部署。

---

## 8. (方案 B 专属)绑定自定义域名

如果你有自己的域名,且域名 DNS 还没托管在 Cloudflare:

1. Cloudflare Pages 项目页 → **Custom domains** → **Set up a custom domain**
2. 输入你的域名(比如 `yuumixcode.com`),Cloudflare 会提示你去改 NS
3. 去你的域名注册商(阿里云/腾讯云/Cloudflare Registrar)→ 把 NS 改成 Cloudflare 给的那两个
4. 等 NS 生效(几分钟到 24 小时)
5. Cloudflare 自动签发 SSL 证书(Let's Encrypt),绿勾出现就 OK
6. 强制 HTTPS:Cloudflare → **SSL/TLS** → **Full** 模式

如果你的域名 DNS 已经在 Cloudflare(常见于 Cloudflare Registrar 买的域名),直接加 Custom domain 即可,不用改 NS。

---

## 9. 验收清单

部署完一项项过:

- [ ] 访问 `https://yuumixcode.pages.dev`(或你的自定义域名)能打开首页
- [ ] 点站内任意链接**不会 404**
- [ ] 浏览器开发者工具看 HTML,确认 `<link rel="canonical">` 指向新地址
- [ ] 浏览器开发者工具 → Network → 任意资源确认 HTTPS + 200
- [ ] 访问 `https://yuumixcode.pages.dev/sitemap.xml`(如果有)能拿到
- [ ] 故意在 `docs/index.md` 改一个字,`git push` 后 Cloudflare 自动重新部署,1-2 分钟后新内容上线
- [ ] 仓库确认是 Private(`Settings → General → Danger Zone` 那行显示 "Make public")

---

## 10. 回滚方案

万一 Cloudflare 出问题要回 GitHub Pages:

1. 仓库改回 Public:`Settings → General → Danger Zone → Change visibility → Make public`
2. 恢复 workflow:
   ```bash
   git revert <删除 workflow 的 commit>   # 或者
   git checkout HEAD~3 -- .github/workflows/docs.yml   # 找历史里有这个文件的那个 commit
   git push
   ```
3. 等 GitHub Actions 跑完(2-3 分钟)
4. `site_url` 改回 `https://yuumixcode.github.io/`,commit push
5. 旧的 `yuumixcode.github.io` 链接恢复有效

> 💡 GitHub Pages 在仓库改 Private 时只是停止服务,**不会丢失内容**。`gh-pages` 分支 / `pages` 部署历史都还在。

---

## 11. 日常使用(迁移后)

迁移完,你日常的开发流程**基本不变**:

```bash
# 本地开发
source .venv/bin/activate
zensical serve                  # localhost:8000 实时预览

# 写完 push
git add -A
git commit -m "..."
git push origin main            # Cloudflare 自动检测到 push,1-2 分钟重新部署
```

唯一区别:**不再需要看 GitHub Actions 跑没跑**——直接看 Cloudflare 的 **Deployments** 标签页。

---

## 12. 常见问题

### Q:为什么我不需要 `actions/setup-python@v5`?
Cloudflare Pages 镜像里已经预装了 Python 3.x + pip,直接用即可。固定版本靠 `PYTHON_VERSION` 环境变量。

### Q:为什么 build command 直接写 `pip install zensical`?不写 `python -m pip` 吗?
两种都行,Cloudflare 默认 `pip` 指向 Python 3 的 pip。

### Q:Cloudflare 免费层 500 次构建/月够用吗?
够。一个月 30 天,你日更才 30 次。频繁的小修改可以本地攒几个一起 push。

### Q:为什么 `PYTHON_VERSION=3.12`?最新不是 3.13 吗?
Cloudflare 当时支持的 Python 版本是 3.12(以及更新的)。3.12 是 LTS,最稳。具体支持到哪个版本,看 Cloudflare 官方文档(可能随时更新)。

### Q:迁移后老链接 `yuumixcode.github.io/xxx` 全失效了,要不要做 301?
- 方案 A:`yuumixcode.pages.dev` 没法做跨域 301(没法把 github.io 重定向到 pages.dev)
- 方案 B:可以在 Cloudflare **Bulk Redirects** 里加规则,把老路径对应重定向到新地址
- 个人主页一般不强求,搜索引擎会自己重新索引

### Q:能不能 Cloudflare Pages + 同时用 GitHub Pages?
不能两套同时跑。GitHub Pages 要求仓库 Public,Cloudflare Pages 没有这个限制。一旦你 Cloudflare 跑起来了,GitHub Pages 那边就关了。

### Q:私有仓库会不会有什么功能不能用?
不会。Cloudflare 连的是 GitHub OAuth,不依赖仓库可见性。build、preview、custom domain、analytics 全部正常。

---

## 13. 进阶(以后再看)

迁移跑通后,以下事情你可能想做:

- **优选 IP / Cloudflare for SaaS**:让国内访问快到 50ms 以内(折腾,但效果惊艳)
- **Cloudflare Analytics**:免费隐私友好的访问统计(比 GA 干净)
- **Pages Functions**:写 Cloudflare Workers 加点动态能力(比如自定义评论后端)
- **R2 存储**:放图片/附件,免流量费用

这些单独写文档。

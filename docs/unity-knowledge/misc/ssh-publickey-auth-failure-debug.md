# SSH 认证失败排查：腾讯工蜂 × macOS OpenSSH 的 ssh-rsa 兼容坑

> 本文最后更新于 2026 年 8 月 3 日。

> 适用场景：macOS（OpenSSH 10.x）通过 SSH 拉取 git.code.tencent.com（腾讯工蜂）上的 Unity 项目，报 `Permission denied (publickey)`。UGit、终端 git 均适用。

## 问题现象

用 UGit 拉取远端仓库，报错：

```
git@git.code.tencent.com: Permission denied (publickey).
fatal: Could not read from remote repository.
认证失败，请先到 "UGit->设置->SSH 密钥" 中配置密钥后再操作。
```

去腾讯工蜂网页添加 UGit 生成的公钥，又被拒绝：

```
指纹已被使用
```

看起来是"密钥没配好"，实际两件事都不是。

!!! note "这个密钥不是我生成的"
    网页提示的"指纹已被使用"，对应的是 UGit **自动生成**的密钥（文件名形如 `ugit-created-ssh-key-donnot-delete-<主机名>`，直译"UGit 创建、勿删"）。它第一次使用时就被登记到服务器了，同一把密钥对同一账号只能登记一次，所以再添加会提示指纹冲突——**这是正常提示，不是故障**，反而说明服务器端登记是有效的。

## 一、先分清 SSH 连接的"两道门"

SSH 认证失败的大多数困惑，都源于把两类密钥混为一谈。一次连接要过两道完全独立的门：

| | 第一道门：主机密钥协商 | 第二道门：用户认证 |
| --- | --- | --- |
| **回答的问题** | 这服务器真的是 git.code.tencent.com 吗？ | 你真的是有权限的用户吗？ |
| **谁提供密钥** | 服务器（主机密钥，host key） | 客户端（用户密钥） |
| **记录在哪** | 客户端首次连接后写入 `~/.ssh/known_hosts` | 公钥登记到网页，私钥留在 `~/.ssh/` |
| **算法** | 本次服务器只提供 `ssh-rsa` | ed25519 / RSA 均可 |

两道门互不依赖：ed25519（第二道门的"工牌"）和 ssh-rsa（第一道门的"门牌"）没有任何关系。

### 完整连接流程（含失败点标注）

把两道门放回完整链路里看，一次 `git pull` 的实际过程如下：

```
① git pull
   └→ 读取 .git/config 的 remote → 调用系统 ssh
   └→ 连接 git@git.code.tencent.com:22

② TCP 连接 + SSH 版本协商

③ 密钥交换 KEX + 服务器身份验证          ← 第一道门
   服务器: 出示主机公钥
   客户端: 与 ~/.ssh/known_hosts 缓存指纹对比
     ├─ 一致       → 信任,继续
     ├─ 不一致     → 拒绝(可能中间人攻击)
     └─ 无记录     → 询问是否信任(TOFU,首次连接)
   双方协商会话密钥 → 此后通信全部加密
   ┗━ 失败点①: no matching host key type
        └─ 本次案例就卡在这里,后面根本没发生

④ 用户认证 publickey                    ← 第二道门
   服务器: 列出登记的可用公钥
   客户端: 找到对应私钥
   服务器: 发送随机挑战
   客户端: 用私钥签名并返回(私钥永不出本地)
   服务器: 用登记的公钥验签 → 确认身份
   ┗━ 失败点②: Permission denied (publickey)

⑤ 权限检查: 账号对该仓库的读/写权限(认证 ≠ 授权)

⑥ 传输: git-upload-pack 经加密通道返回对象与引用 → 拉取完成
```

图上两个失败点对应第二节的报错解读：**报错发生在哪个阶段，直接决定排查方向**——卡在 ③ 是算法/信任问题（与你的密钥无关），卡在 ④ 才是密钥登记问题。

## 二、逐条解读你看到的报错

用 `ssh -T -v` 逐阶段看，报错出现在**哪道门**，比报错文案本身更重要：

| 报错 / 输出 | 卡在哪 | 含义 |
| --- | --- | --- |
| `no matching host key type found. Their offer: ssh-rsa` | 第一道门 | 客户端不接受服务器的主机密钥算法，**连接根本没开始** |
| `Offering public key` 之后 `Permission denied (publickey)` | 第二道门 | 密钥提交了但服务器不认（公钥未登记 / 登记错账号） |
| 无任何 `Offering` 直接 `Permission denied` | 第一道门（被包装） | 客户端压根没提交密钥，多为算法协商或找不到密钥 |
| `shell request failed on channel 0` | ✅ 已通过 | 认证成功，只是 git 用户没有 shell，属正常响应 |

!!! warning "误导性的 `Permission denied (publickey)`"
    很多工具（UGit 等）会把第一道门的失败也包装成笼统的"认证失败"。**看到 publickey 报错先别怀疑密钥，先用 `ssh -v` 确认它到底断在哪一步。**

## 三、根因：服务器只提供 ssh-rsa，新版 OpenSSH 默认禁用

本案例实测：

```
$ ssh -T git@git.code.tencent.com
Unable to negotiate with <服务器 IP> port 22: no matching host key type found. Their offer: ssh-rsa
```

服务器**只提供 ssh-rsa（SHA-1 算法）主机密钥**。而 SHA-1 已被安全社区弃用，新版 OpenSSH 逐步收紧：

- OpenSSH 8.8（2021）起：默认禁用 ssh-rsa **用户密钥签名**
- 新版 OpenSSH（如 macOS 26 自带的 10.2）：默认不再接受 ssh-rsa **主机密钥算法**（本案例实测）

于是连接在第一道门就断掉，客户端根本来不及提交你的 ed25519 / RSA 用户密钥。这解释了"为什么第一次用 ed25519 能拉取、现在不行"——ed25519 认证能力从未变化，变的是客户端对 ssh-rsa 主机密钥的默认态度。

## 四、排查方法：三步定位

```bash
# ① 看默认连接断在哪
ssh -T -o BatchMode=yes git@git.code.tencent.com

# ② 临时放行 ssh-rsa 再试（不写任何文件）
ssh -T -o BatchMode=yes \
  -o HostKeyAlgorithms=+ssh-rsa \
  -o PubkeyAcceptedAlgorithms=+ssh-rsa \
  -i ~/path/to/private_key git@git.code.tencent.com
```

每一步的错误信息都在告诉你下一步做什么：

1. ① 报 `no matching host key type` → 问题在算法协商，与密钥无关
2. ② 报 `Permission denied (publickey)` → 第一道门已过，进入用户认证，检查公钥登记
3. ② 返回 `shell request failed on channel 0` → 全部通过

## 五、解决方案：写入 ~/.ssh/config 永久放行

把临时参数固化到 `~/.ssh/config`（不存在则新建）：

```ini
Host git.code.tencent.com
    HostKeyAlgorithms +ssh-rsa
    PubkeyAcceptedAlgorithms +ssh-rsa
    IdentityFile "/Users/<你的用户名>/Library/Application Support/UGit/ssh/<UGit 生成的密钥文件>"
    IdentitiesOnly yes
```

> UGit 生成的密钥文件名包含主机名（如 `ugit-created-ssh-key-donnot-delete-<主机名>`），实际路径可在 UGit 设置的 SSH 密钥页查看。

三行各解决一个问题：

- `HostKeyAlgorithms +ssh-rsa`：放行第一道门（服务器只有 ssh-rsa 主机密钥）
- `PubkeyAcceptedAlgorithms +ssh-rsa`：放行 RSA 用户密钥的 SHA-1 签名
- `IdentityFile` + `IdentitiesOnly`：明确指定使用哪把私钥，不依赖系统自动搜索

!!! tip "如果用的是自己的 ed25519"
    以上两行算法配置仍然需要（第一道门是服务器决定的，与用户密钥算法无关），`IdentityFile` 改成你自己的 `~/.ssh/id_ed25519` 即可。

验证：

```bash
ssh -T -o BatchMode=yes git@git.code.tencent.com        # shell request failed on channel 0 = 成功
cd 你的项目 && git ls-remote origin HEAD                  # 返回远端 HEAD 提交号 = 拉取能力正常
```

## 六、新手要点总结

1. **两类密钥、两道门，不要混**：ed25519 是你的"工牌"（用户密钥），ssh-rsa 是楼门的"门牌"（主机密钥），互不相关。
2. **报错阶段 > 报错文案**：`Permission denied (publickey)` 不代表密钥没配好，先 `ssh -v` 确认断在哪一步。
3. **"指纹已被使用"通常是好消息**：说明这把公钥已登记，同账号同密钥只能登记一次。
4. **老服务器 × 新客户端**：SHA-1 类旧算法被新版 OpenSSH 默认禁用，是这类兼容问题的常见来源；`-o` 参数临时验证、`~/.ssh/config` 永久修复。

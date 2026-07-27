# 语音克隆 TTS 方案指南

> 目标：找一个**可以免费克隆我自己的声音**的方案，再准备一个**使用 MiniMax Token Plan 付费生成语音**的方案。  
> 更新日期：2026-07-27

---

## 1. 核心结论

| 需求 | 推荐方案 | 成本 |
| --- | --- | --- |
| 免费克隆 + 本地跑 | **GPT-SoVITS**（Windows 有整合包，开箱即用） | $0（一次性投入：≥8GB 显存的 GPU） |
| 不想装任何东西就体验 | **MiniMax Audio 海外版**网页克隆 + 每日 4000 免费积分 | $0（每天约 5 分钟音频） |
| 用 MiniMax Token Plan 付费（不克隆） | **MiniMax T2A API**（`speech-01` / `speech-02-turbo` / `speech-02-hd`），300+ 预设音色 | 按字符数计费，积分抵扣 |
| 用 MiniMax Token Plan 付费（克隆） | **MiniMax Audio 海外版** 网页克隆（个人/小项目最顺） 或 **MiniMax MCP**（开发者，嵌进 Claude Desktop / Cursor） | 按字符数计费 + 克隆一次性 $3 |
| 不想碰 MiniMax 克隆 API 的企业限制 | **CosyVoice 2.0**（Apache-2.0，本地或自建服务） | $0（自建） |

**先说清楚一个重要事实**：

MiniMax 官方 `/v1/voice_clone` 接口**目前只对企业认证账号开放**，个人开发者即便注册了账号、拿到了 API Key，也调不动这个接口。`/v1/t2a_pro`（不克隆、用预设音色）则个人账号直接可用。**个人想用 MiniMax 通道做声音克隆，目前最现实的路径是走「MiniMax Audio 网页版」或「MiniMax-MCP」**。

---

## 2. 免费方案：先跑起来再说

### 2.1 🥇 GPT-SoVITS（首选：本地一键启动）

- **仓库**：<https://github.com/RVC-Boss/GPT-SoVITS>（35K+ ⭐）
- **能干啥**：
  - 5 秒样本 **零样本克隆**（即开即用，零训练）
  - 1 分钟样本 **少样本微调**（效果更好，要训几十分钟）
  - 跨语言：中文 / 英文 / 日文 / 韩文 / 粤语
  - 输出 WebUI + API（`http://localhost:9880`）
- **硬件门槛**：
  - 推理：6GB 显存起步（RTX 3060 流畅）
  - 训练：建议 12GB+（RTX 3080/4070 及以上）
  - 纯 CPU 能跑，但慢
- **零基础起步**（Windows）：
  1. 下载整合包（百度网盘 / GitHub Release 都行，搜「GPT-SoVITS 整合包」）
  2. 解压后双击 `go-webui.bat`
  3. 浏览器打开 WebUI，默认进入「1A-模型推理」页
  4. 上传 5~10 秒干净人声 → 填参考文本 → 写要合成的文本 → 点合成
  5. 不满意就用「1B-训练」页微调（需要 1~5 分钟更长的干净录音 + 自动 ASR 标注）
- **录音小贴士**（决定效果 80%）：
  - 安静房间 + 耳机麦克风或桌面麦，**别用手机外放录**
  - 一次录 30~60 秒，**语速正常、情绪稳定**
  - 不要有背景音乐、回声、其他人说话
  - 转成 16kHz 单声道 WAV 最稳

### 2.2 🥈 CosyVoice 2.0（中文更地道，Apache-2.0）

- **仓库**：<https://github.com/FunAudioLLM/CosyVoice>
- **能干啥**：
  - 3 秒样本零样本克隆
  - **支持情感指令**（"用四川话读" "用哭腔读"）
  - 跨语言 + 多方言（四川话、上海话、粤语等）
  - 流式输出，延迟低至 150ms
  - Apache-2.0 协议，商用友好
- **硬件门槛**：
  - 推理：6~8GB 显存
  - 训练：12GB+
- **什么时候选它**：
  - 中文播报、有声书要做**方言/情感**控制
  - 你需要商用闭源（GPT-SoVITS 是 MIT 也行，但 CosyVoice 协议更宽松）
  - 你的显卡偏弱（CosyVoice 体积更小、速度更快）

### 2.3 🥉 F5-TTS（速度最快，MIT）

- **仓库**：<https://github.com/SWivid/F5-TTS>
- **能干啥**：
  - 10~30 秒克隆
  - 实时因子（RTF）0.15，比 CosyVoice 更快
  - 多语言代码切换（一句中文里夹英文）
  - MIT 协议
- **什么时候选它**：
  - 实时性要求高（直播配音、实时对话）
  - 多语言混排文案

### 2.4 对比表

| 项目 | 协议 | 最低样本 | 中文效果 | 速度 | 商用 | 跨语言 | 适合场景 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| GPT-SoVITS | MIT | 5s | ⭐⭐⭐⭐ | 中 | ✅ | 中/英/日/韩/粤 | 个人/小项目快速起步 |
| CosyVoice 2.0 | Apache-2.0 | 3s | ⭐⭐⭐⭐⭐ | 快 | ✅ | 中/英/日/韩 + 多方言 | 中文+情感+商用 |
| F5-TTS | MIT | 10s | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ✅ | 中/英 | 实时+多语言混排 |
| MockingBird | MIT | 5s | ⭐⭐⭐ | 慢 | ✅ | 中/英 | 老牌方案，参考用 |
| OpenVoice | MIT | 短音频 | ⭐⭐ | 中 | ✅ | 多语 | 风格/情感控制研究 |

### 2.5 不想装任何东西？在线试一把

- **MiniMax Audio 海外版** <https://www.minimax.io/audio>
  - 注册后每日送 4000 积分（≈5 分钟音频）
  - 支持 10 秒克隆、30+ 语种、情感控制
  - 国内访问需要网络工具
- **MiniMax Audio 国内版** <https://hailuoai.com/audio>
  - 无需网络工具
  - **但目前不支持 Speech-02 模型，也不支持声音克隆**
- **AltVoice** <https://www.altvoice.io/>
  - 浏览器内直接传音频 + 输入文本 → 生成
  - 不用注册也能免费试几次（每天有免费额度）
  - 20 种语言，缺点：单次长度短、商用授权看条款
- **剪映**（桌面版/手机版）
  - 「朗读」→「克隆音色」功能，念 10 秒就能用
  - 需要会员（基础会员 199 元/年），但能商用
- **EasyVoice**（Docker 自托管）
  - <https://hub.docker.com/r/cosincox/easyvoice>
  - 完全免费、无时长字数限制、需要一台小服务器

---

## 3. 付费方案：用 MiniMax Token Plan 跑 TTS

> "MiniMax Token Plan" 在这里指：你的 MiniMax 开放平台账户余额（人民币充值 / 赠送积分），用 MiniMax 官方 API 时直接从账户扣。  
> 注册地址：<https://platform.minimaxi.com/>（国内） 或 <https://www.minimax.io/>（海外）

### 3.1 路径 A：纯 TTS（不克隆，用 300+ 预设音色）✅ 个人可用

这是最干净的「用 MiniMax Token Plan 付费」路径。

**模型**：

| 模型 | 特点 | 价格 | 适合 |
| --- | --- | --- | --- |
| `speech-02-hd` | 高保真、声音克隆效果最好 | ~$50 / 百万字符 | 有声书、广告、播客 |
| `speech-02-turbo` | 实时、低延迟 | ~$30 / 百万字符 | 实时对话、智能助手 |
| `speech-01` | 经典款、稳定 | 更便宜 | 一般场景 |

**API 端点**：

- 国内：`https://api.minimax.chat/v1/t2a_pro?GroupId=<你的GroupId>`
- 海外：`https://api.minimaxi.chat/v1/t2a_pro?GroupId=<你的GroupId>`

**最小调用示例**（Python）：

```python
import requests

api_key = "你的_API_KEY"
group_id = "你的_GROUP_ID"

resp = requests.post(
    f"https://api.minimaxi.chat/v1/t2a_pro?GroupId={group_id}",
    headers={
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
    },
    json={
        "model": "speech-02-turbo",
        "text": "你好，这是用 MiniMax 生成的语音。",
        "stream": False,
        "voice_setting": {
            "voice_id": "male-qn-qingse",  # 预设音色，列表见文档
            "speed": 1.0,
            "vol": 1.0,
            "pitch": 0,
        },
        "audio_setting": {
            "sample_rate": 32000,
            "bitrate": 128000,
            "format": "mp3",
        },
    },
)
print(resp.json())
# 返回里有 audio_file（音频 URL）或 audio_content（六进制）
```

**获取 API Key**：

1. 登录 <https://platform.minimaxi.com/>
2. 「账户管理」→「接口密钥」→ 创建
3. 「账户管理」→「基本信息」→ 复制 GroupId
4. 充值（最低 10 元就能解锁更高 TPM 限速）

**预设音色列表**（部分常用）：

| voice_id | 描述 |
| --- | --- |
| `male-qn-qingse` | 青涩男声 |
| `male-qn-jingying` | 精英男声 |
| `female-shaonv` | 少女音 |
| `female-yujie` | 御姐音 |
| `presenter_male` | 男主持人 |
| `presenter_female` | 女主持人 |
| `male-qn-daxuesheng` | 青年大学生男声 |
| `female-tianmei` | 甜美女性 |

完整列表调用 `GET /v1/voice/list` 或查 [官方文档](https://platform.minimaxi.com/document/T2A%20Model)。

### 3.2 路径 B：声音克隆 API ⚠️ 仅企业认证

- 端点：`POST /v1/files/upload`（上传音频）→ `POST /v1/voice_clone`（创建 voice_id）→ T2A 时把 `voice_id` 传进去
- 官方说明：「目前 Minimax 语音复刻只支持企业认证才可以开通，因此需要联系相关工作人员对接权限」
- 官网申请：<https://www.minimaxi.com/document/guides/T2A-model/replica>
- **个人开发者怎么办？** 看下面 3.3 / 3.4

### 3.3 路径 C：用 MiniMax Audio 网页 + 你的 Token 余额（个人推荐 ⭐）

- 入口：<https://www.minimax.io/audio>（海外版，支持克隆 + Speech-02）
- 流程：
  1. 注册 / 登录 MiniMax 账号
  2. 进「Voices」→「Create your Voice Clone」上传 10~300 秒音频
  3. 10 秒左右克隆完成
  4. 回「Text to Speech」选自己克隆的 voice，输入文本 → Generate
- 扣费方式：先用每日 4000 免费积分（≈5 分钟音频/天），用完按字符数从账户余额扣
- **优点**：完全个人可用、零代码、支持 30+ 语种
- **缺点**：海外版访问可能需要网络工具、不能嵌进自己的 App

### 3.4 路径 D：MiniMax-MCP（开发者方案 ⭐⭐）

MiniMax 官方开源的 MCP server，把 TTS/克隆/生图/生视频能力以 MCP tool 形式暴露出来。

- **仓库**：<https://github.com/MiniMax-AI/MiniMax-MCP>（27.4K+ ⭐，MIT）
- **暴露的 tool**：
  - `text_to_audio`（TTS）
  - `list_voices`（查音色）
  - `voice_clone`（克隆）✅ 支持个人账号
  - `generate_video`
  - `text_to_image`
- **接入 Claude Desktop**（`claude_desktop_config.json`）：

```json
{
  "mcpServers": {
    "MiniMax-mcp": {
      "command": "uvx",
      "args": ["MiniMax-mcp"],
      "env": {
        "MiniMax_API_KEY": "你的_API_KEY",
        "MiniMax_MCP_BASE_PATH": "/Users/yuumix/MiniMax-output"
      }
    }
  }
}
```

- **接入 Cursor / Windsurf**：同理，在 MCP 设置里加上面这段
- **优势**：在 Claude 里直接对话就生成语音，克隆你自己的声音后，让 Claude 用你的声音"念"出回复
- **价格**：从你的 MiniMax 账户余额扣

### 3.5 替代：统一 TTS 网关（如果以后想接多家）

- **UnifiedTTS** <https://unifiedtts.com>：用同一套接口在 MiniMax / CosyVoice / ElevenLabs / Edge / Azure 之间切换
- **OneAPI** <https://github.com/songquanpeng/one-api>：自托管，OpenAI 协议兼容，可把 MiniMax 当一个 channel 接进去
- 适合：以后想换供应商时不用重写代码

---

## 4. 完整推荐路径

按"想花多少时间 / 钱"分三档：

### 🟢 5 分钟上手，零成本

1. 打开 <https://www.minimax.io/audio>（海外版）
2. 注册 → 上传 10 秒你说话的录音（手机录就够）
3. 输入一段文字 → 听效果
4. 满意就每天用 4000 免费积分跑 5 分钟音频

### 🟡 半天折腾，长期免费

1. 装 GPT-SoVITS 整合包（Windows 友好）
2. 准备 1~5 分钟干净录音 → 跑一遍训练
3. 用训练好的模型 + WebUI 批量生成
4. 之后想用 MiniMax 通道的 300+ 音色再装 MiniMax-MCP

### 🔴 一天搞定，可商用

1. 在 <https://platform.minimaxi.com/> 注册 + 充值 10 元
2. 装 MiniMax-MCP，接到 Claude Desktop / Cursor
3. 用 `voice_clone` tool 克隆自己的声音（无需企业认证，MCP 通道走的是网页那套权限）
4. 日常在 Claude 里说"用我的声音念一下这段"，Token 余额直接扣

---

## 5. 录音与克隆效果 Checklist

不管用哪套方案，**录音质量决定 80% 效果**。

- [ ] **环境**：关窗关空调的安静房间，软装（床、沙发）能吸回声
- [ ] **设备**：耳机麦克风 > 桌面麦 > 手机贴近嘴巴
- [ ] **内容**：读一段你没读过的文字，**语速正常、有停顿**
- [ ] **时长**：
  - 零样本克隆：10~30 秒
  - 少样本微调：1~5 分钟
  - **不要超过 10 分钟**，超过反而过拟合
- [ ] **格式**：保存为 16kHz/44.1kHz 单声道 WAV（不行就用 Audacity 转一下）
- [ ] **禁忌**：
  - ❌ 背景音乐 / BGM
  - ❌ 回声 / 远场录音
  - ❌ 多人说话
  - ❌ 切掉头尾的爆破音（留 0.5 秒空白）

---

## 6. 法律 & 伦理

- **只克隆自己的声音**或**拿到明确书面授权**的声音
- 中国《民法典》第 1019 / 1024 条：声音权益受肖像权同等保护
- 生成内容发布时要按所用模型协议**署名**（GPT-SoVITS / CosyVoice / MiniMax 都要求）
- 不要用于：诈骗、伪造他人言论、绕过语音验证

---

## 7. 参考链接

- MiniMax 开放平台（国内）：<https://platform.minimaxi.com/>
- MiniMax 开放平台（海外）：<https://www.minimax.io/>
- MiniMax Audio 网页：<https://www.minimax.io/audio>
- MiniMax-MCP：<https://github.com/MiniMax-AI/MiniMax-MCP>
- GPT-SoVITS：<https://github.com/RVC-Boss/GPT-SoVITS>
- CosyVoice：<https://github.com/FunAudioLLM/CosyVoice>
- F5-TTS：<https://github.com/SWivid/F5-TTS>
- OpenVoice：<https://github.com/myshell-ai/OpenVoice>
- UnifiedTTS：<https://unifiedtts.com>
- OneAPI：<https://github.com/songquanpeng/one-api>
- MiniMax Speech-02 技术报告：<https://arxiv.org/pdf/2505.07916>

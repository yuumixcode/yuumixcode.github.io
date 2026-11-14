/* ============================================================
   Git 第一次不慌 — 双人协作模拟器
   状态模型：
     远端 remote.main  ＝ 团队唯一真相
     A / B 各自拥有     work(工作区) / staged(暂存区) / main(本地分支) / originMain(远端跟踪)
   所有步骤通过「从初始状态重放」得到状态，保证任意步可跳转。
   ============================================================ */
(function () {
  'use strict';

  /* ---------- 基础文件内容 ---------- */
  const BASE_FILE = `using UnityEngine;

public class PlayerHealth : MonoBehaviour
{
    public int maxHealth = 100;
    public int currentHealth;

    void Start()
    {
        currentHealth = maxHealth;
    }
}`;

  const A_ADDS_ARMOR = `using UnityEngine;

public class PlayerHealth : MonoBehaviour
{
    public int maxHealth = 120;
    public int armor = 20;
    public int currentHealth;

    void Start()
    {
        currentHealth = maxHealth;
    }

    public int TakeDamage(int raw)
    {
        int taken = Mathf.Max(0, raw - armor);
        currentHealth = Mathf.Max(0, currentHealth - taken);
        return taken;
    }
}`;

  const B_LOWERS_HP = `using UnityEngine;

public class PlayerHealth : MonoBehaviour
{
    public int maxHealth = 80;
    public int currentHealth;

    void Start()
    {
        currentHealth = maxHealth;
    }

    public void Reset()
    {
        currentHealth = maxHealth;
    }
}`;

  /* B 修改一个不同的文件——专门设计来和 A 的 PlayerHealth.cs 区分 */
  const B_COMBAT_UI = `using UnityEngine;
using UnityEngine.UI;

public class PlayerCombatUI : MonoBehaviour
{
    public Slider healthBar;

    void Start()
    {
        healthBar.maxValue = 100f;
        healthBar.value = healthBar.maxValue;
    }
}`;

  /* A 与 B 改到同一行 → 产生冲突的中间态 */
  const CONFLICT_FILE = `using UnityEngine;

public class PlayerHealth : MonoBehaviour
{
<<<<<<< HEAD
    public int maxHealth = 80;
    public int currentHealth;
=======
    public int maxHealth = 120;
    public int armor = 20;
    public int currentHealth;
>>>>>>> origin/main

    void Start()
    {
        currentHealth = maxHealth;
    }`;

  /* 解决后的结果：以远端为主（120 + 护甲），再把 B 的 Reset 接上去 */
  const RESOLVED_FILE = `using UnityEngine;

public class PlayerHealth : MonoBehaviour
{
    public int maxHealth = 120;   // 采纳 A 的数值：策划要求提高上限
    public int armor = 20;        // 保留 A 新增的字段
    public int currentHealth;

    void Start()
    {
        currentHealth = maxHealth;
    }

    public int TakeDamage(int raw)
    {
        int taken = Mathf.Max(0, raw - armor);
        currentHealth = Mathf.Max(0, currentHealth - taken);
        return taken;
    }

    public void Reset()
    {
        currentHealth = maxHealth;   // B 的改动适配到新基线上
    }
}`;

  /* ============================================================
     场景定义
     ============================================================ */

  const SCENARIOS = [
    /* ---------- 1 ---------- */
    {
      id: 'happy',
      label: '顺畅同步',
      title: '最理想的一次协作：A 提交推送，B 拉取更新',
      desc: '这是没有任何意外的"标准姿势"。先把整条主线跑通一遍，你才知道后面那些麻烦是打哪儿冒出来的。',
      principle: 'commit → push → fetch → pull。这四步构成了几乎所有日常协作的骨架。',
      steps: [
        {
          actor: 'SYS', title: '起点：A 和 B 刚 clone 完',
          term: [
            { t: 'dim', s: '$ git clone git@github.com:yuumix/demo-unity.git' },
            { t: 'ok', s: '  两人本地仓库与远端 origin/main 完全一致' }
          ],
          body: '三个人拿着同一份代码：A 的电脑、B 的电脑、GitHub 上的远端仓库。三份历史一模一样，都是 <code>c1</code>。',
          callout: { type: 'info', text: '注意：此刻 B 电脑上"远端"的那份数据是 clone 那一刻的快照。之后远端变了，B 不会自动知道。' },
          do: []
        },
        {
          actor: 'A', title: 'A 开始改代码，改动出现在工作区',
          cmd: null,
          term: [{ t: 'dim', s: '# A 在 IDE 里修改了 PlayerHealth.cs' }],
          body: 'A 给角色加了护甲和减伤方法。此时改动<strong>只存在于 A 电脑的文件里</strong>，Git 完全没有记录，随时可能因为一次误操作消失。',
          callout: { type: 'warn', text: '这就是工作区的危险之处：它不受版本控制保护。改完代码第一件事应该是 commit。' },
          do: [{ op: 'edit', who: 'A', file: A_ADDS_ARMOR }]
        },
        {
          actor: 'A', title: 'A 把改动放进暂存区',
          cmd: 'git add PlayerHealth.cs',
          term: [
            { t: 'cmd', s: '$ git add PlayerHealth.cs' },
            { t: 'ok', s: '' }
          ],
          body: '<code>add</code> 只是"贴了个待办标签"，还没有真正存档。好处是能<strong>只提交一部分文件</strong>——大项目里这个能力很值钱。',
          callout: { type: 'info', text: '反悔了？add 之后还能用 git restore --staged 文件 撤回，代码不会丢。' },
          do: [{ op: 'stage', who: 'A' }]
        },
        {
          actor: 'A', title: 'A 提交，形成一个快照',
          cmd: 'git commit -m "feat(health): 增加护甲与减伤计算"',
          term: [
            { t: 'cmd', s: '$ git commit -m "feat(health): 增加护甲与减伤计算"' },
            { t: 'ok', s: '[feature/log c2a91f4] feat(health): 增加护甲与减伤计算' },
            { t: 'ok', s: ' 1 file changed, 9 insertions(+), 2 deletions(-)' }
          ],
          body: '本地仓库多了一个提交 <code>c2</code>。<strong>从这一刻起，这份代码永远不会丢了</strong>——哪怕你把文件改烂、删掉、或者 checkout 到别的分支，都能靠这个提交找回来。',
          callout: { type: 'good', text: '这就是"安全带"。commit 之后你就可以放心地做任何实验了。' },
          do: [{ op: 'commit', who: 'A', msg: 'feat(health): 增加护甲与减伤计算' }]
        },
        {
          actor: 'A', title: 'A 推送到远端，团队可见',
          cmd: 'git push -u origin feature/log',
          term: [
            { t: 'cmd', s: '$ git push -u origin feature/log' },
            { t: 'ok', s: 'Enumerating objects: 5, done.' },
            { t: 'ok', s: 'To github.com:yuumix/demo-unity.git' },
            { t: 'ok', s: ' * [new branch]  feature/log -> feature/log' }
          ],
          body: '提交从 A 的本地仓库<strong>飞到了远端</strong>。现在它进了团队的历史，成了大家共享的资产。',
          callout: { type: 'info', text: '-u 是"建立关联"的缩写：它记住了这个本地分支对应远端的哪个分支，以后直接 git push 就行，不用每次都写全。' },
          do: [{ op: 'push', who: 'A' }]
        },
        {
          actor: 'SYS', title: '此刻 B 的世界毫无变化',
          term: [{ t: 'dim', s: '# B 什么也没做' }],
          body: '这是本课最重要的认知之一：<strong>远端变了，B 不会自动收到任何通知</strong>。B 的代码、他的本地仓库，全都还是老样子。',
          callout: { type: 'warn', text: '所以"我明明 push 了啊同事怎么还说他没看到"——因为你们看的不是同一份数据。' },
          do: []
        },
        {
          actor: 'B', title: 'B 先 fetch：只下载，不动代码',
          cmd: 'git fetch origin',
          term: [
            { t: 'cmd', s: '$ git fetch origin' },
            { t: 'ok', s: 'From github.com:yuumix/demo-unity' },
            { t: 'ok', s: ' * branch  feature/log -> FETCH_HEAD' }
          ],
          body: 'B 的本地多了一份"远端快照" <code>origin/main</code>，里面已经包含了 A 的 <code>c2</code>。但<strong>B 的工作区和本地分支一个字节都没变</strong>。',
          callout: { type: 'good', text: 'fetch 是零风险的"侦察"动作。想稳妥地了解情况，先 fetch 是永远正确的选择。' },
          do: [{ op: 'fetch', who: 'B' }]
        },
        {
          actor: 'B', title: 'B 再 pull：下载并合并',
          cmd: 'git pull',
          term: [
            { t: 'cmd', s: '$ git pull' },
            { t: 'ok', s: 'Updating c1b8e3d..c2a91f4' },
            { t: 'ok', s: 'Fast-forward' },
            { t: 'ok', s: ' PlayerHealth.cs | 9 ++++++++--' }
          ],
          body: '这次是 <strong>fast-forward（快进）</strong>：B 的本地分支没有自己的新提交，Git 只需要把指针往前挪，没有产生任何合并节点。历史干干净净。',
          callout: { type: 'good', text: '快进是合并里最理想的情况——说明你和远端从来没分叉过。' },
          do: [{ op: 'pull', who: 'B' }]
        },
        {
          actor: 'SYS', title: '完成：三个人再次同步',
          term: [{ t: 'ok', s: '✓ A、本地、远端、B 全部指向同一份历史' }],
          body: '这就是最理想的一次协作。注意全过程<strong>没有产生任何合并提交，也没有冲突</strong>——因为两个人的改动没有打架。',
          callout: { type: 'info', text: '接下来的场景会告诉你：当改动"打架"时，事情会变成什么样。' },
          do: []
        }
      ]
    },

    /* ---------- 2 ---------- */
    {
      id: 'commit-first',
      label: '先提交再更新',
      title: '本地有改动时，能不能直接 pull？',
      desc: '本场景特意用两个不同的文件（A 改 PlayerHealth.cs，B 改 PlayerCombatUI.cs）来教学——pull 不会报错≠你就安全了。',
      principle: '永远先 commit，再 pull。commit 是零成本的保险——pull 不会出错≠不需要 commit。',
      steps: [
        {
          actor: 'SYS', title: '现状：A 已经推了新提交',
          term: [
            { t: 'dim', s: '# A 刚刚 push 了一个修改 PlayerHealth.cs 的提交' },
            { t: 'ok', s: '  远端 origin/main 已经往前走了' }
          ],
          body: 'A 在 <code>PlayerHealth.cs</code> 里加了护甲与减伤机制。B 还没同步，手里还是老版本。',
          do: [{ op: 'edit', who: 'A', file: A_ADDS_ARMOR }, { op: 'stage', who: 'A' },
               { op: 'commit', who: 'A', msg: 'feat(health): 增加护甲与减伤计算' }, { op: 'push', who: 'A' }]
        },
        {
          actor: 'B', title: 'B 在改另一个文件，还没提交',
          term: [
            { t: 'dim', s: '# B 在 PlayerCombatUI.cs 里改了半天，一个字都没提交' }
          ],
          body: 'B 在 <code>PlayerCombatUI.cs</code> 里加了个血条 UI 绑定。和 A 改的 <code>PlayerHealth.cs</code> 不是同一个文件,<em style="color:var(--accent);">看起来"互不影响"</em>。',
          callout: { type: 'warn', text: '但"看起来没关系"≠"真的安全"。这些改动只在 B 的工作区里,既没暂存也没提交。下面演示它们仍然可能给你带来麻烦。' },
          do: [{ op: 'edit', who: 'B', name: 'PlayerCombatUI.cs', file: B_COMBAT_UI }]
        },
        {
          actor: 'B', title: 'B 想更新，直接 pull —— 居然成功了',
          cmd: 'git pull',
          term: [
            { t: 'cmd', s: '$ git pull' },
            { t: 'ok', s: 'remote: Counting objects: 5, done.' },
            { t: 'ok', s: 'Unpacking objects: 100% (3/3), done.' },
            { t: 'ok', s: 'From github.com:yuumix/demo-unity' },
            { t: 'ok', s: '   c1b8e3d..c2a91f4  feature/log -> origin/feature/log' },
            { t: 'ok', s: 'Updating c1b8e3d..c2a91f4' },
            { t: 'ok', s: 'Fast-forward' },
            { t: 'ok', s: ' PlayerHealth.cs | 9 ++++++++--' },
            { t: 'ok', s: ' 1 file changed, 9 insertions(+), 2 deletions(-)' }
          ],
          body: '因为 B 改的文件和 A 改的不是同一个，pull 直接成功。B 拿到了 A 的 c2，<em style="color:var(--accent);">工作区里 PlayerCombatUI.cs 的改动完整保留</em>。',
          callout: { type: 'warn', text: '看起来"pull 挺安全"对吧?但请继续看,这种"轻松"反而是危险开始。' },
          do: [{ op: 'pull', who: 'B' }]
        },
        {
          actor: 'SYS', title: '可是：工作区仍然脏着',
          term: [
            { t: 'dim', s: '$ git status' },
            { t: 'warn', s: 'On branch feature/log' },
            { t: 'warn', s: 'Your branch is up to date with \'origin/feature/log\'.' },
            { t: 'warn', s: '' },
            { t: 'warn', s: 'Changes not staged for commit:' },
            { t: 'warn', s: '  (use "git add <file>..." to update)' },
            { t: 'warn', s: '        modified:   PlayerCombatUI.cs' },
            { t: 'warn', s: '' },
            { t: 'warn', s: 'no changes added to commit' }
          ],
          body: 'pull 成功了,但<em style="color:var(--accent);">B 工作区里的 PlayerCombatUI.cs 仍然没 commit</em>——一个浮在版本控制系统外的零散改动。',
          callout: { type: 'warn', text: '这时候如果 B 想切到 main 分支修点别的东西,git 会拒绝:它不能把工作区的裸改动藏起来。下一步演示。' }
        },
        {
          actor: 'B', title: '如果这时切分支 —— 又被拒绝',
          cmd: 'git switch main',
          term: [
            { t: 'cmd', s: '$ git switch main' },
            { t: 'err', s: 'error: Your local changes to the following files would be overwritten' },
            { t: 'err', s: '  by checkout:' },
            { t: 'err', s: '        PlayerCombatUI.cs' },
            { t: 'err', s: 'Please commit your changes or stash them before you switch branches.' },
            { t: 'err', s: 'Aborting.' }
          ],
          body: 'git 又把 B 拦下来了。<em style="color:var(--accent);">即使改的是不同文件,只要工作区里有没提交的修改,git 就不让你切分支。</em>',
          callout: { type: 'good', text: '这个拦截是保护你。可以 stash,但最干净的还是 commit——下面演示。' }
        },
        {
          actor: 'B', title: '正解：先 add + commit，把现场存档',
          cmd: 'git commit -m "feat(ui): 添加血条 UI 绑定"',
          term: [
            { t: 'cmd', s: '$ git add PlayerCombatUI.cs' },
            { t: 'cmd', s: '$ git commit -m "feat(ui): 添加血条 UI 绑定"' },
            { t: 'ok', s: '[feature/log 7d2e5b8] feat(ui): 添加血条 UI 绑定' },
            { t: 'ok', s: ' 1 file changed, 11 insertions(+), 2 deletions(-)' }
          ],
          body: '现在 B 的工作区干净了,<code>PlayerCombatUI.cs</code> 的改动被<strong>存进了 B 的本地仓库</strong>。从此以后,B 想切到任何分支都自由——历史里有这个快照。',
          callout: { type: 'good', text: '这一步花不了两秒,却给了你无限次回退的底气。这就是"先提交"的价值。' },
          do: [{ op: 'stage', who: 'B' }, { op: 'commit', who: 'B', msg: 'feat(ui): 添加血条 UI 绑定' }]
        },
        {
          actor: 'B', title: '再 pull —— 干干净净',
          cmd: 'git pull --rebase',
          term: [
            { t: 'cmd', s: '$ git pull --rebase' },
            { t: 'ok', s: 'Current branch feature/log is up to date.' }
          ],
          body: '这次 pull 没东西要拉（本地已经包含了远端 c2），直接成功。B 的两个提交（<code>ui:PlayerCombatUI</code> 和 A 的 c2）在历史里都完整保留。',
          callout: { type: 'good', text: 'commit 之后再 pull,心里的底气完全不一样——出任何问题都能回到 commit 那一刻。' },
          do: [{ op: 'pull', who: 'B', rebase: true }]
        },
        {
          actor: 'SYS', title: '延伸：如果用默认 git pull（不带 --rebase）',
          term: [
            { t: 'dim', s: '$ git pull      # 不带 --rebase' },
            { t: 'ok', s: 'Merge made by the \'recursive\' strategy.' }
          ],
          body: '<strong>如果 B 在 commit 前直接 <code>git pull</code>（没加 <code>--rebase</code>）</strong>,Git 会用 <code>fetch + merge</code> 的默认行为,产生一个 <em>merge commit</em>（提交信息类似 <code>Merge branch \'feature/log\'</code>）。<br><br>这是合法的、默认的,也是大多数 GUI 工具（GitHub Desktop / SourceTree / VS Code 的 Git 面板）做的事。<br><br>团队里通常的"清洁"做法是 <code>--rebase</code>,因为它让本地提交和远端提交呈一条直线,review 更顺。两种都可以,第 08 节会展开。',
          callout: { type: 'info', text: '第一次用 merge 也完全没问题,先别为了"显得专业"去强迫自己用 rebase。' }
        },
        {
          actor: 'SYS', title: '记住这个顺序',
          term: [{ t: 'ok', s: 'git status  →  git add  →  git commit  →  git pull  →  继续干活' }],
          body: '<strong>无论 pull 会不会出错,先 commit 都是对的。</strong>它让你的工作随时可回退、随时可切换分支、不怕冲突也不会被覆盖——这就是"安全带"。',
          callout: { type: 'info', text: '下一个场景（场景 3）：即使两边都 commit 了,只要改到同一行,冲突依然会来。' }
        }
      ]
    },

    /* ---------- 3 ---------- */
    {
      id: 'conflict',
      label: '文件被覆盖',
      title: '两个人改了同一行：冲突现场全解',
      desc: '这是你描述的那个场景的完整版。重点不只是"怎么点那个按钮"，而是"在按下按钮之前，你凭什么判断该选哪一边"。',
      principle: '默认以远端（他人）为主，保住别人的逻辑；然后把自己的改动在这条新基线上重新适配一次。',
      steps: [
        {
          actor: 'A', title: 'A 提交并推送：血量上限提到 120',
          cmd: 'git push',
          term: [
            { t: 'cmd', s: '$ git add . && git commit -m "feat(health): 提升血量上限并加入护甲"' },
            { t: 'cmd', s: '$ git push' },
            { t: 'ok', s: 'To github.com:yuumix/demo-unity.git' },
            { t: 'ok', s: '   c2a91f4..e5b3d77  feature/log -> feature/log' }
          ],
          body: 'A 依据策划案把 <code>maxHealth</code> 从 100 改成 120，同时新增了 <code>armor</code> 字段和 <code>TakeDamage</code> 方法。',
          callout: { type: 'info', text: '这是"有明确意图"的改动——它背后有策划需求，不是随手改的。' },
          do: [{ op: 'edit', who: 'A', file: A_ADDS_ARMOR }, { op: 'stage', who: 'A' },
               { op: 'commit', who: 'A', msg: 'feat(health): 提升血量上限并加入护甲' }, { op: 'push', who: 'A' }]
        },
        {
          actor: 'B', title: 'B 提交：血量上限下调到 80',
          cmd: 'git commit -m "feat(health): 下调血量上限"',
          term: [
            { t: 'cmd', s: '$ git add . && git commit -m "feat(health): 下调血量上限"' },
            { t: 'ok', s: '[feature/log 9a4f2c1] feat(health): 下调血量上限' }
          ],
          body: 'B 依据另一份需求把同一行改成了 <code>80</code>，顺手加了个 <code>Reset()</code> 方法。',
          callout: { type: 'warn', text: 'B 完全不知道 A 也改了这里——两个人都看不见对方的改动，这就是协作的常态。' },
          do: [{ op: 'edit', who: 'B', file: B_LOWERS_HP }, { op: 'stage', who: 'B' },
               { op: 'commit', who: 'B', msg: 'feat(health): 下调血量上限' }]
        },
        {
          actor: 'B', title: 'B fetch 之后：历史正式分叉',
          cmd: 'git fetch origin',
          term: [
            { t: 'cmd', s: '$ git fetch origin' },
            { t: 'ok', s: ' * branch  feature/log -> FETCH_HEAD' }
          ],
          body: 'B 现在能看到远端多了 A 的提交。注意 B 的本地分支<strong>并没有包含</strong> A 的改动——两条线各走各的。',
          callout: { type: 'warn', text: '这就是"分叉"：本地有远端没有的提交，远端也有本地没有的提交。双方都"领先"对方。' },
          do: [{ op: 'fetch', who: 'B' }]
        },
        {
          actor: 'B', title: 'B 执行 pull —— 冲突爆发',
          cmd: 'git pull',
          term: [
            { t: 'cmd', s: '$ git pull' },
            { t: 'err', s: 'Auto-merging PlayerHealth.cs' },
            { t: 'err', s: 'CONFLICT (content): Merge conflict in PlayerHealth.cs' },
            { t: 'err', s: 'Automatic merge failed; fix conflicts and then commit the result.' }
          ],
          body: 'Git 尝试自动合并，发现两边都改了 <code>maxHealth</code> 这一行。它<strong>没有权力替你决定谁对</strong>，于是停下来，把战场原封不动摆在你面前。',
          callout: { type: 'info', text: '冲突不是报错，更不是你的代码坏了。Git 只是不替你丢代码。' },
          do: [{ op: 'conflict', who: 'B' }]
        },
        {
          actor: 'SYS', title: '读懂冲突文件里的尖括号',
          term: [
            { t: 'head', s: '<<<<<<< HEAD        ← 你的这一侧（B 本地）' },
            { t: 'dim',  s: '|||||||  共同祖先    ← 可选，只作参考' },
            { t: 'head', s: '=======            ← 分界线' },
            { t: 'head', s: '>>>>>>> origin/main ← 对方这一侧（远端 A）' }
          ],
          body: '尖括号到等号之间是<strong>你的版本</strong>，等号到大箭头之间是<strong>对方的版本</strong>。B 打开文件后应该看到左右两套 <code>maxHealth</code>。',
          callout: { type: 'info', text: '解决冲突 = 删掉所有标记行，只留下你想要的最终代码。有时候两份都要保留（比如两份 import），不一定是二选一。' },
          do: []
        },
        {
          actor: 'B', title: '关键判断：先想清楚对方为什么这么改',
          term: [
            { t: 'dim', s: '# 在决定之前，先问自己：' },
            { t: 'dim', s: '#   A 把 100 改成 120，是策划要求还是手滑？' }
          ],
          body: '这一步是整个冲突处理的分水岭。<strong>如果你不知道为什么 A 改了这行，那你就没有判断依据。</strong> 猜错方向 = 把 bug 送进主干。',
          callout: { type: 'warn', text: '拿不准就直接问："这行 120 是策划案要求吗？我这边是 80，两边需求对不上了。" 五秒钟解决，比返工一小时划算。' },
          do: []
        },
        {
          actor: 'B', title: '解决：保留 A 的逻辑，把 B 的接上去',
          cmd: '# 手动编辑 PlayerHealth.cs',
          term: [
            { t: 'dim', s: '# 采纳 A 的 120 与 armor 字段（别人的需求不能丢）' },
            { t: 'dim', s: '# 同时保留 B 的 Reset() 方法' },
            { t: 'ok',   s: '# 删掉 <<<<<<< ======= >>>>>>> 全部标记' }
          ],
          body: '最终结果既不是纯 A 也不是纯 B，而是一份<strong>更完整的第三版</strong>：A 的血量数值和护甲系统全部保留，B 的 <code>Reset()</code> 方法也接在了新基线上。',
          callout: { type: 'good', text: '这就是"以远端为主，然后自己做适配"的具体含义：把对方的结果当成新的起点，在它之上重建自己的东西。' },
          do: [{ op: 'resolve', who: 'B' }]
        },
        {
          actor: 'B', title: '标记解决，然后提交合并',
          cmd: 'git add PlayerHealth.cs && git commit',
          term: [
            { t: 'cmd', s: '$ git add PlayerHealth.cs' },
            { t: 'cmd', s: '$ git commit -m "merge: 合并 origin/main，保留护甲系统并适配 Reset"' },
            { t: 'ok',  s: '[feature/log 3f8c1d2] merge: 合并 origin/main...' }
          ],
          body: 'Git 记录下这个合并提交。分叉从此合流，历史里完整保留了"两边都做了什么"和"最后怎么和解的"。',
          callout: { type: 'good', text: '解决一个文件就 add 一个，别攒到最后。Git 在你没 add 之前会禁止提交，这是保护你。' },
          do: [{ op: 'commitMerge', who: 'B', msg: 'merge: 合并 origin/main，保留护甲系统并适配 Reset' }]
        },
        {
          actor: 'B', title: '推上去，团队拿到完整版本',
          cmd: 'git push',
          term: [
            { t: 'cmd', s: '$ git push' },
            { t: 'ok', s: '   9a4f2c1..3f8c1d2  feature/log -> feature/log' }
          ],
          body: '冲突彻底结束，A 下次 pull 就能拿到这个合并结果。<strong>整个过程没有丢掉任何一个人的代码。</strong>',
          callout: { type: 'info', text: '最后养成习惯：提交前用 git diff --check 扫一遍，能揪出漏网的冲突标记。' },
          do: [{ op: 'push', who: 'B' }]
        }
      ]
    },

    /* ---------- 4 ---------- */
    {
      id: 'rejected',
      label: '推送被拒',
      title: 'push 被拒绝：以及那个千万别按的按钮',
      desc: 'non-fast-forward 报错是新手第二常见的恐惧来源。这个场景会告诉你它到底在说什么，以及为什么强推是个坏主意。',
      principle: '被拒不是错误，是保护。正确解法永远是「先 fetch 看清 → 整合 → 再 push」。',
      steps: [
        {
          actor: 'SYS', title: '现状：B 没 pull 就想推',
          term: [
            { t: 'dim', s: '# 远端已经被 A 推进了，B 的本地落后了' }
          ],
          body: 'B 基于老版本做了提交，但完全不知道远端已经变了。',
          do: [{ op: 'edit', who: 'A', file: A_ADDS_ARMOR }, { op: 'stage', who: 'A' },
               { op: 'commit', who: 'A', msg: 'feat(health): 增加护甲与减伤计算' }, { op: 'push', who: 'A' },
               { op: 'edit', who: 'B', file: B_LOWERS_HP }, { op: 'stage', who: 'B' },
               { op: 'commit', who: 'B', msg: 'feat(health): 新增 Reset 方法' }]
        },
        {
          actor: 'B', title: 'B 执行 push —— 被拒绝',
          cmd: 'git push',
          term: [
            { t: 'cmd', s: '$ git push' },
            { t: 'err', s: ' ! [rejected]        feature/log -> feature/log' },
            { t: 'err', s: '   (non-fast-forward)' },
            { t: 'err', s: 'error: failed to push some refs to' },
            { t: 'err', s: 'hint: Updates were rejected because the tip of your' },
            { t: 'err', s: 'hint: current branch is behind its remote counterpart.' }
          ],
          body: '<strong>non-fast-forward</strong> 的字面意思是"你不能快进"。Git 发现远端有它没有的提交，如果直接接受你的推送，A 的提交就会被<strong>整个抹掉</strong>。',
          callout: { type: 'good', text: '所以这是 Git 在替你踩刹车。默认行为是安全的——它宁可拒绝，也不让你误删同事的工作。' },
          do: [{ op: 'rejectPush', who: 'B' }]
        },
        {
          actor: 'B', title: '危险动作：--force 会发生什么',
          cmd: 'git push --force',
          term: [
            { t: 'err', s: '$ git push --force        ← 千万别在共享分支上做' },
            { t: 'err', s: '  远端的 c2a91f4 被删除' },
            { t: 'err', s: '  A 同事辛苦写的护甲代码，从历史中消失' }
          ],
          body: '强推<strong>直接改写远端历史</strong>。A 的那个提交会从远端消失——虽然 A 本地还留着，但下一次 A 拉代码时会遇到一整套他完全没见过的麻烦。',
          callout: { type: 'bad', text: '真有人这么干过：他强推覆盖了同事两天的代码。Git 通过 reflog 最终救回来了，但那天下午的兵荒马乱是真的。共享分支上，--force 是禁忌。' },
          do: []
        },
        {
          actor: 'B', title: '正解：先 fetch，搞清楚状况',
          cmd: 'git fetch origin',
          term: [
            { t: 'cmd', s: '$ git fetch origin' },
            { t: 'ok', s: 'From github.com:yuumix/demo-unity' },
            { t: 'ok', s: ' * branch  feature/log -> FETCH_HEAD' }
          ],
          body: '现在 B 知道远端多了 A 的提交，而且<strong>自己的代码完全没被动过</strong>。信息补齐了，决策才有依据。',
          callout: { type: 'info', text: '用 git log --oneline HEAD..origin/main 可以精确列出"远端有、我还没有"的提交。' },
          do: [{ op: 'fetch', who: 'B' }]
        },
        {
          actor: 'B', title: '整合：用 rebase 把自己的提交接上去',
          cmd: 'git rebase origin/main',
          term: [
            { t: 'cmd', s: '$ git rebase origin/main' },
            { t: 'ok', s: 'Successfully rebased and updated refs/heads/feature/log.' }
          ],
          body: 'B 的提交被"拔下来"插到了 A 的提交后面，历史重新变成一条直线，没有多余的合并节点。',
          callout: { type: 'info', text: '等价写法是 git pull --rebase，一步搞定 fetch + rebase。' },
          do: [{ op: 'pull', who: 'B', rebase: true }]
        },
        {
          actor: 'B', title: '重新 push —— 这次通过了',
          cmd: 'git push',
          term: [
            { t: 'cmd', s: '$ git push' },
            { t: 'ok', s: '   6b2f9a3..c4e8d15  feature/log -> feature/log' }
          ],
          body: '因为 B 的历史现在<strong>包含了远端的全部提交</strong>，推送变成了合法的快进，Git 欣然接受。',
          callout: { type: 'good', text: '完整的自保流程：fetch → 看清楚 → 整合 → push。全程没有任何人的工作被牺牲。' },
          do: [{ op: 'push', who: 'B' }]
        },
        {
          actor: 'SYS', title: '预防胜于补救',
          term: [
            { t: 'ok', s: '开工前：git fetch origin' },
            { t: 'ok', s: '推送前：git pull --rebase' }
          ],
          body: '这两个动作加起来花不到五秒，却能让上面整个事故链条消失。<strong>与其学会怎么从 non-fast-forward 里爬出来，不如一开始就别掉进去。</strong>',
          callout: { type: 'info', text: '下一场景看看进阶一点的 rebase：它是干什么的，以及什么时候绝对不能碰。' },
          do: []
        }
      ]
    },

    /* ---------- 5 ---------- */
    {
      id: 'rebase',
      label: '变基整理历史',
      title: '进阶：rebase 到底在做什么',
      desc: 'rebase 被说成高级操作，其实一句话就能说清。把你的提交拔下来，插到别的地方，重新拍一遍照。难的是知道什么时候该用。',
      principle: 'rebase 只在「这条线只有你一个人推过」的时候做。已经推给别人的提交，动了就是给别人添乱。',
      steps: [
        {
          actor: 'B', title: 'B 的分支历史长这样',
          term: [
            { t: 'dim', s: '$ git log --oneline' },
            { t: 'dim', s: '4a2e9c1 fix: 再调一下数值' },
            { t: 'dim', s: '7b3d5f8 wip: 先这样' },
            { t: 'dim', s: '1c9a4e2 wip: 还是不对' },
            { t: 'dim', s: 'c1b8e3d init: 项目初始提交' }
          ],
          body: '典型的"边写边提交"痕迹。三个 <code>wip</code> 提交看得人眼花，而且中间还夹着远端的新提交没同步进来。',
          do: [{ op: 'edit', who: 'A', file: A_ADDS_ARMOR }, { op: 'stage', who: 'A' },
               { op: 'commit', who: 'A', msg: 'feat(health): 增加护甲与减伤计算' }, { op: 'push', who: 'A' },
               { op: 'commit', who: 'B', msg: 'wip: 还是不对', explicit: true },
               { op: 'commit', who: 'B', msg: 'wip: 先这样', explicit: true },
               { op: 'commit', who: 'B', msg: 'fix: 再调一下数值', explicit: true }]
        },
        {
          actor: 'SYS', title: '问题在哪',
          term: [
            { t: 'warn', s: '  ✗ 历史里混着 wip，看不出哪次改了什么' },
            { t: 'warn', s: '  ✗ 落后远端，review 的人得先自己理清顺序' }
          ],
          body: '不是功能有问题，是<strong>可读性问题</strong>。提交历史是给未来的自己和同事读的日志，混乱的日志会让 code review 变成猜谜。',
          callout: { type: 'info', text: '很多人以为 wip 提交很丢人，其实它完全没问题——它记录了真实的思考过程。问题是别让它进入共享分支。' },
          do: []
        },
        {
          actor: 'B', title: '同步远端',
          cmd: 'git fetch origin',
          term: [
            { t: 'cmd', s: '$ git fetch origin' },
            { t: 'ok', s: ' * branch  main -> origin/main' }
          ],
          body: 'B 先拿到远端最新情况，再决定怎么整理。',
          do: [{ op: 'fetch', who: 'B' }]
        },
        {
          actor: 'B', title: '变基：把三个提交接到远端后面',
          cmd: 'git rebase origin/main',
          term: [
            { t: 'cmd', s: '$ git rebase origin/main' },
            { t: 'warn', s: 'CONFLICT (content): Merge conflict in PlayerHealth.cs' },
            { t: 'warn', s: 'error: could not apply 1c9a4e2...' }
          ],
          body: 'rebase 做的事是：把 B 的三个提交逐个<strong>摘下来，重放到 <code>origin/main</code> 的顶上</strong>。每重放一个提交，Git 都会停下来问一次"这个提交在这个新位置上还成立吗"。',
          callout: { type: 'warn', text: '很可能会冲突——因为 A 也改了那个文件。rebase 是"逐个提交重放"，所以它可能停下来问你好几次，而 merge 只问一次。' },
          do: [{ op: 'rebaseStart', who: 'B' }]
        },
        {
          actor: 'B', title: 'rebase 冲突的头号陷阱：身份互换',
          term: [
            { t: 'err', s: 'HEAD  = origin/main 的内容（A 的版本）' },
            { t: 'err', s: 'theirs = 你正在重放的提交（B 的版本）' },
            { t: 'warn', s: '⚠ 和 merge 时的 ours/theirs 正好相反' }
          ],
          body: '在 <code>main</code> 上 <code>git merge feature/x</code>，<code>HEAD</code> 是你的 main，<code>--ours</code> 指你自己。' +
                '但在 <code>feature/x</code> 上 <code>git rebase main</code>，<code>--ours</code> <strong>反而变成了远端的 main</strong>，你的改动成了 <code>--theirs</code>。' +
                '<br><br>一句话记忆：<strong>merge 时"我方"= 你所在的分支；rebase 时"我方"= 你要 rebase 上去的那个目标分支</strong>。',
          callout: { type: 'bad', text: '这是实战里坑最多的知识点。误用 --ours 会把整个远端代码吞进来，同时把自己的改动全丢掉。用之前一定先 git status 看清当前分支。' },
          do: [{ op: 'rebaseConflict', who: 'B' }]
        },
        {
          actor: 'B', title: '解决后继续，直到重放完成',
          cmd: 'git add . && git rebase --continue',
          term: [
            { t: 'cmd', s: '$ git add PlayerHealth.cs' },
            { t: 'cmd', s: '$ git rebase --continue' },
            { t: 'ok', s: 'Successfully rebased and updated refs/heads/feature/login.' }
          ],
          body: 'rebase 完成后，<strong>B 那三个提交的哈希全变了</strong>（从 1c9a4e2 变成别的），因为它们的父提交换了，内容一样但"身份证"不同。',
          callout: { type: 'good', text: '这就是为什么不能 rebase 已推送的提交：别人手里还拿着旧哈希的引用，你一改他们的历史就乱了。' },
          do: [{ op: 'rebaseDone', who: 'B' }]
        },
        {
          actor: 'SYS', title: '整理后的历史',
          term: [
            { t: 'ok', s: '4a2e9c1 fix: 再调一下数值' },
            { t: 'ok', s: '7b3d5f8 wip: 先这样' },
            { t: 'ok', s: '1c9a4e2 wip: 还是不对' },
            { t: 'ok', s: 'c2a91f4 feat(health): 增加护甲与减伤计算  ← 远端的提交在最下面' }
          ],
          body: '一条直线，每个提交含义清晰。review 的人打开就能看懂你做了什么。',
          callout: { type: 'info', text: '还可以配合 git commit --amend 或交互式 rebase 把三个 wip 压成一个干净的提交，但这一步对初学者不是必需的。' },
          do: []
        },
        {
          actor: 'SYS', title: 'rebase 的使用边界',
          term: [
            { t: 'ok', s: '✅ 可以：自己的私有分支、同步远端、整理未推送的历史' },
            { t: 'err', s: '❌ 不行：已推送给别人的提交、main / develop 等共享分支' }
          ],
          body: '如果 rebase 中途觉得不对劲，<strong><code>git rebase --abort</code> 随时可以一键回到变基之前</strong>。放心试，反正你 rebase 前一定是干净的。',
          callout: { type: 'info', text: '对初学者的结论：日常用 merge 完全够用。等你开始嫌 git log 乱、想让 PR 更好读时，再学 rebase 也不迟。' },
          do: []
        }
      ]
    },

    /* ---------- 6 ---------- */
    {
      id: 'pr',
      label: '分支与 PR',
      title: '团队标准姿势：别在 main 上直接改',
      desc: '前五个场景都在讲"怎么不出事"，这个场景讲"怎么让整个团队都不出事"。',
      principle: '共享分支只通过 Pull Request 修改。作者是作者，裁判是裁判。',
      steps: [
        {
          actor: 'SYS', title: '危险做法：所有人直接往 main 推',
          term: [
            { t: 'err', s: '$ git switch main' },
            { t: 'err', s: '$ git commit -m "改了点东西" && git push' },
            { t: 'err', s: '  ✗ 没人 review  ✗ 没有测试  ✗ 出事查不到人' }
          ],
          body: '两条提交同时从 main 分出去，main 会变成谁都能改的公共黑板。这在两三个人的小团队里也许还能撑，人一多就崩。',
          callout: { type: 'bad', text: '更隐蔽的问题是：出了问题你不知道是哪次提交引入的，也没人能帮你确认这个改动是安全的。' },
          do: [{ op: 'edit', who: 'A', file: A_ADDS_ARMOR }, { op: 'stage', who: 'A' },
               { op: 'commit', who: 'A', msg: 'feat(health): 增加护甲与减伤计算' }, { op: 'push', who: 'A' }]
        },
        {
          actor: 'B', title: '正解第一步：从 main 开一个自己的分支',
          cmd: 'git switch -c feature/reset-method',
          term: [
            { t: 'cmd', s: '$ git switch main' },
            { t: 'cmd', s: '$ git pull                        # 先保证 main 是最新的' },
            { t: 'cmd', s: '$ git switch -c feature/reset-method' },
            { t: 'ok', s: "Switched to a new branch 'feature/reset-method'" }
          ],
          body: '新分支从<strong>最新的 main</strong> 长出来，带着 A 的改动一起。这样 B 的 PR 一开就是完整的功能，而不是半个。',
          callout: { type: 'info', text: 'git switch - 可以在两个分支之间反复横跳，是日常操作里最省时间的一个键。' },
          do: [{ op: 'fetch', who: 'B' }, { op: 'pull', who: 'B' },
               { op: 'branch', who: 'B', name: 'feature/reset-method' }]
        },
        {
          actor: 'B', title: '在自己的分支上放心写代码',
          cmd: 'git commit -m "feat(health): 添加 Reset 方法"',
          term: [
            { t: 'dim', s: '# B 在 feature/reset-method 上开发' },
            { t: 'cmd', s: '$ git add . && git commit -m "feat(health): 添加 Reset 方法"' },
            { t: 'ok', s: '[feature/reset-method 5e1a7b3] feat(health): 添加 Reset 方法' }
          ],
          body: '在分支上，B 想 commit 多少次就 commit 多少次，想 push 多少次就 push 多少次——<strong>不会影响任何其他人</strong>。',
          callout: { type: 'good', text: '分支给了你一个"可以放心折腾"的隔离区。这是分支最大的价值。' },
          do: [{ op: 'edit', who: 'B', file: B_LOWERS_HP }, { op: 'stage', who: 'B' },
               { op: 'commit', who: 'B', msg: 'feat(health): 添加 Reset 方法' }]
        },
        {
          actor: 'B', title: '推送分支并建立关联',
          cmd: 'git push -u origin feature/reset-method',
          term: [
            { t: 'cmd', s: '$ git push -u origin feature/reset-method' },
            { t: 'ok', s: ' * [new branch]  feature/reset-method -> feature/reset-method' },
            { t: 'ok', s: "branch 'feature/reset-method' set up to track 'origin/feature/reset-method'" }
          ],
          body: '<code>-u</code> 建立了本地分支和远端分支的对应关系，以后 B 直接敲 <code>git push</code> 就行。',
          do: [{ op: 'push', who: 'B' }]
        },
        {
          actor: 'B', title: '发起 Pull Request',
          term: [
            { t: 'ok', s: '  feature/reset-method  →  main' },
            { t: 'ok', s: '  ✓ 自动 diff 预览' },
            { t: 'ok', s: '  ✓ CI 流水线：编译通过 / 单元测试通过' },
            { t: 'ok', s: '  ✓ 等待 1 位同事 review' }
          ],
          body: 'PR 把"我想改什么"变成一个<strong>可以被讨论和被否决</strong>的请求。改动的每一行都摆在台面上。',
          callout: { type: 'info', text: '如果是开源项目，你可能没有直接推送权限，需要先 fork 仓库，再从自己的 fork 开 PR 回去。' },
          do: [{ op: 'prOpen' }]
        },
        {
          actor: 'SYS', title: '同事 review 后合并',
          term: [
            { t: 'ok', s: '  Alice: 这个 Reset 和护甲系统的初始顺序要对一下' },
            { t: 'ok', s: '  Bob:     LGTM，已按建议调整' },
            { t: 'ok', s: '  ✓ merged commit 4d8e2f1 into main' }
          ],
          body: 'PR 合并后，远端 main 前进了一步。这一步的每个决策都留下了记录：谁写的、谁审的、什么时候合的。',
          callout: { type: 'good', text: '这就是 review 的真正价值——不是抓 bug，而是让另一个人确认"这个改动我理解了"。' },
          do: [{ op: 'prMerge' }]
        },
        {
          actor: 'B', title: '收尾：切回 main 同步，然后清理',
          cmd: 'git switch main && git pull && git branch -d feature/reset-method',
          term: [
            { t: 'cmd', s: '$ git switch main' },
            { t: 'cmd', s: '$ git pull' },
            { t: 'ok', s: "Deleted branch feature/reset-method (was 5e1a7b3)." },
            { t: 'ok', s: '# 如果 B 还没推本地提交，先 git push 一下' }
          ],
          body: '一个功能从开分支到合入，完整闭环。下一个功能重复这个循环就行。',
          callout: { type: 'good', text: '短命分支 + PR 合并，就是绝大多数团队实际在用的工作流。简单，但有效。' },
          do: [{ op: 'prCleanup' }]
        },
        {
          actor: 'SYS', title: '完整的团队循环',
          term: [
            { t: 'ok', s: 'fetch → switch -c feature/x → 开发 → commit → push' },
            { t: 'ok', s: '→ 开 PR → review → 合并 → switch main → pull → 删分支' }
          ],
          body: '这个循环你每天都会跑一遍。前五个场景里学的每一个技能——commit 存档、fetch 侦察、冲突处理、push 被拒的处理——都是为了这个循环能顺畅跑完。',
          do: []
        }
      ]
    }
  ];

  /* ============================================================
     状态引擎
     ============================================================ */
  const C = {};   // commit registry

  function mkDev() {
    return { work: null, staged: null, main: ['c1'], originMain: ['c1'], branch: 'main', branches: { main: ['c1'] } };
  }

  function freshState() {
    C.c1 = { id: 'c1', author: 'SYS', msg: 'init: 项目初始提交' };
    return { seq: 2, remote: { main: ['c1'] }, A: mkDev(), B: mkDev() };
  }

  function newCommit(s, author, msg) {
    const id = 'c' + s.seq++;
    C[id] = { id, author, msg };
    return id;
  }

  function devOf(s, w) { return s[w]; }

  function commonPrefix(a, b) {
    let i = 0;
    while (i < a.length && i < b.length && a[i] === b[i]) i++;
    return i;
  }

  const OPS = {
    edit(s, o) {
      const d = devOf(s, o.who);
      d.work = { name: o.name || 'PlayerHealth.cs', file: o.file };
      d.dirty = true;
    },
    stage(s, o) {
      const d = devOf(s, o.who);
      d.staged = d.work ? { name: d.work.name, file: d.work.file } : null;
      d.dirty = true;
    },
    commit(s, o) {
      const d = devOf(s, o.who);
      const file = d.staged ? d.staged.file : (d.work ? d.work.file : BASE_FILE);
      const name = d.staged ? d.staged.name : (d.work ? d.work.name : 'PlayerHealth.cs');
      const id = newCommit(s, o.who, o.msg);
      d.branches[d.branch] = (d.branches[d.branch] || []).concat([id]);
      /* 真实 Git:commit 后 staged 已清;这里为了教学保留内容快照,加 demo 标记 */
      d.staged = { name, file, demo: true };
      d.work = { name, file };
      d.dirty = false;
    },
    commitMerge(s, o) {
      const d = devOf(s, o.who);
      const id = newCommit(s, o.who, o.msg);
      C[id].merge = true;
      d.branches[d.branch] = (d.branches[d.branch] || []).concat([id]);
      d.staged = { name: 'PlayerHealth.cs', file: RESOLVED_FILE, demo: true };
      d.work = { name: 'PlayerHealth.cs', file: RESOLVED_FILE };
      d.dirty = false;
    },
    push(s, o) {
      const d = devOf(s, o.who);
      const list = d.branches[d.branch] || d.main;
      s.remote.main = list.slice();
      d.originMain = list.slice();
    },
    fetch(s, o) {
      const d = devOf(s, o.who);
      d.originMain = s.remote.main.slice();
    },
    pull(s, o) {
      const d = devOf(s, o.who);
      const cur = d.branches[d.branch] || d.main;
      const remote = s.remote.main;
      const p = commonPrefix(cur, remote);
      if (o.rebase) {
        // 自己的提交重新接到远端之后
        const own = cur.slice(p);
        const next = remote.slice().concat(own.map(id => {
          const nid = newCommit(s, C[id].author, C[id].msg);
          C[nid].rebased = true;
          return nid;
        }));
        d.branches[d.branch] = next;
      } else {
        d.branches[d.branch] = remote.slice();
        // pull 成功时工作区的未提交改动保持不变(可能与 A 改了不同文件)
      }
      d.main = d.branches[d.branch];
      d.originMain = s.remote.main.slice();
    },
    conflict(s, o) {
      const d = devOf(s, o.who);
      d.staged = null;
      d.work = { name: 'PlayerHealth.cs', file: CONFLICT_FILE };
      d.conflict = true;
      d.dirty = true;
    },
    resolve(s, o) {
      const d = devOf(s, o.who);
      d.work = { name: 'PlayerHealth.cs', file: RESOLVED_FILE };
      d.conflict = false;
      d.resolved = true;
      d.dirty = true; // 已手动解决,还需 commit 一次
    },
    branch(s, o) {
      const d = devOf(s, o.who);
      d.branches[o.name] = (d.branches[d.branch] || d.main).slice();
      d.branch = o.name;
    },
    rebaseStart(s, o) {
      const d = devOf(s, o.who);
      d.rebasing = true;
      d.staged = null;
      d.work = { name: 'PlayerHealth.cs', file: CONFLICT_FILE };
      d.conflict = true;
      d.dirty = true;
    },
    rebaseConflict(s, o) { /* 状态不变，仅提示 */ },
    rebaseDone(s, o) {
      const d = devOf(s, o.who);
      const remote = s.remote.main;
      const own = (d.branches[d.branch] || d.main).slice().reverse().slice(0, 3).reverse();
      const next = remote.slice().concat(own.map(id => {
        const nid = newCommit(s, C[id].author, C[id].msg);
        C[nid].rebased = true;
        return nid;
      }));
      d.branches[d.branch] = next;
      d.main = next;
      d.rebasing = false;
      d.conflict = false;
      d.work = { name: 'PlayerHealth.cs', file: RESOLVED_FILE };
      d.dirty = false;
    },
    prOpen(s) { s.prOpen = true; },
    prMerge(s) {
      s.prOpen = false;
      s.prMerged = true;
      const id = newCommit(s, 'SYS', 'merge: 合并 PR #42 feature/reset-method');
      C[id].merge = true;
      s.remote.main = s.remote.main.concat([id]);
      s.A.originMain = s.remote.main.slice();
    },
    prCleanup(s) {
      const d = s.B;
      delete d.branches['feature/reset-method'];
      d.branch = 'main';
      d.branches['main'] = s.remote.main.slice();
      d.main = s.remote.main;
      d.originMain = s.remote.main.slice();
    },
    rejectPull(s, o) { s.lastEvent = 'rejectPull'; },
    rejectPush(s, o) { s.lastEvent = 'rejectPush'; }
  };

  function buildState(scn, upTo) {
    Object.keys(C).forEach(k => delete C[k]);
    const s = freshState();
    s.A.work = null; s.A.staged = null; s.B.work = null; s.B.staged = null;
    for (let i = 0; i <= upTo; i++) {
      const st = scn.steps[i];
      if (!st) break;
      (st.do || []).forEach(o => { if (OPS[o.op]) OPS[o.op](s, o); });
    }
    return s;
  }

  /* ============================================================
     渲染
     ============================================================ */
  const $ = id => document.getElementById(id);
  const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  let scnIdx = 0, stepIdx = 0, autoTimer = null;

  function renderTerm(scn, upTo) {
    const lines = [];
    for (let i = 0; i <= upTo; i++) {
      const st = scn.steps[i];
      if (!st) break;
      if (st.cmd) lines.push({ t: 'cmd', s: '$ ' + st.cmd });
      (st.term || []).forEach(l => {
        if (i === upTo && l.s && l.s === '$ ' + st.cmd) return; // cmd 行已在上面输出过
        lines.push(l);
      });
    }
    const body = $('termBody');
    body.innerHTML = lines.map(l => `<div class="term-line ${l.t || ''}">${esc(l.s) || '&nbsp;'}</div>`).join('');
    body.scrollTop = body.scrollHeight;
  }

  function commitChain(list, opts) {
    opts = opts || {};
    if (!list || !list.length) return '<span class="chain-empty">（空）</span>';
    return list.map((id, i) => {
      const c = C[id] || { id, author: 'SYS', msg: '' };
      const cls = id === 'c1' ? 'base' : (c.author === 'A' ? 'a' : c.author === 'B' ? 'b' : 'base');
      const isLast = i === list.length - 1;
      const fresh = isLast && opts.fresh;
      const tag = c.merge ? '<span class="cnode-tag merge">merge</span>' : '';
      return `<div class="cnode ${cls} ${fresh ? 'fresh' : ''}" data-cid="${id}">${id}${tag}</div>`;
    }).join('');
  }

  /* 带冲突标记着色的文件渲染 */
  function fileCode(file, baseFile) {
    const baseSet = new Set((baseFile || '').split('\n'));
    const lines = file.split('\n');
    let zone = 'ctx';
    return lines.map((l, i) => {
      let cls = 'line';
      if (/^<{7}/.test(l)) { zone = 'ours'; cls = 'line cfm'; }
      else if (/^\|{7}/.test(l)) { zone = 'base'; cls = 'line cfm'; }
      else if (/^={7}/.test(l)) { zone = 'ctx'; cls = 'line cfm'; }
      else if (/^>{7}/.test(l)) { zone = 'theirs'; cls = 'line cfm'; }
      else if (zone === 'ours') cls = 'line mod';
      else if (zone === 'theirs') cls = 'line add';
      else if (baseSet && !baseSet.has(l) && l.trim()) cls = 'line add';
      return `<span class="${cls}"><span class="ln">${i + 1}</span>${esc(l) || ' '}</span>`;
    }).join('');
  }

  function workingBlock(d) {
    if (d.conflict) {
      return `<div class="rz-label">工作区 <span class="rz-badge">⚠ 冲突</span></div>
        <div class="rz-body danger">
          <div class="file-head"><span class="file-chip work">${esc(d.work.name)}</span><span>合并冲突，等待你裁决</span></div>
          <pre class="file-code">${fileCode(d.work.file, BASE_FILE)}</pre>
        </div>`;
    }
    /* 已经 commit/合并/rebase 完成,工作区与最新提交一致 —— 只显示干净徽标,不重复渲染整文件 */
    if (d.work && !d.dirty) {
      return `<div class="rz-label">工作区</div>
        <div class="rz-body"><div class="file-head"><span class="file-chip clean">✓</span><span>干净,与最后一次提交一致</span></div></div>`;
    }
    /* 编辑后又产生新改动(已 staged,但工作区又有新内容) */
    if (d.work && d.staged && d.work.file !== d.staged.file) {
      return `<div class="rz-label">工作区 <span class="rz-badge">还有新改动</span></div>
        <div class="rz-body hot">
          <div class="file-head"><span class="file-chip work">${esc(d.work.name)}</span><span>未暂存</span></div>
          <pre class="file-code">${fileCode(d.work.file, BASE_FILE)}</pre>
        </div>`;
    }
    /* 编辑后未提交 —— 工作区有未暂存的内容 */
    if (d.work && d.dirty) {
      return `<div class="rz-label">工作区 <span class="rz-badge">有未提交改动</span></div>
        <div class="rz-body hot">
          <div class="file-head"><span class="file-chip work">${esc(d.work.name)}</span><span>未暂存 · 未提交</span></div>
          <pre class="file-code">${fileCode(d.work.file, BASE_FILE)}</pre>
        </div>`;
    }
    /* 刚 resolve 但还没 commit —— 仍然 dirty,但没有 conflict 标记了 */
    if (d.work && d.dirty && d.resolved) {
      return `<div class="rz-label">工作区 <span class="rz-badge">已解决 · 待提交</span></div>
        <div class="rz-body hot">
          <div class="file-head"><span class="file-chip work">${esc(d.work.name)}</span><span>冲突标记已清,等待 commit</span></div>
          <pre class="file-code">${fileCode(d.work.file, BASE_FILE)}</pre>
        </div>`;
    }
    return `<div class="rz-label">工作区</div>
      <div class="rz-body"><div class="file-head"><span class="file-chip clean">✓</span><span>干净,与最后一次提交一致</span></div></div>`;
  }

  function stagedBlock(d) {
    /* commit 后的"演示态" —— 真实 Git 暂存区已清,这里保留刚提交的内容快照,加 demo 标记辅助教学 */
    if (d.staged && d.staged.demo) {
      return `<div class="rz-label">暂存区 <span class="rz-badge demo">演示 · 已 commit,实际已清</span></div>
        <div class="rz-body demo">
          <div class="file-head"><span class="file-chip staged demo">${esc(d.staged.name)}</span><span>刚刚提交,这里是「这次改了什么」的快照</span></div>
          <pre class="file-code">${fileCode(d.staged.file, BASE_FILE)}</pre>
        </div>`;
    }
    if (d.staged) {
      return `<div class="rz-label">暂存区 <span class="rz-badge">待提交</span></div>
        <div class="rz-body hot">
          <div class="file-head"><span class="file-chip staged">${esc(d.staged.name)}</span><span>已 add，等待 commit</span></div>
        </div>`;
    }
    return `<div class="rz-label">暂存区</div><div class="rz-body"><div class="file-head"><span class="file-chip">空</span></div></div>`;
  }

  function forkBadges(d) {
    const cur = d.branches[d.branch] || d.main;
    const p = commonPrefix(cur, d.originMain);
    const ahead = cur.length - p;
    const behind = d.originMain.length - p;
    const out = [];
    if (d.dirty) out.push('<span class="fs-badge dirty">工作区有未提交改动</span>');
    if (ahead > 0) out.push(`<span class="fs-badge ahead">领先 origin/main ${ahead} 个提交</span>`);
    if (behind > 0) out.push(`<span class="fs-badge behind">落后 origin/main ${behind} 个提交</span>`);
    if (!ahead && !behind && !d.dirty) out.push('<span class="fs-badge clean">与 origin/main 同步</span>');
    return out.length ? out.join('') : '';
  }

  function devCol(who, label, sub, s, scn) {
    const d = s[who];
    const cur = d.branches[d.branch] || d.main;
    const active = (scn.steps[stepIdx] || {}).actor === who ? ' active' : '';
    return `
      <div class="dev-head">
        <div class="avatar ${who.toLowerCase()}${active}">${who === 'A' ? 'A' : 'B'}</div>
        <div class="dev-name">${label}<span class="dev-sub">${sub}</span></div>
        <div class="dev-branch">${esc(d.branch)}</div>
      </div>
      <div class="rz">${workingBlock(d)}</div>
      <div class="rz">${stagedBlock(d)}</div>
      <div class="rz">
        <div class="rz-label">本地仓库</div>
        <div class="rz-body"><div class="chain">${commitChain(cur, { fresh: true })}</div>
        <div class="rz-msg"><b>${esc(d.branch)}</b> · ${cur.length} 个提交 · 仅本机可见</div></div>
      </div>
      <div class="fork-state">${forkBadges(d)}</div>`;
  }

  function remoteCol(s, scn) {
    const stepActor = (scn.steps[stepIdx] || {}).actor;
    const active = (stepActor !== 'A' && stepActor !== 'B') ? ' active' : '';
    const brs = Object.keys(s.remote).filter(k => k !== 'main');
    return `
      <div class="dev-head">
        <div class="avatar r${active}" style="border-radius:11px">☁</div>
        <div class="dev-name">远端仓库<span class="dev-sub">GitHub · origin</span></div>
      </div>
      <div class="rz">
        <div class="rz-label">origin/main</div>
        <div class="rz-body"><div class="chain" id="remoteChain">${commitChain(s.remote.main, { fresh: true })}</div>
        <div class="rz-msg"><b>main</b> · ${s.remote.main.length} 个提交 · <b>团队唯一真相</b></div></div>
      </div>
      <div class="rz">
        <div class="rz-label">其他分支</div>
        <div class="rz-body">
          <div class="remote-branches">
            <div class="rb-row"><span class="rb-name">main</span><span style="font-size:12.5px;color:var(--ink-3)">主线，持续可发布</span></div>
            ${brs.map(b => `<div class="rb-row"><span class="rb-name">${esc(b)}</span><span style="font-size:12.5px;color:var(--ink-3)">进行中</span></div>`).join('')}
            ${brs.length ? '' : '<div class="rb-row"><span style="font-size:12.5px;color:var(--ink-4);font-style:italic">暂时只有一条分支</span></div>'}
          </div>
        </div>
      </div>
      <div class="rz">
        <div class="rz-label">谁能看到</div>
        <div class="rz-body" style="padding:11px 13px">
          <div class="rz-msg" style="margin:0">A ✅ &nbsp;·&nbsp; B ${(s.B.originMain.length === s.remote.main.length) ? '✅' : '❌'}
          <br><span style="color:var(--ink-4)">没 fetch 的人永远看不到新提交</span></div>
        </div>
      </div>`;
  }

  function actorMeta(a) {
    if (a === 'A') return ['actor-a', 'A 的操作'];
    if (a === 'B') return ['actor-b', 'B 的操作'];
    if (a === 'R') return ['actor-r', '远端'];
    return ['actor-sys', '说明'];
  }

  function render() {
    const scn = SCENARIOS[scnIdx];
    const st = scn.steps[stepIdx];
    if (!st) return;
    const s = buildState(scn, stepIdx);

    renderTerm(scn, stepIdx);
    $('colA').innerHTML = devCol('A', '开发者 A', 'MacBook Pro', s, scn);
    $('colB').innerHTML = devCol('B', '开发者 B', 'Windows 工作站', s, scn);
    $('colRemote').innerHTML = remoteCol(s, scn);

    const [acls, atext] = actorMeta(st.actor);
    let html = `<div class="se-label"><span class="se-actor ${acls}">${atext}</span>第 ${stepIdx + 1} / ${scn.steps.length} 步</div>
      <div class="se-title">${st.title}</div>
      <div class="se-body">${st.body}</div>`;
    if (st.callout) html += `<div class="se-callout ${st.callout.type}">${st.callout.text}</div>`;
    $('simExplain').innerHTML = html;

    $('simProgFill').style.width = ((stepIdx + 1) / scn.steps.length * 100) + '%';
    $('simProgText').textContent = `${stepIdx + 1} / ${scn.steps.length}`;
    $('btnPrev').disabled = stepIdx === 0;
    $('btnNext').disabled = stepIdx === scn.steps.length - 1;

    requestAnimationFrame(() => runFlyAnim(scn));
  }

  /* ---------- 提交飞行动画 ---------- */
  function nodeRect(scope, cid) {
    const el = scope.querySelector(`.cnode[data-cid="${cid}"]`);
    if (!el) return null;
    const r = el.getBoundingClientRect();
    return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
  }

  function flyFrom(srcEl, dstEl, cid, fromWho) {
    if (!srcEl || !dstEl) return;
    const a = nodeRect(srcEl, cid), b = nodeRect(dstEl, cid);
    if (!a || !b) return;
    const chip = document.createElement('div');
    chip.className = 'fly-commit from-' + fromWho;
    chip.textContent = cid;
    chip.style.left = (a.x - 18) + 'px';
    chip.style.top = (a.y - 13) + 'px';
    document.body.appendChild(chip);
    const dx = b.x - a.x, dy = b.y - a.y;
    chip.animate([
      { transform: 'translate(0,0) scale(1)', opacity: 1 },
      { transform: `translate(${dx * .45}px, ${dy * .45 - 46}px) scale(1.16)`, opacity: 1, offset: .55 },
      { transform: `translate(${dx}px, ${dy}px) scale(.7)`, opacity: 0 }
    ], { duration: 880, easing: 'cubic-bezier(.45,.05,.2,1)' }).onfinish = () => chip.remove();
  }

  function shake(el) {
    if (!el) return;
    el.animate([
      { transform: 'translateX(0)' }, { transform: 'translateX(-7px)' },
      { transform: 'translateX(6px)' }, { transform: 'translateX(-4px)' },
      { transform: 'translateX(0)' }
    ], { duration: 380, easing: 'ease-in-out' });
  }

  function runFlyAnim(scn) {
    if (stepIdx === 0) return;
    const prev = scn.steps[stepIdx - 1];
    const ops = (prev && prev.do) || [];
    const colA = $('colA'), colB = $('colB'), colR = $('colRemote');
    const rchain = $('remoteChain');

    ops.forEach(o => {
      if (o.op === 'push') {
        const d = devOf(buildState(scn, stepIdx - 1), o.who);
        const cur = d.branches[d.branch] || d.main;
        const src = o.who === 'A' ? colA : colB;
        setTimeout(() => cur.forEach(id => flyFrom(src, rchain, id, o.who.toLowerCase())), 130);
      }
      if (o.op === 'pull') {
        setTimeout(() => s_remoteLast(scn).forEach(id => flyFrom(colR, colB, id, 'r')), 130);
      }
      if (o.op === 'rejectPush' || o.op === 'rejectPull') {
        const target = o.who === 'A' ? colA : colB;
        setTimeout(() => {
          shake(target);
          const av = target.querySelector('.avatar');
          av.style.background = '#A8453A';
          setTimeout(() => av.style.background = '', 1100);
        }, 220);
      }
    });
  }

  function s_remoteLast(scn) {
    const prev = buildState(scn, stepIdx - 1);
    return prev.remote.main;
  }

  /* ============================================================
     场景切换
     ============================================================ */
  function renderTabs() {
    $('scnTabs').innerHTML = SCENARIOS.map((s, i) =>
      `<button class="scn-tab ${i === scnIdx ? 'active' : ''}" data-i="${i}">
        <span class="scn-tab-n">${i + 1}</span>${s.label}</button>`).join('');
  }

  function loadScn(i, keepStep) {
    scnIdx = i;
    stepIdx = keepStep ? Math.min(stepIdx, SCENARIOS[i].steps.length - 1) : 0;
    const s = SCENARIOS[i];
    $('scnIntro').innerHTML = `
      <div class="scn-intro-main">
        <h3>${s.title}</h3>
        <p>${s.desc}</p>
      </div>
      <div class="scn-principle">
        <div class="scn-principle-label">这个场景的原则</div>
        <p>${s.principle}</p>
      </div>`;
    $('termTitle').textContent = `场景 ${i + 1} / ${SCENARIOS.length} · ${s.label}`;
    renderTabs();
    render();
  }

  function stopAuto() {
    if (autoTimer) { clearInterval(autoTimer); autoTimer = null; }
    const b = $('btnAuto');
    b.textContent = '▶ 自动播放';
    b.classList.remove('btn-primary');
    b.classList.add('btn-ghost');
  }

  function init() {
    if (!$('simRoot')) return;

    $('scnTabs').addEventListener('click', e => {
      const t = e.target.closest('.scn-tab');
      if (!t) return;
      stopAuto();
      loadScn(parseInt(t.dataset.i, 10), false);
    });
    $('btnNext').addEventListener('click', () => {
      stopAuto();
      if (stepIdx < SCENARIOS[scnIdx].steps.length - 1) { stepIdx++; render(); }
    });
    $('btnPrev').addEventListener('click', () => {
      stopAuto();
      if (stepIdx > 0) { stepIdx--; render(); }
    });
    $('btnReset').addEventListener('click', () => { stopAuto(); stepIdx = 0; render(); });
    $('btnAuto').addEventListener('click', () => {
      if (autoTimer) { stopAuto(); return; }
      const b = $('btnAuto');
      b.textContent = '⏸ 暂停';
      b.classList.add('btn-primary'); b.classList.remove('btn-ghost');
      if (stepIdx >= SCENARIOS[scnIdx].steps.length - 1) { stepIdx = 0; render(); }
      autoTimer = setInterval(() => {
        if (stepIdx >= SCENARIOS[scnIdx].steps.length - 1) { stopAuto(); return; }
        stepIdx++; render();
      }, 3200);
    });

    document.addEventListener('keydown', e => {
      if (!$('simRoot') || !$('simRoot').offsetParent) return;
      if (e.key === 'ArrowRight') { stopAuto(); $('btnNext').click(); }
      if (e.key === 'ArrowLeft') { stopAuto(); $('btnPrev').click(); }
    });

    loadScn(0, false);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();

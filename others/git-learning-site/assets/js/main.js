/* ============================================================
   Git 第一次不慌 — 页面交互层
   ============================================================ */
(function () {
  'use strict';

  const $ = id => document.getElementById(id);
  const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- 导航 ---------- */
  function initNav() {
    const nav = $('nav');
    const toggle = $('navToggle');
    const links = document.querySelector('.nav-links');

    const onScroll = () => nav.classList.toggle('stuck', window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });

    if (toggle && links) {
      toggle.addEventListener('click', () => {
        const open = links.classList.toggle('open');
        toggle.classList.toggle('open', open);
        toggle.setAttribute('aria-expanded', String(open));
      });
      links.addEventListener('click', e => {
        if (e.target.tagName === 'A') {
          links.classList.remove('open');
          toggle.classList.remove('open');
          toggle.setAttribute('aria-expanded', 'false');
        }
      });
    }
  }

  /* ---------- 滚动揭示 ---------- */
  function initReveal() {
    const els = document.querySelectorAll('.reveal');
    if (!('IntersectionObserver' in window) || reduce) {
      els.forEach(e => e.classList.add('in'));
      return;
    }
    const io = new IntersectionObserver((entries) => {
      entries.forEach(en => {
        if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
    els.forEach(e => io.observe(e));
  }

  /* ---------- Hero：循环播放 push ---------- */
  function initHero() {
    const fly = $('hpFly');
    const pill = $('hpPill');
    if (!fly || !pill) return;

    const seed = [
      { sel: '.hp-body .hp-col:nth-child(1) .hp-pill:nth-child(1)', on: true },
      { sel: '.hp-body .hp-col:nth-child(1) .hp-pill:nth-child(2)', on: false },
      { sel: '.hp-body .hp-col:nth-child(3) .hp-pill:nth-child(1)', on: true },
      { sel: '.hp-body .hp-col:nth-child(3) .hp-pill:nth-child(2)', on: false }
    ];

    let n = 0;
    function tick() {
      const s = seed[n % seed.length];
      const el = document.querySelector(s.sel);
      if (el) el.classList.toggle('on', s.on);
      n++;
      if (n % seed.length === 0) setTimeout(pushOnce, 900);
      else setTimeout(tick, 620);
    }

    function pushOnce() {
      const src = document.querySelector('.hp-body .hp-col:nth-child(1) .hp-pill:nth-child(2)');
      const dst = document.querySelector('.hp-body .hp-col:nth-child(3) .hp-pill:nth-child(2)');
      if (!src || !dst || reduce) { setTimeout(tick, 900); return; }
      const a = src.getBoundingClientRect(), b = dst.getBoundingClientRect();
      fly.textContent = 'a2';
      fly.style.left = (a.left + window.scrollX + a.width / 2 - 16) + 'px';
      fly.style.top = (a.top + window.scrollY + a.height / 2 - 11) + 'px';
      const dx = b.left - a.left, dy = b.top - a.top;
      fly.animate([
        { opacity: 0, transform: 'translate(0,0) scale(.7)' },
        { opacity: 1, transform: `translate(${dx * .5}px, ${dy * .5 - 34}px) scale(1.15)`, offset: .55 },
        { opacity: 1, transform: `translate(${dx}px, ${dy}px) scale(.7)` }
      ], { duration: 820, easing: 'cubic-bezier(.4,.05,.2,1)' });
      setTimeout(() => {
        pill.style.opacity = '1';
        pill.style.transform = 'scale(1)';
        pill.textContent = 'a2';
      }, 800);
      setTimeout(() => {
        pill.style.opacity = '0';
        pill.style.transform = 'scale(.6)';
        pill.textContent = 'a3';
      }, 3000);
      setTimeout(tick, 3600);
    }

    // 进入视口才播放
    const hp = document.querySelector('.hero-preview');
    if (hp && 'IntersectionObserver' in window) {
      const io = new IntersectionObserver((e) => {
        if (e[0].isIntersecting) { tick(); io.disconnect(); }
      }, { threshold: 0.3 });
      io.observe(hp);
    } else tick();
  }

  /* ---------- fetch vs pull 对比动画 ---------- */
  function initCompare() {
    document.querySelectorAll('.cmp-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const mode = btn.dataset.play;
        const card = btn.closest('.cmp-card');
        const local = card.querySelector('.local-node');
        const remote = card.querySelector('.remote-node');
        const dot = card.querySelector('.cmp-arrow i');
        const label = $('cmpLocalState');
        const dur = reduce ? 10 : 760;

        card.classList.add('playing');
        remote.classList.add('pulse');
        local.classList.remove('pulse', 'merged');

        dot.animate([{ left: '0%', opacity: 0 }, { left: '0%', opacity: 1, offset: .15 },
                     { left: 'calc(100% - 11px)', opacity: 1 }], { duration: dur, easing: 'cubic-bezier(.4,0,.2,1)' });

        if (mode === 'fetch') {
          if (label) label.textContent = '代码不动';
          setTimeout(() => {
            remote.classList.remove('pulse');
            remote.classList.add('merged');
            card.classList.remove('playing');
            setTimeout(() => remote.classList.remove('merged'), 1300);
          }, dur);
        } else {
          setTimeout(() => {
            local.classList.add('pulse');
            if (label) label.textContent = '已合并别人的改动';
          }, dur);
          setTimeout(() => {
            local.classList.remove('pulse');
            local.classList.add('merged');
            remote.classList.remove('pulse');
            card.classList.remove('playing');
            setTimeout(() => local.classList.remove('merged'), 1500);
          }, dur + 520);
        }
      });
    });
  }

  /* ---------- 分支演示 ---------- */
  const C1 = { id: 'c1', cls: 'base' };
  const C2 = { id: 'c2', cls: 'a' };

  const BD = {
    fresh: {
      remote: [[C1]],
      a: { main: [[C1]], origin: [[C1]] },
      b: { main: [[C1]], origin: [[C1]] },
      text: '<strong>一切同步。</strong>远端、A 的电脑、B 的电脑，三份数据完全一致。' +
            '<code>origin/main</code> 只是 A、B 各自本地存的一份"远端照片"，此刻它和真实远端内容相同。'
    },
    pushed: {
      remote: [[C1, C2]],
      a: { main: [[C1, C2]], origin: [[C1, C2]] },
      b: { main: [[C1]], origin: [[C1]] },
      text: '<strong>A 推了新提交，B 还不知道。</strong>注意 B 的 <code>main</code> 和 <code>origin/main</code> ' +
            '都还停在 <code>c1</code>——B 完全不知道自己落后了，因为没人告诉过他。' +
            '这就是"我同事推了新代码，我怎么不知道"的根源。'
    },
    fetched: {
      remote: [[C1, C2]],
      a: { main: [[C1, C2]], origin: [[C1, C2]] },
      b: { main: [[C1]], origin: [[C1, C2]] },
      text: '<strong>B 执行了 <code>git fetch</code>，现在 B 知道了。</strong>' +
            'B 的 <code>origin/main</code> 更新到了 <code>c2</code>（<span class="bd-pulse">新增的橙色节点</span>），' +
            '但请注意：<strong>B 的本地 <code>main</code> 还停在 <code>c1</code>，代码一个字节都没变。</strong>' +
            'fetch 只负责"知道"，要真正把改动拿进工作区，还得再执行 <code>git pull</code>。'
    }
  };

  function chainHtml(list, freshId) {
    return list.map(c => `<div class="bd-node ${c.cls} ${c.id === freshId ? 'new' : ''}">${c.id}</div>`).join('');
  }

  function lagBadge(behind) {
    if (!behind) return '';
    return `<div class="bd-lag">⚠ B 的本地 <code>main</code> 落后 <code>origin/main</code> <strong>${behind}</strong> 个提交</div>`;
  }

  function initBranchDemo() {
    const box = document.getElementById('branches');
    if (!box) return;
    const tabs = box.querySelectorAll('.bd-tab');
    const exp = $('bdExplain');

    function behind(local, remote) {
      let i = 0;
      while (i < local.length && i < remote.length && local[i] === remote[i]) i++;
      return remote.length - i;
    }

    function paint(key) {
      const d = BD[key];
      const bBehind = behind(d.b.main[0], d.b.origin[0]);

      $('bdRemote').innerHTML = `<div class="bd-branch" data-b="main">
        <div class="bd-bname"><code>main</code><span class="bd-ref">真实分支</span></div>
        <div class="bd-chain">${chainHtml(d.remote[0], key === 'pushed' ? 'c2' : null)}</div></div>`;

      $('bdA').innerHTML = `
        <div class="bd-branch" data-b="main">
          <div class="bd-bname"><code>main</code><span class="bd-ref">真实分支</span></div>
          <div class="bd-chain">${chainHtml(d.a.main[0], key === 'pushed' ? 'c2' : null)}</div></div>
        <div class="bd-branch" data-b="originmain">
          <div class="bd-bname"><code>origin/main</code><span class="bd-ref">远端跟踪</span></div>
          <div class="bd-chain">${chainHtml(d.a.origin[0])}</div></div>`;

      $('bdB').innerHTML = `
        <div class="bd-branch" data-b="main">
          <div class="bd-bname"><code>main</code><span class="bd-ref">真实分支</span></div>
          <div class="bd-chain">${chainHtml(d.b.main[0])}</div></div>
        <div class="bd-branch" data-b="originmain">
          <div class="bd-bname"><code>origin/main</code><span class="bd-ref">远端跟踪</span></div>
          <div class="bd-chain">${chainHtml(d.b.origin[0], key === 'fetched' ? 'c2' : null)}</div></div>
        ${lagBadge(bBehind)}`;

      exp.innerHTML = d.text;
    }

    tabs.forEach(t => t.addEventListener('click', () => {
      tabs.forEach(x => x.classList.remove('active'));
      t.classList.add('active');
      paint(t.dataset.bd);
    }));
  }

  /* ---------- 冲突文件渲染 ---------- */
  const CONFLICT_LINES = [
    { t: 'ctx', s: 'using UnityEngine;' },
    { t: 'ctx', s: '' },
    { t: 'ctx', s: 'public class PlayerHealth : MonoBehaviour' },
    { t: 'ctx', s: '{' },
    { t: 'mark', s: '<<<<<<< HEAD' },
    { t: 'ours', s: '    public int maxHealth = 80;      // B 改的' },
    { t: 'ours', s: '    public int currentHealth;' },
    { t: 'mark', s: '||||||| 1b8e3d4  (共同祖先)' },
    { t: 'base', s: '    public int maxHealth = 100;    // 分叉前的原值' },
    { t: 'mark', s: '=======' },
    { t: 'theirs', s: '    public int maxHealth = 120;    // A 改的' },
    { t: 'theirs', s: '    public int armor = 20;         // A 新增的字段' },
    { t: 'theirs', s: '    public int currentHealth;' },
    { t: 'mark', s: '>>>>>>> origin/main' },
    { t: 'ctx', s: '' },
    { t: 'ctx', s: '    void Start()' },
    { t: 'ctx', s: '    {' },
    { t: 'ctx', s: '        currentHealth = maxHealth;' },
    { t: 'ctx', s: '    }' },
    { t: 'ctx', s: '}' }
  ];

  const RESOLVED_LINES = [
    { t: 'ctx', s: 'using UnityEngine;' },
    { t: 'ctx', s: '' },
    { t: 'ctx', s: 'public class PlayerHealth : MonoBehaviour' },
    { t: 'ctx', s: '{' },
    { t: 'fix', s: '    public int maxHealth = 120;   // ✅ 采纳 A 的数值' },
    { t: 'fix', s: '    public int armor = 20;        // ✅ 保留 A 新增的字段' },
    { t: 'fix', s: '    public int currentHealth;' },
    { t: 'ctx', s: '' },
    { t: 'ctx', s: '    void Start()' },
    { t: 'ctx', s: '    {' },
    { t: 'ctx', s: '        currentHealth = maxHealth;' },
    { t: 'ctx', s: '    }' }
  ];

  function initConflict() {
    const code = $('cfCode');
    const btn = $('cfToggle');
    const legend = $('cfLegend');
    if (!code || !btn) return;

    let showingFixed = false;

    function paint() {
      const lines = showingFixed ? RESOLVED_LINES : CONFLICT_LINES;
      code.innerHTML = lines.map((l, i) => {
        const cls = l.t === 'mark' ? 'l-mark' : l.t === 'ours' ? 'l-ours' : l.t === 'theirs' ? 'l-theirs'
          : l.t === 'base' ? 'l-base' : l.t === 'fix' ? 'l-fix' : 'l-ctx';
        return `<span class="${cls}">${String(i + 1).padStart(3, ' ')}  ${esc(l.s) || ' '}</span>`;
      }).join('');
      legend.classList.toggle('hide', showingFixed);
      btn.textContent = showingFixed ? '← 回到冲突的样子' : '看看解决之后长什么样';
    }
    paint();
    btn.addEventListener('click', () => { showingFixed = !showingFixed; paint(); });
  }

  /* ---------- 启动 ---------- */
  function boot() {
    initNav();
    initReveal();
    initHero();
    initCompare();
    initBranchDemo();
    initConflict();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();

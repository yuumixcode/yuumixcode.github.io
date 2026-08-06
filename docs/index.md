---
title: 歪歪空间
hide:
    - navigation
    - toc
---

<section class="yuumix-section yuumix-section--hero" id="hero" data-mood="chill">
  <div class="pixel-particles" aria-hidden="true"></div>

  <div class="yuumix-dialog yuumix-dialog--center yuumix-dialog--large">
    <img src="assets/images/avatar.png" alt="Yuumix" class="yuumix-avatar">
    <div class="dialog-box">
      <div class="dialog-box__name">Yuumix 说:</div>
      <p class="dialog-box__text">嘿!我是 Yuumix,顺便做点 Unity 插件。</p>
    </div>
  </div>

  <h1 class="yuumix-title">Y U U M I X</h1>
  <p class="yuumix-subtitle">Runestone · 符文石 · Unity 插件作者</p>

  <a href="#about" class="yuumix-cta">▶ 继续往下看</a>
  <div class="yuumix-scroll-hint" aria-hidden="true">▼ 向下滚动 ▼</div>
</section>


<section class="yuumix-section yuumix-section--about" id="about" data-mood="chill">
  <div class="yuumix-dialog yuumix-dialog--left yuumix-dialog--small">
    <img src="assets/images/avatar.png" alt="Yuumix" class="yuumix-avatar">
    <div class="dialog-box">
      <div class="dialog-box__name">Yuumix 说:</div>
      <p class="dialog-box__text">我是个独立开发者,做些能省时间的工具。</p>
    </div>
  </div>

  <div class="yuumix-section__body">
    <h2>关于我</h2>
    <p>独立 Unity 开发者,做工具、编辑器扩展、写写笔记。踩过的坑都记下来,省的以后再栽一次。</p>
  </div>
</section>

<section class="yuumix-section yuumix-section--contact" id="contact" data-mood="friendly">
  <div class="yuumix-dialog yuumix-dialog--center yuumix-dialog--large">
    <img src="assets/images/avatar.png" alt="Yuumix" class="yuumix-avatar">
    <div class="dialog-box">
      <div class="dialog-box__name">Yuumix 说:</div>
      <p class="dialog-box__text">想聊合作?来敲我!</p>
    </div>
  </div>
</section>

<script>
(function() {
  if (!('IntersectionObserver' in window)) {
    document.querySelectorAll('.yuumix-section').forEach(function(s) {
      s.classList.add('is-visible');
    });
    return;
  }
  var observer = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.2, rootMargin: '0px 0px -50px 0px' });
  document.querySelectorAll('.yuumix-section').forEach(function(s) {
    observer.observe(s);
  });
})();
</script>

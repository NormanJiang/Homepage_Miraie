(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const a of document.querySelectorAll('link[rel="modulepreload"]'))s(a);new MutationObserver(a=>{for(const r of a)if(r.type==="childList")for(const l of r.addedNodes)l.tagName==="LINK"&&l.rel==="modulepreload"&&s(l)}).observe(document,{childList:!0,subtree:!0});function i(a){const r={};return a.integrity&&(r.integrity=a.integrity),a.referrerPolicy&&(r.referrerPolicy=a.referrerPolicy),a.crossOrigin==="use-credentials"?r.credentials="include":a.crossOrigin==="anonymous"?r.credentials="omit":r.credentials="same-origin",r}function s(a){if(a.ep)return;a.ep=!0;const r=i(a);fetch(a.href,r)}})();const n=[{title:"Payroll Hours Dashboard",category:"projects",label:"Live project",description:"把每周工时、薪资与 PAYE 数据转化为清晰的个人数据看板。",href:"./payroll/",accent:"blue"}],o=[{id:"all",label:"全部",title:"Everything",description:"所有已经发布和即将展开的内容。"},{id:"projects",label:"项目",title:"Projects",description:"工具、产品与可被使用的数字体验。"},{id:"writing",label:"文章",title:"Writing",description:"学习、观察与长期记录。"},{id:"code",label:"代码",title:"Code",description:"开源实验、自动化与构建笔记。"}],d=Object.fromEntries(o.map(({id:e,label:t})=>[e,t]));function p(e){return`
    <a class="entry-card entry-card--${e.accent}" href="${e.href}">
      <span class="entry-icon" aria-hidden="true">${e.category==="projects"?"↗":"→"}</span>
      <div class="entry-body">
        <p class="entry-label">${e.label}</p>
        <h3>${e.title}</h3>
        <p>${e.description}</p>
      </div>
      <span class="entry-link">打开 <span aria-hidden="true">→</span></span>
    </a>
  `}function u(e){const t={projects:["下一个项目","新的产品、工具或可视化会在这里出现。"],writing:["第一篇文章","写下值得长期保留的学习、观察或经历。"],code:["下一个代码实验","收纳开源项目、自动化与技术笔记。"]}[e];return`
    <article class="entry-card entry-card--empty">
      <span class="entry-icon" aria-hidden="true">+</span>
      <div class="entry-body">
        <p class="entry-label">${d[e]} / RESERVED</p>
        <h3>${t[0]}</h3>
        <p>${t[1]}</p>
      </div>
      <span class="entry-link">已预留</span>
    </article>
  `}function c(e="all"){const t=e==="all"?n:n.filter(s=>s.category===e),i=e==="all"?o.slice(2).map(({id:s})=>s).filter(s=>!n.some(a=>a.category===s)):t.length===0?[e]:[];document.querySelector("#entryGrid").innerHTML=[...t.map(p),...i.map(u)].join("")}document.querySelector("#app").innerHTML=`
  <div class="site-shell">
    <header class="site-header">
      <a class="brand" href="#top" aria-label="返回首页">norman<span>jiang</span></a>
      <nav aria-label="主导航">
        <a href="#library">探索</a>
        <a href="#about">关于</a>
      </nav>
      <a class="header-cta" href="#library">查看内容 <span aria-hidden="true">→</span></a>
    </header>

    <main id="top">
      <section class="hero" aria-labelledby="hero-title">
        <div class="hero-shape shape-violet"></div>
        <div class="hero-shape shape-blue"></div>
        <div class="hero-shape shape-orange"></div>
        <div class="hero-content">
          <p class="eyebrow">NORMAN JIANG / DIGITAL WORK</p>
          <h1 id="hero-title">Ideas into<br /><span>useful things.</span></h1>
          <p class="hero-copy">一个持续更新的个人空间，用于发布项目、文章、代码与正在形成的新想法。</p>
          <div class="hero-actions"><a class="button button-primary" href="#library">开始探索 <span aria-hidden="true">→</span></a><a class="text-link" href="#about">认识我 <span aria-hidden="true">↓</span></a></div>
        </div>
        <div class="hero-status"><span class="pulse"></span><span>BUILDING FROM AUCKLAND, NZ</span></div>
      </section>

      <section class="signal-row" aria-label="站点内容概览">
        <div><span>01</span><strong>已上线项目</strong><p>可直接访问和使用的作品。</p></div>
        <div><span>02</span><strong>持续文章</strong><p>等待第一篇长期记录。</p></div>
        <div><span>03</span><strong>代码实验</strong><p>为新工具和自动化预留。</p></div>
      </section>

      <section class="library" id="library" aria-labelledby="library-title">
        <div class="section-intro"><div><p class="eyebrow">THE LIBRARY</p><h2 id="library-title">所有内容，<br />都有自己的位置。</h2></div><p>不论你新增第二个项目、第一篇文章，还是一个代码实验，它们都会进入这里对应的分类，并自动适应数量增长。</p></div>
        <div class="collection-tabs" role="tablist" aria-label="内容分类">
          ${o.map(({id:e,label:t},i)=>`<button class="collection-tab${i===0?" is-active":""}" type="button" data-category="${e}" role="tab" aria-selected="${i===0}">${t}<span>${e==="all"?n.length:n.filter(s=>s.category===e).length}</span></button>`).join("")}
        </div>
        <div class="entry-grid" id="entryGrid"></div>
        <p class="directory-note">新增页面时，只需在 <code>src/main.js</code> 的 <code>entries</code> 中添加一条记录和链接。</p>
      </section>

      <section class="about" id="about" aria-labelledby="about-title">
        <div><p class="eyebrow">ABOUT THIS SPACE</p><p class="about-kicker">个人主页不是简历，也不应只有一个终点。</p></div>
        <div><h2 id="about-title">长期构建，<br /><span>持续开放。</span></h2><p>这里会随时间生长。每个新页面保留独立的空间，同时仍然从这一处入口被发现。</p></div>
      </section>
    </main>

    <footer><a class="brand" href="#top">norman<span>jiang</span></a><span>© 2026</span><span>Built for the next idea.</span></footer>
  </div>
`;c();document.querySelectorAll(".collection-tab").forEach(e=>{e.addEventListener("click",()=>{const t=e.dataset.category;document.querySelectorAll(".collection-tab").forEach(i=>{const s=i===e;i.classList.toggle("is-active",s),i.setAttribute("aria-selected",String(s))}),c(t)})});

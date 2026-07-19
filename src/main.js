import "./styles.css";

if ("scrollRestoration" in window.history) {
  window.history.scrollRestoration = "manual";
}

// A refresh should replay the hero from the top rather than restore the previous scroll position.
window.addEventListener("pageshow", () => {
  window.requestAnimationFrame(() => window.scrollTo(0, 0));
});

// Register every future page here. The homepage directory and category views update automatically.
const entries = [
  {
    title: "Payroll Hours Dashboard",
    category: "projects",
    label: "Live project",
    description: "A clear personal dashboard for weekly hours, earnings, and PAYE data.",
    href: "./payroll/",
    accent: "blue",
    meta: "Payroll analytics",
    glyph: "PAY",
    locked: true,
  },
  {
    title: "Codex Token Usage Dashboard",
    category: "projects",
    label: "Windows utility",
    description: "Track local ccusage data for Codex tokens, costs, cache activity, and intraday trends.",
    href: "./codex-token-usage/",
    accent: "violet",
    image: "./codex-token-usage/assets/icon.png",
    meta: "WinForms / ccusage",
  },
  {
    title: "Snapshots, 2026",
    category: "gallery",
    label: "Personal gallery",
    description: "Game worlds, work in progress, and the small scenes worth keeping.",
    href: "./gallery/",
    accent: "gallery",
    glyph: "06",
    meta: "Open gallery",
  },
  {
    title: "Moonlight at Last",
    category: "writing",
    label: "Fiction / 2021",
    description: "A New Year story about memory, courage, and choosing not to let go.",
    href: "./writing/2021-new-year-story/",
    accent: "writing",
    glyph: "TXT",
    meta: "Read story",
  },
];

const collections = [
  { id: "all", label: "All", title: "Everything", description: "Everything published and still taking shape." },
  { id: "projects", label: "Projects", title: "Projects", description: "Tools, products, and useful digital experiences." },
  { id: "writing", label: "Writing", title: "Writing", description: "Learning, observations, and long-form notes." },
  { id: "gallery", label: "Gallery", title: "Gallery", description: "Photography, travel, and visual records." },
];

const categoryNames = Object.fromEntries(collections.map(({ id, label }) => [id, label]));
const PAGE_SIZE = 6;
let activeCategory = "all";
const currentPages = Object.fromEntries(collections.map(({ id }) => [id, 1]));

function EntryCard(entry) {
  return `
    <a class="entry-card entry-card--${entry.accent}${entry.locked ? " entry-card--locked" : ""}" href="${entry.href}"${entry.locked ? ' data-locked="true" aria-haspopup="dialog"' : ""}>
      ${
        entry.image
          ? `<span class="entry-image" aria-hidden="true"><img src="${entry.image}" alt="" /></span>`
          : entry.glyph
            ? `<span class="entry-image entry-image--glyph" aria-hidden="true">${entry.glyph}</span>`
          : `<span class="entry-icon" aria-hidden="true">${entry.category === "projects" ? "↗" : "→"}</span>`
      }
      <div class="entry-body">
        <p class="entry-label">${entry.label}</p>
        <h3>${entry.title}</h3>
        <p>${entry.description}</p>
      </div>
      <span class="entry-link">${entry.meta || "Open"} <span aria-hidden="true">→</span></span>
      ${entry.locked ? '<span class="entry-lock" aria-hidden="true"><span class="entry-lock-icon">&#128274;</span><span>PRIVATE DATA</span></span>' : ""}
    </a>
  `;
}

function EmptyCard(category) {
  const copy = {
    projects: ["Next project", "A new product, tool, or visualization will appear here."],
    writing: ["First article", "A place for learning, observations, and experiences worth keeping."],
    gallery: ["First photo set", "A home for photography, travel, and everyday visual observations."],
  }[category];

  return `
    <article class="entry-card entry-card--empty">
      <span class="entry-icon" aria-hidden="true">+</span>
      <div class="entry-body">
        <p class="entry-label">${categoryNames[category]} / RESERVED</p>
        <h3>${copy[0]}</h3>
        <p>${copy[1]}</p>
      </div>
      <span class="entry-link">Reserved</span>
    </article>
  `;
}

function listItems(category) {
  const visible = category === "all" ? entries : entries.filter((entry) => entry.category === category);
  const emptyCategories = category === "all"
    ? collections.slice(2).map(({ id }) => id).filter((id) => !entries.some((entry) => entry.category === id))
    : visible.length === 0 ? [category] : [];

  return [...visible.map(EntryCard), ...emptyCategories.map(EmptyCard)];
}

function pageNumbers(totalPages, currentPage) {
  if (totalPages <= 7) return Array.from({ length: totalPages }, (_, index) => index + 1);
  const middle = [currentPage - 1, currentPage, currentPage + 1].filter((page) => page > 1 && page < totalPages);
  return [1, ...(currentPage > 4 ? ["…"] : [2]), ...middle, ...(currentPage < totalPages - 3 ? ["…"] : [totalPages - 1]), totalPages]
    .filter((page, index, array) => array.indexOf(page) === index);
}

function renderPagination(totalPages, currentPage) {
  const pagination = document.querySelector("#pagination");
  if (totalPages <= 1) {
    pagination.innerHTML = "";
    return;
  }

  pagination.innerHTML = `
    <button class="page-control" type="button" data-page="${currentPage - 1}" ${currentPage === 1 ? "disabled" : ""} aria-label="Previous page">←</button>
    ${pageNumbers(totalPages, currentPage).map((page) => page === "…"
      ? `<span class="page-ellipsis" aria-hidden="true">…</span>`
      : `<button class="page-control${page === currentPage ? " is-current" : ""}" type="button" data-page="${page}" aria-label="Page ${page}" ${page === currentPage ? "aria-current=\"page\"" : ""}>${page}</button>`).join("")}
    <button class="page-control" type="button" data-page="${currentPage + 1}" ${currentPage === totalPages ? "disabled" : ""} aria-label="Next page">→</button>
  `;
}

function renderEntries() {
  const items = listItems(activeCategory);
  const totalPages = Math.max(1, Math.ceil(items.length / PAGE_SIZE));
  const currentPage = Math.min(currentPages[activeCategory], totalPages);
  currentPages[activeCategory] = currentPage;
  const start = (currentPage - 1) * PAGE_SIZE;

  document.querySelector("#entryGrid").innerHTML = items.slice(start, start + PAGE_SIZE).join("");
  renderPagination(totalPages, currentPage);
}

document.querySelector("#app").innerHTML = `
  <div class="site-shell">
    <header class="site-header">
      <a class="brand" href="#top" aria-label="Back to home">norman<span>jiang</span></a>
      <nav aria-label="Primary navigation">
        <a href="#library">Explore</a>
        <a href="#about">About</a>
      </nav>
      <a class="header-cta" href="#library">View work <span aria-hidden="true">→</span></a>
    </header>

    <main id="top">
      <section class="hero" aria-labelledby="hero-title">
        <div class="hero-shape shape-violet"></div>
        <div class="hero-shape shape-blue"></div>
        <div class="hero-shape shape-orange"></div>
        <div class="hero-content">
          <p class="eyebrow">NORMAN JIANG / DIGITAL WORK</p>
          <h1 id="hero-title">Ideas into<br /><span>useful things.</span></h1>
          <p class="hero-copy">A living personal space for projects, writing, galleries, and ideas still taking shape.</p>
          <div class="hero-actions"><a class="button button-primary" href="#library">Start exploring <span aria-hidden="true">→</span></a><a class="text-link" href="#about">About me <span aria-hidden="true">↓</span></a></div>
        </div>
        <div class="hero-status"><span class="pulse"></span><span>BUILDING FROM AUCKLAND, NZ</span></div>
      </section>

      <section class="signal-row" aria-label="Site content overview">
        <div><span>01</span><strong>Live projects</strong><p>Work you can access and use now.</p></div>
        <div><span>02</span><strong>Ongoing writing</strong><p>A home for the first long-form note.</p></div>
        <div><span>03</span><strong>Photo galleries</strong><p>Reserved for travel, street scenes, and everyday observations.</p></div>
      </section>

      <section class="library" id="library" aria-labelledby="library-title">
        <div class="section-intro"><div><p class="eyebrow">THE LIBRARY</p><h2 id="library-title">Everything has<br />its place.</h2></div><p>Every new project, article, or photo set enters its own category and scales as the collection grows.</p></div>
        <div class="collection-tabs" role="tablist" aria-label="Content categories">
          ${collections.map(({ id, label }, index) => `<button class="collection-tab${index === 0 ? " is-active" : ""}" type="button" data-category="${id}" role="tab" aria-selected="${index === 0}">${label}<span>${id === "all" ? entries.length : entries.filter((entry) => entry.category === id).length}</span></button>`).join("")}
        </div>
        <div class="entry-grid" id="entryGrid"></div>
        <nav class="pagination" id="pagination" aria-label="Content pagination"></nav>
      </section>

      <section class="about" id="about" aria-labelledby="about-title">
        <div><p class="eyebrow">ABOUT THIS SPACE</p><p class="about-kicker">A personal site is not a resume, and it should not have a single destination.</p></div>
        <div><h2 id="about-title">Build for the long term.<br /><span>Stay open.</span></h2><p>This space grows over time. Every new page keeps its own identity while remaining discoverable from one home.</p></div>
      </section>
    </main>

    <footer><a class="brand" href="#top">norman<span>jiang</span></a><span>© 2026</span><span>Built for the next idea.</span></footer>
  </div>
  <div class="access-modal" id="accessModal" hidden>
    <div class="access-modal__backdrop" data-close-access></div>
    <section class="access-dialog" role="dialog" aria-modal="true" aria-labelledby="accessTitle" aria-describedby="accessCopy">
      <button class="access-dialog__close" type="button" aria-label="Close" data-close-access>&times;</button>
      <div class="access-dialog__mark" aria-hidden="true">&#128274;</div>
      <p class="eyebrow">RESTRICTED ACCESS</p>
      <h2 id="accessTitle">Payroll dashboard</h2>
      <p id="accessCopy">Enter the access password to continue.</p>
      <form id="accessForm" class="access-form">
        <label for="accessPassword">Access password</label>
        <input id="accessPassword" name="password" type="password" inputmode="numeric" autocomplete="current-password" required />
        <p class="access-error" id="accessError" role="alert" hidden>Incorrect password. Please try again.</p>
        <button type="submit">Unlock and enter <span aria-hidden="true">→</span></button>
      </form>
    </section>
  </div>
`;

renderEntries();

document.querySelectorAll(".collection-tab").forEach((button) => {
  button.addEventListener("click", () => {
    const category = button.dataset.category;
    activeCategory = category;
    currentPages[category] = 1;
    document.querySelectorAll(".collection-tab").forEach((tab) => {
      const active = tab === button;
      tab.classList.toggle("is-active", active);
      tab.setAttribute("aria-selected", String(active));
    });
    renderEntries();
  });
});

document.querySelector("#pagination").addEventListener("click", (event) => {
  const button = event.target.closest("button[data-page]");
  if (!button || button.disabled) return;
  currentPages[activeCategory] = Number(button.dataset.page);
  renderEntries();
});

const accessModal = document.querySelector("#accessModal");
const accessForm = document.querySelector("#accessForm");
const accessPassword = document.querySelector("#accessPassword");
const accessError = document.querySelector("#accessError");
let lockedDestination = "";

function closeAccessModal() {
  accessModal.hidden = true;
  accessForm.reset();
  accessError.hidden = true;
}

function openAccessModal(destination) {
  lockedDestination = destination;
  accessModal.hidden = false;
  accessError.hidden = true;
  window.requestAnimationFrame(() => accessPassword.focus());
}

document.querySelector("#entryGrid").addEventListener("click", (event) => {
  const lockedCard = event.target.closest("[data-locked]");
  if (!lockedCard) return;
  event.preventDefault();
  openAccessModal(lockedCard.href);
});

document.querySelectorAll("[data-close-access]").forEach((button) => {
  button.addEventListener("click", closeAccessModal);
});

accessForm.addEventListener("submit", (event) => {
  event.preventDefault();
  if (accessPassword.value === "030819") {
    window.location.assign(lockedDestination);
    return;
  }
  accessError.hidden = false;
  accessPassword.select();
});

window.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !accessModal.hidden) closeAccessModal();
});

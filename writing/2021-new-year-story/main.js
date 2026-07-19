const storyElement = document.querySelector("#story");

function escapeHtml(value) {
  return value.replace(/[&<>'"]/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[character]);
}

function renderParagraph(text) {
  const content = escapeHtml(text);
  if (text === "……") return '<div class="scene-break" aria-label="场景转换">*</div>';
  if (text.includes("End")) return `<p class="story-end">${content}</p>`;
  if (text.startsWith("写在后面：")) return `<p class="afterword">${content}</p>`;
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(text)) return `<p class="story-date">${content}</p>`;
  return `<p>${content}</p>`;
}

async function loadStory() {
  const response = await fetch("./story.json");
  if (!response.ok) throw new Error("Story data could not be loaded.");
  const story = await response.json();
  const paragraphs = story.paragraphs.filter(Boolean);
  document.querySelector("#wordCount").textContent = `${story.character_count.toLocaleString("zh-CN")} 字`;
  storyElement.innerHTML = `<h2 id="readingTitle">正文</h2>${paragraphs.map(renderParagraph).join("")}`;
}

loadStory().catch(() => {
  storyElement.innerHTML = '<h2 id="readingTitle">正文</h2><p class="story-loading">故事暂时无法加载。</p>';
});

window.addEventListener("scroll", () => {
  const maximum = document.documentElement.scrollHeight - window.innerHeight;
  document.querySelector("#progress").style.transform = `scaleX(${maximum > 0 ? window.scrollY / maximum : 0})`;
}, { passive: true });

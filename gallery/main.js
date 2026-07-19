import { collection, photos } from "./gallery-data.js";
import { collectionIndex } from "./collection-index.js";

const isPrimary = collection.id === collectionIndex.primaryId;
const homeHref = isPrimary ? "../" : "../../";
const galleryHref = isPrimary ? "./" : "../";
const grid = document.querySelector("#photoGrid");
const heroImage = document.querySelector("#heroImage");
const lightbox = document.querySelector("#lightbox");
const lightboxImage = document.querySelector("#lightboxImage");
const lightboxCaption = document.querySelector("#lightboxCaption");

document.title = collection.title;
document.querySelector("#homeLink").href = homeHref;
document.querySelector("#backLink").href = homeHref;
document.querySelector("#footerHomeLink").href = homeHref;
document.querySelector("#heroEyebrow").textContent = `PERSONAL GALLERY / COLLECTION ${collection.id}`;
document.querySelector("#heroCount").textContent = `${collection.count.toString().padStart(2, "0")} frames`;
document.querySelector("#footerLabel").textContent = collection.title;
heroImage.src = photos[0].src;
heroImage.alt = photos[0].alt;

document.querySelector("#collectionNav").innerHTML = collectionIndex.collections.map((item) => {
  const href = item.id === collection.id ? "#collection" : item.id === collectionIndex.primaryId ? galleryHref : `${galleryHref}${item.id}/`;
  return `<a class="collection-link${item.id === collection.id ? " is-current" : ""}" href="${href}"${item.id === collection.id ? ' aria-current="page"' : ""}>${item.title}</a>`;
}).join("");

const layout = ["photo--wide", "photo--tall", "photo--desk", "photo--small", "photo--small photo--small-b", "photo--small photo--small-c"];
grid.innerHTML = photos.map((photo, index) => `
  <figure class="photo ${layout[index % layout.length]}">
    <button type="button" data-photo="${photo.src}" data-caption="${photo.caption}"><img src="${photo.src}" alt="${photo.alt}" /></button>
    <figcaption><span>${String(index + 1).padStart(2, "0")}</span><span>${photo.caption}</span></figcaption>
  </figure>
`).join("");

grid.addEventListener("click", (event) => {
  const button = event.target.closest("[data-photo]");
  if (!button) return;
  lightboxImage.src = button.dataset.photo;
  lightboxImage.alt = button.querySelector("img").alt;
  lightboxCaption.textContent = button.dataset.caption;
  lightbox.showModal();
});

document.querySelector(".lightbox-close").addEventListener("click", () => lightbox.close());
lightbox.addEventListener("click", (event) => {
  if (event.target === lightbox) lightbox.close();
});

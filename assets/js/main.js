const toggle = document.querySelector(".nav-toggle");
const nav = document.querySelector("#site-nav");

if (toggle && nav) {
  toggle.addEventListener("click", () => {
    const open = nav.classList.toggle("open");
    toggle.setAttribute("aria-expanded", String(open));
  });
}

const photoLinks = Array.from(document.querySelectorAll("[data-photo-full]"));

if (photoLinks.length) {
  const lightbox = document.createElement("div");
  const frame = document.createElement("figure");
  const image = document.createElement("img");
  const caption = document.createElement("figcaption");
  const captionTitle = document.createElement("h2");
  const captionDescription = document.createElement("p");
  const captionLink = document.createElement("a");
  const close = document.createElement("button");
  let previousFocus = null;

  lightbox.className = "photo-lightbox";
  lightbox.setAttribute("role", "dialog");
  lightbox.setAttribute("aria-modal", "true");
  lightbox.setAttribute("aria-hidden", "true");
  lightbox.setAttribute("aria-label", "Photo preview");

  frame.className = "photo-lightbox-frame";
  caption.className = "photo-lightbox-caption";
  caption.hidden = true;
  captionLink.textContent = "Read the news post";
  caption.append(captionTitle, captionDescription, captionLink);
  frame.append(image, caption);

  close.type = "button";
  close.className = "photo-lightbox-close";
  close.textContent = "Close";

  lightbox.append(frame, close);
  document.body.append(lightbox);

  const closeLightbox = () => {
    lightbox.classList.remove("open");
    lightbox.setAttribute("aria-hidden", "true");
    document.body.classList.remove("lightbox-open");
    image.removeAttribute("src");
    caption.hidden = true;
    captionTitle.textContent = "";
    captionDescription.textContent = "";
    captionLink.removeAttribute("href");
    if (previousFocus) previousFocus.focus();
  };

  const openLightbox = (link) => {
    const newsTitle = link.dataset.newsTitle || "";
    const newsDescription = link.dataset.newsDescription || "";
    const newsUrl = link.dataset.newsUrl || "";
    previousFocus = document.activeElement;
    image.src = link.dataset.photoFull || link.href;
    image.alt = link.dataset.photoAlt || "";
    captionTitle.textContent = newsTitle;
    captionDescription.textContent = newsDescription;
    captionDescription.hidden = !newsDescription;
    captionLink.hidden = !newsUrl;
    if (newsUrl) captionLink.href = newsUrl;
    else captionLink.removeAttribute("href");
    caption.hidden = !newsTitle && !newsDescription && !newsUrl;
    lightbox.classList.add("open");
    lightbox.setAttribute("aria-hidden", "false");
    document.body.classList.add("lightbox-open");
    close.focus();
  };

  for (const link of photoLinks) {
    link.addEventListener("click", (event) => {
      event.preventDefault();
      openLightbox(link);
    });
  }

  close.addEventListener("click", closeLightbox);

  lightbox.addEventListener("click", (event) => {
    if (event.target === lightbox) closeLightbox();
  });

  window.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && lightbox.classList.contains("open")) closeLightbox();
  });
}

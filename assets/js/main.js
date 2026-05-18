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
  const image = document.createElement("img");
  const close = document.createElement("button");
  let previousFocus = null;

  lightbox.className = "photo-lightbox";
  lightbox.setAttribute("role", "dialog");
  lightbox.setAttribute("aria-modal", "true");
  lightbox.setAttribute("aria-hidden", "true");

  close.type = "button";
  close.className = "photo-lightbox-close";
  close.textContent = "Close";

  lightbox.append(image, close);
  document.body.append(lightbox);

  const closeLightbox = () => {
    lightbox.classList.remove("open");
    lightbox.setAttribute("aria-hidden", "true");
    document.body.classList.remove("lightbox-open");
    image.removeAttribute("src");
    if (previousFocus) previousFocus.focus();
  };

  const openLightbox = (src, alt) => {
    previousFocus = document.activeElement;
    image.src = src;
    image.alt = alt || "";
    lightbox.classList.add("open");
    lightbox.setAttribute("aria-hidden", "false");
    document.body.classList.add("lightbox-open");
    close.focus();
  };

  for (const link of photoLinks) {
    link.addEventListener("click", (event) => {
      event.preventDefault();
      openLightbox(link.dataset.photoFull || link.href, link.dataset.photoAlt || "");
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

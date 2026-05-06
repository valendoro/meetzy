export interface UIComponent {
  type: "card" | "gallery" | "booking" | "pricing" | "contact";
  data: Record<string, unknown>;
}

interface CardData {
  title: string;
  description: string;
  price?: string;
  imageUrl?: string;
  ctaText: string;
  ctaUrl?: string;
}

interface GalleryData {
  images: { url: string; alt: string }[];
  caption: string;
}

interface BookingData {
  message: string;
  calUrl?: string;
}

interface PricingPlan {
  name: string;
  price: string;
  features: string[];
  highlighted?: boolean;
  ctaUrl?: string;
}

interface PricingData {
  plans: PricingPlan[];
}

interface ContactField {
  name: string;
  label: string;
  type: string;
  required?: boolean;
}

interface ContactData {
  message: string;
  fields: ContactField[];
}

export function renderUIComponent(component: UIComponent, brandColor: string): HTMLElement {
  const data = component.data as unknown;
  switch (component.type) {
    case "card": return renderCard(data as CardData, brandColor);
    case "gallery": return renderGallery(data as GalleryData);
    case "booking": return renderBooking(data as BookingData, brandColor);
    case "pricing": return renderPricing(data as PricingData, brandColor);
    case "contact": return renderContact(data as ContactData, brandColor);
    default: return document.createElement("div");
  }
}

function renderCard(data: CardData, brandColor: string): HTMLElement {
  const el = document.createElement("div");
  el.className = "mz-ui-card";
  el.style.cssText = `
    background: #1a1a1a;
    border: 1px solid #2a2a2a;
    border-radius: 16px;
    overflow: hidden;
    margin: 8px 0;
    max-width: 280px;
  `;

  if (data.imageUrl) {
    const img = document.createElement("img");
    img.src = data.imageUrl;
    img.alt = data.title;
    img.style.cssText = "width:100%; height:140px; object-fit:cover;";
    el.appendChild(img);
  } else {
    const placeholder = document.createElement("div");
    placeholder.style.cssText = `width:100%; height:80px; background: linear-gradient(135deg, ${brandColor}20, ${brandColor}40); display:flex; align-items:center; justify-content:center;`;
    placeholder.textContent = "🛍️";
    placeholder.style.fontSize = "2rem";
    el.appendChild(placeholder);
  }

  const body = document.createElement("div");
  body.style.cssText = "padding: 14px;";

  const title = document.createElement("p");
  title.style.cssText = "color: #F0EDE8; font-weight: 700; font-size: 14px; margin: 0 0 6px;";
  title.textContent = data.title;
  body.appendChild(title);

  if (data.description) {
    const desc = document.createElement("p");
    desc.style.cssText = "color: #6b6b6b; font-size: 12px; margin: 0 0 8px; line-height: 1.5;";
    desc.textContent = data.description;
    body.appendChild(desc);
  }

  if (data.price) {
    const price = document.createElement("p");
    price.style.cssText = `color: ${brandColor}; font-weight: 700; font-size: 18px; margin: 0 0 10px;`;
    price.textContent = data.price;
    body.appendChild(price);
  }

  const btn = document.createElement("a");
  btn.href = data.ctaUrl ?? "#";
  btn.target = "_blank";
  btn.style.cssText = `
    display: block; text-align: center; background: ${brandColor};
    color: #fff; font-size: 12px; font-weight: 600;
    padding: 8px 16px; border-radius: 8px; text-decoration: none;
    transition: opacity 0.15s;
  `;
  btn.textContent = data.ctaText;
  btn.onmouseenter = () => (btn.style.opacity = "0.85");
  btn.onmouseleave = () => (btn.style.opacity = "1");
  body.appendChild(btn);

  el.appendChild(body);
  return el;
}

function renderGallery(data: GalleryData): HTMLElement {
  const el = document.createElement("div");
  el.style.cssText = "margin: 8px 0;";

  const grid = document.createElement("div");
  grid.style.cssText = "display:flex; gap:8px; overflow-x:auto; padding-bottom:6px; scrollbar-width:thin;";

  data.images.slice(0, 6).forEach((img) => {
    const wrapper = document.createElement("div");
    wrapper.style.cssText = "flex-shrink:0; width:110px;";
    const image = document.createElement("img");
    image.src = img.url;
    image.alt = img.alt ?? "";
    image.style.cssText = "width:110px; height:80px; object-fit:cover; border-radius:10px;";
    wrapper.appendChild(image);
    grid.appendChild(wrapper);
  });

  if (data.caption) {
    const cap = document.createElement("p");
    cap.style.cssText = "color: #6b6b6b; font-size: 11px; margin: 6px 0 0;";
    cap.textContent = data.caption;
    el.appendChild(cap);
  }

  el.appendChild(grid);
  return el;
}

function renderBooking(data: BookingData, brandColor: string): HTMLElement {
  const el = document.createElement("div");
  el.style.cssText = `
    background: #1a1a1a; border: 1px solid #2a2a2a;
    border-radius: 16px; padding: 16px; margin: 8px 0;
  `;

  const msg = document.createElement("p");
  msg.style.cssText = "color: #F0EDE8; font-size: 13px; margin: 0 0 12px;";
  msg.textContent = data.message;
  el.appendChild(msg);

  const btn = document.createElement("a");
  btn.href = data.calUrl ?? "#";
  btn.target = "_blank";
  btn.style.cssText = `
    display: block; text-align: center; background: ${brandColor};
    color: #fff; font-size: 13px; font-weight: 600;
    padding: 10px 16px; border-radius: 10px; text-decoration: none;
  `;
  btn.textContent = "📅 Reservar reunión";
  el.appendChild(btn);
  return el;
}

function renderPricing(data: PricingData, brandColor: string): HTMLElement {
  const el = document.createElement("div");
  el.style.cssText = "margin: 8px 0;";

  const grid = document.createElement("div");
  grid.style.cssText = "display:flex; gap:8px; overflow-x:auto; padding-bottom:6px;";

  data.plans.forEach((plan) => {
    const card = document.createElement("div");
    card.style.cssText = `
      flex-shrink:0; width:160px;
      background: ${plan.highlighted ? brandColor + "15" : "#1a1a1a"};
      border: 1px solid ${plan.highlighted ? brandColor + "50" : "#2a2a2a"};
      border-radius: 14px; padding: 14px;
    `;

    const name = document.createElement("p");
    name.style.cssText = "color: #6b6b6b; font-size: 11px; font-weight: 700; text-transform:uppercase; letter-spacing:0.05em; margin:0 0 4px;";
    name.textContent = plan.name;
    card.appendChild(name);

    const price = document.createElement("p");
    price.style.cssText = `color: ${plan.highlighted ? brandColor : "#F0EDE8"}; font-weight: 700; font-size: 20px; margin: 0 0 10px;`;
    price.textContent = plan.price;
    card.appendChild(price);

    const ul = document.createElement("ul");
    ul.style.cssText = "margin:0 0 12px; padding: 0 0 0 14px;";
    plan.features.slice(0, 4).forEach((f) => {
      const li = document.createElement("li");
      li.style.cssText = "color: #a0a0a0; font-size: 11px; margin-bottom: 4px;";
      li.textContent = f;
      ul.appendChild(li);
    });
    card.appendChild(ul);

    if (plan.ctaUrl) {
      const btn = document.createElement("a");
      btn.href = plan.ctaUrl;
      btn.target = "_blank";
      btn.style.cssText = `
        display:block; text-align:center; padding: 7px;
        background: ${plan.highlighted ? brandColor : "transparent"};
        border: 1px solid ${plan.highlighted ? "transparent" : "#333"};
        color: ${plan.highlighted ? "#fff" : "#F0EDE8"};
        border-radius: 8px; font-size: 11px; font-weight:600; text-decoration:none;
      `;
      btn.textContent = "Elegir plan";
      card.appendChild(btn);
    }

    grid.appendChild(card);
  });

  el.appendChild(grid);
  return el;
}

function renderContact(data: ContactData, brandColor: string): HTMLElement {
  const el = document.createElement("div");
  el.style.cssText = `
    background: #1a1a1a; border: 1px solid #2a2a2a;
    border-radius: 16px; padding: 16px; margin: 8px 0;
  `;

  const msg = document.createElement("p");
  msg.style.cssText = "color: #F0EDE8; font-size: 13px; margin: 0 0 12px;";
  msg.textContent = data.message;
  el.appendChild(msg);

  const form = document.createElement("form");
  form.style.cssText = "display:flex; flex-direction:column; gap:8px;";
  form.addEventListener("submit", (e) => e.preventDefault());

  data.fields.forEach((field) => {
    const input = document.createElement("input");
    input.type = field.type ?? "text";
    input.placeholder = field.label;
    input.required = field.required ?? false;
    input.style.cssText = `
      background: #0e0e0e; border: 1px solid #222; color: #F0EDE8;
      border-radius: 10px; padding: 8px 12px; font-size: 12px; outline:none;
    `;
    input.onfocus = () => (input.style.borderColor = brandColor);
    input.onblur = () => (input.style.borderColor = "#222");
    form.appendChild(input);
  });

  const btn = document.createElement("button");
  btn.type = "submit";
  btn.style.cssText = `
    background: ${brandColor}; color: #fff;
    border: none; border-radius: 10px; padding: 9px;
    font-size: 12px; font-weight: 600; cursor: pointer;
  `;
  btn.textContent = "Enviar";
  form.appendChild(btn);

  el.appendChild(form);
  return el;
}

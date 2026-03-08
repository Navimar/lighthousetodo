import { html } from "~/arrow-js/index.js"

export const relationIcon = (kind) => {
  if (kind === "blocks") {
    return html`<svg
      class="w-2.5 pointer-events-none"
      width="16"
      height="16"
      viewBox="0 0 16 16"
      xmlns="http://www.w3.org/2000/svg"
      fill="none">
      <rect x="0" y="7" width="16" height="9" fill="currentColor" />
      <path
        d="M2 7V4.5C2 2.01 4.01 0 6.5 0H9.5C11.99 0 14 2.01 14 4.5V7"
        stroke="currentColor"
        stroke-width="2.2"
        stroke-linecap="round"
        stroke-linejoin="round" />
    </svg>`
  }

  return html`<svg
    class="w-2.5 pointer-events-none"
    width="16"
    height="16"
    viewBox="0 0 16 16"
    xmlns="http://www.w3.org/2000/svg"
    fill="currentColor">
    <path d="M0 8L8 0L8 16Z" />
    <path d="M16 8L8 0L8 16Z" />
    <rect x="7" y="0" width="2" height="16" />
  </svg>`
}

export const bridgeArrowIcon = () => {
  return html`<svg
    class="w-4 h-4 text-white dark:text-black pointer-events-none"
    width="16"
    height="16"
    viewBox="0 0 16 16"
    xmlns="http://www.w3.org/2000/svg"
    fill="none">
    <path d="M1 8H10" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" />
    <path d="M8 3L14 8L8 13" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" />
  </svg>`
}

export const taskStatusIcon = (kind) => {
  if (kind === "pause") {
    return html`<svg
      class="w-2.5"
      width="16"
      height="16"
      viewBox="0 0 16 16"
      xmlns="http://www.w3.org/2000/svg"
      fill="currentColor">
      <rect x="1" y="0" width="5" height="16" />
      <rect x="10" y="0" width="5" height="16" />
    </svg>`
  }

  if (kind === "ready") {
    return html`<svg
      class="w-2.5"
      width="16"
      height="16"
      viewBox="0 0 16 16"
      xmlns="http://www.w3.org/2000/svg"
      fill="none">
      <path
        d="M2 8 L6 12 L14 2"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round" />
    </svg>`
  }

  if (kind === "futureDay") {
    return html`<svg
      class="w-2.5"
      width="16"
      height="16"
      viewBox="0 0 16 16"
      xmlns="http://www.w3.org/2000/svg"
      fill="currentColor">
      <path d="M0 0 L16 8 L0 16 Z" />
    </svg>`
  }

  if (kind === "futureToday") {
    return html`<svg
      class="w-2.5"
      width="16"
      height="16"
      viewBox="0 0 16 16"
      xmlns="http://www.w3.org/2000/svg"
      fill="currentColor">
      <path d="M0 0 L16 0 L8 9 Z" />
      <path d="M0 16 L16 16 L8 7 Z" />
    </svg>`
  }

  if (kind === "blocked") {
    return html`<svg
      class="w-2.5"
      width="16"
      height="16"
      viewBox="0 0 16 16"
      xmlns="http://www.w3.org/2000/svg"
      fill="currentColor">
      <rect x="1" y="1" width="14" height="14" />
    </svg>`
  }

  if (kind === "depth") {
    return html`<svg class="w-2.5" width="16" height="16" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
      <circle cx="8" cy="8" r="8" fill="currentColor" />
    </svg>`
  }

  if (kind === "past") {
    return html`<svg
      class="w-2.5"
      width="16"
      height="16"
      viewBox="0 0 16 16"
      xmlns="http://www.w3.org/2000/svg"
      fill="currentColor">
      <path d="M16 0 L0 8 L16 16 Z" />
    </svg>`
  }

  return ""
}

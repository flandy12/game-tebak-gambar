const paths = {
  play: '<path d="m9 18 12-8-12-8v16Z"/>',
  help: '<circle cx="12" cy="12" r="9"/><path d="M9.7 9a2.5 2.5 0 0 1 4.8 1c0 2-2.5 2.2-2.5 4"/><path d="M12 18h.01"/>',
  volume: '<path d="M11 5 6 9H2v6h4l5 4V5Z"/><path d="M15 9a4 4 0 0 1 0 6M18 6a8 8 0 0 1 0 12"/>',
  mute: '<path d="M11 5 6 9H2v6h4l5 4V5Z"/><path d="m19 9-6 6m0-6 6 6"/>',
  fullscreen: '<path d="M8 3H3v5M16 3h5v5M8 21H3v-5M16 21h5v-5"/>',
  bulb: '<path d="M9 18h6M10 22h4"/><path d="M8.4 14.5A7 7 0 1 1 15.6 14.5C14.5 15.3 14 16 14 18h-4c0-2-.5-2.7-1.6-3.5Z"/>',
  trash: '<path d="M3 6h18M8 6V4h8v2m-9 0 1 15h8l1-15M10 10v7m4-7v7"/>',
  check: '<path d="m5 12 4 4L19 6"/>',
  back: '<path d="m15 18-6-6 6-6"/>',
  skip: '<path d="m5 4 10 8L5 20V4Zm11 0v16"/>',
  settings: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-2.8 2.8-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6v.2h-4V21a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1L4.2 17l.1-.1a1.7 1.7 0 0 0 .3-1.9A1.7 1.7 0 0 0 3 14H2.8v-4H3a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9L4.2 7 7 4.2l.1.1A1.7 1.7 0 0 0 9 4.6a1.7 1.7 0 0 0 1-1.6v-.2h4V3a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1L19.8 7l-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.6 1h.2v4H21a1.7 1.7 0 0 0-1.6 1Z"/>',
  trophy: '<path d="M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0V4Z"/><path d="M7 6H4v2c0 2 1 4 4 4m9-6h3v2c0 2-1 4-4 4"/>',
  rotate: '<path d="M20 7v5h-5M4 17v-5h5"/><path d="M7.5 7.5a7 7 0 0 1 11 2.5L20 12M4 12l1.5 2a7 7 0 0 0 11 2.5"/>'
};

export function icon(name, size = 24) {
  return `<svg aria-hidden="true" class="icon" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${paths[name] || ''}</svg>`;
}

const OPEN_CHAT = "chat:open";

export function requestChat(propertyId?: string) {
  window.dispatchEvent(new CustomEvent(OPEN_CHAT, { detail: { propertyId } }));
}

export function onChatRequest(handler: (propertyId?: string) => void) {
  const listener = (e: Event) =>
    handler((e as CustomEvent<{ propertyId?: string }>).detail.propertyId);
  window.addEventListener(OPEN_CHAT, listener);
  return () => window.removeEventListener(OPEN_CHAT, listener);
}

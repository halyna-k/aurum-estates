import { useChat } from "@/hooks/useChat";

import { ChatHeader, GdprBanner, ChatMessages, ChatInput, NotificationBar, ChatFooter } from "@/components";

export default function ChatPanel({
  state,
  loading,
  open,
  setOpen,
  messages,
  handleGdprAccept,
  handleGdprDecline,
  inputRef,
  input,
  setInput,
  send,
}: ReturnType<typeof useChat>) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="AI Rental Assistant"
      className={`
        fixed bottom-24 right-7 z-(--z-modal)
        flex
        h-auto max-h-[75vh]
        w-95
        flex-col
        overflow-hidden
        rounded-lg
        border border-(--border)
        bg-(--bg-2)
        shadow-custom
        origin-bottom-right
        transition-[opacity,transform]
        duration-220
        ease-out

        ${
          open
            ? "pointer-events-auto translate-y-0 scale-100 opacity-100"
            : "pointer-events-none translate-y-3.5 scale-[0.97] opacity-0"
        }

        max-sm:bottom-20
        max-sm:right-2.5
        max-sm:w-[calc(100vw-20px)]
        max-sm:max-h-[75vh]
      `}
    >
      {/* Header */}
      <ChatHeader state={state} loading={loading} setOpen={setOpen} />

      {/* Body */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* GDPR */}
        {!state.gdprConsented && <GdprBanner onAccept={handleGdprAccept} onDecline={handleGdprDecline} />}

        {/* Messages */}
        <ChatMessages state={state} messages={messages} loading={loading} />

        {/* Input */}
        {state.gdprConsented && <ChatInput ref={inputRef} input={input} setInput={setInput} loading={loading} send={send} />}

        {/* Lead saved */}
        {state.leadSaved && <NotificationBar text="Your details have been saved. An agent will be in touch shortly." />}
      </div>

      {/* Footer */}
      <ChatFooter />
    </div>
  );
}

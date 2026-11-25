import { formatTime } from "@/lib/format";
import type { UIMessage } from "@/types/chat";
import Guidance from "./Guidance";

interface MessageBubbleProps {
  message: UIMessage;
  assistantName: string;
  isLatest: boolean;
  loading: boolean;
  onReply: (text: string) => void;
}

function bubbleClass(message: UIMessage): string {
  if (message.role === "user") return "self-end rounded-xl rounded-br-sm bg-brand text-on-brand";
  const border = message.isError ? "border-danger" : "border-line";
  return `self-start rounded-xl rounded-bl-sm border bg-surface-2 text-ink ${border}`;
}

/** Matches "Label: *value*", and the value is shown in bold. */
const LABELLED_VALUE = /^(.+?):\s*(.+)$/;

function Line({ text, bold }: { text: string; bold: boolean }) {
  const match = bold ? LABELLED_VALUE.exec(text) : null;

  return (
    <span className="block">
      {match ? (
        <>
          {match[1]}:{" "}
          <strong className="font-semibold">{match[2]}</strong>
        </>
      ) : (
        text
      )}
    </span>
  );
}

/** Blank lines separate paragraphs. Only the assistant's text is formatted. */
function MessageText({ text, bold }: { text: string; bold: boolean }) {
  return text.split(/\n{2,}/).map((paragraph, p) => (
    <p key={p} className={p > 0 ? "mt-2" : undefined}>
      {paragraph.split("\n").map((line, l) => (
        <Line key={l} text={line} bold={bold} />
      ))}
    </p>
  ));
}

export default function MessageBubble({
  message,
  assistantName,
  isLatest,
  loading,
  onReply,
}: MessageBubbleProps) {
  const isUser = message.role === "user";
  const speaker = isUser ? "You" : assistantName;

  const time = (
    <time
      dateTime={message.timestamp.toISOString()}
      className="float-right mt-1 ml-3 text-xs opacity-70 cursor-default"
    >
      {formatTime(message.timestamp)}
    </time>
  );

  return (
    <div className={`animate-message-in max-w-[85%] px-3 py-2 text-sm leading-normal ${bubbleClass(message)}`}>
      <div className="[overflow-wrap:anywhere]">
        <span className="sr-only">{speaker} said: </span>
        <MessageText text={message.text} bold={!isUser} />
      </div>

      {isLatest && !isUser && <Guidance message={message} loading={loading} onReply={onReply} />}

      {time}
    </div>
  );
}

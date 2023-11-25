import { PropsWithChildren, forwardRef, useState } from "react";
import { Button } from "../ui/button";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import HeaderWithAction from "../shared/header-with-action";
import { cn } from "@/src/utils";
import { Send } from "lucide-react";

type ChatContainerProps = {
  className?: string;
};
export function ChatContainer({
  className,
  children,
}: PropsWithChildren<ChatContainerProps>) {
  return (
    <div className={cn("flex max-h-full w-full flex-col", className)}>
      {children}
    </div>
  );
}

type ChatHeaderProps = {
  title: string;
  subtitle: string;
  onBack?: () => void;
  actionBtn?: React.ReactNode;
};
export function ChatHeader({
  title,
  subtitle,
  onBack,
  actionBtn,
}: ChatHeaderProps) {
  return (
    <HeaderWithAction
      className="mb-4"
      title={title}
      subtitle={subtitle}
      leftActionBtn={
        onBack && (
          <Button onClick={onBack} variant="ghost">
            <ArrowLeftIcon className="h-5 w-5" />
          </Button>
        )
      }
      rightActionBtn={actionBtn}
    />
  );
}

const ChatBody = forwardRef<
  HTMLDivElement,
  PropsWithChildren<{ className?: string }>
>(({ children, className }: PropsWithChildren<{ className?: string }>, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        "flex flex-1 flex-col overflow-y-scroll p-4 lg:px-8",
        className,
      )}
    >
      {children}
    </div>
  );
});
ChatBody.displayName = "ChatBody";
export ChatBody;

export type Message = {
  position: "top" | "middle" | "bottom";
  side: "left" | "right";
  content: string;
};
type ChatMessageProps = {
  chatMessage: Message;
};
export function ChatMessage({ chatMessage }: ChatMessageProps) {
  const determineRoundedCorners = () => {
    if (chatMessage.side === "left") {
      if (chatMessage.position === "top") {
        return "rounded-bl-sm";
      } else if (chatMessage.position === "middle") {
        return "rounded-l-sm";
      } else if (chatMessage.position === "bottom") {
        return "rounded-tl-sm";
      }
    } else {
      if (chatMessage.position === "top") {
        return "rounded-br-sm";
      } else if (chatMessage.position === "middle") {
        return "rounded-r-sm";
      } else if (chatMessage.position === "bottom") {
        return "rounded-tr-sm";
      }
    }
  };

  return (
    <div
      className={cn(
        chatMessage.side === "right" ? "ml-auto" : "mr-auto",
        chatMessage.side === "right"
          ? "bg-primary text-secondary"
          : "bg-secondary",
        "my-1 max-w-2xl rounded-xl p-2",
        determineRoundedCorners(),
      )}
    >
      {chatMessage.content}
    </div>
  );
}

type ChatInputProps = {
  className?: string;
  onSend: (message: string) => void;
};
export function ChatInput({ className, onSend }: ChatInputProps) {
  const [message, setMessage] = useState("");
  return (
    <div className="w-full p-4 lg:px-8">
      <form
        className={cn("flex gap-x-2", className)}
        onSubmit={(e) => {
          e.preventDefault();
          onSend(message);
          setMessage("");
        }}
      >
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="flex-grow rounded-lg p-2"
          placeholder="Type a message"
        />
        <Button>
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </div>
  );
}

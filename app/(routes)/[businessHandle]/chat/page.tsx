"use client";

import {
  ChatBody,
  ChatContainer,
  ChatHeader,
  ChatInput,
  ChatMessage,
} from "@/src/components/chat-room/chat-room";
import { useRouter } from "next/navigation";

export default function ChatRoom({
  params,
}: {
  params: { businessHandle: string };
}) {
  const router = useRouter();
  return (
    <div>
      <ChatContainer>
        <ChatHeader
          title="Aaron Didi <> aaronaung.95@gmail.com"
          subtitle="Last active: 12/12/2022 6:36pm"
          onBack={() => {
            router.push(`/${params.businessHandle}/schedule`);
          }}
        />
        <ChatBody>
          {(
            [
              {
                content: "Hello",
                side: "left",
                position: "top",
              },
              {
                content: "how you doing",
                side: "left",
                position: "middle",
              },
              {
                content: "I miss you",
                side: "left",
                position: "bottom",
              },
              {
                content: "Wassup",
                side: "right",
                position: "top",
              },
              {
                content: "Nothing much. You?",
                side: "left",
                position: "top",
              },
              {
                content: "Nothing much. You?",
                side: "left",
                position: "bottom",
              },
            ] as const
          ).map((chatMessage, i) => (
            <ChatMessage key={i} chatMessage={chatMessage} />
          ))}
        </ChatBody>
        <ChatInput
          onSend={(message) => {
            console.log("sending message", message);
          }}
        />
      </ChatContainer>
    </div>
  );
}

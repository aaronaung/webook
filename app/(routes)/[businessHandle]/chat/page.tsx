"use client";
import "@chatscope/chat-ui-kit-styles/dist/default/styles.min.css";
import {
  MainContainer,
  ChatContainer,
  MessageList,
  Message,
  MessageInput,
  Sidebar,
  ConversationList,
  Conversation,
  ConversationHeader,
} from "@chatscope/chat-ui-kit-react";
import { useCallback, useEffect, useState } from "react";

export default function ChatRoom() {
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [sidebarStyle, setSidebarStyle] = useState({});
  const [chatContainerStyle, setChatContainerStyle] = useState({});
  const [conversationContentStyle, setConversationContentStyle] = useState({});
  const [conversationAvatarStyle, setConversationAvatarStyle] = useState({});

  const handleBackClick = () => setSidebarVisible(!sidebarVisible);

  const handleConversationClick = useCallback(() => {
    if (sidebarVisible) {
      setSidebarVisible(false);
    }
  }, [sidebarVisible, setSidebarVisible]);

  useEffect(() => {
    if (sidebarVisible) {
      setSidebarStyle({
        display: "flex",
        flexBasis: "auto",
        width: "100%",
        maxWidth: "100%",
      });
      setConversationContentStyle({
        display: "flex",
      });
      setConversationAvatarStyle({
        marginRight: "1em",
      });
      setChatContainerStyle({
        display: "none",
      });
    } else {
      setSidebarStyle({});
      setConversationContentStyle({});
      setConversationAvatarStyle({});
      setChatContainerStyle({});
    }
  }, [
    sidebarVisible,
    setSidebarVisible,
    setConversationContentStyle,
    setConversationAvatarStyle,
    setSidebarStyle,
    setChatContainerStyle,
  ]);
  return (
    <div className="relative h-full">
      <MainContainer responsive>
        <Sidebar position="left" scrollable={false} style={sidebarStyle}>
          <ConversationList>
            <Conversation onClick={handleConversationClick}>
              {/* <Avatar src={lillyIco} name="Lilly" status="available" style={conversationAvatarStyle} /> */}
              <Conversation.Content
                name="Lilly"
                lastSenderName="Lilly"
                info="Yes i can do it for you"
                style={conversationContentStyle}
              />
            </Conversation>
          </ConversationList>
        </Sidebar>
        <ChatContainer style={chatContainerStyle}>
          <ConversationHeader>
            <ConversationHeader.Back onClick={handleBackClick} />
            {/* <Avatar src={zoeIco} name="Zoe" /> */}
            <ConversationHeader.Content
              userName="Zoe"
              info="Active 10 mins ago"
            />
          </ConversationHeader>
          <MessageList className="mt-2">
            <Message
              model={{
                message: "Hello my friend",
                sentTime: "15 mins ago",
                sender: "Zoe",
                direction: "incoming",
                position: "single",
              }}
            />
          </MessageList>
          <MessageInput className="!py-3" placeholder="Type message here" />
        </ChatContainer>
      </MainContainer>
    </div>
  );
}

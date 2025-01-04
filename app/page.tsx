"use client";

import { Avatar } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AvatarFallback, AvatarImage } from "@radix-ui/react-avatar";
import { useChat } from "ai/react";
import { useEffect, useRef, useState } from "react";
import { CircleUser, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// interface Message {
//   id: number;
//   content: string;
//   role: "user" | "system";
// }

const Home = () => {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);
  if (!mounted) <></>;

  const {
    // append,
    // isLoading,
    messages,
    input,
    handleInputChange,
    handleSubmit,
  } = useChat();

  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <header className="flex items-center px-6 py-4 border-b bg-white">
        <Avatar className="h-10 w-10">
          <AvatarImage src="/midwestern_logo.png" />
          <AvatarFallback className="bg-[#1a237e] text-white">
            MCC
          </AvatarFallback>
        </Avatar>
        <div className="ml-4">
          <h1 className="text-lg font-semibold">
            Midwestern Career College AI Assistant
          </h1>
        </div>
      </header>

      <div className="flex-1 overflow-hidden">
        <ScrollArea ref={scrollRef} className="h-full px-6 py-4">
          {messages?.map((message) => (
            <div
              key={message.id}
              className={`flex items-start gap-3 mb-6 ${
                message.role === "user" ? "flex-row-reverse" : "flex-row"
              }`}
            >
              <Avatar className="mt-1">
                {message?.role === "assistant" ? (
                  <>
                    <AvatarImage src="/midwestern_logo.png" />
                    <AvatarFallback className="bg-[#1a237e] text-white">
                      MCC
                    </AvatarFallback>
                  </>
                ) : (
                  <>
                    {/* <AvatarImage src=""  /> */}
                    <CircleUser />
                  </>
                )}
              </Avatar>
              <div
                className={`flex flex-col max-w-[80%] ${
                  message.role === "user" ? "items-end" : "items-start"
                }`}
              >
                <div
                  className={`rounded-lg p-4 ${
                    message.role === "user"
                      ? "bg-[#1a237e] text-white"
                      : "bg-white border shadow-sm"
                  }`}
                >
                  {message.content}
                </div>
              </div>
            </div>
          ))}
          {/* {messages?.map((message, i) => (
            <div key={i}>
              <p>{message.role}</p>
              <p>{message.content}</p>
            </div>
          ))}
          {isLoading && <p>Loading...</p>} */}
        </ScrollArea>
      </div>

      <div className="border-t bg-white p-4">
        <div className="max-w-3xl mx-auto">
          <form onSubmit={handleSubmit} className="flex gap-2">
            <Input
              onChange={handleInputChange}
              value={input}
              placeholder="Type your message..."
              className="flex-1"
            />
            <Button type="submit" className="bg-[#1a237e] hover:bg-[#0d1757]">
              <Send className="h-4 w-4" />
              <span className="sr-only">Send message</span>
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Home;

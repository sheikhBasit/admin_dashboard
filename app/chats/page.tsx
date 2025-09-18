"use client";

import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { ChatSession, ChatMessage } from "@/lib/types";
import { MessageCircle, Send, Search, Plus } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export default function ChatsPage() {
  const [selectedChat, setSelectedChat] = useState<ChatSession | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const queryClient = useQueryClient();

  // Fetch chat sessions
  const { data: chatsResp, isLoading } = useQuery({
    queryKey: ["chats"],
    queryFn: () => api.get<{ sessions: ChatSession[] }>("/chat/sessions"),
  });
  const chats: ChatSession[] = chatsResp?.data?.sessions || [];

  // Fetch messages for selected chat
  const { data: selectedChatDetails, isLoading: isLoadingMessages } = useQuery({
    queryKey: ["chat-messages", selectedChat?._id],
    queryFn: () =>
      api.get<{ chat_history: ChatMessage[] }>(
        `/chat/sessions/${selectedChat!._id}/chat`
      ),
    enabled: !!selectedChat,
  });
  const messages: ChatMessage[] = selectedChatDetails?.data?.chat_history || [];

  // Use useEffect to automatically select the first chat session if none is selected
  useEffect(() => {
    if (chats.length > 0 && !selectedChat) {
      setSelectedChat(chats[0]);
    }
  }, [chats, selectedChat]);

  // Start new chat mutation
  const startChatMutation = useMutation({
    mutationFn: () =>
      api.post<{ session_id: string; chat_title: string }>("/chat/start", {}),
    onSuccess: (response) => {
      const { session_id, chat_title } = response.data!;
      const newSession: ChatSession = {
        _id: session_id,
        chat_title: chat_title,
        user_id: "",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        preview: "New chat started...",
      };
      queryClient.setQueryData(
        ["chats"],
        (oldData: { sessions: ChatSession[] } | undefined) => {
          const existingSessions = oldData?.sessions || [];
          return { sessions: [newSession, ...existingSessions] };
        }
      );
      setSelectedChat(newSession);
      queryClient.invalidateQueries({ queryKey: ["chats"] });
    },
  });

  // Send message mutation
const sendMessageMutation = useMutation({
  mutationFn: (data: FormData) =>
    api.post<{
      response: string;
      session_id: string;
      chat_title: string
    }>("/chat/message", data), // Remove the headers object here
  onSuccess: (response) => {
    console.log(response);
    setNewMessage("");
    
    const { session_id, chat_title } = response.data || {};

    if (selectedChat && session_id === selectedChat._id && chat_title) {
      setSelectedChat({
        ...selectedChat,
        chat_title: chat_title
      });
    }

    queryClient.invalidateQueries({ queryKey: ["chats"] });
    
    if (session_id) {
      queryClient.invalidateQueries({
        queryKey: ["chat-messages", session_id],
      });
    }
  },
  onError: (error) => {
    console.error("Failed to send message:", error);
    
    if (error) {
        alert(`Error: ${error}`);
    } else {
        alert("An unexpected error occurred. Please try again.");
    }
  },
});
const handleSendMessage = () => { 
  if (!newMessage.trim()) return;

  const formData = new FormData();
  formData.append("message", newMessage);
  console.log("Sending message:", newMessage);
  if (selectedChat?._id) {
    formData.append("session_id", selectedChat._id);
  }
  console.log("Session ID:", selectedChat?._id);
  // Create vehicle data object with proper structure
  // const vehicleData = {
  //   model: "Corolla",
  //   brand: "Toyota",
  //   year: 2020,
  //   type: "car",
  //   fuel_type: "petrol",
  //   transmission: "automatic",
  //   mileage_km: 50000,
  // };
  
  // // Convert to JSON string as required by backend
  // formData.append("vehicle_json", JSON.stringify(vehicleData));
  
  sendMessageMutation.mutate(formData);
};

  const filteredChats = chats?.filter((chat) =>
    (chat.chat_title || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="flex flex-col h-screen max-w-full overflow-hidden">
        {/* <div className="flex items-center justify-between p-4 border-b shrink-0">
          <h1 className="text-xl font-semibold">Chat</h1>
        </div>
         */}
        <div className="flex flex-1 min-h-0">
          {/* Chat Area */}
          <div className="flex-1 flex flex-col min-w-0 border-r min-h-0">
            {selectedChat ? (
              <>
                {/* Chat Header */}
                <div className="p-4 border-b bg-card shrink-0">
                  <div className="flex items-center space-x-3">
                    <div>
                      <h2 className="font-semibold truncate">
                        {selectedChat.chat_title || "Chat"}
                      </h2>
                    </div>
                  </div>
                </div>
                
                {/* Messages with padding for fixed message bar */}
                <div className="flex-1 overflow-hidden relative min-h-0">
                  <ScrollArea className="h-full pb-20">
                    <div className="p-4 space-y-6">
                      {messages?.map((message, idx) => (
                        <div
                          key={idx}
                          className={`flex items-start gap-4 ${
                            message.role === "user" ? "flex-row-reverse" : ""
                          }`}
                        >
                          <div
                            className={`flex flex-col gap-1 max-w-[70%] ${
                              message.role === "user"
                                ? "items-end"
                                : "items-start"
                            }`}
                          >
                            <div className="text-xs text-muted-foreground">
                              {message.role === "user" ? "You" : "AutoBot"}
                            </div>
                            <div
                              className={`p-3 rounded-xl whitespace-pre-wrap break-words ${
                                message.role === "user"
                                  ? "bg-primary text-primary-foreground"
                                  : "bg-muted"
                              }`}
                            >
                              <p>{message.content}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                      {isLoadingMessages && (
                        <div className="text-center text-muted-foreground">
                          Loading messages...
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                  
                  {/* Fixed Message Input */}
                  <div className="absolute bottom-22 left-0 right-0 p-4 border-t bg-card">
                    <div className="flex items-center space-x-2">
                      <Input
                        placeholder="Type a message..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={(e) =>
                          e.key === "Enter" && handleSendMessage()
                        }
                        className="flex-1"
                      />
                      <Button
                        onClick={handleSendMessage}
                        disabled={
                          !newMessage.trim() || sendMessageMutation.isPending
                        }
                      >
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center bg-muted/20 min-h-0">
                <div className="text-center">
                  <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium">Select a conversation</h3>
                  <p className="text-muted-foreground">
                    Choose a chat from the list to start messaging
                  </p>
                  <p className="text-muted-foreground">
                    Or start a new one to begin messaging
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Conversations List */}
          <div className="w-1/3 bg-card min-w-[300px] max-w-md flex flex-col min-h-0">
  <div className="p-4 border-b bg-card shrink-0">
    <div className="flex items-center justify-between mb-4">
      <h1 className="text-xl font-semibold">Conversations</h1>
      <Button onClick={() => startChatMutation.mutate()} size="sm">
        <Plus className="h-4 w-4" />
      </Button>
    </div>
    <div className="relative">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <Input
        placeholder="Search conversations..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="pl-10"
      />
    </div>
  </div>
  <div className="flex-1 min-h-0 overflow-hidden">
    <ScrollArea className="h-full">
      <div className="p-2">
        {isLoading ? (
          <div className="text-center py-8 text-muted-foreground">
            Loading chats...
          </div>
        ) : filteredChats?.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No conversations found
          </div>
        ) : (
          filteredChats?.map((chat) => (
            <Card
              key={chat._id}
              className={`mb-2 cursor-pointer transition-colors hover:bg-accent ${
                selectedChat?._id === chat._id ? "bg-accent" : ""
              }`}
              onClick={() => setSelectedChat(chat)}
            >
              <CardContent className="p-3">
                <div className="flex items-start space-x-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium truncate">
                        {chat.chat_title || "Chat"}
                      </h3>
                      <span className="text-xs text-muted-foreground whitespace-nowrap">
                        {chat.updated_at
                          ? formatDistanceToNow(new Date(chat.updated_at), {
                              addSuffix: true,
                            })
                          : ""}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground truncate mt-1">
                      {chat.preview || "No messages yet"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </ScrollArea>
  </div>
</div>
        </div>
      </div>
    </DashboardLayout>
  );
}
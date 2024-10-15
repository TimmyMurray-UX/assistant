import React, { useState, useEffect, useRef } from "react";
import MessagesSection from "./MessagesSection";
import InputSection from "./InputSection";
import InitialScreen from "./InitialScreen";
import Header from "./Header";

function App() {
  const [messages, setMessages] = useState([]);
  const [threadId, setThreadId] = useState(null);
  const [loading, setLoading] = useState(false);
  const inputSectionRef = useRef(null); // Reference to the InputSection component

  const agentId = document.body.getAttribute("agent-id");

  useEffect(() => {
    const createThread = async () => {
      try {
        const response = await fetch("/create-thread", {
          method: "GET",
          headers: { "Agent-ID": agentId },
        });

        if (response.ok) {
          const data = await response.json();
          if (data.thread_id) {
            setThreadId(data.thread_id);
          }
        }
      } catch (error) {
        console.error("Error creating thread:", error);
      }
    };

    if (agentId) {
      createThread();
    }
  }, [agentId]);

  const sendMessage = async (message) => {
    if (!threadId) {
      console.error("Thread ID is not available, cannot send message.");
      return;
    }

    setLoading(true);
    setMessages((prev) => [...prev, { role: "user", content: message }]);

    try {
      const response = await fetch("/send-message", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Agent-ID": agentId,
        },
        body: JSON.stringify({
          message,
          threadId,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: data.result },
        ]);
      }
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setLoading(false);
    }
  };

  const hasFiles = () => {
    return inputSectionRef.current ? inputSectionRef.current.hasFiles() : false;
  };

  return (
    <main className="flex justify-center items-center h-screen bg-gray-100">
      <div className="flex flex-col w-full h-full bg-white shadow-lg rounded-lg overflow-hidden">
        {messages.length > 0 && <Header />}
        <div className="flex-grow overflow-auto p-6 sm:pl-0 pb-0 flex flex-col">
          {/* Check if inputSectionRef is available before rendering InitialScreen */}
          {messages.length === 0 && inputSectionRef.current ? (
            <InitialScreen
              onSendMessage={sendMessage}
              hasFiles={hasFiles}
              getCombinedMessage={inputSectionRef.current.getCombinedMessage}
              loadingFiles={inputSectionRef.current.loadingFiles}
              setUserInput={inputSectionRef.current.setUserInput}
              triggerSend={inputSectionRef.current.triggerSend}
              textareaRef={inputSectionRef.current.textareaRef}
              adjustTextareaHeight={
                inputSectionRef.current.adjustTextareaHeight
              }
            />
          ) : (
            <MessagesSection
              messages={messages}
              onSendMessage={sendMessage}
              loading={loading}
            />
          )}
        </div>
        {/* Always render InputSection */}
        <InputSection ref={inputSectionRef} onSendMessage={sendMessage} />
      </div>
    </main>
  );
}

export default App;

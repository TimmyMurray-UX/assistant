import React, { useState, useEffect } from "react";
import MessagesSection from "./MessagesSection";
import InputSection from "./InputSection";
import InitialScreen from "./InitialScreen";
import Header from "./Header";

function App() {
  const [messages, setMessages] = useState([]);
  const [threadId, setThreadId] = useState(null);
  const [loading, setLoading] = useState(false);

  // Extract agentId from the body attribute
  const agentId = document.body.getAttribute('agent-id');

  // Create a new thread when the app starts
  useEffect(() => {
    const createThread = async () => {
      try {
        const response = await fetch("https://assistants.api.ea.huit.harvard.edu/create-thread", {
          method: "GET",
          headers: { "Agent-ID": agentId },  // Include the Agent-ID header
        });
        const data = await response.json();
        if (data.thread_id) {
          setThreadId(data.thread_id); // Store the thread ID
        } else {
          console.error("Error: No thread ID received");
        }
      } catch (error) {
        console.error("Error creating thread:", error);
      }
    };

    if (agentId) {
      createThread();  // Create the thread only if agentId is available
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
      const response = await fetch("https://assistants.api.ea.huit.harvard.edu/send-message", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Agent-ID": agentId,  // Include the Agent-ID header
        },
        body: JSON.stringify({
          message,
          threadId,  // Send the threadId in the body
        }),
      });

      const data = await response.json();
      if (data.result) {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: data.result },
        ]);
      } else if (data.error) {
        console.error("Error from assistant:", data.error);
      }
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex justify-center items-center h-screen bg-gray-100">
      <div className="flex flex-col w-full h-full bg-white shadow-lg rounded-lg overflow-hidden">
        {messages.length > 0 && <Header />} {/* Conditionally render Header */}
        <div className="flex-grow overflow-auto p-6 sm:pl-0 pb-0 flex flex-col">
          {messages.length === 0 ? (
            <InitialScreen onSendMessage={sendMessage} />
          ) : (
            <MessagesSection
              messages={messages}
              onSendMessage={sendMessage}
              loading={loading}
            />
          )}
        </div>
        <InputSection onSendMessage={sendMessage} />
      </div>
    </main>
  );
}

export default App;

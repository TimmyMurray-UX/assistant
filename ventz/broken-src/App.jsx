import React, { useState, useEffect, useRef } from "react";
import MessagesSection from "./MessagesSection";
import InputSection from "./InputSection";
import InitialScreen from "./InitialScreen";
import Header from "./Header";

function App() {
  const [messages, setMessages] = useState([]);
  const [threadId, setThreadId] = useState(null); // Track the thread ID
  const [loading, setLoading] = useState(false);
  const [threadLoading, setThreadLoading] = useState(true);  // Track thread creation
  const inputSectionRef = useRef(null); // Reference to the InputSection component

  // Extract agentId from the body attribute
  const agentId = document.body.getAttribute('agent-id');

  // Create a new thread when the app starts
  useEffect(() => {
    const createThread = async () => {
      setThreadLoading(true);  // Set thread loading state
      try {
        const response = await fetch("https://assistants.api.ea.huit.harvard.edu/create-thread", {
          method: "GET",
          headers: { "Agent-ID": agentId },  // Include the Agent-ID header
        });
        const data = await response.json();
        if (data.thread_id) {
          setThreadId(data.thread_id); // Store the thread ID
          console.log("Thread ID created: ", data.thread_id);  // Debugging log for thread ID
        } else {
          console.error("Error: No thread ID received");
        }
      } catch (error) {
        console.error("Error creating thread:", error);
      } finally {
        setThreadLoading(false);  // Thread creation completed
      }
    };

    if (agentId) {
      createThread();  // Create the thread only if agentId is available
    }
  }, [agentId]);

  // Function to send message, explicitly passing threadId as a parameter
  const sendMessage = async (message, explicitThreadId) => {
    const currentThreadId = explicitThreadId || threadId;  // Use the passed threadId or fallback to state
    if (!currentThreadId) {
      console.error("Thread ID is not available, cannot send message.");  // Debugging log if thread ID is missing
      return;
    }

    setLoading(true);
    setMessages((prev) => [...prev, { role: "user", content: message }]);

    try {
      console.log("Sending message with thread ID: ", currentThreadId);  // Debugging log for threadId when sending message

      const response = await fetch("https://assistants.api.ea.huit.harvard.edu/send-message", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Agent-ID": agentId,  // Include the Agent-ID header
        },
        body: JSON.stringify({
          message,
          threadId: currentThreadId,  // Send the threadId in the body
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

  // Function to check if files are attached by accessing InputSection's hasFiles method
  const hasFiles = () => {
    return inputSectionRef.current ? inputSectionRef.current.hasFiles() : false;
  };

  // Ensure that the threadId is fully available before allowing the message send
  useEffect(() => {
    if (threadId) {
      console.log("Thread ID is now available for sending messages:", threadId);
    }
  }, [threadId]);  // Track threadId changes to ensure it’s up to date

  return (
    <main className="flex justify-center items-center h-screen bg-gray-100">
      <div className="flex flex-col w-full h-full bg-white shadow-lg rounded-lg overflow-hidden">
        {messages.length > 0 && <Header />} {/* Conditionally render Header */}
        <div className="flex-grow overflow-auto p-6 sm:pl-0 pb-0 flex flex-col">
          {messages.length === 0 ? (
            <InitialScreen
              onSendMessage={(msg) => sendMessage(msg, threadId)}  // Explicitly pass threadId here
              hasFiles={hasFiles}
              getCombinedMessage={inputSectionRef.current?.getCombinedMessage}
              loadingFiles={inputSectionRef.current?.loadingFiles}
              setUserInput={inputSectionRef.current?.setUserInput}   
              handleSend={(msg) => sendMessage(msg, threadId)}       // Explicitly pass threadId here
              threadLoading={threadLoading}   // Pass thread loading status
            />
          ) : (
            <MessagesSection
              messages={messages}
              onSendMessage={(msg) => sendMessage(msg, threadId)}  // Explicitly pass threadId here
              loading={loading}
            />
          )}
        </div>
        <InputSection ref={inputSectionRef} onSendMessage={(msg) => sendMessage(msg, threadId)} />
      </div>
    </main>
  );
}

export default App;

import React, { useState, useEffect, useRef } from "react";
import MessagesSection from "./MessagesSection";
import InputSection from "./InputSection";
import InitialScreen from "./InitialScreen";
import Header from "./Header";
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf";

pdfjsLib.GlobalWorkerOptions.workerSrc = `${window.location.origin}/pdf/pdf.worker.min.mjs`;

function App() {
  const [messages, setMessages] = useState([]);
  const [threadId, setThreadId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fileTexts, setFileTexts] = useState({}); // State for text extracted from files
  const [pendingPrompt, setPendingPrompt] = useState(null); // Store the pending prompt text
  const inputSectionRef = useRef(null); // Reference to the InputSection component
  const fileInputRef = useRef(null); // Reference to trigger file picker in InputSection

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

  const extractTextFromPDF = async (file) => {
    try {
      const reader = new FileReader();
      reader.onload = async function (e) {
        const typedarray = new Uint8Array(e.target.result);
        const pdf = await pdfjsLib.getDocument({ data: typedarray }).promise;
        let pdfText = "";

        for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber++) {
          const page = await pdf.getPage(pageNumber);
          const textContent = await page.getTextContent();
          const strings = textContent.items.map((item) => item.str);
          pdfText += strings.join(" ") + "\n";
        }

        const fileId = `${file.name}_${file.lastModified}`;
        setFileTexts((prevTexts) => ({
          ...prevTexts,
          [fileId]: pdfText,
        }));

        // Populate the InputSection with the pending prompt after file selection
        if (pendingPrompt && inputSectionRef.current) {
          inputSectionRef.current.setUserInput(pendingPrompt);
          setPendingPrompt(null); // Clear the pending prompt
        }
      };
      reader.readAsArrayBuffer(file);
    } catch (error) {
      console.error("Error extracting text from PDF:", error);
    }
  };

  return (
    <main className="flex justify-center items-center h-screen bg-gray-100">
      <div className="flex flex-col w-full h-full bg-white shadow-lg rounded-lg overflow-hidden">
        {messages.length > 0 && <Header />}
        <div className="flex-grow overflow-auto p-6 sm:pl-0 pb-0 flex flex-col">
          {messages.length === 0 && inputSectionRef.current ? (
            <InitialScreen
              setPendingPrompt={setPendingPrompt} // Set the pending prompt for later
              fileInputRef={fileInputRef} // Pass file input ref to trigger file picker
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
        <InputSection
          ref={inputSectionRef}
          fileInputRef={fileInputRef} // Pass file input ref to InputSection
          onSendMessage={sendMessage}
          extractTextFromPDF={extractTextFromPDF}
          fileTexts={fileTexts}
          setFileTexts={setFileTexts} // Pass setFileTexts to InputSection
        />
      </div>
    </main>
  );
}

export default App;

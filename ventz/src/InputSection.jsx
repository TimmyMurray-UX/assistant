import React, { useState, useImperativeHandle, forwardRef } from "react";
import {
  PaperAirplaneIcon,
  PaperClipIcon,
  XCircleIcon,
} from "@heroicons/react/24/outline";
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf";

// Manually set the workerSrc to point to the S3-hosted worker with cross-origin support
pdfjsLib.GlobalWorkerOptions.workerSrc = "https://harvard-openai-assistants.s3.amazonaws.com/assets/pdf.worker.min.js";

const InputSection = forwardRef(({ onSendMessage }, ref) => {
  const [userInput, setUserInput] = useState("");
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [fileTexts, setFileTexts] = useState({});
  const [loadingFiles, setLoadingFiles] = useState(false); // Track file extraction
  const [rows, setRows] = useState(1);

  const getFileId = (file) => `${file.name}_${file.lastModified}`;

  const hasContent = () => {
    const combinedFileText = Object.values(fileTexts).join("\n");
    return (combinedFileText + userInput).trim().length > 0;
  };

  const hasFiles = () => selectedFiles.length > 0; // Helper function to check for files

  useImperativeHandle(ref, () => ({
    hasFiles,
    getCombinedMessage,
    loadingFiles,
    setUserInput,  // Expose setUserInput to update the input field
    triggerSend,   // Expose triggerSend to programmatically trigger message send
  }));

  // This will be called to combine the file text with the prompt from the buttons
  const getCombinedMessage = (prompt) => {
    const combinedFileText = Object.values(fileTexts).join("\n");
    return combinedFileText + "\n" + prompt;
  };

  const triggerSend = () => {
    handleSend();  // Trigger the send action programmatically
  };

  const handleSend = () => {
    const combinedFileText = Object.values(fileTexts).join("\n");
    const message = combinedFileText + userInput;

    if (message.trim()) {
      onSendMessage(message);
      setUserInput("");
      setSelectedFiles([]);
      setFileTexts({});
      setRows(1);
    }
  };

  const handleInputChange = (e) => {
    const input = e.target.value;
    setUserInput(input);
  };

  const extractTextFromPDF = async (file) => {
    setLoadingFiles(true); // Start loading
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
          pdfText += strings.join("\n") + "\n";
        }

        // Store the extracted text in fileTexts state
        const fileId = getFileId(file);
        setFileTexts((prevTexts) => ({
          ...prevTexts,
          [fileId]: pdfText,
        }));
      };
      reader.readAsArrayBuffer(file);
    } catch (error) {
      console.error("Error extracting text from PDF:", error);
    } finally {
      setLoadingFiles(false); // End loading
    }
  };

  const handleFileChange = async (event) => {
    const files = Array.from(event.target.files);
    setSelectedFiles((prevFiles) => [...prevFiles, ...files]);

    for (const file of files) {
      if (file.type === "application/pdf" || file.name.endsWith(".pdf")) {
        await extractTextFromPDF(file);
      } else {
        console.warn("Unsupported file type:", file.type);
      }
    }
  };

  const removeFile = (fileToRemove) => {
    setSelectedFiles((prevFiles) =>
      prevFiles.filter((file) => file !== fileToRemove)
    );

    setFileTexts((prevTexts) => {
      const newTexts = { ...prevTexts };
      const fileId = getFileId(fileToRemove);
      delete newTexts[fileId];
      return newTexts;
    });
  };

  return (
    <div className="p-4">
      <div className="flex flex-col items-center max-w-3xl mx-auto relative w-full">
        {/* Input field container */}
        <div className="flex flex-col items-start w-full relative p-4 rounded-3xl shadow-sm bg-gray-100 text-black">
          {/* Display file names above the message input */}
          {selectedFiles.length > 0 && (
            <div className="flex space-x-2 mb-2 overflow-x-auto w-full">
              {selectedFiles.map((file, index) => (
                <div
                  key={index}
                  className="flex items-center bg-gray-200 rounded px-2 py-1 text-sm text-gray-600"
                  style={{ wordBreak: "keep-all", whiteSpace: "nowrap" }}
                >
                  <span className="mr-2">{file.name}</span>
                  <XCircleIcon
                    className="h-4 w-4 text-red-500 cursor-pointer"
                    onClick={() => removeFile(file)}
                    aria-label="Remove file"
                  />
                </div>
              ))}
            </div>
          )}

          {/* Display extracted PDF text inside a <pre> tag */}
          {Object.values(fileTexts).length > 0 && (
            <pre className="w-full bg-gray-200 p-4 rounded-md mb-4 overflow-auto max-h-64 whitespace-pre-wrap">
              {Object.values(fileTexts).join("\n")}
            </pre>
          )}

          {/* Message input */}
          <div className="flex items-start w-full relative">
            {/* PaperClipIcon for file upload */}
            <label htmlFor="file-upload" className="cursor-pointer mr-4 mt-2">
              <PaperClipIcon className="h-6 w-6 text-gray-500 hover:text-gray-400" />
              <input
                id="file-upload"
                type="file"
                multiple
                onChange={handleFileChange}
                className="sr-only"
                accept="application/pdf"
              />
            </label>

            <label htmlFor="message-input" className="sr-only">
              Type a message
            </label>

            <textarea
              id="message-input"
              className="bg-transparent flex-grow outline-none w-full p-2 resize-none overflow-auto"
              value={userInput}
              onChange={handleInputChange}
              placeholder="Type a message..."
              rows={rows}
              onKeyPress={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
            />

            {/* Send button */}
            <button
              onClick={handleSend}
              className={`p-2 bg-gray-700 text-white rounded-full hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-400 ml-4 mt-2 ${
                !hasContent() && "opacity-50 cursor-not-allowed"
              }`}
              disabled={!hasContent()}
              aria-label="Send Message"
              title="Send Message"
            >
              <PaperAirplaneIcon className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>

      <footer className="p-4 text-center text-xs text-gray-500">
        <a href="#" target="_blank" rel="noreferrer">
          Digital Accessibility
        </a>{" "}
        |{" "}
        <a href="#" target="_blank" rel="noreferrer">
          Privacy
        </a>{" "}
        |{" "}
        <a href="#" target="_blank" rel="noreferrer">
          Help
        </a>
      </footer>
    </div>
  );
});

export default InputSection;

import React, {
  useState,
  useImperativeHandle,
  forwardRef,
  useRef,
  useLayoutEffect,
} from "react";
import {
  PaperAirplaneIcon,
  PaperClipIcon,
  XCircleIcon,
} from "@heroicons/react/24/outline";
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf";

pdfjsLib.GlobalWorkerOptions.workerSrc = `${window.location.origin}/pdf/pdf.worker.min.mjs`;

const InputSection = forwardRef(({ onSendMessage }, ref) => {
  const [userInput, setUserInput] = useState("");
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [fileTexts, setFileTexts] = useState({});
  const [loadingFiles, setLoadingFiles] = useState(false);
  const textareaRef = useRef(null); // Ref for the textarea

  const getFileId = (file) => `${file.name}_${file.lastModified}`;

  const hasContent = () => {
    const combinedFileText = Object.values(fileTexts).join("\n");
    return (combinedFileText + userInput).trim().length > 0;
  };

  const hasFiles = () => selectedFiles.length > 0;

  const getCombinedMessage = (prompt) => {
    const combinedFileText = Object.values(fileTexts).join("\n");
    return combinedFileText + "\n" + prompt;
  };

  const triggerSend = () => {
    handleSend();
  };

  useImperativeHandle(ref, () => ({
    hasFiles,
    getCombinedMessage,
    loadingFiles,
    setUserInput,
    triggerSend,
    adjustTextareaHeight,
  }));

  // Automatically adjust the textarea height whenever userInput changes
  useLayoutEffect(() => {
    adjustTextareaHeight();
  }, [userInput]);

  const handleFileChange = async (event) => {
    const files = Array.from(event.target.files);

    if (files.length > 0) {
      setLoadingFiles(true);
      setSelectedFiles((prevFiles) => [...prevFiles, ...files]);

      for (const file of files) {
        if (file.type === "application/pdf" || file.name.endsWith(".pdf")) {
          await extractTextFromPDF(file);
        } else {
          console.warn("Unsupported file type:", file.type);
        }
      }

      setLoadingFiles(false);
      event.target.value = null;
    }
  };

  const handleSend = () => {
    const combinedFileText = Object.values(fileTexts).join("\n");
    const message = combinedFileText + userInput;

    if (message.trim()) {
      onSendMessage(message);
      setUserInput(""); // Clear the input after sending
      setSelectedFiles([]);
      setFileTexts({});
    }
  };

  const handleInputChange = (e) => {
    const input = e.target.value;
    setUserInput(input); // Update input content
  };

  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto"; // Reset height to auto
      textarea.style.height = `${textarea.scrollHeight}px`; // Adjust height to fit content
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

        const fileId = getFileId(file);
        setFileTexts((prevTexts) => ({
          ...prevTexts,
          [fileId]: pdfText,
        }));
      };
      reader.readAsArrayBuffer(file);
    } catch (error) {
      console.error("Error extracting text from PDF:", error);
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
        <div className="flex flex-col items-start w-full relative p-2 rounded-3xl shadow-sm bg-gray-100 text-black">
          {Object.values(fileTexts).length > 0 && (
            <pre className="w-full bg-gray-200 p-4 rounded-md mb-4 overflow-auto max-h-64 whitespace-pre-wrap">
              {Object.values(fileTexts).join("\n")}
            </pre>
          )}

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

          {/* Flex container with items-end to align icons to the bottom */}
          <div className="flex items-end space-x-2 bg-gray-100 rounded-lg p-0 w-full">
            {/* Paperclip icon */}
            <div className="flex items-center p-2">
              <label htmlFor="file-upload" className="cursor-pointer">
                <PaperClipIcon className="h-8 w-8 text-black hover:text-gray-400" />
                <input
                  id="file-upload"
                  type="file"
                  multiple
                  onChange={handleFileChange}
                  className="sr-only"
                  accept="application/pdf"
                />
              </label>
            </div>

            {/* Textarea */}
            <div className="flex-grow">
              <textarea
                id="message-input"
                ref={textareaRef}
                className="bg-transparent flex-grow outline-none w-full resize-none overflow-hidden h-auto max-h-32 p-2 leading-relaxed"
                value={userInput}
                onChange={handleInputChange}
                placeholder="Type a message..."
                rows={1}
              />
            </div>

            {/* Submit button */}
            <div className="flex items-center p-2">
              <button
                onClick={handleSend}
                className={`p-2 bg-gray-700 text-white rounded-full hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-400 ${
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

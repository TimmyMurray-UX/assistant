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

const InputSection = forwardRef(
  (
    { onSendMessage, fileTexts, setFileTexts, extractTextFromPDF, openModal },
    ref
  ) => {
    const [userInput, setUserInput] = useState("");
    const [selectedFiles, setSelectedFiles] = useState([]); // State for managing selected files
    const textareaRef = useRef(null);

    useImperativeHandle(ref, () => ({
      setUserInput,
      // Add uploaded file to the selected files
      addUploadedFile: (file) => {
        setSelectedFiles((prevFiles) => [...prevFiles, file]); // Add new file to the selectedFiles array
      },
    }));

    const handleInputChange = (e) => {
      const input = e.target.value;
      setUserInput(input);
    };

    const adjustTextareaHeight = () => {
      const textarea = textareaRef.current;
      if (textarea) {
        textarea.style.height = "auto"; // Reset height to auto
        textarea.style.height = `${textarea.scrollHeight}px`; // Adjust height to fit content
      }
    };

    useLayoutEffect(() => {
      adjustTextareaHeight();
    }, [userInput]);

    const handleSend = () => {
      const combinedFileText = Object.values(fileTexts).join("\n"); // PDF text
      const messageToSend = combinedFileText + userInput; // Full message with PDF + prompt text
      const promptMessage = userInput; // Only the prompt text
      const fileName = selectedFiles.length > 0 ? selectedFiles[0].name : null; // Get the file name

      if (messageToSend.trim()) {
        // Pass the full message and file name to be sent to the API, but the promptMessage to display in the MessagesSection
        onSendMessage({
          fullMessage: messageToSend,
          displayMessage: promptMessage,
          fileName,
        });
        setUserInput(""); // Clear the input after sending
        setSelectedFiles([]); // Clear selected files
        setFileTexts({}); // Clear the fileTexts in <pre> tags
      }
    };

    const removeFile = (fileToRemove) => {
      setSelectedFiles((prevFiles) => {
        const updatedFiles = prevFiles.filter((file) => file !== fileToRemove);

        // Clear text input and fileTexts when no files are left
        if (updatedFiles.length === 0) {
          setUserInput(""); // Clear the text box
          setFileTexts({}); // Clear the fileTexts that display in <pre>
        }

        return updatedFiles;
      });
    };

    return (
      <div className="p-4">
        <div className="flex flex-col items-center max-w-3xl mx-auto relative w-full">
          <div className="flex flex-col items-start w-full relative rounded-3xl shadow-sm bg-gray-100 text-black">
            {/* Display fileTexts in the <pre> tag */}
            {Object.values(fileTexts).length > 0 && (
              <div className="p-2">
                <pre className="w-full bg-gray-200 p-4 rounded-3xl mb-4 overflow-auto max-h-64 whitespace-pre-wrap">
                  {Object.values(fileTexts).join("\n")}
                </pre>
              </div>
            )}

            {selectedFiles.length > 0 && (
              <div className="flex space-x-2 mb-2 overflow-x-auto p-2 w-full">
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

            <div className="flex items-end space-x-2 bg-gray-100 rounded-full p-0 w-full">
              {/* Paperclip icon for attaching files */}
              <div className="flex items-center p-2">
                <label
                  htmlFor="file-upload"
                  className="cursor-pointer"
                  onClick={openModal}
                >
                  <PaperClipIcon className="h-8 w-8 text-black hover:text-gray-400" />
                </label>
              </div>

              {/* Textarea for user input */}
              <div className="flex-grow">
                <textarea
                  ref={textareaRef}
                  className="bg-transparent flex-grow outline-none w-full resize-none overflow-hidden h-auto max-h-32 p-2 leading-relaxed"
                  value={userInput}
                  onChange={handleInputChange}
                  placeholder="Type a message..."
                  rows={1}
                />
              </div>

              {/* Send button */}
              <div className="flex items-center p-2">
                <button
                  onClick={handleSend}
                  className={`p-2 bg-gray-700 text-white rounded-full hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-400 ${
                    userInput.trim() === ""
                      ? "opacity-50 cursor-not-allowed"
                      : ""
                  }`}
                  aria-label="Send Message"
                  title="Send Message"
                  disabled={userInput.trim() === ""} // Disable when there is no text
                >
                  <PaperAirplaneIcon className="h-5 w-5" aria-hidden="true" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer section */}
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
  }
);

export default InputSection;

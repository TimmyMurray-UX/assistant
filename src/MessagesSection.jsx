import React, { useRef, useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { okaidia } from "react-syntax-highlighter/dist/esm/styles/prism";
import InitialScreen from "./InitialScreen";
import { ArrowDownIcon } from "@heroicons/react/24/outline";
/*import harvardShield from "./assets/Harvard_University_shield.svg";*/

function MessagesSection({
  messages,
  onSendMessage,
  loading,
  showInitialScreen,
}) {
  const messageContainerRef = useRef(null);
  const lastMessageRef = useRef(null);
  const [isAtBottom, setIsAtBottom] = useState(true);

  useEffect(() => {
    if (messageContainerRef.current && messages.length > 0) {
      lastMessageRef.current?.scrollIntoView({ behavior: "smooth" });
      setIsAtBottom(true);
    }
  }, [messages]);

  const handleScroll = () => {
    if (messageContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } =
        messageContainerRef.current;
      const isScrolledToBottom = scrollHeight - scrollTop <= clientHeight + 1;
      setIsAtBottom(isScrolledToBottom);
    }
  };

  const scrollToBottom = () => {
    if (messageContainerRef.current) {
      messageContainerRef.current.scrollTo({
        top: messageContainerRef.current.scrollHeight,
        behavior: "smooth",
      });
      setIsAtBottom(true);
    }
  };

  return (
    <div
      ref={messageContainerRef}
      className="flex flex-col w-full h-full overflow-y-auto relative"
      onScroll={handleScroll}
      role="log"
      aria-live="polite"
      aria-relevant="additions text"
    >
      {showInitialScreen ? (
        <InitialScreen onSendMessage={onSendMessage} />
      ) : (
        <div className="flex flex-col justify-end flex-grow max-w-3xl w-full mx-auto p-6 space-y-4">
          {messages.map((msg, index) => (
            <Message
              msg={msg}
              index={index}
              key={index}
              lastMessageRef={
                index === messages.length - 1 ? lastMessageRef : null
              }
            />
          ))}
          {loading && (
            <div
              className="flex items-start prose max-w-full text-black"
              role="alert"
              aria-live="assertive"
            >
              <div aria-hidden className="flex-shrink-0 mr-3">
                <img
                  src="https://harvard-openai-assistants.s3.amazonaws.com/assets/Harvard_University_shield.svg"
                  alt="Harvard University shield"
                  className="w-6 h-6 mt-6 not-prose object-contain"
                />
              </div>
              <div className="p-3 max-w-full mt-3 text-gray-500">
                Assistant is typing<span className="typing-dots"></span>
              </div>
            </div>
          )}
        </div>
      )}
      {!isAtBottom && (
        <button
          className="fixed bottom-36 left-1/2 transform -translate-x-1/2 bg-gray-700 text-white border border-gray-600 p-3 rounded-full shadow-lg hover:bg-gray-600 focus:outline-none z-10"
          onClick={scrollToBottom}
          aria-label="Scroll to bottom"
        >
          <ArrowDownIcon className="h-5 w-5" />
          <span className="sr-only">Scroll to bottom</span>
        </button>
      )}
    </div>
  );
}

function Message({ msg, index, lastMessageRef }) {
  const [isAccordionOpen, setIsAccordionOpen] = useState(false);

  const toggleAccordion = () => {
    setIsAccordionOpen(!isAccordionOpen);
  };

  return (
    <article
      className={`flex w-full ${
        msg.role === "user" ? "justify-end" : "justify-start"
      }`}
      role="region"
      aria-labelledby={`message-${index}-heading`}
    >
      <div
        ref={lastMessageRef}
        aria-live="polite"
        className={`flex ${
          msg.role === "user" ? "flex-col items-end" : "flex-row items-start"
        } p-3 prose ${
          msg.role === "user"
            ? "max-w-full md:max-w-md rounded-2xl bg-gray-200 text-gray-800 not-prose"
            : "max-w-full text-black"
        }`}
      >
        <h3 id={`message-${index}-heading`} className="sr-only">
          {msg.role === "user" ? "You said:" : "The assistant said:"}
        </h3>

        {/* Display file name and accordion controls for user messages */}
        {msg.role === "user" && msg.fileName && (
          <div className="text-sm text-gray-500 mb-2 self-start flex items-center">
            <strong>Attached file:</strong> {msg.fileName}
            {/* Expand/Collapse button */}
            <button
              onClick={toggleAccordion}
              className="ml-2 focus:outline-none text-blue-500 underline"
              aria-expanded={isAccordionOpen}
              aria-controls={`file-content-${index}`}
            >
              {isAccordionOpen ? "Hide file contents" : "Show file contents"}
            </button>
          </div>
        )}

        {/* Display assistant's logo for assistant messages */}
        {msg.role === "assistant" && (
          <div aria-hidden className="flex-shrink-0 mr-3">
            <img
              /*src={harvardShield}*/
              src="https://harvard-openai-assistants.s3.amazonaws.com/assets/Harvard_University_shield.svg"
              alt="Harvard University shield"
              className="w-6 h-6 mt-6 object-contain"
            />
          </div>
        )}

        <div className="flex-grow max-w-full overflow-x-auto">
          {/* Display file content in accordion */}
          {isAccordionOpen && msg.fileContent && (
            <div
              id={`file-content-${index}`}
              className="bg-gray-100 p-2 rounded mb-2"
            >
              <pre className="whitespace-pre-wrap">{msg.fileContent}</pre>
            </div>
          )}

          {/* Display message content */}
          <ReactMarkdown
            components={{
              code({ node, inline, className, children, ...props }) {
                const match = /language-(\w+)/.exec(className || "");
                return !inline && match ? (
                  <SyntaxHighlighter
                    style={okaidia}
                    language={match[1]}
                    PreTag="div"
                    {...props}
                  >
                    {String(children).replace(/\n$/, "")}
                  </SyntaxHighlighter>
                ) : (
                  <code className={className} {...props}>
                    {children}
                  </code>
                );
              },
            }}
          >
            {msg.content}
          </ReactMarkdown>
        </div>
      </div>
    </article>
  );
}

export default MessagesSection;

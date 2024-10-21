import React, { useRef, useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { okaidia } from "react-syntax-highlighter/dist/esm/styles/prism";
import InitialScreen from "./InitialScreen";
import { ArrowDownIcon } from "@heroicons/react/24/outline";
/*import harvardShield from * "./assets/Harvard_University_shield.svg";*/

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
      setIsAtBottom(true); // Ensure state is updated after scrolling
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
      role="log" // Log region for better screen reader navigation
      aria-live="polite"
      aria-relevant="additions text" // Ensure screen readers announce new content
    >
      {showInitialScreen ? (
        <InitialScreen onSendMessage={onSendMessage} />
      ) : (
        <div className="flex flex-col justify-end flex-grow max-w-3xl w-full mx-auto p-6 space-y-4">
          {messages.map((msg, index) => (
            <article
              key={index}
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
                  msg.role === "user"
                    ? "flex-col items-end" // Align user message to the right, but file name to the left
                    : "flex-row items-start" // Assistant messages use a row layout
                } p-3 prose ${
                  msg.role === "user"
                    ? "max-w-full md:max-w-md rounded-2xl bg-gray-200 text-gray-800 not-prose"
                    : "max-w-full text-black"
                }`}
              >
                <h3 id={`message-${index}-heading`} className="sr-only">
                  {msg.role === "user" ? "You said:" : "The assistant said:"}
                </h3>

                {/* Display file name aligned to the top left for user messages */}
                {msg.role === "user" && msg.fileName && (
                  <div className="text-sm text-gray-500 mb-2 self-start">
                    {" "}
                    {/* Use self-start to align to top-left */}
                    <strong>Attached file:</strong> {msg.fileName}
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
          ))}
          {loading && (
            <div
              className="flex items-start prose max-w-full text-black"
              role="alert" // Immediate announcement of loading state
              aria-live="assertive" // Ensure typing status is immediately announced
            >
              <div aria-hidden className="flex-shrink-0 mr-3">
                <img
                  /*src={harvardShield}*/
                  src="https://harvard-openai-assistants.s3.amazonaws.com/assets/Harvard_University_shield.svg"
                  alt="Harvard University shield"
                  className="w-6 h-6 mt-6 not-prose object-contain"
                />
              </div>
              <div className="p-3 max-w-full mt-3 text-gray-500">
                Assistant is typing...
              </div>
            </div>
          )}
        </div>
      )}
      {!isAtBottom && (
        <button
          className="fixed bottom-36 left-1/2 transform -translate-x-1/2 bg-gray-700 text-white border border-gray-600 p-3 rounded-full shadow-lg hover:bg-gray-600 focus:outline-none z-10"
          onClick={scrollToBottom}
          aria-label="Scroll to bottom" // Accessible label
        >
          <ArrowDownIcon className="h-5 w-5" />
          <span className="sr-only">Scroll to bottom</span>{" "}
        </button>
      )}
    </div>
  );
}

export default MessagesSection;

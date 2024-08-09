"use client";
import { useState, useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import remarkBreaks from "remark-breaks";

export default function Home() {
    // States
    const [messages, setMessages] = useState([
        {
            role: "assistant",
            content: `Hi I'm the Headstarter Support Agent. How can I assist you today?`,
        },
    ]);

    const [message, setMessage] = useState("");

    // Declaring this for dynamic scrolling
    const lastMessageRef = useRef(null);

    // Fetching responses from the OpenAI API
    const sendMessage = async () => {
        const userMessage = message;
        setMessages((messages) => [
            ...messages,
            { role: "user", content: userMessage },
            { role: "assistant", content: "" },
        ]);
        setMessage("");
        const response = fetch("/api/chat", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify([
                ...messages,
                { role: "user", content: message },
            ]),
        }).then(async (res) => {
            const reader = res.body.getReader();
            const decoder = new TextDecoder();
            let result = "";
            return reader.read().then(function processText({ done, value }) {
                if (done) {
                    return result;
                }
                const text = decoder.decode(value || new Int8Array(), {
                    stream: true,
                });
                setMessages((messages) => {
                    let lastMessage = messages[messages.length - 1];
                    let otherMessages = messages.slice(0, messages.length - 1);
                    return [
                        ...otherMessages,
                        {
                            ...lastMessage,
                            content: lastMessage.content + text,
                        },
                    ];
                });
                return reader.read().then(processText);
            });
        });
    };

    // For dynamic scrolling
    useEffect(() => {
        if (lastMessageRef.current) {
            lastMessageRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages]);

    return (
        <div className="w-screen h-screen flex justify-center items-center bg-white">
            <div className="bg-gradient-to-l from-[#060609] to-[#19203C] w-[25%] h-full mr-0"></div>
            <div className="flex flex-col w-9/12 h-full p-2 justify-between bg-[#10153A] bg-gradient-to-r from-[#060609] to-[#19203C]">
                <div
                    className="flex-col p-2 m-2 overflow-auto max-h-full flex-grow"
                    id="scrollablediv"
                >
                    {/* Creating a new div for each message and displaying it*/}
                    {messages.map((message, index) => (
                        <div
                            key={index}
                            ref={
                                index === messages.length - 1
                                    ? lastMessageRef
                                    : null
                            }
                            className={`flex ${
                                message.role === "assistant"
                                    ? "justify-start"
                                    : "justify-end"
                            } mt-4`}
                        >
                            <div
                                className={`bg-[#050714] rounded-2xl p-3 border-2 border-[#E5E5E5] ${
                                    message.role === "assistant"
                                        ? "text-[#60E4C8] ml-2"
                                        : "text-white"
                                }`}
                            >
                                <ReactMarkdown remarkPlugins={[remarkBreaks]}>
                                    {message.content}
                                </ReactMarkdown>
                            </div>
                        </div>
                    ))}
                </div>
                <div className="flex flex-row p-2 m-2">
                    <textarea
                        placeholder="Message Headstarter support assistant"
                        value={message}
                        className="w-full block p-2.5 text-sm bg-[#0A0E1D] text-white rounded-lg border border-gray-300 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white resize-none focus: outline-none focus:ring focus:ring-[#00E3B2]"
                        onKeyDown={(e) => {
                            if (e.key === "Enter" && e.shiftKey) {
                                e.preventDefault();
                                setMessage((prevMessage) => prevMessage + "\n");
                            } else if (e.key === "Enter") {
                                e.preventDefault();
                                message === "" ? null : sendMessage();
                            }
                        }}
                        onChange={(e) => setMessage(e.target.value)}
                    />
                    <button
                        onClick={() => (message === "" ? null : sendMessage())}
                        className="text-black bg-[#00F2C0] transition-colors duration-300 ease-in-out hover:bg-[#00f2c2b8] focus:outline-none font-medium rounded-lg text-sm px-5 py-2.5 ml-2 shadow-[0_0_2px_#00F2C0,inset_0_0_2px_#00F2C0,0_0_5px_#00F2C0,0_0_5px_#00F2C0,0_0_10px_#00F2C0]"
                    >
                        SEND
                    </button>
                </div>
            </div>
        </div>
    );
}

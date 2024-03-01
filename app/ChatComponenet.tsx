"use client";
import React, { useEffect, useState } from "react";

interface chatMsgTypes {
  roomId: string | number;
  user: string;
  msg: string;
  time: string;
  isTyping?: boolean;
  key?: any;
}

const ChatPage = ({ socket, username, roomId }: any) => {
  const [currentMsg, setCurrentMsg] = useState("");
  const [chat, setChat] = useState<chatMsgTypes[]>([]);
  const [typyingUser, setTypingUser] = useState<any>();
  const [isTyping, setIsTyping] = useState<Boolean>(false);

  const sendData = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (currentMsg !== "") {
      const msgData: chatMsgTypes = {
        roomId,
        user: username,
        msg: currentMsg,
        time: `${new Date(Date.now()).getHours()}:${new Date(
          Date.now()
        ).getMinutes()}`,
      };
      await socket.emit("send_msg", msgData);
      setCurrentMsg("");
      setIsTyping(false);
    }
  };

  useEffect(() => {
    socket.on("receive_msg", (data: chatMsgTypes) => {
      setChat((pre) => [...pre, data]);
      setIsTyping(false);
    });
    socket.on("join_notification", (data: any) => {
      // setJoinUser(name);
      setChat((pre: any) => [
        ...pre,
        {
          user: data.username,
          msg: "joined the room",
          time: "",
          key: data.key,
        },
      ]);
    });
    socket.on("leave_notification", (data: any) => {
      // setExitUser(name);
      setChat((pre: any) => [
        ...pre,
        { user: data.username, msg: "left the room", time: "", key: data.key },
      ]);
    });
    socket.on("initial_message_history", (history: chatMsgTypes[]) => {
      setChat(history);
    });
    socket.on("user_typing", (data: chatMsgTypes) => {
      setChat((pre) => {
        const existingIndex = pre.findIndex(
          (item) => item.user === data.user && item.roomId === data.roomId
        );
        setTypingUser(data.user);
        if (existingIndex !== -1) {
          const updatedChat = [...pre];
          updatedChat[existingIndex].isTyping = data.isTyping;

          return updatedChat;
        }
        return [...pre, data];
      });
      setIsTyping(data.isTyping);
    });
  }, [socket]);

  const handleTyping = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCurrentMsg(e.target.value);
    const isTyping = e.target.value !== "";
    setIsTyping(isTyping);
    socket.emit("typing", { roomId, username, isTyping });
  };
  const leaveRoom = (username: any, roomId: any) => {
    socket.emit("leave_room", { username, roomId });
    window.location.reload();
  };
  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <div className="mb-4 ">
        <p>
          Name: <b>{username}</b> and Room Id: <b>{roomId}</b>
        </p>
      </div>
      <div className="border p-5 flex flex-col w-[28rem] h-96 overflow-y-auto bg-slate-400">
        <div>
          {chat.map(({ user, msg, time, isTyping, key }, index) => (
            <div
              key={index}
              className={`${
                isTyping ? "text-gray-500 italic" : ""
              } flex items-center mb-5 ${
                user === username ? "justify-end" : "justify-start"
              }`}
            >
              {key === "join" || key === "leave" ? (
                <p className={`text-${user === username ? "right" : "left"}`}>
                  <strong>{user}</strong> {msg}
                </p>
              ) : (
                <>
                  {user === username ? (
                    <>
                      <h3 className="text-right">{msg}</h3>
                      <span
                        className={`bg-gray-300 h-10 w-10 rounded-full flex items-center justify-center border-white ml-2`}
                      >
                        {user?.charAt(0)}
                      </span>
                    </>
                  ) : (
                    <>
                      <span
                        className={`bg-gray-300 h-10 w-10 rounded-full flex items-center justify-center border-white mr-2`}
                      >
                        {user?.charAt(0)}
                      </span>
                      <h3 className="text-left">{msg}</h3>
                    </>
                  )}
                </>
              )}
            </div>
          ))}
          {isTyping && (
            <p className="text-gray-500 italic mb-2">
              {typyingUser} is typing...
            </p>
          )}
        </div>
      </div>
      <div className="p-4 bg-gray-200  w-[28rem]">
        <form onSubmit={(e) => sendData(e)} className="flex items-center">
          <input
            className="flex-grow p-2 border border-gray-300 rounded"
            type="text"
            value={currentMsg}
            placeholder="Type your message.."
            onChange={(e) => handleTyping(e)}
          />
          <button className="ml-2 bg-blue-500 text-white p-2 rounded">
            Send
          </button>
          <button
            className="ml-2 bg-red-500 text-white p-2 rounded"
            onClick={() => leaveRoom(username, roomId)}
          >
            Leave
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatPage;

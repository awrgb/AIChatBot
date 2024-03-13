"use client";
import { UserButton } from "@clerk/nextjs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button"
import { ModeToggle } from "@/components/Theme";

import { useState, useEffect } from "react";

import {
   GoogleGenerativeAI,
   HarmCategory,
   HarmBlockThreshold
   
} from "@google/generative-ai";

export default function Home() {
  
    const [message, setMessages ] = useState([]);
    const [userInput, setUserInput] = useState("");
    const [chat, setChat] = useState(null);
    const [theme, setTheme] = useState("light");
    const [error, setError] = useState(null);


    const API_KEY = "AIzaSyDoJIOVzYZYVcfpE1J8DCfAErPZtNVnduo" // Replace with your own API
    const MODEL_NAME = "gemini-1.0-pro-001";
    const genAI = new GoogleGenerativeAI(API_KEY)
    const generationConfig = {
      temperature: 0.9,
      topK: 1,
      topP: 1,
      maxOutputTokens: 2048,
    };
    
    generationConfig.maxOutputTokens = 4096;

    const safetySettings = [
      {
        category: HarmCategory.HARM_CATEGORY_HARASSMENT,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
      },
      {
        category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
      },
      {
        category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
      },
      {
        category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
      },
    ];



    useEffect(() => {
      const initChat  = async () => { 
        try{
          const newChat = await genAI
          .getGenerativeModel({model: MODEL_NAME})
          .startChat({
            generationConfig,
            safetySettings,
            history: message.map((msg) => ({
              text: msg.text ,
              role: msg.role,

            })),
          })
          setChat(newChat);
        } catch (error) {
            setError("Failed to initialize chat. Please try angain.")
        }
      }

      initChat();
    } , []);


    const handleSendMessage = async () => {
      try{
        const userMessage = {
          text: userInput,
          role: 'user',
          timestamp: new Date(),

        }

        setMessages((prevMessages) => [...prevMessages, userMessage ]);
        setUserInput("");
        if(chat) {
          const result = await chat.sendMessage(userInput);
          const botMessage = {
            text: result.response.text(),
            role: "bot",
            timestamp: new Date(),

          }

          setMessages((prevMessages) => [...prevMessages, botMessage])
        }
      } catch (error) {
          setError("Failed to send message. Please try again.")

      }
    }


    // Handle theme change 

    const handleThemeChange = (e) => {
      setTheme(e.target.value); 
    }


    const getThemeColors = () => {
      switch (theme) {
        case 'light':
          return {
            primary: "bg-white" ,
            secondary: "bg-gray-100",
            accent: "bg-blue-500",
            text: "text-gray-500",
          }

          case 'dark': 
          return {
            primary: "bg-gray-900",
            secondary: "bg-gray-800",
            accent: "bg-yellow-500",
            text: "text-gray-100"
          } 

          default : 
          return {
            primary : 'bg-white',
            secondary: 'bg-gray-100',
            accent: "bg-blue-500",
            text: 'text-gray-800'
          }


      }
    }


    const handleKeyPress =  (e) => {
        if(e.key === "Enter") {
          e.preventDefault(); 
          handleSendMessage();
        }


    }


    const {primary, secondary, accent, text} = getThemeColors();

    return(
      <div className={`flex flex-col h-screen p-4 ${primary}`}>
          <div className="flex justify-between items-center mb-4">
              <h1 className={`text-2xl font-bold ${text }`}>
                    Gemini ChatBot
              </h1>
              <div className="flex space-x-2 ">
                  <label htmlFor="theme"  className={`text-lg ${text}`}> 
                      Theme: 
                  </label>
                  <select id="theme" value={theme} onChange={handleThemeChange} className={`p-1 rounded-md border ${text}`}>
                        <option value="light" className="rounded-md">Light</option>
                        <option value="dark" className="rounded-md"> Dark</option>
                        
                  </select>
                  <UserButton className="h-full w-full"/>

              </div>
          </div>
        <div className={`flex-1 overflow-y-auto ${secondary}  rounded-md p-4 mt-3`}>
              {message.map((msg, index) => (
                <div key={index} className={`mb-4 ${
                  msg.role === "user" ? "text-right" : "text-left"
                }`}> 

                <span className={`p-2 rounded-lg ${msg.role === "user" ? `${accent} text-white` : `${primary} ${text}`}`}>
                    {msg.text}
                </span>
                <p className={`text-m w-500 ${text } mt-1`}>
                    {msg.role === 'bot' ? "Bot " : "You "} -{""}
                    {msg.timestamp.toLocaleTimeString()}
                </p>

                </div>
              ))}
        </div>

        {error && <div className="text-red-500 text-sm mb-4 h-80">{error}</div>}

        <div className="flex items-center mt-4">
                  <Input 
                  type="text" 
                  placeholder="Type Your Message ... ☺️☺️☺️" 
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  onKeyDown={handleKeyPress}
                  className={`gap-7 flex-1 p-2 rounded-1-md border-t border-b border-1 h-full focus:outline-none focus:border-${accent}`} 
                  required />

                  <Button
                    onClick={handleSendMessage}
                    className={`p-2 ${accent} gap-7 text-white bg-orange-500 h-full rounded-r-md hover:bg-opacity-80 focus:outline-none`}
                  >
                    Send
                  </Button>
        </div>
      </div>
    )
}
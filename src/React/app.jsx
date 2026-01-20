import React from "react";
import Checker from "./Functions/form"
import { motion } from "framer-motion";
import { ArrowBigDownDash } from "lucide-react";
import ThemeSwitcher from "./Functions/themeSwitcher";
import Titlebar from "./Functions/titlebar";

const MotionArrow = motion(ArrowBigDownDash);

function Application() {
  return (
  <div>
    <Titlebar />
    <ul id="Nav">
      <li></li>
      <li>
        <ThemeSwitcher  />
      </li>
    </ul>
    <div id="mainTitle">
      <h1>YTMP3Downloader</h1>
      <MotionArrow id="arrowMainTitle"
          size={64}
          animate={{ y: [0, 6, 0] }}
          transition={{
            duration: 0.6,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />  
    </div>
    
    <Checker />
  </div> 
  );
};

export default Application;
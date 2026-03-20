import React from "react";
import { motion } from "framer-motion";
import { ArrowBigDownDash } from "lucide-react";
import ThemeSwitcher from "./Functions/themeSwitcher";
import HomeMainApp from "./Functions/MainApp";

const MotionArrow = motion(ArrowBigDownDash);

function Application() {
  return (
  <div id="Application">
    <ul id="Nav">
      <li></li>
      <li>
        <ThemeSwitcher  />
      </li>
    </ul>
    <div id="mainTitle">
      <h1>YTDownloader</h1>
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
    
    <HomeMainApp />
  </div> 
  );
};

export default Application;
import React, {useState} from "react";
import '../Styles/themeswitcher.css';


function ThemeSwitcher() {
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const [isChecked, setChecked] = useState(prefersDark);

  function handleChange(e) {
    setChecked(e.target.checked);
  }

  if (isChecked) {
    document.documentElement.classList.add("dark");
    document.documentElement.classList.remove("white");

  } else {
    document.documentElement.classList.remove("dark");
    document.documentElement.classList.add("white");
  }

  return(
    <div className="switch">
          <input type="checkbox" id="toggleswitch"  checked={isChecked} onChange={handleChange}/>
          <label for="toggleswitch" className="slider"></label>
        </div>
  )
}


export default ThemeSwitcher;
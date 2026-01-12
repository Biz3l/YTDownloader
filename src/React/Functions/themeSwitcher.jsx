import React, {useState} from "react";

function ThemeSwitcher() {
  const [isChecked, setChecked] = useState(false);

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
    <label className="switch">
          <input type="checkbox"  checked={isChecked} onChange={handleChange}/>
          <span className="slider"></span>
        </label>
  )
}


export default ThemeSwitcher;
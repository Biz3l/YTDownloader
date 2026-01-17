import React, {useState} from "react";

// Funções da titlebar

class windowHandler{
   static close() {
    window.api.window.close();
  }

   static minimize() {
    window.api.window.minimize();
  }

  static fullscreen() {
    window.api.window.fullscreen();
  }

  //Função especifica para abrir o devTools **MUDAR O USESTATE PARA APARECER**

  static devTools() {
    window.api.window.devTools();
  }
}

function Titlebar() {
  const [devMode, setDevMode] = useState(false); // Padrão false :)
  return (
  <div id="windowTitlebar">
    <p>YTMP3Downloader</p>
      <div id="windowTitlebarControls">
        {devMode && (
          <button className="windowTitlebarButton" onClick={() => {
         windowHandler.devTools();
        }}>&#62;:&#40;</button>
        )}
        <button className="windowTitlebarButton" onClick={() => {
         windowHandler.minimize();
        }}>-</button>
        <button className="windowTitlebarButton" onClick={() => {
          windowHandler.fullscreen();
        }}>O</button>
        <button className="windowTitlebarButton" onClick={() => {
          windowHandler.close();
        }}>X</button>
      </div>
    </div>
)}

export default Titlebar;
import React, {useState} from "react";
import logo from '../../Resources/YTDownloaderlogo.png';

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
  const [devMode, setDevMode] = useState(true); // Padrão false :)
  return (
  <div id="windowTitlebar">
    <div id="logoAndTitle">
      <img id="logoMain" src={logo} alt="logo"/>
      <p>YTDownloader</p>
    </div>
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
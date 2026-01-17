import React, { useState } from "react";
import { ClipLoader } from "react-spinners";


function Checker() {
  const [url, setUrl] = useState("");
  const [error, setError] = useState("");
  const [videoData, setVideoData] = useState(null);
  const [isLoading, setLoading] = useState(false);
  const [isDarkMode, setDarkMode] = useState(false);
  

  // Função de Loading
  function loading(color) {
    return (
      <ClipLoader size={42} color={color} />
    )
  }

  function IsDark(e) {
    if(document.classList.contains("white")) {
          setDarkMode(false);
          return "white";
        } else if(document.classList.contains("black")){
          setDarkMode(true);
          return "black";
        }
  }

  async function handleClick() {
    if (url.trim() === "") {
      setError("Please put some URL")
      setVideoData(null);
      return
    } else {
      setError("")

      try {
        setLoading(true);

        const data = await window.api.getMetadata(url);
        console.log("Metadata:", data);
        if (data.error) {
          // erro caso esteja sem internet
          if (data.error === "getaddrinfo ENOTFOUND www.youtube.com") {
            setError("Can't load youtube address, please check your internet.")
            setUrl("");
            setVideoData(null);
            setLoading(false);
            return;
          }
          setError(data.error);
          setUrl("");
          setVideoData(null);

        } else {
          setError("");
        }

        setVideoData(data);
        setLoading(false);


      } catch (e) {
        console.log("Error:" + e);
      }
    }
    setUrl("");

  }

  return (
    <>
   <div id="inputForm">
    <input id="Input" placeholder="Put some URL" value={url} onChange={(e) => setUrl(e.target.value)}></input>
    <button id="Search" onClick={handleClick} disabled={isLoading} >{isLoading ? "Loading" : "Search"} </button>
    {error && (
      <p id="Error" style={{color: "red"}}>{error}</p>
    )}

    {isLoading && (
      <div id="Loading">
        {loading({isDarkMode /*Checa se está no dark mode*/ })}
      </div>
    )}

    </div >
    
    <div id="video">
    {videoData?.thumbnail && (
      <>
          <h2 className="titles" id="videoFound" style={{color: "green"}}>Video found successfully!</h2>

          <img id="videoThumb" src={videoData?.thumbnail[videoData?.thumbnail.length - 1].url} />
          <div id="videoInformation">
            <h2 className="titles" id="videoTitle">{videoData?.videoName}</h2>

            <div id="authorContainer"className="containerItems">
              <img src={videoData?.authorProfilePic} />
              <h3 id="authorTitle">Author:</h3>
              <p>{videoData?.author}</p>
            </div>
            <div id="descriptionContainer" className="containerItems">
              <h3 id="descriptionTitle">Description:</h3>
              <p>{videoData?.description}</p>
            </div>
          </div>
          </>
    )}
    </div>
    </>

  
)
}

export default Checker;
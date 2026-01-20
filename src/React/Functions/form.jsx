import React, { useEffect, useState } from "react";
import { ClipLoader } from "react-spinners";


function Checker() {
  const [url, setUrl] = useState("");
  const [downloadUrl, setDownloadUrl] = useState("");
  const [error, setError] = useState("");
  const [videoData, setVideoData] = useState(null);
  const [isLoading, setLoading] = useState(false);
  const [filePath, setFilePath] = useState("");
  const [isDownloading, setDownloading] = useState(false);
  const [Progress, setProgress] = useState(null);

  // Função de Loading
  

  async function handleSearch() {
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

        setDownloadUrl(url);
        setUrl("");

      } catch (e) {
        console.log("Error:" + e);
      }
    }
    
    setFilePath("");
  }

  async function handleDownload(url, format) {
    setDownloading(true);
    if (format === ".mp4") {
      setProgress(50);
      const file = await window.api.downloadVideo(url, format);
      setProgress(100);
      setFilePath(file.filePath);
      console.log(file);
      setProgress(null);

    } else if (format === ".mp3") {
      setProgress(50);
      const file = await window.api.downloadVideo(url, format);
      setProgress(100);
      setFilePath(file.filePath);
      console.log(file);
      setProgress(null);
    }
    setDownloading(false);
  }

  return (
    <>
   <div id="inputForm">
    <input id="Input" placeholder="Put some URL" value={url} onChange={(e) => setUrl(e.target.value)}></input>
    <button id="Search" onClick={handleSearch} disabled={isLoading} >{isLoading ? "Loading" : "Search"} </button>
    {error && (
      <p id="Error" style={{color: "red"}}>{error}</p>
    )}

    {isLoading && (
      <div id="Loading">
        <ClipLoader size={42} color={document.documentElement.classList.contains("dark") ? "#fff" : "#000"}/>
      </div>
    )}

    </div >

    <div id="video">
    {videoData?.thumbnail && (
      // Retorna o vídeo do Youtube em uma div caso seja sucedido
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
          {Progress && (
            <progress id="progressBar" value={Progress} max={100} />
          )}
          {filePath && (
            <p id="filePath">File downloaded successfully at {filePath}</p>
          )}
          <div id="downloadButtons">
            <button className="downloadButton" onClick={() => {handleDownload(downloadUrl, ".mp3")}} disabled={isDownloading}>{isDownloading ? "Downloading..." : "Download MP3"}</button>
            <button className="downloadButton" onClick={() => {handleDownload(downloadUrl, ".mp4")}} disabled={isDownloading}>{isDownloading ? "Downloading..." : "Download MP4"}</button>
          </div>
          
          </>
    )}
    </div>
    </>

  
)
}

export default Checker;
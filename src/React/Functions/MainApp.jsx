import React, { useEffect, useState } from "react";
import { ClipLoader } from "react-spinners";
import '../Styles/playlistContainer.css';

function HomeMainApp() {
  const [url, setUrl] = useState("");
  const [downloadUrl, setDownloadUrl] = useState("");
  const [error, setError] = useState("");
  const [videoData, setVideoData] = useState(null);
  const [isLoading, setLoading] = useState(false);
  const [filePath, setFilePath] = useState("");
  const [isDownloading, setDownloading] = useState(false);
  const [Progress, setProgress] = useState(null);


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
          console.log(data.error)
          // erro caso esteja sem internet
          if (data.error.includes("Failed to resolve 'www.youtube.com'")) {
            setError("Can't load youtube address, please check your internet.")
            setUrl("");
            setVideoData(null);
            setLoading(false);
            return;
          }
          setError(data.error);
          setUrl("");
          setVideoData(null);
          return;

        } else {
          setError("");
        }

        setVideoData(data);
        
        setDownloadUrl(url);
        setUrl("");

      } catch (e) {

        console.log("Error:" + e);
        setError("Something went wrong while fetching metadata.");
        setVideoData(null);


      } finally {
      setLoading(false);
    }
    }
    setFilePath("");
  }

  async function handleDownload(url, format, downloadAll) {
    setDownloading(true);
    try {
      if (format === ".mp4") {
        setProgress(50);
        const file = await window.api.downloadVideo(url, format, downloadAll);
        setProgress(100);
        setFilePath(file.filePath);
        console.log(file);

      } else if (format === ".mp3") {
        if (downloadAll) {
          const totalArr = videoData?.videoInfo?.entries.length;
          const eachProgress = 100/totalArr //Vai pegar o progresso de cada um pra no final adicionar a quantidade
          for (const element of videoData?.videoInfo?.entries) {
            const file = await window.api.downloadVideo(element.original_url, format);
            setProgress(Progress => Progress + eachProgress);
            setFilePath(file.filePath);
            console.log(file);
          }

        } else {
          setProgress(50);
          const file = await window.api.downloadVideo(url, format, downloadAll);
          setProgress(100);
          setFilePath(file.filePath);
          console.log(file);
        }
      }
    } catch (e) {
      setError(e.message);
      setFilePath(null);
    } finally {
      setProgress(null);
      setDownloading(false);
    }
  }


  return (
    <>
   <form id="inputForm" onSubmit={(e) => {
    e.preventDefault();
    handleSearch();
  }}>
    <input id="Input" placeholder="Put some URL" value={url} onChange={(e) => setUrl(e.target.value)}></input>
    <button id="Search" type="submit" disabled={isLoading} >{isLoading ? "Loading" : "Search"} </button>
    {error && (
      <p id="Error" style={{color: "red"}}>{error}</p>
    )}

    {isLoading && (
      <div id="Loading">
        <ClipLoader size={42} color={document.documentElement.classList.contains("dark") ? "#fff" : "#000"}/>
      </div>
    )}

    </form >

    <div id="video">
    {videoData?.videoInfo?.entries && videoData.playlist && (
      // Retorna os vídeos do Youtube em uma div caso seja sucedido
      <>
          <h2 className="titles" id="videoFound" style={{color: "green"}}>Videos found successfully!</h2>
          
          <div id="downloadButtons">
            <button className="downloadButton" onClick={() => {handleDownload(downloadUrl, ".mp3", false)}} disabled={isDownloading}>Download MP3</button>
            <button className="downloadButton" onClick={() => {handleDownload(downloadUrl, ".mp4", false)}} disabled={isDownloading}>Download MP4</button>
            <button className="downloadButton" onClick={() => {handleDownload(downloadUrl, ".mp3", true)}} disabled={isDownloading}>Download All MP3</button>
          </div>

          {isDownloading && (
            <p style={{color: "green",}}>Please await, Downloading...</p>
          )}
          {Progress && (
            <progress id="progressBar" value={Progress} max={100} />
          )}
          {filePath && (
            <p id="filePath">File downloaded successfully at {filePath}</p>
          )}

          <div id="videoInformation">
            <h1>Playlist</h1>
            {videoData?.videoInfo?.entries?.map((element, index) => (
              <div className="videoPlaylistContainer" key={index}>
                <img id="videoPlaylistThumb" src={element.thumbnail} />
                <p id="videoPlaylistTitle">{element.title}</p>
                <p id="videoPlaylistAuthor">{element.artist ? element.artist : element.channel}</p>
              </div>
              )
            )}
          </div>
          
          </>
    )}
    {videoData?.videoInfo?.thumbnail && !videoData.playlist && (
      // Retorna o vídeo do Youtube em uma div caso seja sucedido
      <>
          <h2 className="titles" id="videoFound" style={{color: "green"}}>Video found successfully!</h2>
          
          <div id="downloadButtons">
            <button className="downloadButton" onClick={() => {handleDownload(downloadUrl, ".mp3", false)}} disabled={isDownloading}>Download MP3</button>
            <button className="downloadButton" onClick={() => {handleDownload(downloadUrl, ".mp4", false)}} disabled={isDownloading}>Download MP4</button>
          </div>
          {Progress && (
            <progress id="progressBar" value={Progress} max={100} />
          )}
          {filePath && (
            <p id="filePath">File downloaded successfully at {filePath}</p>
          )}

          <img id="videoThumb" src={videoData?.videoInfo.thumbnail.url} />
          <div id="videoInformation">
            <h2 className="titles" id="videoTitle">{videoData?.videoInfo.videoName}</h2>

            <div id="authorContainer"className="containerItems">
              <img src={videoData?.videoInfo.authorProfilePic} />
              <h3 id="authorTitle">Author:</h3>
              <p>{videoData?.videoInfo.author}</p>
            </div>
            <div id="descriptionContainer" className="containerItems">
              <h3 id="descriptionTitle">Description:</h3>
              <p>{videoData?.videoInfo.description}</p>
            </div>
          </div>
          
          </>
    )}
    </div>
    </>

  
)
}


export default HomeMainApp;
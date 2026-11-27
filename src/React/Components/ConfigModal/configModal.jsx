import { React, useEffect, useState } from "react";
import './configModal.css';
import { motion } from "framer-motion";

function ConfigModal({onClickBackModal}) {
  const [path, setPath] = useState("")
  
  async function handleSelectFolder() {
    const selectedFolder = await window.api.fs.selectDownloadPath();
    if (!selectedFolder) {
      return;
    }
    setPath(JSON.parse(selectedFolder).path);
  };

  useEffect(() => {
    (async () => setPath(await window.api.fs.seeDownloadPath()))();
  }, []);
  
  return (
    <motion.div
      onClick={(event) => {
        if(event.target === event.currentTarget) {
          onClickBackModal();
        }
      }}
      id="configModal"
      className="modal"
      initial={{ opacity: 0}}
      animate={{ opacity: 1}}
      exit={{ opacity: 0}}
      transition={{ duration: 0.2, ease: "easeOut" }}
    >
      <motion.div
        className="modalBackground"
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0 }}
      >
        <div className="settingContainer">
          <h2 className="settingTitle">Path to file</h2>
          <p>{path}</p>
          <button onClick={handleSelectFolder}>Select folder</button>
        </div>
        <hr></hr>

      </motion.div>
    </motion.div>
  );
}
export default ConfigModal;
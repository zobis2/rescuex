// OrthoPhotoMain.js
import React, { useState } from "react";
import { S3_BUCKET_ORTHOPHOTO } from "../../utils/consts";
import UploadOrthoPhotoFiles from "./UploadOrthoPhotoFiles";
import ViewOrthoPhotoFiles from "./ViewOrthoPhotoFiles";

const OrthoPhotoMain = () => {
  const [activeTab, setActiveTab] = useState("create");

  return (
    <div className="container">
      <h1>OrthoPhoto Processing</h1>
      <ul className="nav nav-tabs">
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === "create" ? "active" : ""}`}
            onClick={() => setActiveTab("create")}
          >
            Create
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === "view" ? "active" : ""}`}
            onClick={() => setActiveTab("view")}
          >
            View
          </button>
        </li>
      </ul>
      <div className="tab-content py-3">
        {activeTab === "create" && <UploadOrthoPhotoFiles />}
        {activeTab === "view" && (
          <ViewOrthoPhotoFiles bucketName={S3_BUCKET_ORTHOPHOTO} />
        )}
      </div>
    </div>
  );
};

export default OrthoPhotoMain;

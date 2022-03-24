import s from "./PotreeView.module.css";
import React from "react";
import toggleBtn from "../img/icons/menu_button.svg";
import { useNavigate, useParams } from "react-router-dom";
const language = window.localStorage.getItem('language');

const PotreeViewer = () => {
  const { viewType } = useParams();
  const navigate = useNavigate();

  const protocol = "https",
    domain = "potree.vitest.ninja",
    // domain = '6q2ltab710.execute-api.eu-west-1.amazonaws.com',
    resource = "files",
    projectId = 1,
    fileId = 6,
    token = "Bearer Bier koen",
    pointCloudUrl = `${protocol}://${domain}/${resource}/${projectId}/${fileId}/meta/metadata.json`,
    cache = new Map(),
    useCorsMode = true,
    cachingDomain = `${domain}`,
    redirectStatusCode = 200,
    expiresIn = 600_000;

  Function.prototype.clone = function () {
    var that = this;
    var temp = function temporary() {
      return that.apply(this, arguments);
    };
    for (var key in this) {
      if (this.hasOwnProperty(key)) {
        temp[key] = this[key];
      }
    }
    return temp;
  };

  const potreeBicycleFetch = async (url, init, authHeader) => {
    const modInit = { ...init };
    let modUrl = `${url}`;
    if (!modInit.headers) modInit.headers = {};
    if (!modInit.headers["Authorization"]) {
      modInit.headers["Authorization"] = authHeader;
    }
    if (!cache.has(url) || Date.now() - cache.get(url).timestamp > expiresIn) {
      const modifiedInit = { ...init };
      modInit.method = "POST";
      const redRes = await window.originalFetch(url, modInit);
      cache.set(url, {
        timestamp: Date.now(),
        response: await redRes.json(),
      });
    }

    const cachedUrl = cache.get(url).response.url;
    modInit.method = "GET";
    delete modInit.headers["Authorization"];
    const realRes = await window.originalFetch(cachedUrl, modInit);
    return realRes;
  };

  function useFetchMiddleware(authHeader) {
    if (!window.originalFetch) {
      window.originalFetch = window.fetch.clone();
    }
    if (!authHeader) {
      window.fetch = window.originalFetch.clone();
      return;
    }

    window.fetch = function (url, init) {
      if (url.includes(cachingDomain)) {
        return potreeBicycleFetch(url, init, authHeader);
      }
      return window.originalFetch(url, init);
    };
  }

  useFetchMiddleware(token);

  function change() {
    if (viewType === "rgba" || !viewType) {
      navigate("/classification");
    } else {
      navigate("/rgba");
    }
    window.location.reload();
  }

  React.useEffect(() => {
    const Potree = window.Potree,
      potreeContainerDiv = document.getElementById("potree_render_area");

    const viewer = new Potree.Viewer(potreeContainerDiv);
    viewer.setEDLEnabled(true);
    viewer.setFOV(60);
    viewer.setPointBudget(2 * 100 * 10000);
    viewer.setClipTask(Potree.ClipTask.SHOW_INSIDE);
    viewer.loadSettingsFromURL();
    viewer.setControls(viewer.orbitControls);
    // viewer.setDescription("Point cloud");
    viewer.loadGUI(() => {
      viewer.setLanguage(language||"en");
    });

    const classificationUrl =
      "http://5.9.65.151/mschuetz/potree/resources/pointclouds/opentopography/CA13_1.4/cloud.js";
    Potree.loadPointCloud(pointCloudUrl, "pointcloud", (e) => {
      let pointcloud = e.pointcloud;
      let material = pointcloud.material;
      material.activeAttributeName = viewType || "rgba";
      material.minSize = 2;
      material.pointSizeType = Potree.PointSizeType.FIXED;
      viewer.scene.addPointCloud(pointcloud);
      viewer.fitToScreen();
      document
        .getElementById("classificationToggle")
        .addEventListener("click", change);
    });
  }, [pointCloudUrl, viewType]);

  return (
    <div id="potree-root">
      <div id="potree_render_area">
        <div id="toggleButton" className={s.toggleButton}>
          <img src={toggleBtn} alt="btn" />
        </div>
      </div>
      <div id="potree_sidebar_container"></div>
      <div id="measurementsToggleBtn">
        <img src={toggleBtn} alt="btn" />
      </div>
    </div>
  );
};

export default PotreeViewer;

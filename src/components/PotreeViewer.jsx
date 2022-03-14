import s from './PotreeView.module.css'
import React from "react";
import toggleBtn from '../img/icons/menu_button.svg'
// import * as THREE from "../three.js/build/three.module.js";
// import dd from 'xml-js'
// import convertJSONToXML from 'xml-js'
const Potree = window.Potree;

const PotreeViewer = () => {
  const potreeContainerDiv = React.createRef(),
    protocol = "https",
    domain = "potree.vitest.ninja",
    // domain = '6q2ltab710.execute-api.eu-west-1.amazonaws.com',
    resource = "files",
    projectId = 1,
    fileId = 1,
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

  React.useEffect(() => {
    const viewer = new Potree.Viewer(potreeContainerDiv.current);
    viewer.setEDLEnabled(true);
    viewer.setFOV(60);
    viewer.setPointBudget(2 * 100 * 10000);
    viewer.setClipTask(Potree.ClipTask.SHOW_INSIDE);
    viewer.loadSettingsFromURL();
    viewer.setControls(viewer.orbitControls);
    // viewer.setDescription("Point cloud");
    viewer.loadGUI(() => {
      viewer.setLanguage("en");
      viewer.toggleSidebar();
    });
    const customUrl="http://5.9.65.151/mschuetz/potree/resources/pointclouds/helimap/360/MLS_drive1/cloud.js"
    Potree.loadPointCloud(customUrl, 'pointcloud', (e)=> {
      let pointcloud = e.pointcloud;
      let material = pointcloud.material;
      material.activeAttributeName = "rgba";
      material.minSize = 2;
      material.pointSizeType = Potree.PointSizeType.FIXED;
      viewer.scene.addPointCloud(pointcloud);
      viewer.fitToScreen();
    })
  }, [pointCloudUrl, potreeContainerDiv]);

  return (
    <div id="potree-root">
      <div
        ref={potreeContainerDiv}
        id="potree_render_area"
        style={{
          width: "100%",
          height: "100%",
          left: "0px",
          top: "0px",
        }}
      >
        <div id='toggleButton' className={s.toggleButton}>
        <img src={toggleBtn} alt="toggleButton" />
        </div>
        <li id="tools"></li>
      </div>
      <div id="potree_sidebar_container"></div>
      <div id='measurementsToggleBtn'>
      <img src={toggleBtn} alt='btn'/>
      </div>
    </div>
  );
};

export default PotreeViewer;

import s from "./PotreeView.module.css";
import React, { useEffect } from "react";
import toggleBtn from "../img/icons/menu_button.svg";
import { useNavigate, useParams } from "react-router-dom";
import { observer } from "mobx-react-lite";
import user from "../store/user";
const language = window.localStorage.getItem("language");

const PotreeContainer = observer(() => {
  const { urlParams } = useParams();
  let params = urlParams.split("&");

  useEffect(() => {
    user.verifySession().then(() => {
      user.refreshToken().then(() => {
        user.getPointCloudChilds(params[1], params[4], params[3]);
      });
    });
  }, []);

  return (
    <>
      {user.pointCloudChildsWasFetched ? (
        <PotreeViewer />
      ) : (
        <div className={s.background}></div>
      )}
    </>
  );
});

const PotreeViewer = () => {
  const { urlParams } = useParams();
  const [fetchParams, setFetchParams] = React.useState(
    (urlParams && urlParams.split("&")) || ["rgba", 118, 975]
  );

  React.useEffect(() => {
    setFetchParams(urlParams && urlParams.split("&"));
  }, [urlParams]);

  const navigate = useNavigate();
  const protocol = "https",
    // domain = "potree.vitest.ninja",
    domain = "zqhq8ti8nf.execute-api.eu-central-1.amazonaws.com",
    base = "api",
    resource = "files",
    projectId = fetchParams[1],
    fileId = fetchParams[2],
    token = `Bearer ${user.accessToken}`,
    pointCloudUrl = `${protocol}://${domain}/${base}/${resource}/${projectId}/${fileId}/get-tiles/metadata.json`,
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

  function toggleClassification() {
    if (fetchParams[0] === "rgba") {
      navigate(
        `/classification&${fetchParams[1]}&${fetchParams[2]}&${fetchParams[3]}&${fetchParams[4]}`
      );
    } else {
      navigate(
        `/rgba&${fetchParams[1]}&${fetchParams[2]}&${fetchParams[3]}&${fetchParams[4]}`
      );
    }
    window.location.reload();
  }

  function selectPointCloud(fileId, sourceFileId) {
    navigate(
      `/${fetchParams[0]}&${fetchParams[1]}&${fileId}&${fetchParams[3]}&${sourceFileId}`
    );
  }

  React.useEffect(() => {
    setInterval(() => {
      user.refreshToken();
    }, 1000 * 60 * 60);
    const Potree = window.Potree,
      potreeContainerDiv = document.getElementById("potree_render_area"),
      viewer = new Potree.Viewer(potreeContainerDiv);
    viewer.setEDLEnabled(true);
    viewer.setFOV(60);
    viewer.setPointBudget(2 * 100 * 10000);
    viewer.setClipTask(Potree.ClipTask.SHOW_INSIDE);
    viewer.loadSettingsFromURL();
    viewer.setControls(viewer.orbitControls);
    viewer.loadGUI(() => {});

    Potree.loadPointCloud(pointCloudUrl, "pointcloud", (e) => {
      let pointcloud = e.pointcloud;
      let material = pointcloud.material;
      material.activeAttributeName = fetchParams[0];
      material.minSize = 2;
      material.pointSizeType = Potree.PointSizeType.FIXED;
      viewer.scene.addPointCloud(pointcloud);
      viewer.setLanguage(language || "en");
      viewer.fitToScreen();
      document
        .getElementById("classificationToggle")
        .addEventListener("click", toggleClassification);
    });
  }, [pointCloudUrl]);

  return (
    <div id="potree-root">
      <div
        style={{
          position: "absolute",
          right: "20px",
          top: "260px",
          zIndex: 2,
        }}
      >
        {user.pointCloudChilds &&
          user.pointCloudChilds.map((e, i) => (
            <div
              key={i}
              onClick={() => selectPointCloud(e.fileId, e.sourceFileId)}
              style={{
                cursor: "pointer",
                color: "#fff",
              }}
            >
              {e.name.substring(0, e.name.length - 4)}
            </div>
          ))}
      </div>
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

export default PotreeContainer;

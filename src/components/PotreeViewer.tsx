import s from "./PotreeView.module.css";
import { FC, useEffect, useState } from "react";
import toggleBtn from "../img/icons/menu_button.svg";
import { useNavigate, useParams } from "react-router-dom";
import { observer } from "mobx-react-lite";
import { userStore } from "../store/userStore";
const language = window.localStorage.getItem("language");

declare global {
  interface Window {
    originalFetch: Function;
    Potree: any;
  }
  interface Function {
    clone: Function;
  }
}

export const PotreeContainer: FC = observer(() => {
  const { urlParams } = useParams<{ urlParams: string }>(),
    params: string[] | null = urlParams ? urlParams.split("&") : null;

  useEffect(() => {
    // userStore.verifySession().then(() => {
    //   userStore.refreshToken().then(() => {
    if (params)
      userStore.getPointCloudChilds(
        Number(params[1]),
        Number(params[4]),
        params[3]
      );
    // });
    // });
  }, []);

  return (
    <>
      {/* {params ? ( */}
      <PotreeViewer />
      {/* ) : (
        <div className={s.background}></div>
      )} */}
    </>
  );
});

const PotreeViewer: FC = () => {
  const { urlParams } = useParams<{ urlParams: string }>();
  const [fetchParams, setFetchParams] = useState<string[]>(
    'urlParams'.split("&")
  );

  useEffect(() => {
    setFetchParams('urlParams'!.split("&"));
  }, [urlParams]);

  const navigate = useNavigate();
  const protocol = "https",
    // domain = "potree.vitest.ninja",
    domain = "zqhq8ti8nf.execute-api.eu-central-1.amazonaws.com",
    base = "api",
    resource = "files",
    projectId = fetchParams[1],
    fileId = fetchParams[2],
    token = `Bearer ${userStore.accessToken}`,
    pointCloudUrl = `${protocol}://${domain}/${base}/${resource}/${projectId}/${fileId}/get-tiles/metadata.json`,
    cache = new Map(),
    // useCorsMode = true,
    cachingDomain = `${domain}`,
    // redirectStatusCode = 200,
    expiresIn = 600_000;

  Function.prototype.clone = function () {
    var that = this;
    var temp: any = function temporary() {
      return that.apply(this, arguments);
    };
    for (var key in this) {
      if (this.hasOwnProperty(key)) {
        temp[key] = this[key];
      }
    }
    return temp;
  };

  const potreeBicycleFetch = async (
    url: string,
    init: any,
    authHeader: string
  ) => {
    const modInit = { ...init };
    // let modUrl = `${url}`;
    if (!modInit.headers) modInit.headers = {};
    if (!modInit.headers["Authorization"]) {
      modInit.headers["Authorization"] = authHeader;
    }
    if (!cache.has(url) || Date.now() - cache.get(url).timestamp > expiresIn) {
      // const modifiedInit = { ...init };
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

  function useFetchMiddleware(authHeader: string) {
    if (!window.originalFetch) {
      window.originalFetch = window.fetch.clone();
    }
    if (!authHeader) {
      window.fetch = window.originalFetch.clone();
      return;
    }

    window.fetch = function (url: any, init: any) {
      if (url.includes(cachingDomain)) {
        return potreeBicycleFetch(url, init, authHeader);
      }
      return window.originalFetch(url, init);
    };
  }

  useFetchMiddleware(token);

  const toggleClassification = () => {
    // let fetchparams = `${fetchParams[1]}&${fetchParams[2]}&${fetchParams[3]}&${fetchParams[4]}`;

    // if (fetchParams[0] === "rgba") {
    //   navigate(`/classification&${fetchparams}`);
    // } else {
    //   navigate(`/rgba&${fetchparams}`);
    // }
    // window.location.reload();
  };

  const selectPointCloud = (fileId: number) => {
    if (fileId !== Number(fetchParams[2])) {
      navigate(
        `/${fetchParams[0]}&${fetchParams[1]}&${fileId}&${fetchParams[3]}&${fetchParams[4]}`
      );
      window.location.reload();
    }
  };

  useEffect(() => {
    setInterval(() => {
      userStore.refreshToken();
    }, 1000 * 60 * 60);

    const Potree = window.Potree,
      potreeContainerDiv = document.getElementById("potree_render_area"),
      viewer = new Potree.Viewer(potreeContainerDiv);

    viewer.setEDLEnabled(true);
    viewer.setFOV(60);
    viewer.setPointBudget(2 * 100 * 10000);
    viewer.setClipTask(Potree.ClipTask.SHOW_INSIDE);
    // viewer.loadSettingsFromURL();
    viewer.setControls(viewer.orbitControls);
    viewer.loadGUI(() => console.log("GUI loaded"));

    Potree.loadPointCloud(
      "http://5.9.65.151/mschuetz/potree/resources/pointclouds/helimap/360/MLS_drive1/cloud.js",
      "pointcloud",
      (e: any) => {
        let pointcloud = e.pointcloud;
        pointcloud.projection =
          "+proj=utm +zone=32 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs";
        let material = pointcloud.material;
        material.activeAttributeName = fetchParams[0];
        material.minSize = 2;
        material.pointSizeType = Potree.PointSizeType.FIXED;
        viewer.scene.addPointCloud(pointcloud);
        viewer.setLanguage(language || "en");
        viewer.fitToScreen();

        document
          .getElementById("classificationToggle")
          ?.addEventListener("click", toggleClassification);
        document.querySelectorAll(".pointcloudItems").forEach((item: any) => {
          if (item.id === fetchParams[2]) {
            item.classList.add("selected");
          }
          item.addEventListener("click", (e: any) => {
            selectPointCloud(e.target.id);
          });
        });
      }
    );
  }, [pointCloudUrl]);

  return (
    <div id="potree-root">
      <div id="potree_render_area">
        <div id="toggleButton">
          <img id="toggleButtonIcon" src={toggleBtn} alt="btn" />
        </div>
        <li id="navigation"></li>
      </div>
      <div id="potree_sidebar_container"></div>
      <div id="measurementsToggleBtn">
        <img id="measurementsToggleBtnIcon" src={toggleBtn} alt="btn" />
      </div>
    </div>
  );
};

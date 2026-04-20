function gridCellDimensions() {
  const element = document.createElement("div");
  element.style.position = "fixed";
  element.style.height = "var(--line-height)";
  element.style.width = "1ch";
  document.body.appendChild(element);
  const rect = element.getBoundingClientRect();
  document.body.removeChild(element);
  return { width: rect.width, height: rect.height };
}

// Add padding to each media to maintain grid.
function adjustMediaPadding() {
  const cell = gridCellDimensions();

  function setHeightFromRatio(media, ratio) {
      const rect = media.getBoundingClientRect();
      const realHeight = rect.width / ratio;
      const diff = cell.height - (realHeight % cell.height);
      media.style.setProperty("padding-bottom", `${diff}px`);
  }

  function setFallbackHeight(media) {
      const rect = media.getBoundingClientRect();
      const height = Math.round((rect.width / 2) / cell.height) * cell.height;
      media.style.setProperty("height", `${height}px`);
  }

  function onMediaLoaded(media) {
    var width, height;
    switch (media.tagName) {
      case "IMG":
        width = media.naturalWidth;
        height = media.naturalHeight;
        break;
      case "VIDEO":
        width = media.videoWidth;
        height = media.videoHeight;
        break;
    }
    if (width > 0 && height > 0) {
      setHeightFromRatio(media, width / height);
    } else {
      setFallbackHeight(media);
    }
  }

  const medias = document.querySelectorAll("img, video");
  for (media of medias) {
    switch (media.tagName) {
      case "IMG":
        if (media.complete) {
          onMediaLoaded(media);
        } else {
          media.addEventListener("load", () => onMediaLoaded(media));
          media.addEventListener("error", function() {
              setFallbackHeight(media);
          });
        }
        break;
      case "VIDEO":
        switch (media.readyState) {
          case HTMLMediaElement.HAVE_CURRENT_DATA:
          case HTMLMediaElement.HAVE_FUTURE_DATA:
          case HTMLMediaElement.HAVE_ENOUGH_DATA:
            onMediaLoaded(media);
            break;
          default:
            media.addEventListener("loadeddata", () => onMediaLoaded(media));
            media.addEventListener("error", function() {
              setFallbackHeight(media);
            });
            break;
        }
        break;
    }
  }
}

adjustMediaPadding();
window.addEventListener("load", adjustMediaPadding);
window.addEventListener("resize", adjustMediaPadding);

function drawProfessionalWorkEdges() {
  const tree = document.querySelector(".professional-work-tree");
  if (!tree) return;

  const root = tree.querySelector(".professional-work-tree__node--root");
  const leaves = Array.from(tree.querySelectorAll(".professional-work-tree__node--leaf"));
  const edgesSvg = tree.querySelector(".professional-work-tree__edges");
  const edgeLayer = tree.querySelector(".professional-work-tree__edge-layer");

  if (!root || leaves.length < 3 || !edgesSvg || !edgeLayer) return;

  const treeRect = tree.getBoundingClientRect();
  if (treeRect.width === 0 || treeRect.height === 0) return;

  const rootRect = root.getBoundingClientRect();
  const leafRects = leaves.map((leaf) => ({ leaf, rect: leaf.getBoundingClientRect() }));

  const sortedByTop = [...leafRects].sort(
    (a, b) => (a.rect.top + a.rect.height / 2) - (b.rect.top + b.rect.height / 2),
  );

  if (sortedByTop.length < 3) return;

  const levelOneNode = sortedByTop[0];
  const levelTwoNodes = sortedByTop
    .slice(1)
    .sort((a, b) => (a.rect.left + a.rect.width / 2) - (b.rect.left + b.rect.width / 2));

  if (levelTwoNodes.length < 2) return;

  const leftNode = levelTwoNodes[0];
  const rightNode = levelTwoNodes[1];

  const relativeX = (rect, horizontalAnchor) =>
    rect.left - treeRect.left + rect.width * horizontalAnchor;
  const relativeY = (rect, verticalAnchor) =>
    rect.top - treeRect.top + rect.height * verticalAnchor;

  const rootCenterX = relativeX(rootRect, 0.5);
  const rootCenterY = relativeY(rootRect, 0.5);
  const rootRadiusX = rootRect.width / 2;
  const rootRadiusY = rootRect.height / 2;

  const centerEndX = relativeX(levelOneNode.rect, 0.5);
  const centerEndY = relativeY(levelOneNode.rect, 0) + 1;

  const leftEndX = relativeX(leftNode.rect, 0.5);
  const leftEndY = relativeY(leftNode.rect, 0) + 1;

  const rightEndX = relativeX(rightNode.rect, 0.5);
  const rightEndY = relativeY(rightNode.rect, 0) + 1;

  const rootBoundaryPoint = (targetX, targetY) => {
    const deltaX = targetX - rootCenterX;
    const deltaY = targetY - rootCenterY;
    const denominator =
      Math.sqrt(
        (deltaX * deltaX) / (rootRadiusX * rootRadiusX) +
          (deltaY * deltaY) / (rootRadiusY * rootRadiusY),
      ) || 1;
    const scale = 1 / denominator;

    return {
      x: rootCenterX + deltaX * scale,
      y: rootCenterY + deltaY * scale,
    };
  };

  const centerStart = rootBoundaryPoint(centerEndX, centerEndY);
  const leftStart = rootBoundaryPoint(leftEndX, leftEndY);
  const rightStart = rootBoundaryPoint(rightEndX, rightEndY);

  edgesSvg.setAttribute("viewBox", `0 0 ${treeRect.width} ${treeRect.height}`);
  edgeLayer.replaceChildren();

  const svgNamespace = "http://www.w3.org/2000/svg";
  const appendPath = (pathData) => {
    const path = document.createElementNS(svgNamespace, "path");
    path.setAttribute("class", "professional-work-tree__edge-path");
    path.setAttribute("d", pathData);
    path.setAttribute("marker-end", "url(#professional-work-arrowhead)");
    edgeLayer.appendChild(path);
  };

  appendPath(`M ${centerStart.x} ${centerStart.y} L ${centerEndX} ${centerEndY}`);
  appendPath(`M ${leftStart.x} ${leftStart.y} L ${leftEndX} ${leftEndY}`);
  appendPath(`M ${rightStart.x} ${rightStart.y} L ${rightEndX} ${rightEndY}`);
}

let professionalWorkEdgeFrame = null;
function scheduleProfessionalWorkEdges() {
  if (professionalWorkEdgeFrame !== null) {
    cancelAnimationFrame(professionalWorkEdgeFrame);
  }

  professionalWorkEdgeFrame = requestAnimationFrame(() => {
    professionalWorkEdgeFrame = null;
    drawProfessionalWorkEdges();
  });
}

scheduleProfessionalWorkEdges();
window.addEventListener("load", scheduleProfessionalWorkEdges);
window.addEventListener("resize", scheduleProfessionalWorkEdges);

const professionalWorkTree = document.querySelector(".professional-work-tree");
if (professionalWorkTree) {
  const professionalWorkObserver = new MutationObserver(scheduleProfessionalWorkEdges);
  professionalWorkObserver.observe(professionalWorkTree, {
    childList: true,
    subtree: true,
    characterData: true,
  });
}

function checkOffsets() {
  const ignoredTagNames = new Set([
    "THEAD",
    "TBODY",
    "TFOOT",
    "TR",
    "TD",
    "TH",
  ]);
  const cell = gridCellDimensions();
  const elements = document.querySelectorAll("body :not(.debug-grid, .debug-toggle)");
  for (const element of elements) {
    if (ignoredTagNames.has(element.tagName)) {
      continue;
    }
    const rect = element.getBoundingClientRect();
    if (rect.width === 0 && rect.height === 0) {
      continue;
    }
    const top = rect.top + window.scrollY;
    const left = rect.left + window.scrollX;
    const offset = top % (cell.height / 2);
    if(offset > 0) {
      element.classList.add("off-grid");
      console.error("Incorrect vertical offset for", element, "with remainder", top % cell.height, "when expecting divisible by", cell.height / 2);
    } else {
      element.classList.remove("off-grid");
    }
  }
}

const debugToggle = document.querySelector(".debug-toggle");
function onDebugToggle() {
  document.body.classList.toggle("debug", debugToggle.checked);
}
debugToggle.addEventListener("change", onDebugToggle);
onDebugToggle();

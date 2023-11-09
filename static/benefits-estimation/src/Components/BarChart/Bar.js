import React, { useRef, useCallback, useEffect, useState } from "react";
export const Bar = (props) => {
  const [hover, setHover] = useState(false);
  const [isClicked, setIsClicked] = useState(false);
  const [height, setHeight] = useState(props.height);

  const startPosX = (2 + 5 * props.index) * props.sizeIncrement;
  const startPosY = props.VBHeight - props.bottomMargin;
  const width = props.width;
  const barTopPadding = width / 10;
  const barPadding = width / 10;
  const barThickness = width / 15;
  const minimumHeight = barTopPadding * 2 + barThickness;

  useEffect(() => {
    if (height < minimumHeight) {
      setHeight(minimumHeight);
    } else setHeight(props.height);
  }, [props.height]);

  return (
    <g onMouseOver={() => setHover(true)} onMouseOut={() => setHover(false)}>
      <path
        d={
          "M" +
          startPosX +
          " " +
          startPosY +
          " h" +
          width +
          " v-" +
          height +
          " h-" +
          width +
          " Z"
        }
        className="bar"
        fill={props.value === 0 ? "#C1C7D0" : "#4C9AFF"}
      />
      <g>
        <rect
          x={startPosX}
          y={startPosY - height}
          width={width}
          height={barTopPadding * 2 + barThickness}
          onMouseDown={(e) => {
            setIsClicked(true);
            window.addEventListener("mouseup", function () {
              setIsClicked(false);
              props.onDrag(false);
            });
            props.onDrag(props.index);
          }}
          fillOpacity="0"
        />
        <path
          d={
            "M" +
            (startPosX + barPadding) +
            " " +
            (startPosY - height + barTopPadding) +
            "A 1 1 0 0 0 " +
            (startPosX + barPadding) +
            " " +
            (startPosY - height + barTopPadding + barThickness) +
            " h" +
            (width - barPadding * 2) +
            " A 1 1 0 0 0 " +
            (startPosX + width - barPadding) +
            " " +
            (startPosY - height + barTopPadding) +
            " Z"
          }
          fill="#0747A6"
          className="barDragger"
          style={
            isClicked
              ? { opacity: "100%" }
              : hover
              ? { opacity: "100%" }
              : { opacity: "0%" }
          }
        />
      </g>
    </g>
  );
};

import React, { useCallback, useEffect, useState } from "react";
import { Bar } from "./Bar";
import "./BarChart.css";

let style = {
  backgroundColor: "blue",
};

let style2 = {
  backgroundColor: "red",
};
let style3 = {
  backgroundColor: "green",
  height: "200px",
};
let textStyle = {
  color: "white",
  fontSize: "13px",
};

export const BarChart = (props) => {
  const [onDrag, setOnDrag] = useState(false);
  const [values, setValues] = useState([16, 25, 25, 10, 1, 6, 15, 2]);

  const dragHandler = (event) => {
    if (onDrag) {
      console.log(event.clientY);
      const parentOffsetY = document
        .getElementById("chart")
        .getBoundingClientRect().top;
      const value = values[onDrag];
      const height = xValueFactor * value;
      const barOffsetY = parentOffsetY + VBHeight - height - bottomMargin;
      const newHeight = height + barOffsetY - event.clientY;
      const snapDistance = 3;
      const nextStep = xValueFactor * (value + 1);
      const previousStep = xValueFactor * (value - 1);
      for (let i = 0; i < max + 2; i++) {
        if (
          newHeight >= xValueFactor * i - snapDistance &&
          newHeight <= xValueFactor * i + snapDistance
        ) {
          let newValues = [...values];
          newValues[onDrag] = i;
          setValues(newValues);
        }
      }
    }
  };

  var dataprop = {
    mode: "confirmatory",
    modeSpec: {
      totalPoints: 100,
    },
    y: { name: "Obj 1" },
    x: [
      { name: "Epic 1", value: 16 },
      { name: "Epic 2", value: 25 },
      { name: "Epic 3", value: 25 },
      { name: "Epic 4", value: 10 },
      { name: "Epic 5", value: 1 },
      { name: "Epic 6", value: 6 },
      { name: "Epic 7", value: 15 },
      { name: "Epic 8", value: 2 },
    ],
  };
  const maxValue = 100;
  const VBWidth = 1000;
  const VBHeight = 500;
  const topMargin = 50;
  const bottomMargin = 50;
  let max = Math.max(...values) === 0 ? 1 : Math.max(...values);
  let xValueFactor = (VBHeight - topMargin - bottomMargin) / max;
  let sizeIncrement = VBWidth / (2 + 5 * values.length);

  return (
    <div className="chartHolder">
      <div>
        <div>Top Component</div>
        {/* <div
          className="main"
          style={style}
          onMouseMove={(e) => console.log(e.clientY - e.target.offsetTop)}
        >
          Main Component
        </div>
        <div
          className="second"
          style={style2}
          onMouseDown={(e) => console.log(e.clientY - e.target.offsetTop)}
        >
          Main Component
        </div> */}
        {/* <div
          className="second"
          style={style3}
          onMouseDown={() => setActive(true)}
          onMouseUp={() => setActive(false)}
          onMouseMove={(e) => {
            e.preventDefault();
            active ? console.log(e.clientY) : null;
          }}
        >
          Main Component
        </div> */}
        <svg
          id="chart"
          width={VBWidth}
          height={VBHeight}
          viewBox={"0 0 " + VBWidth + " " + VBHeight}
          onMouseMove={(e) => dragHandler(e)}
          onTouchMove={(e) => console.log(e)}
        >
          <g>
            <rect
              x="0"
              y="0"
              height={VBHeight - bottomMargin}
              width={VBWidth}
              fill="#F4F5F7"
            />{" "}
            {values.map((value, index) => {
              return (
                <Bar
                  key={index}
                  index={index}
                  value={value}
                  sizeIncrement={sizeIncrement}
                  xValueFactor={xValueFactor}
                  width={3 * sizeIncrement}
                  height={xValueFactor * value}
                  VBHeight={VBHeight}
                  onDrag={(index) => setOnDrag(index)}
                  bottomMargin={bottomMargin}
                />
              );
            })}
          </g>
          <g>
            <rect
              x="0"
              y={VBHeight - bottomMargin}
              height={bottomMargin}
              width={VBWidth}
              fill="#EDEEF2"
            />{" "}
            {values.map((value, index) => {
              return (
                <g key={index}>
                  <path
                    d={
                      "M" +
                      (2 + 5 * index) * sizeIncrement +
                      "," +
                      VBHeight +
                      " h" +
                      3 * sizeIncrement +
                      " v-" +
                      bottomMargin +
                      " h-" +
                      3 * sizeIncrement +
                      " Z"
                    }
                    fill="#42526E"
                  />
                  <foreignObject
                    width={3 * sizeIncrement}
                    height={bottomMargin}
                    x={(2 + 5 * index) * sizeIncrement}
                    y={VBHeight - bottomMargin}
                  >
                    <div
                      className="inputContainer"
                      xmlns="http://www.w3.org/1999/xhtml"
                    >
                      <input
                        id="input"
                        className="inputField"
                        type="text"
                        value={value}
                        onChange={(e) => {
                          let newValue = value;
                          console.log(e.target.value);
                          if (e.target.value === "") {
                            newValue = 0;
                          } else {
                            try {
                              newValue = parseInt(e.target.value);
                            } catch (error) {
                              newValue = value;
                              console.log("Not allowed typing");
                            }
                          }
                          if (newValue < 0) {
                            newValue = 0;
                          }
                          let newValues = [...values];
                          newValues[index] = newValue;
                          setValues(newValues);
                        }}
                      />
                    </div>
                  </foreignObject>
                </g>
              );
            })}
          </g>
          {/* <path d="M30,100 h10 v-30 h-10 Z" fill="#444cf7" />
          <path
            d="M50,100 h10 v-35 h-10 Z"
            fill="#444cf7"
            onMouseDown={() => setActive(true)}
            onMouseUp={() => setActive(false)}
            onMouseMove={(e) =>
              active ? console.log(e.clientY - e.target.offsetTop) : null
            }
          /> */}
        </svg>
      </div>
    </div>
  );
};

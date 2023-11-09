import { createContext, useContext, useRef } from "react";
import { useEstimation } from "../../../Pages/Estimation/EstimationContext";

type ScrollContext = {
  CriteriaGoalScroll: React.MutableRefObject<HTMLDivElement | null>;
  PointsFieldContainerRefs: React.MutableRefObject<HTMLDivElement | null>[];
  TargetRefs: React.MutableRefObject<HTMLDivElement | null>[];
  onScroll: (e: React.UIEvent<HTMLDivElement, UIEvent>) => void;
}

const ScrollContext = createContext<ScrollContext>(undefined!);

export const useScroll = () => {
  return useContext(ScrollContext);
}

type ScrollContextProviderProps = {
  children: React.ReactNode;
}

export const ScrollContextProvider = (props: ScrollContextProviderProps) => {

  const { estimationTargets } = useEstimation();

  const CriteriaGoalScroll = useRef<HTMLDivElement | null>(null);
  const PointsFieldContainerRefs: React.MutableRefObject<HTMLDivElement | null>[] = []
  const TargetRefs: React.MutableRefObject<HTMLDivElement | null>[] = []

  estimationTargets.forEach(() => {
    PointsFieldContainerRefs.push(useRef<HTMLDivElement | null>(null))
    TargetRefs.push(useRef<HTMLDivElement | null>(null))
  })

  const onScroll = (e: React.UIEvent<HTMLDivElement, UIEvent>) => {
    if (CriteriaGoalScroll.current) {
      CriteriaGoalScroll.current.scrollLeft = e.currentTarget.scrollLeft;
    }
    PointsFieldContainerRefs.forEach(ref => {
      if (ref.current) {
        ref.current.scrollLeft = e.currentTarget.scrollLeft;
      }
    });
    TargetRefs.forEach(ref => {
      if (ref.current) {
        ref.current.scrollLeft = e.currentTarget.scrollLeft;
      }
    })
  };

  return (
    <ScrollContext.Provider value={{CriteriaGoalScroll: CriteriaGoalScroll, PointsFieldContainerRefs: PointsFieldContainerRefs, TargetRefs: TargetRefs, onScroll}}>
      {props.children}
    </ScrollContext.Provider>
  )
}
import { ReactNode, createContext, useContext, useMemo, useState } from "react";
import { useAPI } from "../../Contexts/ApiContext";
import { ScrollContextProvider } from "../../Components/Estimation/Table/ScrollContext";
import { EstimationMode, EstimationTarget, EstimationProps } from "../../Models/EstimationModel";

export type EstimationContext = EstimationProps<EstimationMode> & {
  isSubmitting: boolean,
  readyToSubmit: boolean,
  updateGoals: (scopeId: string) => void,
  getCriteriaGoalDP: (criteriaGoalId: string) => number,
  updateCriteriaGoalDP: (criteriaGoalId: string, points: number, scopeId: string) => void,
  onSubmit: () => void,
}

const estimationContext = createContext<EstimationContext>(undefined!);

export const useEstimation = () => {
  return useContext(estimationContext)
}

type EstimationContextProviderProps = {
  estimationProps: EstimationProps<EstimationMode>,
  children: ReactNode
}

export const EstimationContextProvider = ( {estimationProps, children}: EstimationContextProviderProps) => {

  const {
    mode,
    crieriaGoalTier,
    criteriaGoals,
    pointsToDistribute,
    relation,
  } = estimationProps
  const [estimationTargets, setEstimationTargets] = useState<EstimationTarget<EstimationMode>[]>(estimationProps.estimationTargets)
  const [isSubmitting, setSubmitting] = useState<boolean>(false)
  const [criteriaGoalDP, setCriteriaGoalDP] = useState<{[scopeId: string]: {[criteriaGoalId: string]: number}}>()
  
  const api = useAPI();
  
  const getCriteriaGoalDP = (criteriaGoalId: string) => {
    let totalPoints = 0
    for (const estimationTarget of estimationTargets) {
      totalPoints += criteriaGoalDP?.[estimationTarget.scope.id]?.[criteriaGoalId] || 0
    }
    return totalPoints
  }

  const updateCriteriaGoalDP = (criteriaGoalId: string, points: number, scopeId: string) => {
    setCriteriaGoalDP(prev => {
      const newCriteriaGoalDP = {...prev}
      if (!newCriteriaGoalDP[scopeId]) {
        newCriteriaGoalDP[scopeId] = {}
      }
      newCriteriaGoalDP[scopeId][criteriaGoalId] = points
      return newCriteriaGoalDP
    })
  }

  const updateGoals = (scopeId: string) => {
    setEstimationTargets(prevTargets => {
      const updatedTargets = [...prevTargets]
      const updatedTarget = updatedTargets.find(target => target.scope.id === scopeId)
      if (updatedTarget) {
        updatedTarget.goals
      }
      return updatedTargets
    })
  }

  const onSubmit = () => {
    setSubmitting(true)
    api.estimation.submit(mode, estimationTargets, estimationProps.criteriaGoals).then(() => {
      setSubmitting(false)
    }).catch(() => { 
      setSubmitting(false)
      console.error('Error submitting estimation')
    })
  }

  const validate = (): boolean => {
    let validated = true
    for (const criteriaGoal of estimationProps.criteriaGoals) {
      if (getCriteriaGoalDP(criteriaGoal.id) !== pointsToDistribute) {
        validated = false
      }
    };
    return validated
  }

  const readyToSubmit = useMemo(() => {
    return validate()
  }, [criteriaGoalDP])

  const value: EstimationContext = {
    mode,
    crieriaGoalTier,
    criteriaGoals,
    relation,
    pointsToDistribute,
    estimationTargets,
    isSubmitting,
    readyToSubmit,
    updateGoals,
    getCriteriaGoalDP,
    updateCriteriaGoalDP,
    onSubmit,
  }
  
  return (
    <estimationContext.Provider value={value}>
      <ScrollContextProvider>
        {children}
      </ScrollContextProvider>
    </estimationContext.Provider>
  )
}
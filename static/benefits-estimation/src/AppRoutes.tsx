import { Routes, Route } from "react-router-dom"
import { Estimation } from "./Pages/Estimation/Estimation"
import { AdminGoal } from "./Pages/GoalTiers/Goal/AdminGoal"
import { AdminGoalCollection } from "./Pages/GoalStructure/AdminGoalCollection"
import { ChangeTierLevel } from "./Pages/GoalStructure/ChangeTierLevel"
import { AddPortfolioItems } from "./Pages/GoalTiers/PortfolioItems/AddPortfolioItems"
import { GoalStructure } from "./Pages/GoalStructure/GoalStructure"
import { GoalTiers } from "./Pages/GoalTiers/GoalTiers"
import { Home } from "./Pages/Home"
import { Settings } from "./Pages/Settings/Settings"
import { AppContextProvider } from "./Contexts/AppContext"
import { SetValues } from "./Pages/GoalTiers/SetValues"
import { Disconnect } from "./Pages/GoalTiers/PortfolioItems/Disconnect"
import { DeleteGoalCollection } from "./Pages/GoalStructure/DeleteGoalCollection"
import { DeleteGoal } from "./Pages/GoalTiers/Goal/DeleteGoal"
import { AdminPortfolio } from "./Pages/Portfolio/AdminPortfolio"

export const AppRoutes = () => {
  return(
    <Routes>
      <Route path=":scopeType?/:scopeId?" element={<AppContextProvider/>}>
        <Route index element={<Home />}/>
        <Route path="goal-tier" element={<GoalTiers />}/>
        <Route path="goal-tier/:goal_tier_type/:goal_tier_id" element={<GoalTiers />}>
          <Route path=":goal_id/edit-goal" element={<AdminGoal mode="edit" />}/>
          <Route path=":goal_id/delete" element={<DeleteGoal/>}/>
          <Route path="create-goal" element={<AdminGoal mode="create" />}/>
          <Route path="set-values" element={<SetValues/>}/>
          <Route path=":portfolio_item_id/remove" element={<Disconnect />}/>
          <Route path="portfolio-item/add" element={<AddPortfolioItems />}/>
        </Route>
        <Route path="goal-structure" element={<GoalStructure />}>
          <Route path="change-tier-level/:goal_collection_id_1/:goal_collection_id_2" element={<ChangeTierLevel/>}/>
          <Route path="create-goal-collection" element={<AdminGoalCollection mode="create" />}/>
          <Route path=":goal_collection_id/edit-goal-collection" element={<AdminGoalCollection mode="edit" />}/>
          <Route path=":goal_collection_id/delete" element={<DeleteGoalCollection/>}/>
        </Route>
        <Route path="estimation" element={<Estimation />}/>
        <Route path="estimation/:goal_tier_type/:goal_tier_id/:criteria_goal_tier_id" element={<Estimation />}/>
        <Route path="settings" element={<Settings />}> 
          <Route path="edit-portfolio" element={<AdminPortfolio mode="edit" />}/>
        </Route>
      </Route>
    </Routes>
  )
}
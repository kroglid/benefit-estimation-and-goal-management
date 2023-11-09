import { useNavigate, useParams } from "react-router";
import { useContext, useEffect, useState } from "react";
import { useAppContext } from "../../Contexts/AppContext";
import { useAPI } from "../../Contexts/ApiContext";
import { useAlert } from "../../Contexts/AlertContext";
import { Loading } from "../../Components/Common/Loading";

export const ChangeTierLevel = () => {

  const {goal_collection_id_1, goal_collection_id_2} = useParams()

  const { showAlert } = useAlert()

  const navigation = useNavigate()
  const [ids, setIDs] = useState<string[] | undefined>(undefined)
  const [scope] = useAppContext()
  const api = useAPI()

  console.log(goal_collection_id_1)
  console.log(goal_collection_id_2)

  useEffect(() => {
    if (goal_collection_id_1 && goal_collection_id_2) {
      try {
        setIDs([goal_collection_id_1, goal_collection_id_2])
        showAlert({
          title: `Change Tier Level`,
          body: `Are you sure you want to change the tier level of these two goal collections?`,
          confirmText: "Change Tier Level",
          onConfirm: async () => onConfirm(),
          onCancel: () => navigation('..')
        })
      } catch (error) {
        console.log(error)
      }
    }else{
      console.log("error")
    }
  }, [])

  const onConfirm = () => {
    if (scope && ids) {
      console.log(ids)
      return api.goalCollection.changeTierLevel(scope.id, ids[0], ids[1]).then((response) => {
        console.log(response)
        navigation('..')
      }).catch((error) => {
        console.error(error)
      });
    }else{
      navigation('..')
    }
  }
  return(
    <Loading/>
  )
};

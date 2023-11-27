import Button, { ButtonGroup } from "@atlaskit/button";
import EmptyState from "@atlaskit/empty-state";
import TableTree, { Headers, Header, Rows, Row, Cell } from '@atlaskit/table-tree';
import { useState, useEffect } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAPI } from "../../Contexts/ApiContext";
import { useAppContext } from "../../Contexts/AppContext";
import { GoalTier, GoalTierTypeEnum } from "../../Models/GoalTierModel";
import PageHeader from "@atlaskit/page-header";
import { GoalTable } from "../../Components/GoalTiers/GoalTable";
import DropdownMenu, { DropdownItem, DropdownItemGroup } from "@atlaskit/dropdown-menu";
import MoreIcon from '@atlaskit/icon/glyph/more';

class Item {
  id: string;
  scopeId: string;
  type: GoalTierTypeEnum;
  name: string;
  description: string;
  level: number;
  isChild: boolean;
  children?: Item[];

  constructor(id: string, scopeId: string, type: GoalTierTypeEnum, name: string, description: string, level: number, isChild: boolean) {
    this.id = id;
    this.scopeId = scopeId;
    this.type = type;
    this.name = name;
    this.description = description;
    this.level = level;
    this.isChild = isChild;
    if (!isChild) {
      this.children = [new Item(id, scopeId, type, name, description, level, true)];
    }
  }
}


export const NewGoalStructure = () => {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isTtierLevelModeOn, setTierLevelMode] = useState<boolean>(false);

  const [scope] = useAppContext();
  const api = useAPI();
  const location = useLocation();
  const refresh = location.state?.refresh;
  const navigate = useNavigate();

  const fetchData = async () => {
    return api.goalTier.getAll(scope.id, scope.type).then((response) => {
      const goalTiers = response.reverse();
      return goalTiers.map((goalTier, index): Item => {
        return new Item(goalTier.id, goalTier.scopeId, goalTier.type, goalTier.name, goalTier.description, goalTiers.length - index, false);
      });
    }).catch((error) => {
      console.error(error)
      return []
    });
  }
  
  useEffect(() => {
    let isMounted = true; 
    setLoading(true);
    setTierLevelMode(false);
    fetchData().then((items) => {
      if (isMounted) {
        setItems(items);
        setLoading(false);
      }
    });
    return () => { isMounted = false };
  }, [refresh]);

  const actions = (
    <ButtonGroup>
      <Button appearance="primary" onClick={() => navigate('create-goal-collection')}>New Goal Collection</Button>
      <Button
        isSelected={isTtierLevelModeOn}
        isDisabled={!items || items.length < 3}
        onClick={() => setTierLevelMode(!isTtierLevelModeOn)}
      >
        Change Tier Level
      </Button>
    </ButtonGroup>
  )
  
  return (
    <>
      <PageHeader
        actions={actions}
      >
        Goal Structure
      </PageHeader>
      <TableTree>
        <Headers>
          <Header width={100}>Level</Header>
          <Header width={200}>Name</Header>
          <Header width={500}>Description</Header>
          <Header width={100}>Action</Header>
        </Headers>
        <Rows
          items={items}
          render={({ id, scopeId, type, name, description, level, isChild, children }: Item) =>
            isChild? (
              <GoalTable
                goalTier={{
                  id: id,
                  scopeId: scopeId,
                  type: type,
                  name: name,
                  description: description,
                } as GoalTier}
                onFetching={(isFetching) => console.log(isFetching)}
              />
            ) : (
              <Row
                items={children}
                hasChildren={!isChild}
              >
                <Cell singleLine>{level}</Cell>
                <Cell singleLine>{name}</Cell>
                <Cell singleLine>{description}</Cell>
                <Cell singleLine>{
                  <DropdownMenu 
                    trigger={({ triggerRef, ...props }) => (
                      <Button
                        {...props}
                        iconBefore={<MoreIcon label="more" />}
                        ref={triggerRef}
                      />
                    )}
                  >
                    <DropdownItemGroup>
                      <DropdownItem onClick={() => navigate(`../goal-tier/${type}/${id}`)}>View</DropdownItem>
                        {type === GoalTierTypeEnum.GOAL_COLLECTION && (
                          <>
                            <DropdownItem onClick={() => navigate(`${id}/edit-goal-collection`)}>Edit</DropdownItem>
                            <DropdownItem onClick={() => navigate(`${id}/delete`, { state: { scopeId: scopeId, goalCollectionName: name } })}>Delete</DropdownItem>
                          </>
                        )}
                    </DropdownItemGroup>
                  </DropdownMenu>
                }</Cell>
              </Row>
            )
          }
        />
      </TableTree>
      <Outlet/>
    </>
  );
}
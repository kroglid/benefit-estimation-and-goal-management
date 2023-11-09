import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router";
import { ScopeTypeEnum, useAppContext } from "../../Contexts/AppContext";
import { AtlassianNavigation, PrimaryButton, ProductHome, Settings } from "@atlaskit/atlassian-navigation";
import { Box, Flex, xcss } from "@atlaskit/primitives";

export const HeaderNavigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedTab, setSelectedTab] = useState<string>();
  const [ scope ] = useAppContext();

  useEffect(() => {
    const scopeLocation = location.pathname.replaceAll('/', '');
    const index = tabLinks.find((tabLink) => {
      return scopeLocation.includes(tabLink.src);
    });
    setSelectedTab(index?.name);
  }, [location]);

  const tabLinks = [
    {
      name: "Goal Structure",
      src: "goal-structure",
    },
    {
      name: "Goal Tier",
      src: "goal-tier",
    },
    {
      name: "Estimation",
      src: "estimation",
    },
    {
      name: "Settings",
      src: "settings",
    },
  ];

  const ScopeHeader = () => {
    const headerStyle = xcss({
      color: 'color.text.accent.blue',
      fontWeight: 'bold',
      textOverflow: 'ellipsis',
      overflow: 'hidden',
      whiteSpace: 'nowrap',
      width: '100%',
      textAlign: 'left',
    })

    return (
      <Box as='h5' xcss={headerStyle}>{scope.name.toUpperCase()}</Box>
    )
  }
  

  const DefaultSettings = () => <Settings tooltip='Settings' isSelected={selectedTab === 'Settings'} onClick={() => navigate('settings')}/>;

  return (
    <AtlassianNavigation
      label="site"
      renderProductHome={() => null}
      renderSettings={DefaultSettings}
      primaryItems={[
        <Flex alignItems="center" justifyContent="center" xcss={xcss({
          height: '100%',
          marginLeft: '4px',
          marginRight: '16px',
          maxWidth: '150px',
          overflow: 'hidden',
          color: 'color.text.subtle'
        })}>
          <ScopeHeader/>
        </Flex>,
        ...tabLinks.map((tabLink, index) => {
          if (tabLink.name !== "Settings") {
            return(
              <PrimaryButton key={index} isSelected={selectedTab === tabLink.name} onClick={() => navigate(tabLink.src)}>{tabLink.name}</PrimaryButton>
            )
          }
        })
      ]}
    />
  );
};
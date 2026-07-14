import {
  Box,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
} from "@mui/material";
import { Link, useLocation } from "react-router-dom";

import { navigationItems } from "../../routes/navigation";

export default function Sidebar() {
  const location = useLocation();

  return (
    <Box
      sx={{
        width: 240,
        borderRight: "1px solid",
        borderColor: "divider",
        minHeight: "100vh",
      }}
    >
      <List>
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;

          return (
            <ListItemButton
              key={item.path}
              component={Link}
              to={item.path}
              selected={isActive}
              sx={{
                "&.Mui-selected": {
                  borderRight: "4px solid",
                  borderColor: "primary.main",
                  backgroundColor: "action.selected",
                },
                "&.Mui-selected:hover": {
                  backgroundColor: "action.selected",
                },
              }}
            >
              <ListItemIcon
                sx={{
                  color: isActive ? "primary.main" : "inherit",
                }}
              >
                <Icon />
              </ListItemIcon>

              <ListItemText
                primary={
                  <Typography
                    color={isActive ? "primary" : "inherit"}
                    sx={{
                      fontWeight: isActive ? 600 : 400,
                    }}
                  >
                    {item.label}
                  </Typography>
                }
              />
            </ListItemButton>
          );
        })}
      </List>
    </Box>
  );
}
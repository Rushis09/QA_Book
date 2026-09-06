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
      component="aside"
      sx={{
        width: 240,
        borderRight: "1px solid",
        borderColor: "divider",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        backgroundColor: "background.paper",
      }}
    >
      <Box
        sx={{
          flexGrow: 1,
          overflowY: "auto",
          py: 1,
        }}
      >
        <List disablePadding>
          {navigationItems.map((item) => {
            const Icon = item.icon;

            const isActive =
              location.pathname === item.path ||
              location.pathname.startsWith(
                `${item.path}/`,
              );

            return (
              <ListItemButton
                key={item.path}
                component={Link}
                to={item.path}
                selected={isActive}
                sx={{
                  mx: 1,
                  mb: 0.5,
                  borderRadius: 1,
                  minHeight: 44,

                  "&.Mui-selected": {
                    backgroundColor: "action.selected",
                    color: "primary.main",
                  },

                  "&.Mui-selected:hover": {
                    backgroundColor: "action.selected",
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 40,
                    color: isActive
                      ? "primary.main"
                      : "text.secondary",
                  }}
                >
                  <Icon fontSize="small" />
                </ListItemIcon>

                <ListItemText
                  primary={
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: isActive
                          ? 600
                          : 400,
                        color: isActive
                          ? "primary.main"
                          : "text.primary",
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
    </Box>
  );
}
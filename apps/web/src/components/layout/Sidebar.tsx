import {
  Box,
  Divider,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Tooltip,
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
        width: 224,
        flexShrink: 0,
        height: "100%",
        display: "flex",
        flexDirection: "column",
        background:
          "linear-gradient(180deg, #ffffff 0%, #f8fbff 100%)",
        borderRight: "1px solid #e6ebf2",
      }}
    >
      <Box
        sx={{
          px: 2,
          pt: 2,
          pb: 1.25,
        }}
      >
        <Typography
          sx={{
            fontSize: "0.62rem",
            fontWeight: 700,
            letterSpacing: "0.11em",
            textTransform: "uppercase",
            color: "#8a94a6",
          }}
        >
          Workspace
        </Typography>

        <Typography
          sx={{
            mt: 0.35,
            fontSize: "0.7rem",
            color: "#a0a9b8",
          }}
        >
          Quality engineering
        </Typography>
      </Box>

      <Divider
        sx={{
          mx: 1.75,
          borderColor: "#edf0f5",
        }}
      />

      <Box
        sx={{
          flexGrow: 1,
          overflowY: "auto",
          px: 1,
          py: 1.25,

          "&::-webkit-scrollbar": {
            width: 5,
          },

          "&::-webkit-scrollbar-thumb": {
            backgroundColor: "#d9e0ea",
            borderRadius: 10,
          },
        }}
      >
        <List
          disablePadding
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 0.2,
          }}
        >
          {navigationItems.map((item) => {
            const Icon = item.icon;

            const isActive =
              location.pathname === item.path ||
              (item.path !== "/" &&
                location.pathname.startsWith(
                  `${item.path}/`,
                ));

            return (
              <Tooltip
                key={item.path}
                title=""
                placement="right"
              >
                <ListItemButton
                  component={Link}
                  to={item.path}
                  selected={isActive}
                  sx={{
                    position: "relative",
                    minHeight: 40,
                    px: 1.25,
                    borderRadius: "9px",
                    color: isActive
                      ? "#1769e0"
                      : "#4b5565",
                    transition:
                      "background-color 160ms ease, color 160ms ease, transform 160ms ease",

                    "&:hover": {
                      backgroundColor: "#f0f5fb",
                      color: "#1769e0",
                      transform: "translateX(2px)",
                    },

                    "&.Mui-selected": {
                      background:
                        "linear-gradient(90deg, #eaf3ff 0%, #f3f7ff 100%)",
                      color: "#1769e0",
                    },

                    "&.Mui-selected:hover": {
                      background:
                        "linear-gradient(90deg, #eaf3ff 0%, #f3f7ff 100%)",
                    },

                    "&.Mui-selected::before": {
                      content: '""',
                      position: "absolute",
                      left: 0,
                      top: 7,
                      bottom: 7,
                      width: 3,
                      borderRadius: "0 4px 4px 0",
                      background:
                        "linear-gradient(180deg, #19c6ff 0%, #1677ff 55%, #7c3aed 100%)",
                    },
                  }}
                >
                  <ListItemIcon
                    sx={{
                      minWidth: 36,
                      color: "inherit",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Icon
                      sx={{
                        fontSize: 19,
                      }}
                    />
                  </ListItemIcon>

                  <ListItemText
                    primary={item.label}
                    slotProps={{
                      primary: {
                        sx: {
                          fontSize: "0.82rem",
                          fontWeight: isActive
                            ? 650
                            : 500,
                          letterSpacing: "-0.01em",
                        },
                      },
                    }}
                  />
                </ListItemButton>
              </Tooltip>
            );
          })}
        </List>
      </Box>

      <Box
        sx={{
          px: 1.75,
          py: 1.5,
          borderTop: "1px solid #e9edf3",
          backgroundColor:
            "rgba(255,255,255,0.72)",
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 0.8,
          }}
        >
          <Box
            sx={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              backgroundColor: "#22c55e",
              boxShadow:
                "0 0 0 3px rgba(34,197,94,0.10)",
            }}
          />

          <Typography
            sx={{
              fontSize: "0.66rem",
              fontWeight: 600,
              color: "#667085",
            }}
          >
            Workspace connected
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}
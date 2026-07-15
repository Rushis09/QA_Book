import { login } from "../../services/authService";
import { useState } from "react";
import {
  Box,
  Divider,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
} from "@mui/material";
import LoginIcon from "@mui/icons-material/Login";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import LoginDialog from "../auth/LoginDialog";
import LogoutDialog from "../auth/LogoutDialog";
import { useNotification } from "../../contexts/NotificationContext";
import LogoutIcon from "@mui/icons-material/Logout";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";

import { navigationItems } from "../../routes/navigation";

export default function Sidebar() {
  const [loginOpen, setLoginOpen] = useState(false);
  const [logoutOpen, setLogoutOpen] = useState(false);

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { showNotification } = useNotification();

  const {
    isAuthenticated,
    username: loggedInUsername,
    login: authLogin,
    logout,
  } = useAuth();

  const location = useLocation();

  const handleLogin = async () => {
    try {
      setLoading(true);

      const response = await login({
        username,
        password,
      });

      authLogin(response.access_token);

      setLoginOpen(false);

      setUsername("");
      setPassword("");

      showNotification(
        "Login successful.",
        "success",
      );
    } catch {
      showNotification(
        "Invalid username or password.",
        "error",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        width: 240,
        borderRight: "1px solid",
        borderColor: "divider",
        height: "100%",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <List sx={{ flexGrow: 1 }}>
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

      <Divider />


      <List>
        {isAuthenticated ? (
          <>
            <ListItem
              sx={{
                py: 1.5,
              }}
            >
              <ListItemIcon>
                <AccountCircleIcon color="primary" />
              </ListItemIcon>
            
              <ListItemText
                primary={
                  <Box>
                    <Box
                      sx={{
                        fontWeight: 600,
                        color: "text.primary",
                        lineHeight: 1.2,
                      }}
                    >
                      {loggedInUsername}
                    </Box>
                    
                    <Box
                      sx={{
                        fontSize: "0.8rem",
                        color: "text.secondary",
                      }}
                    >
                      Administrator
                    </Box>
                  </Box>
                }
              />
            </ListItem>

            <Divider sx={{ mx: 2 }} />
        
            <ListItemButton
              onClick={() => setLogoutOpen(true)}
            >
              <ListItemIcon>
                <LogoutIcon />
              </ListItemIcon>
        
              <ListItemText
                primary="Logout"
              />
            </ListItemButton>
          </>
        ) : (
          <ListItemButton
            onClick={() => setLoginOpen(true)}
          >
            <ListItemIcon>
              <LoginIcon />
            </ListItemIcon>
        
            <ListItemText
              primary="Admin Login"
            />
          </ListItemButton>
        )}
      </List>

      <LoginDialog
        open={loginOpen}
        onClose={() => setLoginOpen(false)}
        username={username}
        password={password}
        loading={loading}
        onUsernameChange={setUsername}
        onPasswordChange={setPassword}
        onLogin={handleLogin}
      />

      <LogoutDialog
        open={logoutOpen}
        onClose={() => setLogoutOpen(false)}
        onLogout={() => {
          logout();
          setLogoutOpen(false);
        
          showNotification(
            "Logged out successfully.",
            "success",
          );
        }}
      />
    </Box>
  );
}
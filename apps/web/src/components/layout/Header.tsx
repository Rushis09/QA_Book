import { AppBar, Toolbar, Typography } from "@mui/material";

export default function Header() {
  return (
    <AppBar position="static" elevation={1}>
      <Toolbar>
        <Typography variant="h6">
          QABook
        </Typography>
      </Toolbar>
    </AppBar>
  );
}
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from "@mui/material";

interface LogoutDialogProps {
  open: boolean;
  onClose: () => void;
  onLogout: () => void;
}

export default function LogoutDialog({
  open,
  onClose,
  onLogout,
}: LogoutDialogProps) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
    >
      <DialogTitle>
        Logout
      </DialogTitle>

      <DialogContent>
        <Typography>
          Are you sure you want to log out of the Production workspace?
        </Typography>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>
          Cancel
        </Button>

        <Button
          color="error"
          variant="contained"
          onClick={onLogout}
        >
          Logout
        </Button>
      </DialogActions>
    </Dialog>
  );
}
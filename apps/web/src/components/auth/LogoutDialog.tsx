
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
      aria-labelledby="logout-dialog-title"
    >
      <DialogTitle id="logout-dialog-title">
        Logout
      </DialogTitle>

      <DialogContent>
        <Typography>
          Are you sure you want to log out of the Production workspace?
        </Typography>
      </DialogContent>

      <DialogActions>
        <Button
          id="cancel-logout-button"
          onClick={onClose}
        >
          Cancel
        </Button>

        <Button
          id="confirm-logout-button"
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

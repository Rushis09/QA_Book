import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  typography: {
    fontFamily:
      'Arial, Helvetica, sans-serif',

    htmlFontSize: 16,

    fontSize: 14,

    h1: {
      fontSize: "2rem",
      lineHeight: 1.15,
      fontWeight: 700,
      letterSpacing: "-0.035em",
    },

    h2: {
      fontSize: "1.7rem",
      lineHeight: 1.2,
      fontWeight: 700,
      letterSpacing: "-0.03em",
    },

    h3: {
      fontSize: "1.45rem",
      lineHeight: 1.25,
      fontWeight: 700,
      letterSpacing: "-0.025em",
    },

    h4: {
      fontSize: "1.3rem",
      lineHeight: 1.25,
      fontWeight: 700,
      letterSpacing: "-0.025em",
    },

    h5: {
      fontSize: "1.12rem",
      lineHeight: 1.3,
      fontWeight: 650,
      letterSpacing: "-0.015em",
    },

    h6: {
      fontSize: "0.98rem",
      lineHeight: 1.35,
      fontWeight: 650,
      letterSpacing: "-0.01em",
    },

    body1: {
      fontSize: "0.84rem",
      lineHeight: 1.5,
    },

    body2: {
      fontSize: "0.76rem",
      lineHeight: 1.45,
    },

    subtitle1: {
      fontSize: "0.86rem",
      lineHeight: 1.4,
      fontWeight: 500,
    },

    subtitle2: {
      fontSize: "0.76rem",
      lineHeight: 1.4,
      fontWeight: 600,
    },

    button: {
      fontSize: "0.78rem",
      fontWeight: 600,
      textTransform: "none",
    },

    caption: {
      fontSize: "0.68rem",
      lineHeight: 1.4,
    },
  },

  shape: {
    borderRadius: 9,
  },

  spacing: 8,

  components: {
    MuiButton: {
      defaultProps: {
        size: "small",
      },

      styleOverrides: {
        root: {
          minHeight: 34,
          padding: "6px 14px",
          borderRadius: 8,
          boxShadow: "none",
        },

        sizeSmall: {
          minHeight: 32,
          padding: "5px 12px",
          fontSize: "0.76rem",
        },

        sizeMedium: {
          minHeight: 34,
          padding: "6px 14px",
          fontSize: "0.78rem",
        },
      },
    },

    MuiIconButton: {
      defaultProps: {
        size: "small",
      },

      styleOverrides: {
        root: {
          padding: 7,
        },
      },
    },

    MuiTextField: {
      defaultProps: {
        size: "small",
      },
    },

    MuiFormControl: {
      defaultProps: {
        size: "small",
      },
    },

    MuiSelect: {
      defaultProps: {
        size: "small",
      },
    },

    MuiInputBase: {
      styleOverrides: {
        root: {
          fontSize: "0.8rem",
        },

        input: {
          paddingTop: 8,
          paddingBottom: 8,
        },
      },
    },

    MuiInputLabel: {
      styleOverrides: {
        root: {
          fontSize: "0.78rem",
        },
      },
    },

    MuiChip: {
      defaultProps: {
        size: "small",
      },

      styleOverrides: {
        root: {
          height: 26,
          borderRadius: 7,
          fontSize: "0.7rem",
        },

        label: {
          paddingLeft: 8,
          paddingRight: 8,
        },
      },
    },

    MuiTableCell: {
      styleOverrides: {
        root: {
          padding: "9px 12px",
          fontSize: "0.76rem",
        },

        head: {
          fontSize: "0.7rem",
          fontWeight: 650,
          position: "sticky",
          top: 0,
          zIndex: 2,
          backgroundColor: "#f8fafc",
        },
      },
    },

    MuiTableContainer: {
      styleOverrides: {
        root: {
          overflowX: "auto",
          overflowY: "visible",
          WebkitOverflowScrolling: "touch",

          "&::-webkit-scrollbar": {
            width: 7,
            height: 7,
          },

          "&::-webkit-scrollbar-track": {
            background: "transparent",
          },

          "&::-webkit-scrollbar-thumb": {
            backgroundColor: "#d6dee9",
            borderRadius: 10,
          },

          "&::-webkit-scrollbar-thumb:hover": {
            backgroundColor: "#bdc8d6",
          },
        },
      },
    },

    MuiListItemButton: {
      styleOverrides: {
        root: {
          minHeight: 40,
        },
      },
    },

    MuiDialogTitle: {
      styleOverrides: {
        root: {
          padding: "18px 20px 12px",
          fontSize: "1.05rem",
          fontWeight: 650,
        },
      },
    },

    MuiDialogContent: {
      styleOverrides: {
        root: {
          padding: "12px 20px 20px",
        },
      },
    },

    MuiDialogActions: {
      styleOverrides: {
        root: {
          padding: "10px 20px 16px",
          gap: 8,
        },
      },
    },

    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 10,
        },
      },
    },

    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          fontSize: "0.68rem",
        },
      },
    },
  },
});

export default theme;
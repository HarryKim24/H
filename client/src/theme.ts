import { createTheme } from "@mui/material/styles";

declare module "@mui/material/styles" {
  interface Palette {
    like: Palette["primary"];
    dislike: Palette["primary"];
  }

  interface PaletteOptions {
    like?: PaletteOptions["primary"];
    dislike?: PaletteOptions["primary"];
  }
}

export const lightTheme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#424242",
    },
    secondary: {
      main: "#757575",
    },
    like: {
      main: "#e53935",
    },
    dislike: {
      main: "#1e88e5",
    },
    background: {
      default: "#f5f5f5",
      paper: "#e0e0e0",
    },
    text: {
      primary: "#212121",
      secondary: "#424242",
    },
    warning: {
      main: "#ffa726"
    },
    error: {
      main: "#d32f2f"
    },
    success: {
      main: "#388e3c"
    },
  },
  typography: {
    fontFamily: `"Roboto", "Arial", sans-serif`,
    h1: {
      fontSize: "2rem",
      fontWeight: 700,
      color: "#212121",
    },
    h2: {
      fontSize: "1.8rem",
      fontWeight: 600,
      color: "#424242",
    },
    body1: {
      fontSize: "1rem",
      color: "#424242",
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: "4px",
          textTransform: "none",
          fontWeight: "bold",
          backgroundColor: "#616161",
          color: "#ffffff",
          "&:hover": {
            backgroundColor: "#757575", 
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          marginBottom: "8px",
          padding: "8px",
          borderRadius: "8px",
          border: "1px solid #bdbdbd", 
          boxShadow: "0px 1px 3px rgba(0,0,0,0.2)",
          cursor: "pointer",
          "&:hover": {
            boxShadow: "0px 4px 6px rgba(0,0,0,0.15)",
          },
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          "&.like": {
            color: "#e53935",
          },
          "&.dislike": {
            color: "#1e88e5",
          },
          "&.theme-toggle": {
            color: "#ffffff",
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          marginBottom: "8px",
          marginTop: "8px",
          "& .MuiInputBase-root": {
            padding: "10px",
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: "#424242",
          color: "#ffffff",
        },
      },
    },
    MuiToolbar: {
      styleOverrides: {
        root: {
          minHeight: "56px",
        },
      },
    },
  },
});

export const darkTheme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: "#bdbdbd",
    },
    secondary: {
      main: "#757575",
    },
    like: {
      main: "#ff5252",
    },
    dislike: {
      main: "#64b5f6",
    },
    background: {
      default: "#212121",
      paper: "#424242",
    },
    text: {
      primary: "#e0e0e0",
      secondary: "#bdbdbd",
    },
    warning: {
      main: "#FF9800"
    },
    error: {
      main: "#F44336"
    },
    success: {
      main: "#4CAF50"
    },
  },
  typography: {
    fontFamily: `"Roboto", "Arial", sans-serif`,
    h1: {
      fontSize: "2rem",
      fontWeight: 700,
      color: "#e0e0e0",
    },
    h2: {
      fontSize: "1.8rem",
      fontWeight: 600,
      color: "#bdbdbd",
    },
    body1: {
      fontSize: "1rem",
      color: "#bdbdbd",
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: "4px",
          textTransform: "none",
          fontWeight: "bold",
          backgroundColor: "#616161",
          color: "#ffffff",
          "&:hover": {
            backgroundColor: "#757575",
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          marginBottom: "8px",
          padding: "8px",
          borderRadius: "8px",
          border: "1px solid #757575",
          boxShadow: "0px 1px 3px rgba(0,0,0,0.2)",
          cursor: "pointer",
          "&:hover": {
            boxShadow: "0px 1px 3px rgba(175, 175, 175, 1)",
          },
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          "&.like": {
            color: "#ff5252",
          },
          "&.dislike": {
            color: "#64b5f6",
          },
          "&.theme-toggle": {
            color: "#ffcc00",
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          marginBottom: "8px",
          marginTop: "8px",
          "& .MuiInputBase-root": {
            padding: "10px",
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: "#212121",
          color: "#ffffff",
        },
      },
    },
    MuiToolbar: {
      styleOverrides: {
        root: {
          minHeight: "56px",
        },
      },
    },
  },
});

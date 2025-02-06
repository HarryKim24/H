import { createTheme } from "@mui/material/styles";

export const lightTheme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#424242",
    },
    secondary: {
      main: "#757575",
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
          backgroundColor: "#e0e0e0", 
          color: "#424242",
          borderRadius: "12px",
          boxShadow: "none",
          border: "1px solid #bdbdbd", 
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
          backgroundColor: "#424242",
          color: "#e0e0e0",
          borderRadius: "12px",
          boxShadow: "none",
          border: "1px solid #757575",
        },
      },
    },
  },
});

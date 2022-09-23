import React from "react";
import { ThemeProvider } from "@material-ui/core/styles";
import CssBaseline from "@material-ui/core/CssBaseline";
import theme from "../src/theme";
import "bootstrap/dist/css/bootstrap.css";

const ThemeDecorator = storyFn => (
    <ThemeProvider theme={theme}>
        <CssBaseline />
        {storyFn()}
    </ThemeProvider>
)

export default ThemeDecorator
import * as React from "react";
import Stack from "@mui/material/Stack";
import { Box, Typography } from "@mui/material";
export default function Section({ number, title, description, content }) {
  return (
    <div>
      <Stack
        spacing={2}
        sx={{ bgcolor: "white", padding: "20px", borderRadius: "10px" }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
          }}
        >
          <Typography
            sx={{
              width: 45,
              height: 45,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "#5EB5F3",
              borderRadius: "50%",
              color: "white",
              padding: "8px 15px 8px 15px",
              marginRight: "8px",
              fontSize: "20pt",
              fontWeight: "bold",
            }}
          >
            {number}
          </Typography>
          <Typography
            variant="h5"
            color={"#5EB5F3"}
            sx={{ fontWeight: 750, fontSize: { xs: "1rem", md: "1.5rem" } }}
          >
            {title}
          </Typography>
        </Box>
        <Typography
          variant="subtitle1"
          sx={{ fontSize: { xs: "0.8rem", md: "1rem" } }}
        >
          {description}
        </Typography>
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
          }}
        >
          {" "}
          {content}
        </Box>
      </Stack>
    </div>
  );
}

import { ImageResponse } from "next/og";

export const size = {
  width: 512,
  height: 512,
};

export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          width: "100%",
          height: "100%",
          alignItems: "center",
          justifyContent: "center",
          background:
            "linear-gradient(180deg, rgba(246, 241, 232, 1) 0%, rgba(253, 248, 241, 1) 100%)",
          color: "#115e59",
          fontSize: 220,
          fontWeight: 900,
        }}
      >
        T
      </div>
    ),
    size,
  );
}

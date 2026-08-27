export default function AdireDivider({ thin }) {
  return (
    <div
      style={{
        height: thin ? 4 : 10,
        opacity: thin ? 0.6 : 1,
        background: `repeating-linear-gradient(
          90deg,
          #B5451B 0, #B5451B ${thin ? 6 : 8}px,
          #C9963A ${thin ? 6 : 8}px, #C9963A ${thin ? 12 : 16}px,
          #7A2E0E ${thin ? 12 : 16}px, #7A2E0E ${thin ? 18 : 24}px,
          #C9963A ${thin ? 18 : 24}px, #C9963A ${thin ? 24 : 32}px
        )`,
      }}
    />
  );
}

export const metadata = {
  title: "The HTV Store",
  description: "Custom t-shirts with HTV designs",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, fontFamily: "system-ui" }}>
        {children}
      </body>
    </html>
  );
}

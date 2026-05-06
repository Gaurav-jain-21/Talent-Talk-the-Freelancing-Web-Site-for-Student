import React from "react";

class AppErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, message: "" };
  }

  static getDerivedStateFromError(error) {
    return {
      hasError: true,
      message: error?.message || "Unknown frontend error",
    };
  }

  componentDidCatch(error, errorInfo) {
    console.error("App crashed:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: "24px", fontFamily: "sans-serif" }}>
          <h2 style={{ marginBottom: "12px" }}>Frontend crashed</h2>
          <p style={{ marginBottom: "8px" }}>
            A runtime error is stopping React from rendering.
          </p>
          <pre
            style={{
              whiteSpace: "pre-wrap",
              background: "#f3f4f6",
              padding: "12px",
              borderRadius: "8px",
            }}
          >
            {this.state.message}
          </pre>
        </div>
      );
    }

    return this.props.children;
  }
}

export default AppErrorBoundary;

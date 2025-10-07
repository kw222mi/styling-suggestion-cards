// src/components/ErrorBoundary.jsx
import React from "react";
export default class ErrorBoundary extends React.Component {
  state = { hasError: false, msg: "" };
  static getDerivedStateFromError(e) {
    return { hasError: true, msg: e?.message || "Ett fel uppstod." };
  }
  render() {
    return this.state.hasError ? (
      <div className="status error">Fel: {this.state.msg}</div>
    ) : (
      this.props.children
    );
  }
}

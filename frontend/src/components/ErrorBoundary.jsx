import { AlertTriangle } from "lucide-react";
import { Component } from "react";

import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";

export class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error) {
    console.error(error);
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Something went wrong
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">Refresh the page and try again. The app kept the error contained.</p>
            <Button onClick={() => window.location.reload()}>Refresh</Button>
          </CardContent>
        </Card>
      </div>
    );
  }
}

import { ClickUIProvider } from "@clickhouse/click-ui";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Editor } from "./editor";
import { AppQueryClientProvider } from "./query-client-provider";

vi.mock("@sqlrooms/sql-editor", () => ({
  SqlMonacoEditor: ({
    value,
    onChange,
  }: {
    value: string;
    onChange: (value: string) => void;
  }) => (
    <textarea
      aria-label="SQL editor"
      onChange={(event) => onChange(event.target.value)}
      value={value}
    />
  ),
}));

const renderEditor = () =>
  render(
    <ClickUIProvider persistTheme={false} theme="light">
      <AppQueryClientProvider>
        <Editor />
      </AppQueryClientProvider>
    </ClickUIProvider>
  );

describe("Editor", () => {
  it("shows a validation message when running empty SQL", async () => {
    const user = userEvent.setup();
    renderEditor();

    await user.click(screen.getByRole("button", { name: "Run" }));

    expect(screen.getByText("Enter a SQL query to run.")).toBeInTheDocument();
  });

  it("runs entered SQL and renders query results", async () => {
    const user = userEvent.setup();
    renderEditor();

    await user.type(
      screen.getByRole("textbox", { name: "SQL editor" }),
      "SELECT 1"
    );
    await user.click(screen.getByRole("button", { name: "Run" }));

    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    expect(await screen.findByText("1 row returned")).toBeInTheDocument();
    expect(screen.getByText("1")).toBeInTheDocument();
  });
});
